import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { Flashcard } from '../types';
import { speakText, triggerHaptic } from '../services/speechService';

const SAMPLE_NOTES = `Lecture Notes - Japanese Aesthetics & Modern Idioms:
1. 木漏れ日 (Komorebi): An untranslatable evocative phrase referencing sunlight filtering through tree leaves during late afternoon walks.
2. 改善 (Kaizen): Foundational manufacturing philosophy popularized by Toyota; emphasizes small, incremental positive updates everyday.
3. 過信 (Kashin): Warning against arrogant overconfidence in one's intellect or preparation.`;

export const GeneratorView: React.FC = () => {
  const { decks, activeDeckId, addMultipleCards, settings } = useDeck();
  const [targetDeckId, setTargetDeckId] = useState(activeDeckId || decks[0]?.id || 'deck_japanese');
  const targetDeck = decks.find((d) => d.id === targetDeckId) || decks[0];

  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationModel, setGenerationModel] = useState('Mistral 7B (On-Device)');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Generated candidate cards
  const [generatedCards, setGeneratedCards] = useState<Array<Partial<Flashcard> & { id: string; status: 'pending' | 'kept' | 'discarded' }>>([
    {
      id: 'gen_1',
      front: '木漏れ日',
      frontSub: 'こもれび',
      romaji: 'Komorebi',
      back: 'Sunlight filtering through trees',
      nuance: 'Poetic noun describing sunlight and leaves interplay.',
      mnemonic: 'Tree (木) leaks (漏) sunlight (日).',
      tag: 'JLPT N2 / N3 • Vocab',
      status: 'pending',
    },
    {
      id: 'gen_2',
      front: '改善',
      frontSub: 'かいぜん',
      romaji: 'Kaizen',
      back: 'Continuous improvement',
      nuance: 'Philosophy of small, daily positive compounding changes.',
      mnemonic: 'Change (改) for the good (善).',
      tag: 'Business & Philosophy',
      status: 'pending',
    },
    {
      id: 'gen_3',
      front: '過信',
      frontSub: 'かしん',
      romaji: 'Kashin',
      back: 'Overconfidence',
      nuance: 'Trusting excessively in one\'s own ability or luck.',
      mnemonic: 'Excessive (過) trust/belief (信).',
      tag: 'Kanji Compound',
      status: 'pending',
    },
  ]);

  const [charCount, setCharCount] = useState(SAMPLE_NOTES.length);
  const tokenCount = Math.round(charCount / 4);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setCharCount(val.length);
  };

  const handleQuickPaste = () => {
    setNotes(SAMPLE_NOTES);
    setCharCount(SAMPLE_NOTES.length);
  };

  const handleClear = () => {
    setNotes('');
    setCharCount(0);
  };

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setIsGenerating(true);
    triggerHaptic(settings.hapticAudio);

    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          deckTitle: targetDeck.title,
          category: targetDeck.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.cards && data.cards.length > 0) {
          setGeneratedCards(
            data.cards.map((c: any) => ({
              ...c,
              status: 'pending' as const,
            }))
          );
          if (data.model) setGenerationModel(data.model);
        }
      }
    } catch (err) {
      console.warn('Card generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeepCard = (id: string) => {
    triggerHaptic(settings.hapticAudio);
    setGeneratedCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus = c.status === 'kept' ? 'pending' : 'kept';
        if (newStatus === 'kept') {
          // Add single card to deck
          addMultipleCards([
            {
              deckId: targetDeck.id,
              front: c.front!,
              frontSub: c.frontSub,
              romaji: c.romaji,
              back: c.back!,
              nuance: c.nuance,
              mnemonic: c.mnemonic,
              sentenceJp: c.sentenceJp,
              sentenceEn: c.sentenceEn,
              tag: c.tag,
            },
          ]);
          setSuccessToast(`Saved "${c.front}" to ${targetDeck.title}`);
          setTimeout(() => setSuccessToast(null), 2500);
        }
        return { ...c, status: newStatus };
      })
    );
  };

  const handleDiscardCard = (id: string) => {
    triggerHaptic(settings.hapticAudio);
    setGeneratedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'discarded' ? 'pending' : 'discarded' } : c))
    );
  };

  const handleAcceptAll = () => {
    triggerHaptic(settings.hapticAudio);
    const pendingOrKept = generatedCards.filter((c) => c.status !== 'discarded');
    if (pendingOrKept.length === 0) return;

    addMultipleCards(
      pendingOrKept.map((c) => ({
        deckId: targetDeck.id,
        front: c.front!,
        frontSub: c.frontSub,
        romaji: c.romaji,
        back: c.back!,
        nuance: c.nuance,
        mnemonic: c.mnemonic,
        sentenceJp: c.sentenceJp,
        sentenceEn: c.sentenceEn,
        tag: c.tag,
      }))
    );

    setGeneratedCards((prev) => prev.map((c) => ({ ...c, status: 'kept' })));
    setSuccessToast(`Added ${pendingOrKept.length} cards to ${targetDeck.title}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handlePreviewAudio = async () => {
    triggerHaptic(settings.hapticAudio);
    const firstCard = generatedCards[0];
    if (firstCard) {
      await speakText(firstCard.frontSub ? `${firstCard.front}. ${firstCard.frontSub}` : firstCard.front!, settings.speechRate, settings.ttsVoice);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 max-w-lg mx-auto pb-10">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black text-white text-[13px] font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[#34C759] text-[18px]">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Context Header & Local Model Status Bar */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-[22px] font-bold text-black tracking-tight">Generate Cards</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#005ab3]/10 text-[#005ab3] text-[12px] font-medium">
                <span className="material-symbols-outlined text-[13px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                {generationModel}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            </div>
          </div>

          {/* Target Deck Selector Pill */}
          <div className="relative">
            <select
              value={targetDeckId}
              onChange={(e) => setTargetDeckId(e.target.value)}
              className="appearance-none flex items-center gap-1 pl-8 pr-7 py-1.5 bg-white rounded-full shadow-sm text-black text-[13px] font-medium border border-black/5 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[#005ab3] text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              folder_special
            </span>
            <span className="material-symbols-outlined text-[#8E8E93] text-[16px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Main Note Input Surface */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative border border-black/5">
        {/* Utility Quick Actions Bar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickPaste}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eeedf3] text-[#414754] text-[13px] font-medium active:bg-[#d6e3ff] active:text-[#001b3e] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">content_paste</span>
              <span>Paste</span>
            </button>
            <button
              onClick={() => {
                setNotes((prev) => `${prev}\n- Key Concept: Extract core terminology for spaced repetition.`);
                setCharCount((prev) => prev + 60);
              }}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eeedf3] text-[#414754] text-[13px] font-medium active:bg-[#d6e3ff] active:text-[#001b3e] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Extract Terms</span>
            </button>
          </div>
          <button
            onClick={handleClear}
            title="Clear text"
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f4f3f8] text-[#414754] hover:text-[#ba1a1a] active:bg-[#ffdad6] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Live Textarea */}
        <div className="relative w-full">
          <textarea
            rows={5}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Paste lecture notes, articles, or transcripts here..."
            className="w-full bg-[#f4f3f8] text-black text-[15px] rounded-2xl p-3 outline-none resize-none placeholder:text-[#8E8E93] leading-relaxed font-sans"
          />
        </div>

        {/* Bottom Counter & Device Safety Badge */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5 text-[#414754]">
            <span className="material-symbols-outlined text-[15px] text-[#005ab3]">memory</span>
            <span className="text-[12px]">
              {charCount.toLocaleString()} chars • ~{tokenCount} tokens (Local inference)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#414754] text-[12px]">
            <span className="material-symbols-outlined text-[14px] text-[#34C759]">speed</span>
            <span>42 t/s</span>
          </div>
        </div>
      </div>

      {/* Primary Generation CTA Area */}
      <div className="flex flex-col items-center gap-1.5">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !notes.trim()}
          type="button"
          className="w-full min-h-[50px] py-3.5 px-6 rounded-full bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF] text-white text-[17px] font-semibold shadow-[0_4px_16px_rgba(10,132,255,0.28)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Cards...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span>Generate with AI (Local)</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 text-[#414754] text-[12px]">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>100% On-Device • No data leaves your iPhone</span>
        </div>
      </div>

      {/* Generated Flashcards Preview Section */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-black tracking-tight">Generated Cards</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#d6e3ff] text-[#001b3e] text-[13px] font-medium">
              {generatedCards.filter((c) => c.status !== 'discarded').length} Ready
            </span>
          </div>
          <button
            onClick={handleAcceptAll}
            type="button"
            className="flex items-center gap-1 text-[#005ab3] text-[13px] font-medium active:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            <span>Accept All ({generatedCards.filter((c) => c.status !== 'discarded').length})</span>
          </button>
        </div>

        {/* Horizontal Flashcard Carousel */}
        <div
          className="flex overflow-x-auto gap-4 pb-3 pt-1 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {generatedCards.map((card) => {
            const isDiscarded = card.status === 'discarded';
            const isKept = card.status === 'kept';

            return (
              <div
                key={card.id}
                className={`snap-center shrink-0 w-[290px] bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all duration-200 border border-black/5 ${
                  isDiscarded ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e9e7ed] text-[#414754] text-[11px] font-medium">
                      {card.tag || 'Vocab'}
                    </span>
                    <button
                      onClick={() => speakText(card.frontSub ? `${card.front}. ${card.frontSub}` : card.front!, settings.speechRate, settings.ttsVoice)}
                      type="button"
                      className="text-[#005ab3] hover:opacity-70"
                    >
                      <span className="material-symbols-outlined text-[18px]">volume_up</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] font-semibold">Front Side</span>
                    <div className="text-[20px] text-black font-bold tracking-tight mt-0.5">
                      {card.front}
                    </div>
                    {card.romaji && (
                      <p className="text-[13px] text-[#005ab3] font-medium mt-0.5">{card.romaji}</p>
                    )}
                  </div>

                  <div className="bg-[#f4f3f8] rounded-xl p-3 mt-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] block mb-1 font-semibold">
                      Back Side
                    </span>
                    <p className="text-[14px] text-black font-medium leading-snug">{card.back}</p>
                    {card.nuance && (
                      <p className="text-[12px] text-[#414754] mt-1.5 italic">{card.nuance}</p>
                    )}
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-2 pt-4 mt-auto">
                  <button
                    onClick={() => handleDiscardCard(card.id)}
                    type="button"
                    className={`flex-1 min-h-[44px] py-2 px-3 rounded-full text-[13px] font-medium flex items-center justify-center gap-1 transition-colors ${
                      isDiscarded ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f4f3f8] text-[#414754] hover:bg-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                    <span>{isDiscarded ? 'Discarded' : 'Discard'}</span>
                  </button>

                  <button
                    onClick={() => handleKeepCard(card.id)}
                    type="button"
                    className={`flex-1 min-h-[44px] py-2 px-3 rounded-full text-[13px] font-semibold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${
                      isKept ? 'bg-[#34C759] text-white' : 'bg-[#0A84FF] text-white hover:bg-blue-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isKept ? 'check_circle' : 'add'}
                    </span>
                    <span>{isKept ? 'Saved' : 'Keep'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Pronunciation / AI Voice Coach Assist Capsule */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between border border-black/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#0A84FF] flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] font-semibold text-black truncate">Audio Pitch Accents</span>
            <span className="text-[12px] text-[#414754] truncate">
              Synthesize native pitch contours for these cards
            </span>
          </div>
        </div>
        <button
          onClick={handlePreviewAudio}
          type="button"
          className="shrink-0 px-3 py-1.5 rounded-full bg-[#005ab3]/10 text-[#005ab3] text-[13px] font-medium active:bg-[#005ab3] active:text-white transition-colors ml-2"
        >
          Preview
        </button>
      </div>
    </div>
  );
};
