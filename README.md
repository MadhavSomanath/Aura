# Aura — iOS Native AI Voice & Spaced Repetition Flashcards

> **Product Teardown & Engineering Spec**

---

## 📱 Executive Summary & Product Vision

Traditional flashcard applications suffer from **passive recognition bias** and **tap-grading fatigue**: learners repeatedly tap "Good" on cards they recognize visually, but cannot retrieve verbally under conversational pressure. This gap is especially painful for language acquisition (e.g. Japanese JLPT), medical terminology, and technical systems engineering.

**Aura** reimagines spaced repetition for the Apple ecosystem. It bridges visual flashcards with **hands-free ambient voice recall**, empowering learners to verbally explain concepts while an on-device AI coach evaluates pronunciation, semantic precision, and nuance in real time.

Built around **Apple Human Interface Guidelines (HIG)**, Aura delivers the tactile fluidity and privacy-first positioning of native iOS software with seamless zero-telemetry local intelligence.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              THE AURA FLYWHEEL                            │
│                                                                           │
│   ┌────────────────┐       ┌─────────────────┐       ┌────────────────┐  │
│   │ 1. Raw Notes   │ ───▶  │ 2. AI Generator │ ───▶  │ 3. Smart Decks │  │
│   │ Unstructured   │       │ Structured SM-2 │       │ Spaced Waves   │  │
│   └────────────────┘       └─────────────────┘       └───────┬────────┘  │
│                                                              │           │
│   ┌────────────────┐       ┌─────────────────┐               │           │
│   │ 5. Mastery &   │ ◀───  │ 4. Voice Recall │ ◀─────────────┘           │
│   │ Retention Loop │       │ Ambient Coach   │                           │
│   └────────────────┘       └─────────────────┘                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Product Pillars

### 1. Spaced Repetition Engine (SM-2 Core)
- **4-Tier Ergonomic Grading**: `Again (<1m)`, `Hard (12m)`, `Good (1d)`, and `Easy (4d)` tuned with haptic feedback to prevent mis-clicks.
- **Dynamic Wave Forecasting**: Real-time interval calculation (`Next Wave in 2h 40m`) based on historical retention decay.
- **Visual Retention Metering**: Segmented card-level recall percentage and deck-level confidence indicators.

### 2. Ambient AI Voice Coach (Hands-Free Call Interface)
- **Conversational Call UX**: Styled after iOS Phone / FaceTime audio calls with Whisper Core ML aesthetic.
- **Live Acoustic Capture**: Uses the Web Speech API (`SpeechRecognition`) for immediate transcription alongside one-tap test prompts for restricted mic environments.
- **Semantic Nuance Evaluation**: Evaluates meaning, grammar context, and collocations (e.g. recognizing that *約束* frequently pairs with *する*).
- **Auto-Advancing Flow**: 3-second auto-advance timer for unbroken flow-state study sessions.

### 3. Generative Notes-to-Flashcards Pipeline
- **Smart Extraction**: Converts unstructured lecture notes, articles, or transcripts into spaced-repetition cards via Gemini 3.8 Flash (`@google/genai`).
- **Comprehensive Linguistic Anatomy**: Automatically extracts `<ruby>` furigana annotations, romaji, nuanced usage notes, authentic sample sentences, and memorable mnemonic hooks.
- **Review & Staging Carousel**: Horizontal card carousel allowing selective `Keep` or `Discard` before committing to the deck.

### 4. Hardware Diagnostic & Local Model Management
- **Apple Neural Engine (ANE) Telemetry**: Live diagnostic monitoring 5.6 GB of local model storage (LLM weights, TTS voice packs, and cache).
- **Multi-Engine Switching**: Toggle between `Llama-3-8B-Instruct` (quantized) and `Phi-3.5 Mini`.
- **High-Fidelity Offline TTS**: Voice previews for *Kenji* (JP Natural Female), *Daiki* (JP Deep Male), *Sakura*, and *Elena* with speed scaling from 0.75x to 1.50x.

---

## 📐 System Architecture

