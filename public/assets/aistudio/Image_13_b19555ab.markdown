---
name: Aura iOS Native
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414754'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c0c6d6'
  surface-tint: '#005db8'
  primary: '#005ab3'
  on-primary: '#ffffff'
  primary-container: '#0073e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#4a47d2'
  on-secondary: '#ffffff'
  secondary-container: '#6462ec'
  on-secondary-container: '#fffbff'
  tertiary: '#9a4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c25300'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006b'
  on-secondary-fixed-variant: '#332dbc'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
  background-light: '#F2F2F7'
  surface-light: '#FFFFFF'
  surface-dark: '#1C1C1E'
  background-dark: '#000000'
  text-primary: '#000000'
  text-secondary: '#8E8E93'
  success-green: '#34C759'
  warning-orange: '#FF9F0A'
  error-red: '#FF453A'
  coach-gradient-start: '#5E5CE6'
  coach-gradient-end: '#0A84FF'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies the clarity, intentionality, and tactile restraint of native Apple Human Interface Guidelines. Built for high-focus mobile interaction and ambient AI collaboration, it emphasizes extreme legibility, instantaneous comprehension, and native ergonomics.

The visual style is Corporate Modern rooted in Cupertino minimalism:
- **Surface Simplicity:** Pure iOS canvas structures using layered grouped backgrounds and elevated surface containers.
- **Vibrant Functional Accents:** System electric blue establishes intentional, purposeful focal points without visual clutter.
- **Spatial Focus:** High typographical hierarchy combined with pill geometries, creating an intuitive touch-first experience tailored for fluid one-handed mobile navigation.

## Colors

The color palette utilizes Apple's standardized system light semantic tokens, prioritizing high-contrast legibility:

- **Primary Accent (`#0A84FF`):** iOS System Electric Blue, reserved strictly for primary interactive affordances, active navigation items, and highlighted controls.
- **Secondary Accent (`#5E5CE6`):** Deep indigo, utilized primarily for the AI Voice Coach gradient blend and secondary highlights.
- **Canvas & Surface Tiering:**
  - Base background canvas uses system grouped background `#F2F2F7`.
  - Elevated surfaces and grouped content blocks use pure `#FFFFFF`.
- **Text & Hierarchy:**
  - High-emphasis labels and body text use deep black `#000000`.
  - Supporting meta-labels, secondary hints, and inactive states use `#8E8E93`.
- **Functional States:** Success (`#34C759`), Warning (`#FF9F0A`), and Error (`#FF453A`) provide direct, unambiguous semantic feedback.

## Typography

The type scale mirrors standard iOS proportional sizing and optical weight distribution using Inter to maintain native system typographic fidelity:

- **Large Titles (`headline-xl`):** 34px bold with tight negative tracking, reserved for primary navigation headers and top-level screen anchors.
- **Card Titles & Headers (`headline-lg` & `headline-sm`):** Sized for swift legibility during study decks and focused session cards.
- **Body (`body-lg`):** Standard iOS 17px body scale with 1.4x line height to optimize sustained reading comfort.
- **System Labels & Captions (`label-md`, `caption`):** Neutralized secondary weights for metadata, badge counts, and timestamps.

## Layout & Spacing

Layout adheres strictly to Apple's touch ergonomic guidelines and vertical card flow:

- **Touch Margins & Gutters:** Base layout margin is 16px (`1rem`) on standard viewports, expanding to 24px (`1.5rem`) on larger device classes.
- **Card Architecture:** Content modules feature 24px (`1.5rem`) inner padding to maintain breathing room around study prompts and AI coach dialogues.
- **Ergonomics & Tap Targets:** All interactive triggers maintain an absolute minimum touch zone of 44x44px. Bottom toolbars and primary call-to-actions are positioned within the primary thumb sweep zone.

## Elevation & Depth

Visual depth is achieved through native layered surfaces paired with ultra-diffuse ambient occlusion rather than heavy drop shadows:

- **Surface Tier 0 (Canvas):** `#F2F2F7` base system background.
- **Surface Tier 1 (Cards & Modals):** Pure `#FFFFFF` resting atop Tier 0, separated by a crisp 1px subtle hairline border (`rgba(0, 0, 0, 0.04)`) and an ambient shadow (`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)`).
- **Floating Controls (FAB & AI Triggers):** Elevated higher with `box-shadow: 0 4px 16px rgba(10, 132, 255, 0.24)` to communicate dynamic interaction and floating presence above the scroll plane.
- **Translucency & Blurs:** Navigation headers and bottom toolbars employ native frosted glass (`backdrop-filter: blur(20px) saturate(180%)`) with semi-transparent surfaces (`rgba(255, 255, 255, 0.85)`).

## Shapes

The geometric signature combines continuous iOS squircle-style corner radii with full pill geometries:

- **Buttons & Chips:** Pure pill shapes (`border-radius: 9999px`) provide immediate visual signifiers of interactive affordance.
- **Content Cards & Modules:** Standardized to a 16px radius (`rounded-md` equivalent in standard pill scale), reflecting modern iOS widget standards.
- **Sheets & Modals:** Large curved anchors (`rounded-lg` at 32px) hugging sheet presentation borders.

## Components

### Primary & Pill Buttons
- **Style:** Full-width (accounting for 16px page margins) or auto-sized pill buttons (`border-radius: 9999px`).
- **Primary:** Background `#0A84FF`, text pure `#FFFFFF`, font weight 600, minimum height 50px.
- **Secondary / Subtle:** Background `rgba(10, 132, 255, 0.12)`, text `#0A84FF`.

### Floating Action Button (FAB)
- **Geometry:** 56x56px circular container.
- **Styling:** Dynamic gradient fill (`#5E5CE6` to `#0A84FF`), centered icon, elevated with soft blue colored shadow. Positioned 16px from right and bottom safe area edge.

### Content Cards
- **Geometry:** 16px rounded corners, pure white background, 24px inner padding.
- **Borders & Shadows:** 1px hairline border in `rgba(0,0,0,0.05)`, subtle 2px Y-offset shadow.

### Input Fields & Controls
- **Inputs:** Height 48px, rounded 12px, filled background `#FFFFFF` with muted placeholder `#8E8E93`.
- **Selection Controls:** Standard iOS switches with primary accent `#0A84FF` active state; checkboxes and radios utilize rounded pill check indicators with crisp tick marks.

### Voice Coach Status Pill
- **Geometry:** Compact capsule displaying active AI voice state with dual gradient ring (`#5E5CE6` to `#0A84FF`) and pulse wave micro-animations.