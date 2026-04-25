# Changelog

All notable changes to **Grade 2 Science: Electricity Interactive Labs** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] — 2026-04-25

### Added
- **Circuit Simulation Engine**: Integrated a robust electrical circuit solver (`circuitSolver.ts`) to calculate real-world values like current, voltage, and power using Ohm's Law.
- **Component Behaviors & Failures**: Enabled component-specific logic including overload detection and component failure (e.g., blown bulbs) based on maximum current thresholds.
- **Live UI Updates**: The UI now accurately reflects physical state changes such as bulbs blowing out from too much current.
- **Simulation Continuity**: Maintained full compatibility with the existing magnetic snapping and mobile-responsive drag-and-drop systems.

### Changed
- Replaced the previous DFS-based connection check with the new solver architecture to provide realistic simulation outcomes.

## [1.2.0] — 2026-04-24

### Added
- **Major Circuit Builder Upgrade (Phase 1-3)**: 
    - Maximized canvas workspace to fill the entire screen.
    - New skeuomorphic component design with premium aesthetics.
    - **Phet-Style Bulb**: Redesigned Bulb icon with realistic metallic base and dynamic raytracing effects that scale with power intensity.
    - Added **Switch** component with toggle functionality.
    - **Physical Wires**: Wires are now draggable objects with endpoints that snap to component terminals.
    - **Magnetic Snapping**: Components can now be dragged directly next to one another. Their terminals will magnetically snap, creating a valid, wire-free connection!
    - Expanded **Gamified Missions**: 5 Interactive challenges including lighting a bulb, adding a switch, using 2 batteries, wire-free connections, and buzzers.
    - **Live Status Panel**: Friendly student feedback if the circuit is broken or working.
    - Removed **Resistor** to adapt the tool perfectly for Grade 2 curriculum.


## [1.1.0] — 2026-04-22

### Added
- **Game 5 — Working Safely with Electricity** (`/games/safety`): Added a new True or False module for safety rules around electricity. Includes explanations for each statement.

### Changed
- **Game 2 — The Electricity Journey** (`/games/sequencing`): Improved touch support by removing the touch activation delay and making the entire card draggable instead of restricting it to the small drag handle. Increased the size of the visual cues ("Step" badge and "Drag" label) to be more touch-friendly for kids.
- **Game 3 — Switch Match** (`/games/matching`): Added Phase 2 sorting challenge. Students must now drag and drop common devices (like Ceiling Lights, Interactive Whiteboards, and Flashlights) into their respective switch type (Rocker, Press, or Slide). Expanded star points calculation to account for these additional challenges.
- **Navigation**: Added "Working Safely" to the sidebar and fixed a hydration bug in `XPContext` that caused "NaN stars" when adding new game modules.

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
