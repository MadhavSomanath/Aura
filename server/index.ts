import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import { callModel, aiConfig } from './ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const NOT_SET_UP = 'AI is not set up. Add AI_API_KEY to .env and restart the server.';
const RATINGS = ['Excellent (Pass)', 'Good', 'Needs Review'];

// API: which model is answering, so the UI can say so
app.get('/api/ai-status', (_req: Request, res: Response) => {
  const { configured, model } = aiConfig();
  res.json({ configured, model });
});

// API: Generate Cards from study notes
app.post('/api/generate-cards', async (req: Request, res: Response) => {
  const { notes, deckTitle, category } = req.body;
  if (!notes || typeof notes !== 'string') {
    return res.status(400).json({ error: 'Notes text is required' });
  }
  if (!aiConfig().configured) return res.status(503).json({ error: NOT_SET_UP });

  try {
    const result = await callModel(
      'You are an expert polyglot flashcard creator specializing in spaced repetition (Anki/SuperMemo). Reply with JSON only.',
      `Analyze these study notes and generate 3 to 6 high-retention spaced repetition flashcards for deck "${deckTitle || 'Study Deck'}" (${category || 'General'}).

Notes:
"""
${notes}
"""

Reply as {"cards": [...]}. Each card has these string fields:
- front: the main prompt or word (required)
- back: primary meaning or concise definition (required)
- nuance: context and usage notes (required)
- mnemonic: a memory hook (required)
- frontSub: reading or furigana, if the term has one
- romaji: romaji or phonetic pronunciation, if useful
- sentenceJp: a natural example sentence in the studied language
- sentenceEn: English translation of that sentence
- tag: a short category label`
    );

    const cards = (Array.isArray(result.cards) ? result.cards : [])
      .filter((c: any) => typeof c?.front === 'string' && c.front && typeof c?.back === 'string' && c.back)
      .map((c: any, index: number) => ({
        id: `gen_${Date.now()}_${index}`,
        front: c.front,
        back: c.back,
        nuance: String(c.nuance || ''),
        mnemonic: String(c.mnemonic || ''),
        frontSub: String(c.frontSub || ''),
        romaji: String(c.romaji || ''),
        sentenceJp: String(c.sentenceJp || ''),
        sentenceEn: String(c.sentenceEn || ''),
        tag: String(c.tag || `${category || 'General'} • Term`),
      }));
    if (cards.length === 0) throw new Error('The AI reply had no usable cards. Try again.');

    return res.json({ cards, model: aiConfig().model });
  } catch (error: any) {
    console.error('Error generating cards:', error);
    return res.status(502).json({ error: error.message || 'Failed to generate cards' });
  }
});

// API: Voice Coach semantic feedback
app.post('/api/voice-feedback', async (req: Request, res: Response) => {
  const { cardFront, cardBack, expectedReading, userTranscript } = req.body;
  if (!userTranscript || typeof userTranscript !== 'string') {
    return res.status(400).json({ error: 'User transcript is required' });
  }
  if (!aiConfig().configured) return res.status(503).json({ error: NOT_SET_UP });

  try {
    const parsed = await callModel(
      'You are a native language and concept review coach listening to a student\'s spoken recall. Reply with JSON only.',
      `Flashcard:
- Front: "${cardFront}" (${expectedReading || ''})
- Meaning: "${cardBack}"

Student's spoken answer:
"${userTranscript}"

Evaluate if the student accurately recalled the meaning or nuance. Reply as {"matchPercent": integer 0-100, "rating": exactly one of "Excellent (Pass)", "Good", "Needs Review", "feedback": one encouraging coaching sentence, max 25 words}.`
    );

    const matchPercent = Math.round(Number(parsed.matchPercent));
    if (!RATINGS.includes(parsed.rating) || !Number.isFinite(matchPercent) || typeof parsed.feedback !== 'string') {
      throw new Error('The AI reply was not a valid score. Try again.');
    }
    return res.json({ matchPercent: Math.max(0, Math.min(100, matchPercent)), rating: parsed.rating, feedback: parsed.feedback });
  } catch (err: any) {
    console.error('Error in voice feedback:', err);
    return res.status(502).json({ error: err.message || 'Failed to score the answer' });
  }
});

// Setup HTTP server with Vite middleware in dev or static files in production
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(ROOT, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(ROOT, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(ROOT, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    const { configured, model } = aiConfig();
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(configured ? `AI: ${model}` : `AI: not set up (${NOT_SET_UP})`);
  });
}

startServer();
