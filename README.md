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

## V4 Protocol — Stage 1 (this build)

The opening trio of the behavioral engine, plus store-level foundations for the
systems features still to come.

- **The Cowl Toggle** (`components/CowlToggle.jsx`) — a skeuomorphic switch in the
  top bar enforcing Bruce Wayne ↔ Batman duality. Wayne Mode (warm, gold,
  glassmorphic) surfaces only Wealth/Allies/Soul + admin cases; Batman Mode
  (vantablack, red) surfaces Body/Mind/Machine + high-threat cases. Off-duty
  cases are hidden from the active identity. Theme swap in `index.css`
  (`.mode-wayne` / `.mode-batman`).
- **Detective Vision** (`components/DetectiveVision.jsx`, `FocusLauncher.jsx`,
  `lib/ambientAudio.js`) — trigger deep-focus on a task (eye icon). The world
  fades to black, a sonar-blue pulse radiates, procedural Gotham rain + low drone
  play via the Web Audio API, and a 25/50/90-minute timer runs. The **Page
  Visibility API** detects tab-away; leaving or aborting early breaks focus and
  triggers a Joker Chaos penalty. Survive the full session for a bounty.
- **Arkham Inmate Profiling** (`components/ArkhamWing.jsx`, in Analytics) — every
  failed mission must be tagged with the Rogue responsible (Riddler / Mr. Freeze /
  Poison Ivy / Bane). The Batcomputer tracks who beats you most, and **Ra's al
  Ghul's mockery adapts** to your nemesis.

**Foundation scaffolded in `store.js`** (UI lands next stage): Tower of Babel
contingencies (`addContingency` / `isSectorLocked`), Lucius Fox R&D coin sink
(`addPrototype` / `investInPrototype`), Batsuit Telemetry (`setBiometrics` →
Bacta Mode), and the **Lazarus Pit** (`lazarusReset` — already wired to the
hidden green pixel at the bottom of the screen; leaves a permanent scar on the
telemetry dashboard).

## V4 Protocol — Stage 2 (this build)

- **BatPanel** (`components/BatPanel.jsx`) — the cinematic centerpiece. Three
  parallax layers (Empire / Machine / Body) whose composite imagery swaps as you
  climb tiers 1–5, with heavy spring-smoothed mouse 3D tracking
  (`useMotionValue`/`useTransform`/`useSpring`), dramatic `AnimatePresence`
  level-up swaps, and CRT scanlines. Drop your 15 images into `public/assets/`
  (see `public/assets/README.txt`); a labelled gradient stands in until then.
  Tiers derive from sector mastery via `selectTiers` in `store.js`.
- **Prep Time** (`TaskItem.jsx`, `requirePrep`) — lock a task behind a 15-min
  countdown. When it hits zero the task turns **Enraged** (aggressive red pulse).
  Abandon a prepped task and Joker Chaos is multiplied ×10. Batman never fails
  with prep time.
- **Adopt a Robin** (`delegateTask`) — a Baby-icon Delegate button on low-threat
  tasks. Clears the task with the appropriately questionable Alfred toast.
- **Billionaire Playboy Alibi** (`components/AlibiModal.jsx`, `clearWithAlibi`) —
  critically overdue tasks **lock** (no quiet delete). You must "Generate Alibi
  for the Press," pick from 8 ridiculous excuses, and "Issue Press Release" to
  bury the case.
- **Brooding Mode** (`components/BroodingOverlay.jsx`) — 3 minutes idle and the OS
  dims to 20%, rain falls, and an overly-edgy monologue types itself out. Any
  mouse movement shatters it like glass and returns you to the night.

## V4 Protocol — Stage 3 (this build): "Batman OS" tactical redesign

- **Tactical HUD aesthetic** — retired the arcade VT323 font for **Chakra Petch**
  (display) + **Rajdhani** (`font-tech`) over JetBrains Mono data. Bigger type
  scale, cyan (`hud`) readouts, angular corner brackets (`.hud-corners`), a faint
  scan-sweep on every panel, and console chrome. Set in `tailwind.config.js`,
  `index.css`, and `components/Panel.jsx`.
