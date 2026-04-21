# Grade 2 Science: Electricity Interactive Labs

**Author:** Brian Franco Estidola, LPT.
**Subject:** Cambridge Primary Science — Stage 2 (Grade 2)
**Topic strand:** Electricity — sources, journey, switches, vocabulary

A small Next.js web app that gives Grade 2 learners four playful ways to explore the electricity unit: sorting devices by their power source, ordering the journey of electricity from the power station to the home, matching switches to their names, and filling in the blanks with a word bank. It is designed to run on a school tablet, a laptop, or a phone, and to be easy for other primary educators to adapt.

---

## What is inside

A friendly dashboard and four mini-games:

1. **Sort the Power** — drag-and-drop devices into *Mains*, *Cells*, or *Non-electrical*.
2. **The Electricity Journey** — put the *Power station → Transmission lines → Distribution lines → House* sequence in order.
3. **Switch Match** — tap-to-match *Press*, *Rocker*, and *Slide* switches with their names and everyday examples.
4. **Finish the Sentence** — drag words from a word bank into nine short sentences.

A simple star counter (shown in the top bar and on the dashboard) grows as students make correct moves. It is saved in the browser so a student's stars stay even after a reload.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** with TypeScript | First-class React support, file-based routing, easy deploys on Vercel |
| UI | **React 18** + **Tailwind CSS** | Fast iteration, mobile-first utilities, simple responsive work |
| Drag & drop | **@dnd-kit/core** and **@dnd-kit/sortable** | Lightweight, touch-friendly, accessible |
| State | **React Context + useReducer** | Small global store — no extra library needed |
| Persistence | **localStorage** (client only) | Lets students keep their stars between sessions |
| Images | **next/image** from `/public` | Optimised loading on tablets and phones |

---

## Design philosophy

- **Light theme, always.** Cream background (`#FDFBF7`) with electric blue (`#1F6FEB`) and bright yellow (`#FFCF1A`) accents. Reduces glare in a bright classroom.
- **Glassmorphism.** Semi-transparent white panels, soft borders, and light backdrop blur make the interface feel friendly without fighting the content.
- **B1 English only.** Instructions, feedback, and questions use short, concrete language suitable for Grade 2 ESL learners. Long technical definitions are only shown as *reveal text* after a student succeeds.
- **No pedagogical labels on screen.** Students never see terms like *5E*, *GRASPS*, *summative*, *success criteria*, or other teacher-facing jargon. Those live in planning documents.
- **No penalties or trick questions.** Correct moves celebrate with stars and a brief banner. Incorrect moves show a gentle nudge and allow another try.
- **Touch first.** Every interactive element has a generous tap target and works with finger input on tablets.

---

## Folder structure

```
electricity-labs/
├── public/
│   ├── devices/              # Mains, cells, and non-electrical item images
│   ├── concept-icons/        # Cells, mains, and switch illustrations
│   └── generation/           # Power station → transmission → distribution → house
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Shell, fonts, <AppShell/>
│   │   ├── page.tsx          # Dashboard
│   │   ├── globals.css       # Tailwind + theme tokens
│   │   └── games/
│   │       ├── sorting/      # Game 1
│   │       ├── sequencing/   # Game 2
│   │       ├── matching/     # Game 3
│   │       └── sentence/     # Game 4
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StarBadge.tsx
│   │   ├── GameCard.tsx
│   │   └── Feedback.tsx
│   ├── context/
│   │   └── XPContext.tsx     # Global star state
│   └── lib/
│       └── assets.ts         # Central image-path map
├── package.json
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── README.md
```

---

## Global state (how the stars are tracked)

All four games read and write to a single React context, `XPContext`:

- Stars are stored per game (`sorting`, `sequencing`, `matching`, `sentence`) so each page can show its own progress, and the dashboard adds them up.
- The reducer supports three actions: `add`, `set`, and `reset`.
- On mount, the context hydrates from `localStorage` under the key `electricity-labs/xp/v1`. Every change is persisted again automatically.
- The top navigation bar shows the running total via the `<StarBadge/>` component.

