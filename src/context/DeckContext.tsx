import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deck, Flashcard, AppSettings, StudyGrade } from '../types';
import { INITIAL_DECKS, INITIAL_CARDS, DEFAULT_SETTINGS } from '../data/initialDecks';
import { triggerHaptic } from '../services/speechService';

interface DeckContextType {
  decks: Deck[];
  cards: Flashcard[];
  settings: AppSettings;
  activeDeckId: string;
  activeStudyDeckId: string | null;
  activeVoiceCoachDeckId: string | null;
  dailyStreak: number;
  reviewedTodayCount: number;
  weekProgress: boolean[];
  setActiveDeckId: (id: string) => void;
  openStudyMode: (deckId: string) => void;
  closeStudyMode: () => void;
  openVoiceCoach: (deckId?: string) => void;
  closeVoiceCoach: () => void;
  gradeCard: (cardId: string, grade: StudyGrade) => void;
  addDeck: (deck: { title: string; description: string; category: Deck['category'] }) => string;
  deleteDeck: (deckId: string) => void;
  addCard: (card: Partial<Flashcard> & { deckId: string; front: string; back: string }) => void;
  addMultipleCards: (newCards: Array<Partial<Flashcard> & { deckId: string; front: string; back: string }>) => void;
  deleteCard: (cardId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetDefaults: () => void;
}

const LOCAL_STORAGE_KEY_DECKS = 'aura_decks_v1';
const LOCAL_STORAGE_KEY_CARDS = 'aura_cards_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'aura_settings_v1';
const LOCAL_STORAGE_KEY_STREAK = 'aura_streak_v1';

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DECKS);
      return saved ? JSON.parse(saved) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [dailyStreak, setDailyStreak] = useState<number>(5);
  const [reviewedTodayCount, setReviewedTodayCount] = useState<number>(24);
  const [weekProgress] = useState<boolean[]>([true, true, true, true, true, false, false]);

  const [activeDeckId, setActiveDeckId] = useState<string>('deck_japanese');
  const [activeStudyDeckId, setActiveStudyDeckId] = useState<string | null>(null);
  const [activeVoiceCoachDeckId, setActiveVoiceCoachDeckId] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DECKS, JSON.stringify(decks));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [decks]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CARDS, JSON.stringify(cards));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [settings]);

  const openStudyMode = (deckId: string) => {
    setActiveStudyDeckId(deckId);
  };

  const closeStudyMode = () => {
    setActiveStudyDeckId(null);
  };

  const openVoiceCoach = (deckId?: string) => {
    setActiveVoiceCoachDeckId(deckId || activeDeckId || 'deck_japanese');
  };

  const closeVoiceCoach = () => {
    setActiveVoiceCoachDeckId(null);
  };

  const gradeCard = (cardId: string, grade: StudyGrade) => {
    triggerHaptic(settings.hapticAudio);
    setCards((prevCards) => {
      const updated = prevCards.map((c) => {
        if (c.id !== cardId) return c;

        let nextInterval = c.intervalDays;
        let nextReps = c.repetitionCount;
        let nextRecall = c.recallPercent;
        let nextDueDate = c.dueDate;
        let nextState = c.state;

        switch (grade) {
          case 'again':
            nextInterval = 0;
            nextReps = 0;
            nextRecall = Math.max(30, c.recallPercent - 15);
            nextDueDate = 'Due in 1m';
            nextState = 'learning';
            break;
          case 'hard':
            nextInterval = Math.max(1, Math.round(c.intervalDays * 1.2));
            nextRecall = Math.min(95, c.recallPercent + 2);
            nextDueDate = 'Due in 12m';
            nextState = 'review';
            break;
          case 'good':
            nextInterval = c.intervalDays === 0 ? 1 : Math.round(c.intervalDays * 2);
            nextReps += 1;
            nextRecall = Math.min(98, c.recallPercent + 5);
            nextDueDate = nextInterval === 1 ? 'Due tomorrow' : `In ${nextInterval}d`;
            nextState = nextInterval > 3 ? 'mastered' : 'review';
            break;
          case 'easy':
            nextInterval = c.intervalDays === 0 ? 4 : Math.round(c.intervalDays * 2.8);
            nextReps += 1;
            nextRecall = Math.min(100, c.recallPercent + 10);
            nextDueDate = `In ${nextInterval}d`;
            nextState = 'mastered';
            break;
        }

        return {
          ...c,
          intervalDays: nextInterval,
          repetitionCount: nextReps,
          recallPercent: nextRecall,
          dueDate: nextDueDate,
          state: nextState,
          lastStudiedDate: new Date().toISOString(),
        };
      });

      return updated;
    });

    setReviewedTodayCount((prev) => prev + 1);

    // Refresh deck aggregate metrics
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setDecks((prevDecks) =>
        prevDecks.map((d) => {
          if (d.id !== card.deckId) return d;
          const deckCards = cards.filter((c) => c.deckId === d.id);
          const totalRetention = deckCards.reduce((acc, curr) => acc + curr.recallPercent, 0);
          const avgRetention = Math.round(totalRetention / (deckCards.length || 1));
          return {
            ...d,
            dueCards: Math.max(0, d.dueCards - (grade !== 'again' ? 1 : 0)),
            retentionRate: avgRetention,
            lastStudied: 'Just now',
          };
        })
      );
    }
  };

  const addDeck = (newDeckData: { title: string; description: string; category: Deck['category'] }): string => {
    const newId = `deck_${Date.now()}`;
    const newDeck: Deck = {
      id: newId,
      title: newDeckData.title,
      description: newDeckData.description,
      category: newDeckData.category,
      badge: newDeckData.category,
      totalCards: 0,
      newCards: 0,
      dueCards: 0,
      retentionRate: 100,
      lastStudied: 'Just created',
      nextWave: 'Ready now',
    };
    setDecks((prev) => [newDeck, ...prev]);
    return newId;
  };

  const deleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
    if (activeDeckId === deckId) {
      setActiveDeckId(decks[0]?.id || '');
    }
  };

  const addCard = (cardData: Partial<Flashcard> & { deckId: string; front: string; back: string }) => {
    const newCard: Flashcard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      deckId: cardData.deckId,
      front: cardData.front,
      frontSub: cardData.frontSub || '',
      romaji: cardData.romaji || '',
      back: cardData.back,
      nuance: cardData.nuance || '',
      mnemonic: cardData.mnemonic || '',
      sentenceJp: cardData.sentenceJp || '',
      sentenceEn: cardData.sentenceEn || '',
      tag: cardData.tag || 'Custom',
      recallPercent: 60,
      intervalDays: 0,
      repetitionCount: 0,
      dueDate: 'New',
      state: 'new',
    };

    setCards((prev) => [newCard, ...prev]);
    setDecks((prev) =>
      prev.map((d) =>
        d.id === cardData.deckId
          ? {
              ...d,
              totalCards: d.totalCards + 1,
              newCards: d.newCards + 1,
              dueCards: d.dueCards + 1,
            }
          : d
      )
    );
  };

  const addMultipleCards = (newCardsData: Array<Partial<Flashcard> & { deckId: string; front: string; back: string }>) => {
    const createdCards: Flashcard[] = newCardsData.map((data, index) => ({
      id: `card_${Date.now()}_${index}`,
      deckId: data.deckId,
      front: data.front,
      frontSub: data.frontSub || '',
      romaji: data.romaji || '',
      back: data.back,
      nuance: data.nuance || '',
      mnemonic: data.mnemonic || '',
      sentenceJp: data.sentenceJp || '',
      sentenceEn: data.sentenceEn || '',
      tag: data.tag || 'AI Generated',
      recallPercent: 65,
      intervalDays: 0,
      repetitionCount: 0,
      dueDate: 'New',
      state: 'new',
    }));

    setCards((prev) => [...createdCards, ...prev]);

    // Update target decks
    const countsByDeck: Record<string, number> = {};
    createdCards.forEach((c) => {
      countsByDeck[c.deckId] = (countsByDeck[c.deckId] || 0) + 1;
    });

    setDecks((prev) =>
      prev.map((d) => {
        const added = countsByDeck[d.id] || 0;
        return added > 0
          ? {
              ...d,
              totalCards: d.totalCards + added,
              newCards: d.newCards + added,
              dueCards: d.dueCards + added,
            }
          : d;
      })
    );
  };

  const deleteCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (card) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setDecks((prev) =>
        prev.map((d) =>
          d.id === card.deckId
            ? {
                ...d,
                totalCards: Math.max(0, d.totalCards - 1),
                dueCards: card.dueDate.includes('Due') ? Math.max(0, d.dueCards - 1) : d.dueCards,
              }
            : d
        )
      );
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_DECKS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CARDS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS);
    setDecks(INITIAL_DECKS);
    setCards(INITIAL_CARDS);
    setSettings(DEFAULT_SETTINGS);
    setReviewedTodayCount(24);
  };

  return (
    <DeckContext.Provider
      value={{
        decks,
        cards,
        settings,
        activeDeckId,
        activeStudyDeckId,
        activeVoiceCoachDeckId,
        dailyStreak,
        reviewedTodayCount,
        weekProgress,
        setActiveDeckId,
        openStudyMode,
        closeStudyMode,
        openVoiceCoach,
        closeVoiceCoach,
        gradeCard,
        addDeck,
        deleteDeck,
        addCard,
        addMultipleCards,
        deleteCard,
        updateSettings,
        resetDefaults,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};
