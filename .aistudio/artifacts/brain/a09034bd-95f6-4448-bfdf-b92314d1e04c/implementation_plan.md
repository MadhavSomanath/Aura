# Aura — iOS Native AI Voice & Spaced Repetition Flashcards

An iOS Human Interface Guidelines-crafted flashcard and ambient spaced-repetition application. Features full deck management, Gemini-powered card extraction, tactile 4-button SRS study sessions, Web Speech voice recall coaching with pronunciation analysis, and local model settings.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview:
> - **Voice Coach Interactive Mode**: Live Web Speech API speech recognition with AI evaluation and instant conversational coach feedback, paired with graceful simulated fallback when microphone access is restricted.
> - **AI Card Generator**: Full Gemini AI generation (`gemini-3.8-flash` via server-side endpoint) for smart term extraction, definitions, furigana/romaji, and mnemonic generation, alongside local text parsing.
> - **Persistence Model**: LocalStorage state management pre-seeded with rich sample decks (Japanese Vocab JLPT N3, Product Design, Medical Terminology, System Architecture) with real-time update and local export.

---

## 1. Overview & Core Concept

- **What It Does**: Aura is an Apple HIG-styled spaced repetition flashcard platform with on-device aesthetic appeal. Users can organize flashcard decks, study cards with a 4-tier SM-2 inspired SRS grading scale (Again, Hard, Good, Easy), generate new decks from study notes using Gemini AI, practice spoken recall in a real-time hands-free Voice Coach session, and manage on-device model settings.
- **Target Audience**: Language learners (e.g., JLPT Japanese), medical and engineering students, and knowledge workers seeking high-retention spaced repetition with voice reinforcement.
- **Key Value**: Combines visual card review with spoken conversational recall drills, providing feedback on pronunciation, semantics, and pitch accents.

---

## 2. User Experience & Visual Design

### Design System & Aesthetic Direction
Follows the **Aura iOS Native** design specification:
- **Canvas & Surface Tiering**: Background `#F2F2F7` (iOS grouped background), cards and surface containers in pure `#FFFFFF` with 16px (`rounded-2xl`) corners and subtle ambient depth (`box-shadow: 0 2px 8px rgba(0,0,0,0.04)`).
- **Color Accents**: Primary Electric Blue `#0A84FF`, Voice Coach Indigo `#5E5CE6`, Success Green `#34C759`, Warning Orange `#FF9F0A`, and Error Red `#FF453A`.
- **Typography & Proportions**: Cupertino type scale using Inter with tight tracking on headlines (`headline-xl` 34px bold, `title-md` 17px semibold, `body-md` 15px, `caption` 12px), tabular numbers for timers and statistics.
- **Navigation & Ergonomics**:
  - Top Bar: Compact 56px header with single-line title and profile button.
  - Bottom Tab Bar: 4-tab bar (Library, Generator, Voice Coach, Settings) with 44px+ touch targets and active state highlights.
  - Floating Action Button (FAB): Electric blue circular button on Library view to create new decks.

### Key Screens & Interactive Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AURA NAVIGATION FLOW                             │
├─────────────────┬──────────────────┬────────────────────┬───────────────────┤
│    [Library]    │   [Generator]    │   [Voice Coach]    │    [Settings]     │
├─────────────────┼──────────────────┼────────────────────┼───────────────────┤
│ • 5-Day Streak  │ • Note Input     │ • Live Microphone  │ • ANE Diagnostic  │
│   Widget        │ • Mistral/Gemini │   Voice Recall     │ • Active LLM:     │
│ • Study Decks   │   Card Extractor │ • Semantic Scoring │   Llama 3 / Phi   │
│   List (4)      │ • 3-Card Preview │ • Coach Feedback   │ • TTS Voice Picker│
│ • Voice Banner  │   Carousel       │ • Auto-Advancing   │ • Offline Whisper │
│ • Create Deck   │ • Keep / Discard │   Countdown Timer  │   & Haptic Toggles│
│   Modal         │ • Deck Injection │ • Call End/Pause   │ • Speech Rate     │
└────────┬────────┴──────────────────┴────────────────────┴───────────────────┘
         │
         ▼ (Tap Deck or "Study Now")
┌────────────────────────────────────────────────────────┐
│                   [Deck Detail View]                   │
├────────────────────────────────────────────────────────┤
│ • Header, JLPT N3 tag, SRS Active status               │
│ • Metric Cards: 142 Cards, 89% Retention, Next Wave    │
│ • Search bar with instant real-time filtering          │
│ • Segmented Filters: All (142), Due (45), Learning...  │
│ • Flashcards List with Furigana, Audio, Progress Bar   │
│ • "Study Now (45 Due)" Button & "Add New Card" Modal   │
└────────┬───────────────────────────────────────────────┘
         │
         ▼ (Tap "Study Now")
