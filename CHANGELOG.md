# Changelog

All notable changes to **Grade 2 Science: Electricity Interactive Labs** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Game 2 — The Electricity Journey** (`/games/sequencing`): Improved touch support by removing the touch activation delay and making the entire card draggable instead of restricting it to the small drag handle. Increased the size of the visual cues ("Step" badge and "Drag" label) to be more touch-friendly for kids.

## [1.0.0] — 2026-04-21

### Added
- **Dashboard** (`/`) with a welcome hero, a live star counter, four large glassmorphism game cards, and a *How to play* helper panel.
- **Collapsible navigation** — sticky top bar with a hamburger menu on small screens, and a persistent glass sidebar on large screens. Active route is highlighted.
- **Global star state** — `XPContext` tracks stars per game (`sorting`, `sequencing`, `matching`, `sentence`) plus a total. State is hydrated from and persisted to `localStorage` under `electricity-labs/xp/v1`. Exposed helpers: `addStars`, `setStars`, `reset`.
- **`<StarBadge/>`** — shared badge that shows the running total in the navigation and on game pages.
- **Game 1 — Sort the Power** (`/games/sorting`). Drag-and-drop with `@dnd-kit/core`. Fifteen device images sort into three zones: *Mains*, *Cells*, *Non-electrical*. One star per correct placement. Gentle retry feedback, no penalties.
- **Game 2 — The Electricity Journey** (`/games/sequencing`). Horizontal sortable list using `@dnd-kit/sortable`. Students arrange Power station → Transmission lines → Distribution lines → House. Reveals the full journey text on success.
- **Game 3 — Switch Match** (`/games/matching`). Tap-to-match interaction between three switch images (*Press*, *Rocker*, *Slide*) and their names, with real-world classroom examples.
- **Game 4 — Finish the Sentence** (`/games/sentence`). Nine fill-in-the-blank sentences with a draggable word bank (`cells, distribution, mains, non-electrical, power station, press, rocker, steam, transmission`).
- **Feedback banner** — reusable `<Feedback/>` component with correct/retry variants. Uses `role="status"` and `aria-live="polite"`.
- **Light theme + glassmorphism styling** — cream background (`#FDFBF7`), electric blue (`#1F6FEB`) and bright yellow (`#FFCF1A`) accents, soft shadows, backdrop blur, rounded pill controls.
- **Central asset map** — `src/lib/assets.ts` exports `deviceImages`, `conceptIcons`, and `generationImages`, so renaming a file only requires a one-line edit.
- **Accessibility baseline** — generous focus rings, alt text on all images, touch sensor activation delay to prevent accidental drags, live regions for feedback.
- **Documentation** — `README.md` covering stack, setup, Vercel deployment, folder structure, global state architecture, image-mapping rules, and adaptation guide for other primary educators.

### Design decisions
- No dark mode. Classroom displays perform better with a light background.
- B1 English only on student-facing screens. Technical terms (mains, cells, transmission lines) are kept because they are the vocabulary target, but all instructions and feedback use plain, short language.
- No pedagogical labels (e.g. *5E*, *summative*, *success criterion*) on student-facing screens.
- No penalty mechanics. A wrong move returns the item to the tray or bank, and a gentle nudge appears. Stars can only go up through correct moves; the *Start again* button is the only way to reset.

### Tech stack
- Next.js 14.2.5 (App Router), React 18.3.1, TypeScript 5.4.3
- Tailwind CSS 3.4.3 with custom `spark`, `sun`, and `cream` tokens
- `@dnd-kit/core` 6.1.0 and `@dnd-kit/sortable` 8.0.0
