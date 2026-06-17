# WAYNE OS // The Dark Knight Protocol — V4

The Gotham discipline engine, migrated from a single `index.html` to a modern
React stack. The brutal psychology is intact; the machinery underneath is now
production-grade.

> The original vanilla prototype is preserved as **`index1.html`** for reference.

## Stack

- **React 18 + Vite** — fast dev server, single-command build
- **Tailwind CSS** — Vantablack "Gotham Terminal" theme (see `tailwind.config.js`)
- **Framer Motion** — cinematic layout animations, spring modals, toast stack
- **Recharts** — the Batcomputer historical telemetry
- **Zustand (+ persist)** — state + LocalStorage persistence (`wayneOSv3`)
- **Lucide React** — minimalist iconography

## Run it

```bash
npm install
npm run dev      # opens http://localhost:6626
npm run build    # production bundle in /dist
```

## The 7 Upgrade Directives — where they live

1. **Wayne-Tech Persistence + Encrypted Backup** — `store.js` (zustand persist),
   `components/BackupPanel.jsx` (export/import JSON).
2. **Batcomputer Analytics** — `components/Analytics.jsx` + `build30DaySeries`
   in `store.js`. Reactive Alfred verdict reads your last 14 days.
3. **Threat-Level Sorting** — `THREAT` ladder in `constants.js`, `sortByThreat`
   in `store.js`. Arkham-Level tasks pulse via `animate-arkham-pulse`.
4. **Patrol Routes (recurring)** — `RECUR` model in `constants.js`,
   `rolloverCheck()` re-arms due routes at midnight (`store.js`).
5. **The Alfred Protocol** — `pushToast` / `requestNotify` in `store.js`,
   `components/AlfredToaster.jsx`, idle nudges in `App.jsx`. Uses the browser
   Notification API when permitted, with in-app toasts always.
6. **Mission Modification** — `components/EditTaskModal.jsx`, spring-animated.
7. **World-Class UI/UX** — glassmorphism (`.glass`), color theory, and Framer
   Motion layout transitions throughout.

## Core mechanics preserved

The Trinity (Body / Mind / Wealth) plus Allies / Soul / Machine, ~30 incremental
upgrades per sector, Wayne Coins (auto-shield against **Joker Chaos** on
completion), the **Bat-Signal** 3× priority task, **Ra's al Ghul**'s reactive
mockery, the punitive overdue-task drain, and the fear-toxin penalty flash.

## File map

```
src/
  store.js          # zustand: persistence, XP, coins, recurrence, history, Alfred
  constants.js      # sectors, upgrade ladders, threat levels, lore
  App.jsx           # layout, rollover loop, idle nudges, fear-toxin
  components/
    Panel.jsx          TopBar.jsx        Protagonist.jsx
    Sectors.jsx        CaseFile.jsx      TaskItem.jsx
    EditTaskModal.jsx  Analytics.jsx     RasPanel.jsx
    BatSignal.jsx      Metrics.jsx       BackupPanel.jsx
    AlfredToaster.jsx
```
