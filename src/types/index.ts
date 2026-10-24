export type DeckCategory = 'Language' | 'Design' | 'Science' | 'Tech';

export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;          // e.g. 約束 or Fitts's Law
  frontSub?: string;      // e.g. (やくそく)
  romaji?: string;        // e.g. yakusoku
  back: string;           // Definition/meaning
  nuance?: string;        // Grammatical nuance / usage context
  mnemonic?: string;      // Memory hook
  sentenceJp?: string;    // Japanese / contextual example
  sentenceEn?: string;    // English translation of example
  tag?: string;           // Sub-tag e.g. JLPT N2/N3, Core 2000, Heuristics
  recallPercent: number;  // e.g. 75
  intervalDays: number;   // Spaced repetition interval
  repetitionCount: number;
  lastStudiedDate?: string;
  dueDate: string;        // ISO date or relative time string
  state: CardState;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: DeckCategory;
  badge?: string;         // e.g. 'JLPT N3'
  totalCards: number;
  newCards: number;
  dueCards: number;
  retentionRate: number;  // e.g. 89
  lastStudied: string;    // e.g. 'Today', 'Yesterday', '2 days ago'
  nextWave: string;       // e.g. '2h 40m'
}

export type StudyGrade = 'again' | 'hard' | 'good' | 'easy';

export interface AppSettings {
  activeModel: string;
  computeAccelerator: string;
  ttsVoice: string;
  offlineWhisper: boolean;
  hapticAudio: boolean;
  speechRate: number;     // 0.75 - 1.5
}

export interface VoiceCoachDialogue {
  cardId: string;
  userTranscript: string;
  matchPercent: number;
  rating: 'Excellent (Pass)' | 'Good' | 'Needs Review';
  coachFeedback: string;
}
