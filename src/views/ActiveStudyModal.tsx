import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { StudyGrade } from '../types';
import { speakText, triggerHaptic } from '../services/speechService';

interface ActiveStudyModalProps {
  deckId: string;
  onClose: () => void;
  onOpenVoiceCoach: (deckId: string) => void;
}

export const ActiveStudyModal: React.FC<ActiveStudyModalProps> = ({ deckId, onClose, onOpenVoiceCoach }) => {
  const { decks, cards, gradeCard, settings } = useDeck();
  const deck = decks.find((d) => d.id === deckId) || decks[0];
  const studyCards = cards.filter((c) => c.deckId === deck?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingGrade, setAnimatingGrade] = useState<StudyGrade | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  if (!deck || studyCards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2">done_all</span>
        <h2 className="text-[20px] font-bold text-black mb-1">No Cards in this Deck</h2>
        <p className="text-[14px] text-slate-500 mb-4">Add some cards first to begin studying.</p>
        <button
          onClick={onClose}
          type="button"
          className="px-6 py-2.5 rounded-full bg-[#0A84FF] text-white font-semibold text-sm"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex % studyCards.length];
  const progressPercent = Math.round(((currentIndex + 1) / studyCards.length) * 100);
  const estMinutesRemaining = Math.max(1, Math.ceil((studyCards.length - currentIndex) * 0.4));

  const handleGrade = (grade: StudyGrade) => {
    triggerHaptic(settings.hapticAudio);
    setAnimatingGrade(grade);
    gradeCard(currentCard.id, grade);

    setSessionStats((prev) => ({
      ...prev,
      [grade]: prev[grade] + 1,
    }));

    setTimeout(() => {
      setAnimatingGrade(null);
      if (currentIndex + 1 >= studyCards.length) {
        setSessionCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 220);
  };

  const handlePronounce = async () => {
    setIsPlayingAudio(true);
    triggerHaptic(settings.hapticAudio);
    const textToSpeak = currentCard.frontSub ? `${currentCard.front}. ${currentCard.frontSub}` : currentCard.front;
    await speakText(textToSpeak, settings.speechRate, settings.ttsVoice);
    setIsPlayingAudio(false);
  };

  const handlePracticeSentence = async () => {
    if (currentCard.sentenceJp) {
      triggerHaptic(settings.hapticAudio);
      await speakText(currentCard.sentenceJp, settings.speechRate, settings.ttsVoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col min-h-screen select-none animate-fade-in overflow-y-auto">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-black/5">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            onClick={onClose}
            aria-label="Close study mode"
            type="button"
            className="w-11 h-11 flex items-center justify-center rounded-full text-[#414754] hover:bg-[#eeedf3] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2 text-center">
            <h1 className="text-[13px] font-semibold text-black truncate max-w-full">
              Active Flashcard Study
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenVoiceCoach(deck.id)}
              aria-label="Toggle AI Voice Coach"
              type="button"
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#0A84FF] text-white shadow-[0_4px_16px_rgba(10,132,255,0.24)] active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#005ab3] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Study Container */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-safe max-w-lg mx-auto px-4">
        {sessionCompleted ? (
          <div className="bg-white rounded-3xl p-8 my-auto text-center shadow-xl border border-black/5 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <h2 className="text-[24px] font-bold text-black mb-1">Session Complete!</h2>
            <p className="text-[14px] text-slate-500 mb-6">
              You reviewed {studyCards.length} cards from <strong className="text-black">{deck.title}</strong>.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl">
                <span className="text-[18px] font-bold text-[#ba1a1a] block">{sessionStats.again}</span>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Again</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <span className="text-[18px] font-bold text-[#FF9F0A] block">{sessionStats.hard}</span>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Hard</span>
              </div>
              <div className="p-3 bg-green-50 rounded-2xl">
                <span className="text-[18px] font-bold text-[#34C759] block">{sessionStats.good}</span>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Good</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <span className="text-[18px] font-bold text-[#0A84FF] block">{sessionStats.easy}</span>
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Easy</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => onOpenVoiceCoach(deck.id)}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                <span>Continue in Voice Coach</span>
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-full bg-slate-100 text-slate-700 font-semibold text-[15px] hover:bg-slate-200 active:scale-95 transition-all"
              >
                Return to Deck
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full pb-6">
            {/* Progress Header Meta */}
            <div className="flex flex-col gap-1.5 mt-1 mb-4">
              <div className="flex items-center justify-between text-[12px] text-[#8E8E93]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-black">Card {currentIndex + 1}</span>
                  <span>of {studyCards.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Est. {estMinutesRemaining} min remaining</span>
                </div>
              </div>

              {/* Thin Segmented iOS Progress Track */}
              <div className="w-full h-1.5 bg-[#eeedf3] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Deck Sub-Bar Badge & Ambient Coach Pill */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eeedf3] text-[12px] text-[#414754] font-medium">
                  {deck.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#332dbc] text-[11px] font-semibold tracking-wide">
                  {deck.badge || deck.category}
                </span>
              </div>

              {/* Voice Coach Status Capsule */}
              <button
                onClick={() => onOpenVoiceCoach(deck.id)}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-[0_2px_8px_rgba(10,132,255,0.12)] active:scale-95 transition-all"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A84FF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5E5CE6]" />
                </span>
                <span className="text-[11px] font-semibold text-[#0A84FF]">Voice Ready</span>
              </button>
            </div>

            {/* Main Active Flashcard */}
            <div
              className={`relative w-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 transition-all duration-200 ${
                animatingGrade === 'again'
                  ? '-translate-x-4 opacity-40'
                  : animatingGrade
                  ? 'translate-x-4 opacity-40'
                  : 'translate-x-0 opacity-100'
              }`}
            >
              {/* Card Upper Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#f4f3f8] text-[#414754] text-[11px] font-medium">
                    {currentCard.tag || 'Kanji • Vocabulary'}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[#d6e3ff] text-[#001b3e] text-[11px] font-medium">
                    Core 2000
                  </span>
                </div>
                <button
                  onClick={handlePronounce}
                  aria-label="Play audio pronunciation"
                  type="button"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isPlayingAudio ? 'bg-[#005ab3] text-white scale-95' : 'bg-[#f4f3f8] text-[#005ab3] hover:bg-[#d6e3ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[19px]">volume_up</span>
                </button>
              </div>

              {/* Question Front: Kanji & Context Sentence */}
              <div className="flex flex-col items-center text-center py-2">
                {currentCard.frontSub ? (
                  <ruby className="text-[44px] leading-tight font-bold tracking-tight text-black">
                    {currentCard.front}
                    <rp>(</rp>
                    <rt className="text-[15px] font-normal text-[#8E8E93] tracking-normal pb-1">
                      {currentCard.frontSub}
                    </rt>
                    <rp>)</rp>
                  </ruby>
                ) : (
                  <div className="text-[36px] font-bold text-black tracking-tight">{currentCard.front}</div>
                )}

                {currentCard.romaji && (
                  <div className="text-[13px] text-[#8E8E93] mt-1 tracking-wide font-normal">
                    {currentCard.romaji}
                  </div>
                )}

                {/* Natural Sentence Example Box */}
                {currentCard.sentenceJp && (
                  <div className="w-full mt-4 p-3 rounded-2xl bg-[#f4f3f8] text-left">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#005ab3] text-[18px] mt-0.5">format_quote</span>
                      <div className="flex-1">
                        <p className="text-[15px] text-[#1a1b1f] font-medium">{currentCard.sentenceJp}</p>
                        {currentCard.sentenceEn && (
                          <p className="text-[12px] text-[#8E8E93] mt-0.5">{currentCard.sentenceEn}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Soft Ambient Divider with Centered Pill Indicator */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full h-px bg-[#e9e7ed]" />
                <div className="absolute px-3 py-0.5 rounded-full bg-white text-[#8E8E93] text-[11px] uppercase tracking-wider font-semibold border border-[#e9e7ed]">
                  Definition & Nuance
                </div>
              </div>

              {/* Answer Back: Meaning, Grammar, and Mnemonic */}
              <div className="flex flex-col gap-3 text-left">
                <div>
                  <h2 className="text-[17px] font-semibold text-black tracking-tight">{currentCard.back}</h2>
                  {currentCard.nuance && (
                    <p className="text-[13px] text-[#414754] mt-1 leading-relaxed">{currentCard.nuance}</p>
                  )}
                </div>

                {/* Delight Tip / Mnemonic Module */}
                {currentCard.mnemonic && (
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#eeedf3] text-[#1a1b1f]">
                    <span className="text-base select-none">💡</span>
                    <div className="flex-1">
                      <span className="text-[12px] font-semibold text-black block">Mnemonic</span>
                      <span className="text-[12px] text-[#414754] leading-snug">{currentCard.mnemonic}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Voice Feedback Prompt Trigger */}
              <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-[#8E8E93]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#5E5CE6]">auto_awesome</span>
                  Say “Review sentence” for AI speech check
                </span>
                <button
                  onClick={handlePracticeSentence}
                  type="button"
                  className="text-[#0A84FF] font-semibold hover:underline"
                >
                  Practice Pronunciation
                </button>
              </div>
            </div>

            {/* Bottom Grading Section */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-2">
                {/* 1: Again */}
                <button
                  onClick={() => handleGrade('again')}
                  type="button"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#ffdad6]/60 text-[#ba1a1a] active:bg-[#ffdad6] active:scale-95 transition-all min-h-[52px]"
                >
                  <span className="text-[14px] font-semibold leading-tight">Again</span>
                  <span className="text-[11px] opacity-80">&lt; 1m</span>
                </button>

                {/* 2: Hard */}
                <button
                  onClick={() => handleGrade('hard')}
                  type="button"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#FF9F0A]/15 text-[#FF9F0A] active:bg-[#FF9F0A]/25 active:scale-95 transition-all min-h-[52px]"
                >
                  <span className="text-[14px] font-semibold leading-tight">Hard</span>
                  <span className="text-[11px] opacity-80">12m</span>
                </button>

                {/* 3: Good */}
                <button
                  onClick={() => handleGrade('good')}
                  type="button"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#34C759]/20 text-[#34C759] active:bg-[#34C759]/30 active:scale-95 transition-all min-h-[52px]"
                >
                  <span className="text-[14px] font-semibold leading-tight">Good</span>
                  <span className="text-[11px] opacity-80">1d</span>
                </button>

                {/* 4: Easy */}
                <button
                  onClick={() => handleGrade('easy')}
                  type="button"
                  className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#d6e3ff]/60 text-[#005ab3] active:bg-[#d6e3ff] active:scale-95 transition-all min-h-[52px]"
                >
                  <span className="text-[14px] font-semibold leading-tight">Easy</span>
                  <span className="text-[11px] opacity-80">4d</span>
                </button>
              </div>

              {/* Native Interaction Gestures Indicator */}
              <div className="flex items-center justify-center gap-1.5 text-center mt-2 text-[#8E8E93]">
                <span className="material-symbols-outlined text-[14px]">swipe</span>
                <span className="text-[11px]">Swipe card left/right or tap grading button</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
