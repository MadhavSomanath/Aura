import React, { useState } from 'react';
import { useDeck } from '../context/DeckContext';
import { Flashcard } from '../types';
import { speakText, triggerHaptic } from '../services/speechService';
import { AddCardModal } from '../components/AddCardModal';

interface DeckDetailViewProps {
  deckId: string;
  onBack: () => void;
}

type FilterType = 'all' | 'due' | 'learning' | 'mastered';

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({ deckId, onBack }) => {
  const { decks, cards, openStudyMode, openVoiceCoach, settings, deleteCard } = useDeck();
  const deck = decks.find((d) => d.id === deckId) || decks[0];

  const deckCards = cards.filter((c) => c.deckId === deck?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isSelectMultiple, setIsSelectMultiple] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [sortAscending, setSortAscending] = useState(false);

  if (!deck) return null;

  // Filter calculations
  const dueCardsList = deckCards.filter((c) => c.dueDate.includes('Due') || c.state === 'learning' || c.state === 'new');
  const learningCardsList = deckCards.filter((c) => c.state === 'learning' || c.state === 'new');
  const masteredCardsList = deckCards.filter((c) => c.state === 'mastered');

  let filtered = deckCards.filter((card) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        card.front.toLowerCase().includes(q) ||
        (card.frontSub && card.frontSub.toLowerCase().includes(q)) ||
        (card.romaji && card.romaji.toLowerCase().includes(q)) ||
        card.back.toLowerCase().includes(q) ||
        (card.tag && card.tag.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Filter pill
    if (activeFilter === 'due') return card.dueDate.includes('Due') || card.state === 'learning' || card.state === 'new';
    if (activeFilter === 'learning') return card.state === 'learning' || card.state === 'new';
    if (activeFilter === 'mastered') return card.state === 'mastered';
    return true;
  });

  if (sortAscending) {
    filtered = [...filtered].sort((a, b) => a.recallPercent - b.recallPercent);
  } else {
    filtered = [...filtered].sort((a, b) => b.recallPercent - a.recallPercent);
  }

  const handlePlayAudio = async (e: React.MouseEvent, card: Flashcard) => {
    e.stopPropagation();
    setPlayingAudioId(card.id);
    triggerHaptic(settings.hapticAudio);
    await speakText(card.frontSub ? `${card.front}. ${card.frontSub}` : card.front, settings.speechRate, settings.ttsVoice);
    setPlayingAudioId(null);
  };

  const toggleSelectCard = (id: string) => {
    const next = new Set(selectedCardIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCardIds(next);
  };

  const handleDeleteSelected = () => {
    if (selectedCardIds.size === 0) return;
    if (confirm(`Delete ${selectedCardIds.size} selected cards?`)) {
      selectedCardIds.forEach((id) => deleteCard(id));
      setSelectedCardIds(new Set());
      setIsSelectMultiple(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 max-w-lg mx-auto">
      {/* Top Navigation & Action Bar */}
      <div className="flex items-center justify-between w-full py-2 mb-1">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-1 text-[#005ab3] text-[15px] font-medium active:opacity-60 transition-opacity"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
          <span className="tracking-tight">Library</span>
        </button>

        <div className="flex items-center gap-2">
          {isSelectMultiple ? (
            <button
              onClick={handleDeleteSelected}
              disabled={selectedCardIds.size === 0}
              type="button"
              className="px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold disabled:opacity-40"
            >
              Delete ({selectedCardIds.size})
            </button>
          ) : (
            <>
              <button
                onClick={() => alert(`Deck Metrics:\nTotal Cards: ${deckCards.length}\nAvg Retention: ${deck.retentionRate}%\nNext Wave: ${deck.nextWave}`)}
                aria-label="Deck statistics"
                type="button"
                className="w-10 h-10 rounded-full bg-[#eeedf3] flex items-center justify-center text-[#414754] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                aria-label="Add Card"
                type="button"
                className="w-10 h-10 rounded-full bg-[#eeedf3] flex items-center justify-center text-[#414754] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Large Title Area & Badge */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-[#d6e3ff] text-[#001b3e] text-[12px] font-semibold">
            {deck.badge || deck.category}
          </span>
          <span className="text-[12px] text-[#8E8E93] flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            Active Spaced Repetition
          </span>
        </div>
        <h1 className="text-[34px] font-bold text-black tracking-tight">{deck.title}</h1>
        <p className="text-[15px] text-[#8E8E93] mt-0.5">
          {deck.description} • {deckCards.length} Cards total
        </p>
      </div>

      {/* Primary CTAs (Study Now + Voice Coach) */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => openStudyMode(deck.id)}
          type="button"
          className="flex-1 h-[54px] rounded-full bg-[#0A84FF] text-white text-[17px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.28)] active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <span>Study Now ({dueCardsList.length} Due)</span>
        </button>

        <button
          onClick={() => openVoiceCoach(deck.id)}
          aria-label="Voice Coach Study Session"
          type="button"
          className="h-[54px] w-[54px] rounded-full bg-white text-[#5E5CE6] shadow-sm flex items-center justify-center active:scale-[0.96] transition-transform relative"
        >
          <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#5E5CE6] rounded-full ring-2 ring-white animate-ping opacity-75" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#5E5CE6] rounded-full ring-2 ring-white" />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {/* Card 1: Total Cards */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Cards</span>
            <span className="material-symbols-outlined text-[16px] text-[#005ab3]">layers</span>
          </div>
          <div className="my-1.5">
            <span className="text-[22px] font-bold text-black tracking-tight">{deckCards.length}</span>
          </div>
          <div className="flex items-center text-[#34C759] text-[11px] font-medium leading-none">
            <span className="material-symbols-outlined text-[14px]">add</span>
            {deck.newCards} new
          </div>
        </div>

        {/* Card 2: Retention Rate */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Retention</span>
            <span className="material-symbols-outlined text-[16px] text-[#34C759]">verified</span>
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-[22px] font-bold text-black tracking-tight">{deck.retentionRate}</span>
            <span className="text-[12px] font-semibold text-[#8E8E93]">%</span>
          </div>
          <div className="flex items-center text-[#34C759] text-[11px] font-medium leading-none">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>+3.4%
          </div>
        </div>

        {/* Card 3: Next Spike */}
        <div className="bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8E93]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Next Wave</span>
            <span className="material-symbols-outlined text-[16px] text-[#FF9F0A]">schedule</span>
          </div>
          <div className="my-1.5">
            <span className="text-[20px] font-bold text-black tracking-tight">{deck.nextWave}</span>
          </div>
          <div className="flex items-center text-[#8E8E93] text-[11px] leading-none">
            <span>{dueCardsList.length} cards</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full mb-3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E93]">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards, kanji, or meanings..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#eeedf3] text-black placeholder:text-[#8E8E93] text-[15px] focus:outline-none focus:bg-white shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E8E93] hover:text-black"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      {/* Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveFilter('all')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0 transition-colors ${
            activeFilter === 'all' ? 'bg-black text-white' : 'bg-[#eeedf3] text-[#414754] hover:bg-white'
          }`}
        >
          All ({deckCards.length})
        </button>
        <button
          onClick={() => setActiveFilter('due')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0 transition-colors ${
            activeFilter === 'due' ? 'bg-black text-white' : 'bg-[#eeedf3] text-[#414754] hover:bg-white'
          }`}
        >
          Due ({dueCardsList.length})
        </button>
        <button
          onClick={() => setActiveFilter('learning')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0 transition-colors ${
            activeFilter === 'learning' ? 'bg-black text-white' : 'bg-[#eeedf3] text-[#414754] hover:bg-white'
          }`}
        >
          Learning ({learningCardsList.length})
        </button>
        <button
          onClick={() => setActiveFilter('mastered')}
          type="button"
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium shrink-0 transition-colors ${
            activeFilter === 'mastered' ? 'bg-black text-white' : 'bg-[#eeedf3] text-[#414754] hover:bg-white'
          }`}
        >
          Mastered ({masteredCardsList.length})
        </button>
        <button
          onClick={() => setSortAscending(!sortAscending)}
          aria-label="Sort options"
          type="button"
          className="w-8 h-8 rounded-full bg-[#eeedf3] flex items-center justify-center text-[#414754] shrink-0 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">swap_vert</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[12px] uppercase font-semibold text-[#8E8E93] tracking-wider">
          Cards in this deck ({filtered.length})
        </span>
        <button
          onClick={() => {
            setIsSelectMultiple(!isSelectMultiple);
            setSelectedCardIds(new Set());
          }}
          type="button"
          className="text-[12px] text-[#005ab3] font-medium cursor-pointer hover:underline"
        >
          {isSelectMultiple ? 'Cancel Selection' : 'Select Multiple'}
        </button>
      </div>

      {/* Flashcards List */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-slate-300 mb-1">style</span>
            <p className="font-semibold text-slate-700">No cards found</p>
            <p className="text-[13px] text-slate-400 mt-1">Try another search or filter pill.</p>
          </div>
        ) : (
          filtered.map((card) => {
            const isDue = card.dueDate.includes('Due');
            const isNew = card.state === 'new';
            const isMastered = card.state === 'mastered';
            const isSelected = selectedCardIds.has(card.id);

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (isSelectMultiple) toggleSelectCard(card.id);
                  else openStudyMode(deck.id);
                }}
                className={`bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:bg-[#f4f3f8] transition-colors cursor-pointer border ${
                  isSelected ? 'border-[#0A84FF] bg-blue-50/20' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isSelectMultiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCard(card.id)}
                        className="w-4 h-4 rounded text-[#0A84FF] shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[20px] font-bold text-black tracking-tight">{card.front}</h2>
                        {card.frontSub && (
                          <span className="text-[15px] text-[#8E8E93] font-normal">({card.frontSub})</span>
                        )}
                      </div>
                      <p className="text-[15px] text-[#414754] mt-0.5 truncate">{card.back}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    {isDue ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] text-[11px] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />
                        {card.dueDate}
                      </span>
                    ) : isNew ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#d6e3ff] text-[#001b3e] text-[11px] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#005ab3]" />
                        New
                      </span>
                    ) : isMastered ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] text-[11px] font-semibold">
                        {card.dueDate}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#eeedf3] text-[#414754] text-[11px] font-medium">
                        {card.dueDate}
                      </span>
                    )}

                    <button
                      onClick={(e) => handlePlayAudio(e, card)}
                      aria-label="Listen audio preview"
                      type="button"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                        playingAudioId === card.id ? 'bg-[#005ab3] text-white' : 'bg-[#eeedf3] text-[#005ab3]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                  </div>
                </div>

                {/* Retention Progress Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#8E8E93] font-medium w-16">Recall {card.recallPercent}%</span>
                  <div className="flex-1 h-1.5 bg-[#eeedf3] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        card.recallPercent >= 90
                          ? 'bg-[#34C759]'
                          : card.recallPercent >= 70
                          ? 'bg-[#005ab3]'
                          : 'bg-[#FF9F0A]'
                      }`}
                      style={{ width: `${card.recallPercent}%` }}
                    />
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#8E8E93]">chevron_right</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Card to Deck Button */}
      <div className="mt-6 pt-2 flex items-center justify-center">
        <button
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="h-10 px-4 rounded-full bg-white text-[#005ab3] text-[13px] font-semibold shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform border border-black/5"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Add New Card to Deck</span>
        </button>
      </div>

      <AddCardModal
        isOpen={isAddModalOpen}
        deckId={deck.id}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