Aura uses a hybrid client-server topology designed for low-latency client transitions and secure server-side AI execution:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (React)                          │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌───────────────────────┐   ┌─────────────────────────────────────────┐  │
│  │     DeckContext       │   │           Speech & Audio Engine         │  │
│  │  - LocalStorage Sync  │   │  - SpeechRecognition (Web Speech API)   │  │
│  │  - SM-2 Intervals     │   │  - SpeechSynthesis (Pitch & Pace)       │  │
│  │  - Streak Counter     │   │  - Taptic Engine Haptic Feedback        │  │
│  └───────────┬───────────┘   └────────────────────┬────────────────────┘  │
│              │                                    │                       │
│              ▼                                    ▼                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         UI Views & Modals                           │  │
│  │  [Library]       [Deck Detail]     [Study Session]  [Voice Coach]   │  │
│  │  • Streak Deck   • Search & Filter • 4-Button SRS   • Live Dialogue │  │
│  │  • Create Deck   • Audio Playback  • Furigana Ruby  • Auto-Advance  │  │
│  └──────────────────────────────────┬──────────────────────────────────┘  │
└─────────────────────────────────────┼─────────────────────────────────────┘
                                      │ HTTP REST (/api/*)
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER (Express + Vite)                      │
├───────────────────────────────────────────────────────────────────────────┤
│  • POST /api/generate-cards  --> Structured Gemini 3.8 Flash pipeline     │
│  • POST /api/voice-feedback  --> Semantic accuracy and pedagogical tips   │
│  • Vite Middleware           --> Single-port (3000) full-stack serving    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System & HIG Compliance

The visual language follows the **Aura iOS Native** design constitution:

| Token | Semantic Role | Value |
|---|---|---|
| **Background** | System Grouped Canvas | `#F2F2F7` |
| **Surface** | Elevated Content Container | `#FFFFFF` (`rounded-2xl`, ambient 2px shadow) |
| **Primary Accent** | iOS Electric Blue | `#0A84FF` / `#005ab3` |
| **Coach Gradient** | AI Voice Glow | Linear Gradient (`#5E5CE6` → `#0A84FF`) |
| **Feedback: Success** | High Retention / Pass | `#34C759` |
| **Feedback: Warning** | Due Spikes / Medium Retention | `#FF9F0A` |
| **Feedback: Error** | Lapses / Hard Reset | `#FF453A` / `#ba1a1a` |
| **Typography** | Apple System Type Scale | Inter (Tight negative tracking on large titles) |

- **44px Touch Rule**: All interactive buttons, chips, and list rows maintain $\ge 44 \times 44\text{px}$ touch targets.
- **Zero-Pill Metadata**: Quiet inline text with subtle typographic dots (`·`) instead of loud static badges.
- **15% Mobile Sticky Cap**: Header and tab bar combined occupy $< 15\%$ of viewport height.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Modern browser with Web Speech API support (Chrome, Safari, Edge)
- (Optional) `GEMINI_API_KEY` for live AI generation and semantic voice scoring

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/aura-flashcards.git
cd aura-flashcards

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env (if calling Gemini endpoints)

# Start the full-stack development server
npm run dev
```

The app will be live at `http://localhost:3000`.

---

## 🧪 Verification & Test Suite

```bash
# Check TypeScript compilation
npm run lint

# Verify production build
npm run build
```

---

## 🔮 Product Roadmap

- [x] **v1.0**: Core SM-2 Spaced Repetition engine with 4 pre-seeded decks.
- [x] **v1.1**: Hands-free Voice Coach call view with real-time speech feedback.
- [x] **v1.2**: Gemini-powered smart note extraction pipeline.
- [ ] **v2.0**: Direct Core ML WebGPU execution for 100% offline in-browser Whisper inference.
- [ ] **v2.1**: Apple Pencil canvas mode for handwritten kanji and diagram recall.
- [ ] **v2.2**: iCloud sync and Anki `.apkg` deck import/export.

---

## 📄 License
Apache-2.0