- **BatPanel fit fix** — Machine and Body PNG layers now `object-contain`,
  floor-anchored, so the subjects fit fully and the Empire backdrop composites
  behind them (was `object-cover` cropping everything).
- **The Armory** (`components/Armory.jsx`, `buyGadget` in `store.js`) — buy 8
  Wayne Tech gadgets with **Wayne Coins**. Each card unfolds transformer-style (a
  mechanical `rotateX` two-flap deploy with corner brackets and a spark ring on
  purchase). Owned gadgets read EQUIPPED.
- **The Drone** (`components/FlyingGadget.jsx`) — a recon drone swoops in on a
  cadence (and 22s after load), hovers with a bob, and delivers a tactical
  reminder (prioritising your Bat-Signal / Arkham cases) or a motivation line,
  then peels off. Cyclable and dismissable.

## V6 // The Batman — Gotham palette + GCPD Dispatch (this build)

- **Gotham palette** — `tailwind.config.js` now carries `gotham.{navy,cyan,slate,
  rust,blood}`, and the existing semantic tokens were re-pointed (navy base, rust
  as the primary accent/CTA, gotham-blood for Arkham/destructive, teal HUD). The
  whole OS shifts at once. Base type bumped to 17.5px. Note: `text-gold` /
  `btn-gold` now render **rust** by design.
- **GCPD Dispatch Grid** (`components/DispatchGrid.jsx`) — the new heart, directly
  under the BatPanel. A weekly Mon–Sun × time-slot schedule; click an empty slot
  to assign an open case, click an assigned block to clear it. Blocks are
  threat-coloured; the live slot glows rust with a scanning laser; 30/60-min
  toggle. State: `schedule` map + `assignSlot`/`clearSlot`.
- **Chrono-Notifications** — `checkChrono` (polled every 20s) fires an **Oracle
  Override** toast + browser notification the minute a scheduled slot opens;
  de-duped via `notifiedSlots`, reset daily.
- **Bigger tactical HUD** — TaskItem rebuilt with `font-tech` 18px titles and
  h-10 icon buttons (h-6 icons) for massive hitboxes.
- **The Dopamine Takedown** — completing a task fires a rust flash, a rotated
  **CASE CLOSED** stamp, a batarang slash through the title, a 14-particle burst,
  then a spring shrink-to-zero.

## V5 // Oracle Integration (previous build)

- **Batcomputer Command Console** (`components/CommandConsole.jsx`) — the primary
  intake. **Cmd/Ctrl+K** anywhere (or the glowing "DECRYPT NEW INTEL" button in
  the Case File) opens a cinematic spring modal. The omnibar auto-parses tokens —
  `#body` `!arkham` `tomorrow` `daily` `!prep` — into a structured case
  (`parseIntel` in `store.js`), with tactile sector / threat / prep / delegate
  toggles to override. Live token chips show what it understood.
- **Oracle's Wiretap** (`components/Wiretap.jsx`) — a floating bottom-left capture
  bar. Dump raw intel instantly into the **Wiretap Backlog**; process each item
  into a backlog case at the Batcomputer. State: `wiretap`, `addWiretap`,
  `processWiretap`.
- **Blackgate Processing Facility** (`components/BlackgateKanban.jsx`) — a 3-column
  Kanban: **Intel Gathered → On Patrol → Incarcerated**. Cards advance with Framer
  `layoutId` animation; committing to Incarcerated fires a procedural **cell-door
  slam** (`playCellDoor` in `lib/ambientAudio.js`) and shakes the board. Tasks
  gained a `status` field; `setStatus`/`groupForKanban` drive it.
- **The Long Halloween** (`components/LongHalloweenHeatmap.jsx`) — a 365-night
  GitHub-style heatmap (black → dark-blue → bright cyan; **Arkham nights glow
  crimson**) from `build365Series`. Break a **7-night streak** and **Two-Face's
  coin toss** triggers (`pendingTwoFace` → `resolveTwoFace`): the clean half
  forgives, the scarred half robs your XP and coins.

> Still to come (store-ready, UI next): the **Evidence Board** knowledge graph
> and **Patrol Route** drag-and-drop timeboxing.

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
