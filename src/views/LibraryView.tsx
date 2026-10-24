import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { CreateDeckModal } from '../components/CreateDeckModal';

interface LibraryViewProps {
  onSelectDeck: (deckId: string) => void;
}

type SortMode = 'due' | 'retention' | 'name';

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectDeck }) => {
  const { decks, dailyStreak, reviewedTodayCount, weekProgress, addDeck, deleteDeck, openVoiceCoach } = useDeck();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('due');
  const [showInsightsToast, setShowInsightsToast] = useState(false);

  const sortedDecks = [...decks].sort((a, b) => {
    if (sortMode === 'due') return b.dueCards - a.dueCards;
    if (sortMode === 'retention') return b.retentionRate - a.retentionRate;
    return a.title.localeCompare(b.title);
  });

  const toggleSort = () => {
    if (sortMode === 'due') setSortMode('retention');
    else if (sortMode === 'retention') setSortMode('name');
    else setSortMode('due');
  };

  const sortLabel = sortMode === 'due' ? 'Sort by Due' : sortMode === 'retention' ? 'Sort by Retention' : 'Sort by Name';

  const categoryColorClasses: Record<string, { bg: string; text: string }> = {
    Language: { bg: 'bg-[#e2dfff]', text: 'text-[#0c006b]' },
    Design: { bg: 'bg-[#d6e3ff]', text: 'text-[#001b3e]' },
    Science: { bg: 'bg-[#ffdbcb]', text: 'text-[#341100]' },
    Tech: { bg: 'bg-[#e3e2e7]', text: 'text-[#414754]' },
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex flex-col w-full pb-6 space-y-4 max-w-lg mx-auto">
      {/* Top Context & Header Row */}
      <section className="flex flex-col pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-[#8E8E93] uppercase tracking-wider font-semibold">
            Tuesday, Oct 24
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e3e2e7] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[12px] text-[#414754] font-medium">On-Device AI Active</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[34px] font-bold text-black tracking-tight">Library</h2>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`text-[13px] font-medium active:opacity-60 transition-opacity ${
              isEditMode ? 'text-[#FF453A] font-semibold' : 'text-[#005ab3]'
            }`}
            type="button"
          >
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </section>

      {/* Daily Streak Widget */}
      <section className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FF9F0A]/15 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[#FF9F0A] text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-semibold text-black">{dailyStreak}-Day Streak</span>
                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A]">
                  Top 5%
                </span>
              </div>
              <p className="text-[13px] text-[#8E8E93] mt-0.5">
                You're on fire! {reviewedTodayCount} cards reviewed today
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInsightsToast(!showInsightsToast)}
            aria-label="Streak Insights"
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#005ab3] hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </button>
        </div>

        {/* Optional Insights Banner */}
        {showInsightsToast && (
          <div className="mt-3 p-3 rounded-xl bg-[#F2F2F7] text-[12px] text-slate-700 flex items-center justify-between">
            <span>🔥 5 consecutive days of study! Peak recall score: 94%.</span>
            <button
              onClick={() => setShowInsightsToast(false)}
              className="text-slate-400 hover:text-black font-semibold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 7-Day Week Trackers */}
        <div className="grid grid-cols-7 gap-2 pt-4 mt-2">
          {daysOfWeek.map((day, index) => {
            const isCompleted = weekProgress[index];
            const isToday = index === 4; // Friday
            return (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <span className={`text-[12px] font-medium ${isToday ? 'text-[#005ab3] font-bold' : 'text-[#8E8E93]'}`}>
                  {day}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90 ${
                    isCompleted
                      ? isToday
                        ? 'bg-[#0A84FF] text-white'
                        : 'bg-[#FF9F0A] text-white'
                      : 'bg-[#e9e7ed] text-[#8E8E93]'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#8E8E93]/40" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deck List Section */}
      <section className="flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[20px] font-semibold text-black">Study Decks</span>
          <div className="flex items-center gap-1.5 text-[#8E8E93] text-[12px]">
            <span>{decks.length} Total</span>
            <span>•</span>
            <button
              onClick={toggleSort}
              type="button"
              className="text-[#005ab3] font-medium hover:underline active:opacity-70"
            >
              {sortLabel}
            </button>
          </div>
        </div>

        {/* Deck Cards */}
        {sortedDecks.map((deck) => {
          const colors = categoryColorClasses[deck.category] || { bg: 'bg-slate-100', text: 'text-slate-700' };
          return (
            <article
              key={deck.id}
              onClick={() => onSelectDeck(deck.id)}
              className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-transform flex flex-col justify-between cursor-pointer min-h-[120px] relative group"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-[11px] font-semibold`}>
                      {deck.category}
                    </span>
                    <span className="text-[12px] text-[#8E8E93]">Last studied: {deck.lastStudied}</span>
                  </div>
                  <h3 className="text-[17px] font-semibold text-black truncate">{deck.title}</h3>
                  <p className="text-[15px] text-[#8E8E93] line-clamp-1 mt-0.5">{deck.description}</p>
                </div>

                {isEditMode ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete deck "${deck.title}" and its cards?`)) {
                        deleteDeck(deck.id);
                      }
                    }}
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0 active:scale-90"
                    title="Delete Deck"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] self-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0A84FF]/15 text-[#0A84FF] text-[13px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />
                    {deck.newCards} New
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] text-[13px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                    {deck.dueCards} Due
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      deck.retentionRate >= 85 ? 'bg-[#34C759]' : deck.retentionRate >= 70 ? 'bg-[#FF9F0A]' : 'bg-[#FF453A]'
                    }`}
                  />
                  <span className="text-[13px] text-[#8E8E93] font-medium">
                    {deck.retentionRate}% retention
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Quick Ambient AI Assist Card (Voice Recall micro-banner) */}
      <section className="w-full rounded-2xl p-4 bg-gradient-to-r from-[#6462ec] to-[#0A84FF] text-white flex items-center justify-between shadow-[0_4px_16px_rgba(10,132,255,0.18)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">graphic_eq</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-[17px] text-white font-semibold truncate leading-tight">Ready for Voice Recall?</h4>
            <p className="text-[12px] text-white/80 truncate">Whisper AI runs 100% on-device</p>
          </div>
        </div>
        <button
          onClick={() => openVoiceCoach()}
          className="px-3.5 py-1.5 rounded-full bg-white text-[#4a47d2] text-[13px] font-semibold shadow-sm active:opacity-90 shrink-0 min-h-[36px] flex items-center active:scale-95 transition-transform"
          type="button"
        >
          Start
        </button>
      </section>

      {/* Floating Action Button (FAB) for Creating New Deck */}
      <div className="fixed right-4 bottom-24 z-30">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Create New Deck"
          className="w-14 h-14 rounded-full bg-[#0A84FF] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(10,132,255,0.4)] active:scale-90 transition-transform"
          type="button"
        >
          <span className="material-symbols-outlined text-[30px]">add</span>
        </button>
      </div>

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(deckData) => {
          const newId = addDeck(deckData);
          onSelectDeck(newId);
        }}
      />
    </div>
  );
};
