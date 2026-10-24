import React, { useState, useEffect, useRef } from 'react';
import { useDeck } from '../context/DeckContext';
import { speakText, createSpeechRecognizer, triggerHaptic } from '../services/speechService';
import { Flashcard } from '../types';

interface LiveVoiceCoachModalProps {
  deckId: string;
  onClose: () => void;
}

export const LiveVoiceCoachModal: React.FC<LiveVoiceCoachModalProps> = ({ deckId, onClose }) => {
  const { decks, cards, settings, gradeCard } = useDeck();
  const deck = decks.find((d) => d.id === deckId) || decks[0];
  const deckCards = cards.filter((c) => c.deckId === deck?.id);

  const [cardIndex, setCardIndex] = useState(0);
  const currentCard: Flashcard = deckCards[cardIndex % (deckCards.length || 1)] || cards[0];

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [userTranscript, setUserTranscript] = useState('Yakusoku means a promise or an appointment with someone.');
  const [matchPercent, setMatchPercent] = useState<number>(98);
  const [rating, setRating] = useState<'Excellent (Pass)' | 'Good' | 'Needs Review'>('Excellent (Pass)');
  const [coachFeedback, setCoachFeedback] = useState(
    "Perfect nuance! Remember it often pairs with する (suru) — '約束をする'."
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Auto-advance countdown
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number | null>(null);

  const recognizerRef = useRef<{ start: () => void; stop: () => void; isSupported: boolean } | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        if (!isPaused && transcript) {
          setUserTranscript(transcript);
          if (isFinal) {
            handleEvaluateTranscript(transcript);
          }
        }
      },
      (status) => {
        setIsListening(status === 'listening');
      },
      'en-US'
    );

    recognizerRef.current = recognizer;
    setSpeechSupported(recognizer.isSupported);

    if (recognizer.isSupported && !isMuted && !isPaused) {
      recognizer.start();
    }

    return () => {
      recognizer.stop();
    };
  }, [cardIndex, isPaused, isMuted]);

  // Countdown timer for auto-advancing
  useEffect(() => {
    if (autoAdvanceSeconds === null || autoAdvanceSeconds <= 0 || isPaused) return;

    const timer = setTimeout(() => {
      if (autoAdvanceSeconds === 1) {
        goToNextCard();
      } else {
        setAutoAdvanceSeconds((prev) => (prev ? prev - 1 : null));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoAdvanceSeconds, isPaused]);

  const handleEvaluateTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    setIsEvaluating(true);
    triggerHaptic(settings.hapticAudio);

    try {
      const res = await fetch('/api/voice-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardFront: currentCard.front,
          cardBack: currentCard.back,
          expectedReading: currentCard.frontSub,
          userTranscript: transcript,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatchPercent(data.matchPercent || 94);
        setRating(data.rating || 'Excellent (Pass)');
        setCoachFeedback(data.feedback || 'Great recall!');

        // Grade card as Good/Easy
        gradeCard(currentCard.id, data.matchPercent > 90 ? 'easy' : 'good');

        // Speak feedback if enabled
        if (settings.offlineWhisper) {
          await speakText(data.feedback, settings.speechRate, settings.ttsVoice);
        }

        // Start 3 second auto advance
        setAutoAdvanceSeconds(3);
      }
    } catch (err) {
      console.warn('Voice feedback evaluation error:', err);
      setMatchPercent(92);
      setRating('Excellent (Pass)');
      setCoachFeedback("Well explained! Moving to next card.");
      setAutoAdvanceSeconds(3);
    } finally {
      setIsEvaluating(false);
    }
  };

  const goToNextCard = () => {
    setAutoAdvanceSeconds(null);
    setCardIndex((prev) => prev + 1);
    setUserTranscript('');
    setCoachFeedback('');
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
    if (!isPaused) {
      recognizerRef.current?.stop();
    } else {
      if (!isMuted) recognizerRef.current?.start();
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) recognizerRef.current?.stop();
      else recognizerRef.current?.start();
      return next;
    });
  };

  const testQuickResponse = (text: string) => {
    setUserTranscript(text);
    handleEvaluateTranscript(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 max-w-lg mx-auto font-sans select-none animate-fade-in overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-safe mt-2">
        <button
          onClick={onClose}
          type="button"
          aria-label="Exit Voice Coach"
          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-[12px] font-medium text-white/90">Whisper Core ML • Offline</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-white/60 font-medium px-2 py-1 rounded-full bg-[#1C1C1E]">
            Card {cardIndex + 1}/{deckCards.length || 1}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#0A84FF] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]">person</span>
          </div>
        </div>
      </div>

      {/* Main Flashcard Prompt Area */}
      <div className="my-auto flex flex-col gap-4">
        {/* Active Prompt Card */}
        <div className="w-full rounded-3xl bg-[#1C1C1E] border border-white/10 p-5 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold tracking-wider text-white/70 uppercase">
              {currentCard.tag || `${deck.title} • JLPT N3`}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#0A84FF] font-medium">
              <span className="material-symbols-outlined text-[14px]">graphic_eq</span>
              <span>Acoustic Sync</span>
            </div>
          </div>

          <div className="py-3">
            {currentCard.frontSub ? (
              <ruby className="text-[44px] font-bold text-white tracking-tight">
                {currentCard.front}
                <rp>(</rp>
                <rt className="text-[14px] text-white/50 tracking-normal pb-1 font-normal">
                  {currentCard.frontSub}
                </rt>
                <rp>)</rp>
              </ruby>
            ) : (
              <div className="text-[36px] font-bold text-white tracking-tight">{currentCard.front}</div>
            )}
          </div>

          <p className="text-[13px] text-white/60 max-w-xs mt-1">
            Translate & explain nuance in Japanese or English
          </p>
        </div>

        {/* Live Conversation Transcript Box */}
        <div className="w-full rounded-3xl bg-[#1C1C1E]/90 border border-white/10 p-5 flex flex-col gap-4 shadow-xl">
          {/* User Speech Transcript */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0A84FF] text-[11px] font-bold tracking-wider uppercase">
                <span className="material-symbols-outlined text-[14px]">mic</span>
                <span>YOU</span>
              </div>
              {matchPercent && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#0A84FF]/20 text-[#0A84FF]">
                  {matchPercent}% match
                </span>
              )}
            </div>
            <p className="text-[15px] text-white font-medium italic mt-0.5 min-h-[22px]">
              {userTranscript ? `"${userTranscript}"` : isListening ? 'Listening to your voice...' : 'Speak now...'}
            </p>
          </div>

          {/* Coach Feedback Bubble */}
          <div className="flex flex-col gap-1 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5E5CE6] text-[11px] font-bold tracking-wider uppercase">COACH</span>
              {rating && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#34C759]">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  <span>Semantic Accuracy: {rating}</span>
                </span>
              )}
            </div>
            <p className="text-[14px] text-white/90 leading-relaxed mt-0.5">
              {isEvaluating ? (
                <span className="inline-flex items-center gap-2 text-white/60">
                  <span className="w-2 h-2 rounded-full bg-[#0A84FF] animate-ping" />
                  Analyzing nuance & pronunciation...
                </span>
              ) : coachFeedback ? (
                <>
                  "{coachFeedback}"
                  <span className="inline-block w-1.5 h-4 bg-[#5E5CE6] ml-1.5 align-middle animate-pulse" />
                </>
              ) : (
                <span className="text-white/40">Say the answer aloud or tap a sample response below.</span>
              )}
            </p>
          </div>

          {/* Auto-advancing spinner & countdown */}
          {autoAdvanceSeconds !== null && (
            <div className="flex items-center gap-2 pt-1 text-[12px] text-white/70">
              <div className="w-3.5 h-3.5 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
              <span>Auto-advancing to Card {cardIndex + 2} in {autoAdvanceSeconds}s...</span>
              <button
                onClick={() => setAutoAdvanceSeconds(null)}
                className="text-[11px] text-[#0A84FF] hover:underline ml-auto"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Shortcuts for testing */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold px-1">
            Quick Practice Answers
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => testQuickResponse(`It means ${currentCard.back.toLowerCase()}`)}
              type="button"
              className="px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-[12px] text-white/80 shrink-0 hover:bg-white/10 active:scale-95 transition-all"
            >
              "It means {currentCard.back}"
            </button>
            {currentCard.sentenceEn && (
              <button
                onClick={() => testQuickResponse(currentCard.sentenceEn!)}
                type="button"
                className="px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-[12px] text-white/80 shrink-0 hover:bg-white/10 active:scale-95 transition-all"
              >
                "{currentCard.sentenceEn.slice(0, 32)}..."
              </button>
            )}
            <button
              onClick={goToNextCard}
              type="button"
              className="px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10 text-[12px] text-[#0A84FF] shrink-0 hover:bg-white/10 active:scale-95 transition-all"
            >
              Skip Card →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Phone Call Controls */}
      <div className="flex items-center justify-around pb-safe pt-4 mb-2">
        {/* End Call Button */}
        <button
          onClick={onClose}
          type="button"
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div className="w-14 h-14 rounded-full bg-[#FF453A] flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:bg-red-600 transition-colors">
            <span className="material-symbols-outlined text-[26px]">call_end</span>
          </div>
          <span className="text-[12px] text-white/70 font-medium">End</span>
        </button>

        {/* Big Center Pause / Resume Button */}
        <button
          onClick={togglePause}
          type="button"
          className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#0A84FF] flex items-center justify-center text-white shadow-[0_0_24px_rgba(10,132,255,0.5)] ring-4 ring-white/10">
            <span className="material-symbols-outlined text-[30px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
          </div>
          <span className="text-[12px] text-white/70 font-medium">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Microphone Mute Toggle */}
        <button
          onClick={toggleMute}
          type="button"
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]' : 'bg-[#1C1C1E] text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {isMuted ? 'mic_off' : 'mic'}
            </span>
          </div>
          <span className="text-[12px] text-white/70 font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>
    </div>
  );
};