┌────────────────────────────────────────────────────────┐
│              [Active Flashcard Study Mode]             │
├────────────────────────────────────────────────────────┤
│ • Progress Bar (Card 12 of 45, Est. 6 min remaining)   │
│ • Interactive Flashcard Flip & Swipe                   │
│   - Front: Kanji with Furigana Ruby, Context Sentence  │
│   - Back: Meaning, Nuance explanation, Mnemonic box    │
│ • Audio Pronunciation (Web Speech Synthesis / TTS)     │
│ • 4 SRS Grading Buttons: Again, Hard, Good, Easy       │
│ • Quick Launch into Live Voice Coach Session           │
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Gemini Integration**:
  - *Decision*: Route all card generation and semantic voice coaching analysis through an Express backend (`server.ts`) using `@google/genai` with `gemini-3.8-flash`.
  - *Why*: Keeps API keys secure on the server while supporting rich natural language extraction from messy notes and intelligent spoken semantic evaluation.
- **Speech Recognition Architecture (Web Speech API + Fallback)**:
  - *Decision*: Implement native browser `webkitSpeechRecognition` / `SpeechRecognition` with a tap-to-speak interface and simulated quick-input prompts for desktop environments without microphone permissions.
  - *Why*: Delivers an immediate hands-free spoken experience that matches the on-device AI aesthetic.
- **State Management & Local Storage**:
  - *Decision*: Reactive React Context with structured LocalStorage sync for decks, cards, review history, streak counts, and settings preferences.
  - *Why*: Seamless persistence across page reloads without requiring complex authentication or database setup, while allowing reset and seed defaults anytime.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (React)                          │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐  │
│  │   DeckContext      │   │   AudioContext     │   │   Navigation      │  │
│  │  - Decks & Cards   │   │  - Web Speech Rec  │   │  - Tabs & Modals  │  │
│  │  - SRS Intervals   │   │  - SpeechSynthesis │   │  - Active Deck ID │  │
│  │  - Streak Counter  │   │  - Voice Config    │   │  - Study Mode     │  │
│  └─────────┬──────────┘   └─────────┬──────────┘   └───────────────────┘  │
│            │                        │                                     │
│            ▼                        ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         UI Views & Modals                           │  │
│  │  • LibraryView        • DeckDetailView      • ActiveStudyModal      │  │
│  │  • GeneratorView      • LiveVoiceCoachModal • SettingsView          │  │
│  └──────────────────────────────────┬──────────────────────────────────┘  │
└─────────────────────────────────────┼─────────────────────────────────────┘
                                      │ HTTP fetch
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     SERVER (Express + @google/genai)                      │
├───────────────────────────────────────────────────────────────────────────┤
│  • POST /api/generate-cards  --> Calls Gemini to parse notes into cards   │
│  • POST /api/voice-feedback  --> Evaluates spoken answer vs target card   │
│  • Vite dev middlewares mounted for seamless single-port hosting (3000)   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Models
- **Deck**: `id`, `title`, `description`, `category` (Language, Design, Science, Tech), `cardCount`, `retentionRate`, `dueCount`, `newCount`, `lastStudied`.
- **Card**: `id`, `deckId`, `front`, `frontSub`, `romaji`, `sentenceJp`, `sentenceEn`, `back`, `nuance`, `mnemonic`, `recallPercent`, `dueDate`, `intervalDays`, `repetitionCount`, `state` ('new' | 'learning' | 'review' | 'mastered').
- **Settings**: `activeModel`, `ttsVoice`, `offlineWhisper`, `hapticAudio`, `speechRate`.

---

## 5. Verification Plan

1. **Compilation & Build**: Run `compile_applet` to ensure zero TypeScript errors or missing imports.
2. **Navigation Testing**: Verify smooth transitions between Library, Generator, Voice Coach, Settings, Deck Details, and Active Study.
3. **Card Study & SRS**: Test flipping cards, audio pronunciation, and clicking each grading button (Again, Hard, Good, Easy) updating cards remaining and progress bar.
4. **AI Generation**: Test pasting notes, generating cards via the backend, and clicking "Keep" or "Accept All" to append to the deck.
5. **Live Voice Coach**: Test microphone input recognition or quick sample input, AI accuracy rating, auto-advance countdown, and pause/end controls.
6. **Settings & Preferences**: Test toggles, voice selection preview, and speech rate slider affecting audio playback.