To reset progress, use **Start again** on the dashboard.

---

## Image mapping rules

All Canva images live in `/public`. Filenames are kept **exactly** as they appear in the source folders so teachers can re-export and replace without touching code. The mapping is centralised in `src/lib/assets.ts`.

| Source folder | `/public` location | Example filename |
|---|---|---|
| `Canva Assets/Electrical and Non-Electrical Devices` | `/public/devices/` | `Broom.png`, `Ceiling-Light.png`, `Dekstop-Computer.png`, `Digital-Calculator.png`, `Dining-Table.png`, `Electric-Fan.png`, `Flashlight.png`, `Interactive-Whiteboard.png`, `Manual-Pencil-Sharpener.png`, `Remote.png`, `Scissors.png`, `Small-Toy-Robot.png`, `Stapler.png`, `Television.png`, `Whiteboard.png` |
| `Canva Assets/Electrical Concept Icons` | `/public/concept-icons/` | `cells.png`, `mains.png`, `press-switch.png`, `rocker-switch.png`, `slide-switch.png` |
| `Canva Assets/Electricity Generation` | `/public/generation/` | `Power-Station.png`, `Transmission-Lines.png`, `Distribution-Lines.png`, `House.png` |

If you add or rename images, update `src/lib/assets.ts` — that file is the single source of truth. Components import keys from it (`deviceImages.ceilingLight`, `conceptIcons.pressSwitch`, etc.), so a filename change only needs a one-line edit.

---

## Running the app locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
# http://localhost:3000
```

Other helpful scripts:

```bash
npm run build        # Production build
npm start            # Run the production build
npm run type-check   # TypeScript only
npm run lint         # ESLint (Next.js preset)
```

Node 18.17 or newer is required (Next.js 14 baseline).

---

## Deploying to Vercel

The project is a plain Next.js app and ships with no custom runtime settings.

1. Push the folder to a Git repository (GitHub or GitLab).
2. In Vercel, click **New Project → Import Git Repository** and select the repo.
3. Leave the framework preset on **Next.js**. Build command: `next build`. Output directory: `.next`. No environment variables are required.
4. Click **Deploy**. Vercel will build and serve the app on a `*.vercel.app` URL.
5. To update the live site, commit to the main branch — Vercel rebuilds automatically.

If you prefer the CLI:

```bash
npm install -g vercel
vercel         # first-time setup (creates the project)
vercel --prod  # promote to production
```

---

## Adapting the app for your class

The app was built so other primary educators can reshape it without diving deep into the code.

- **Swap images:** replace files in `/public` and, if needed, rename the keys in `src/lib/assets.ts`.
- **Change wording:** sentences and labels live at the top of each game's `page.tsx` in a single `SENTENCES`, `ITEMS`, `STEPS`, or `SWITCHES` array. Edit these arrays to match your vocabulary list.
- **Add a new game:** duplicate any of the four folders in `src/app/games/` and add a matching link to `NAV` in `src/components/Sidebar.tsx` and a new `<GameCard/>` to `src/app/page.tsx`. Remember to add a new key to `XPContext`'s `GameId` type and `stars` object.
- **Recolour the theme:** update the `spark`, `sun`, and `cream` tokens in `tailwind.config.ts`. All components use these classes, so one edit restyles the whole app.

---

## Accessibility notes

- Keyboard focus is visible on every interactive element (thick blue ring).
- Drag-and-drop uses both pointer and touch sensors with a short activation delay, reducing accidental drags on tablets.
- All images have `alt` text.
- Feedback banners use `role="status"` and `aria-live="polite"` so screen readers announce them.

---

## License and credits

Written by **Brian Franco Estidola, LPT.** for IPH Schools, Surabaya. You are welcome to use and adapt this app in your classroom. Please keep the attribution in the dashboard footer if you share a fork publicly.

Image assets are original Canva designs prepared for this unit.
