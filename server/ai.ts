// One provider-neutral model call. Any OpenAI-compatible endpoint works:
// Gemini (default), OpenAI, OpenRouter, Groq, or a local Ollama / LM Studio.

const GEMINI_OPENAI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

// Read at call time so dotenv has loaded and .env edits apply after a restart.
export function aiConfig() {
  const baseUrl = (process.env.AI_BASE_URL || GEMINI_OPENAI_URL).replace(/\/+$/, '');
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gemini-3.8-flash';
  // A local server (custom base URL) may need no key.
  const configured = Boolean(apiKey || process.env.AI_BASE_URL);
  return { baseUrl, apiKey, model, configured };
}

/** Pull the JSON object out of a model reply, tolerating ```json fences or stray prose. */
export function parseJsonReply(text: string): any {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('The AI reply was not JSON. Try again.');
  return JSON.parse(text.slice(start, end + 1));
}

export async function callModel(system: string, user: string): Promise<any> {
  const { baseUrl, apiKey, model } = aiConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    throw new Error(`AI provider returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  return parseJsonReply(data.choices?.[0]?.message?.content ?? '');
}
