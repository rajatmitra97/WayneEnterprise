/* ═══════════════════════════════════════════════════════════════════
   WAYNE OS // THE DARK KNIGHT PROTOCOL  ·  global state
   Zustand + persist middleware. localStorage key: 'wayneOSv3'.
   Owns: persistence, XP/levels, Wayne Coins, threat-sorted tasks,
   patrol-route regeneration at midnight, 30-day history log,
   Joker chaos, Bat-Signal, and the Alfred notification queue.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SECTOR_ORDER,
  LEVELS_PER_SECTOR,
  UPGRADES,
  THREAT,
  RECUR,
  xpForLevel,
  JOKER_CHANCE,
  JOKER_SHIELD_COST,
  ALFRED,
  FOCUS_BOUNTY_XP,
  FOCUS_BOUNTY_COINS,
  FOCUS_BREAK_XP_PENALTY,
  FOCUS_BREAK_COIN_PENALTY,
  FOCUS_DEFAULT_MS,
  ROGUE_ORDER,
  RND_STAGES,
  RND_STAGE_COST,
  BACTA_SLEEP_THRESHOLD,
  BACTA_SORENESS_THRESHOLD,
  PREP_DEFAULT_MS,
  JOKER_CHAOS_XP,
  JOKER_CHAOS_COINS,
  PREP_PENALTY_MULT,
  ROBIN_TOAST,
  levelToTier,
  SECTOR_TOKENS,
  THREAT_TOKENS,
  SCHEDULE_TOKENS,
  RECUR_TOKENS,
  TWOFACE_STREAK,
  TWOFACE,
  ORACLE_OVERRIDE,
  SIDEKICK_BY_ID,
  MUTATION_AGE_MS,
  MUTATION_IDS,
  MUTATIONS,
  BOSSES,
  BOSS_DAMAGE,
  BOSS_BUFF_STEP,
  DAILY_LOGIN_BONUS,
  LAZARUS_REVIVE_COST,
  RESEARCH_PROJECTS,
  RESEARCH_HOURS,
  INTERROGATION_PENALTY_RELIEF,
} from './constants'

// ISO-ish week key so the boss rotates every Monday.
function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const wk = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`
}
const freshBoss = (prevId) => {
  const pool = BOSSES.filter((b) => b.id !== prevId)
  const b = pool[Math.floor(Math.random() * pool.length)] || BOSSES[0]
  return { id: b.id, name: b.name, color: b.color, tag: b.tag, maxHp: b.maxHp, hp: b.maxHp, weekKey: weekKey(), defeated: false }
}

/* ═══════════════════════════════════════════════════════════════════
   OMNIBAR PARSER — turns raw intel into a structured directive.
   Alfred: parsing natural-language field orders into tactical metadata.
   e.g. "spar with Bane #body !arkham tomorrow daily" →
        { title:'spar with Bane', sector:'body', threat:'ARKHAM',
          schedule:1, recur:'DAILY' }
   ═══════════════════════════════════════════════════════════════════ */
export function parseIntel(raw) {
  const out = { sector: null, threat: null, schedule: null, recur: null, prep: false }
  let text = ` ${raw} `

  // #sector
  text = text.replace(/#(\w+)/g, (m, w) => {
    const k = SECTOR_TOKENS[w.toLowerCase()]
    if (k) { out.sector = k; return ' ' }
    return m
  })
  // !threat  and  !prep
  text = text.replace(/!(\w+)/g, (m, w) => {
    const lw = w.toLowerCase()
    if (lw === 'prep') { out.prep = true; return ' ' }
    const t = THREAT_TOKENS[lw]
    if (t) { out.threat = t; return ' ' }
    return m
  })
  // bare schedule / recurrence keywords
  Object.keys(SCHEDULE_TOKENS).forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i')
    if (re.test(text)) { out.schedule = SCHEDULE_TOKENS[kw]; text = text.replace(re, ' ') }
  })
  Object.keys(RECUR_TOKENS).forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i')
    if (re.test(text)) { out.recur = RECUR_TOKENS[kw]; text = text.replace(re, ' ') }
  })

  out.title = text.replace(/\s+/g, ' ').trim()
  return out
}

const STORAGE_KEY = 'wayneOSv3'
const uid = () => Math.random().toString(36).slice(2, 10)
export const todayKey = () => new Date().toISOString().slice(0, 10)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const freshSectors = () =>
  SECTOR_ORDER.reduce((acc, k) => {
    acc[k] = { xp: 0, lvl: 0 }
    return acc
  }, {})

// ─── reward / penalty math ───────────────────────────────────────────
function applyXp(sectors, sectorKey, deltaXp) {
  const s = { ...sectors[sectorKey] }
  s.xp += deltaXp
  const unlocked = []
  // level up while affordable and rungs remain
  while (s.lvl < LEVELS_PER_SECTOR && s.xp >= xpForLevel(s.lvl)) {
    s.xp -= xpForLevel(s.lvl)
    s.lvl += 1
    unlocked.push(UPGRADES[sectorKey][s.lvl - 1])
  }
  // bleed levels back down on heavy penalty — progress can be LOST
  while (s.lvl > 0 && s.xp < 0) {
    s.lvl -= 1
    s.xp += xpForLevel(s.lvl)
  }
  if (s.xp < 0) s.xp = 0
  return { sector: { ...sectors, [sectorKey]: s }, unlocked }
}

// is a recurring task due "today" given its schedule?
function dueToday(recur, days, dateObj = new Date()) {
  if (recur === RECUR.DAILY) return true
  // WEEKLY & CUSTOM both resolve to a set of weekdays in days[] (0=Sun..6=Sat)
  if (recur === RECUR.WEEKLY || recur === RECUR.CUSTOM)
    return (days || []).includes(dateObj.getDay())
  return false
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── identity / time ──
      firstNight: todayKey(),
      lastSeen: todayKey(),
      version: 4,

      // ── progression ──
      sectors: freshSectors(),
      coins: 0, // Wayne Coins (WC)
      streak: 0,
      failedCount: 0,
      upgradesEarned: 0,

      // ── content ──
      tasks: [], // active
      closedTasks: [], // archive
      signal: null, // {taskId, date} — the Bat-Signal (3x)
      selectedSector: 'body',

      // ── history (Batcomputer Analytics) ──
      // completionLog: [{ date:'YYYY-MM-DD', points, sector, threat }]
      completionLog: [],

      // ── Alfred / notifications ──
      toasts: [], // {id, label, text, tone}
      notifyPermission: 'default',
      lastFearToxin: 0,

      // ── Cowl Toggle (Contextual Duality) ──
      mode: 'batman', // 'wayne' | 'batman'

      // ── Detective Vision (focus session) ──
      // {active, taskId, endsAt, duration} — persisted so a reload mid-session
      // is itself treated as breaking focus.
      focus: null,

      // ── Arkham Wing (rogue profiling) ──
      rogueStats: { riddler: 0, freeze: 0, ivy: 0, bane: 0 },

      // ── The Armory (owned Wayne Tech gadget ids) ──
      gadgets: [],

      // ── V5 Oracle Integration ──
      commandOpen: false, // Batcomputer Command Console (Cmd+K)
      wiretap: [], // raw intel backlog {id, text, at}
      pendingTwoFace: false, // a 7-day streak just shattered → coin toss owed

      // ── GCPD Dispatch Grid (weekly routine) ──
      schedule: {}, // slotKey "wd:mins" → taskId  (repeats weekly)
      notifiedSlots: {}, // "YYYY-MM-DD:wd:mins" → true (chrono de-dupe, reset daily)

      // ── Arkham Mutation Protocol ──
      riddlerScrambled: [], // task ids whose titles are ciphered by a Riddler mutation

      // ── V7 Gotham Paradigm ──
      activeTab: 'mission', // left-rail navigation
      contextTaskId: null, // right contextual panel target
      lastLoginDate: null, // Daily Alfred Briefing gate
      boss: null, // weekly Rogue boss-fight {id,name,hp,maxHp,weekKey,defeated}
      bossBuffs: 0, // permanent XP multiplier steps earned from defeats
      bossScars: [], // [{id,name,week}] bosses that escaped
      beltActive: null, // active Utility Belt gadget (e.g. 'batarang') for click-actions

      // ── V8 Detective Board Update ──
      boardCores: [], // {id,title,sector,x,y,done,taskId}
      boardSubs: [], // {id,title,coreId,done,x,y}
      journal: [], // {id,text,at,kind}
      graveyard: [], // failed core/routine cases awaiting the Lazarus Pit
      focusStrict: true, // focus mode: true=Arkham(strict) | false=Oracle(background)
      research: [], // active R&D {projectId, startedAt}
      unlockedResearch: [], // claimed project ids
      muted: false, // global ambient mute
      lastInterrogation: null, // date of last Arkham Interrogation

      // ── V9 Arkham Interrogation Protocol ──
      slotResolutions: {}, // "wd:mins" → {state:'done'|'failed', title, sector, threat} (clears at midnight)
      adHackedUntil: 0, // Cryptographic Sequencer hides the Gazette ad until this ts
      hoveredTaskId: null, // task under the cursor, for the 'T' quick-schedule hotkey

      // ── FOUNDATION (full UI lands in the next stage) ──
      contingencies: [], // {id, label, when, then, enabled, armed}
      rnd: [], // Lucius Fox prototypes {id, title, stage, invested}
      biometrics: { date: null, sleep: null, soreness: null, bacta: false },
      lazarus: { scars: [] }, // [{date, forgavePenalties, clearedTasks}]

      /* ───────────────────────── TASKS ───────────────────────── */
      addTask: ({
        title, sector, threat, recur = RECUR.NONE, days = [], signal = false,
        status = 'patrol', prep = false, schedule = null,
      }) => {
        // WEEKLY anchors to today's weekday unless explicit days supplied.
        const resolvedDays =
          recur === RECUR.WEEKLY && (!days || days.length === 0)
            ? [new Date().getDay()]
            : days
        // schedule = day-offset (0 today, 1 tomorrow …) → a scheduledFor date
        let scheduledFor = null
        if (schedule != null) {
          const d = new Date()
          d.setDate(d.getDate() + schedule)
          scheduledFor = d.toISOString().slice(0, 10)
        }
        const t = {
          id: uid(),
          title: title.trim(),
          sector,
          threat,
          recur,
          days: resolvedDays,
          status,
          scheduledFor,
          createdAt: Date.now(),
          createdDate: todayKey(),
          done: false,
        }
        set((st) => ({ tasks: [t, ...st.tasks] }))
        if (signal) get().setSignal(t.id)
        if (prep) get().requirePrep(t.id)
        if (threat === 'ARKHAM') get().pushToast('ALFRED', pick(ALFRED.arkham), 'blood')
        return t.id
      },

      updateTask: (id, patch) =>
        set((st) => ({
          tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        // Abandoning a task after Prep Time was invoked → Joker Chaos ×10.
        if (t && t.prepInvoked) {
          const { sector } = applyXp(st.sectors, t.sector, -JOKER_CHAOS_XP * PREP_PENALTY_MULT)
          set({
            sectors: sector,
            coins: Math.max(0, st.coins - JOKER_CHAOS_COINS * PREP_PENALTY_MULT),
            streak: 0,
            lastFearToxin: Date.now(),
          })
          get().pushToast(
            'THE JOKER',
            'You invoked prep time and ran anyway? HAHAHA. The price is TEN times steeper, Bats.',
            'chaos'
          )
        }
        set((s) => ({
          tasks: s.tasks.filter((x) => x.id !== id),
          signal: s.signal?.taskId === id ? null : s.signal,
        }))
      },

      // PREP TIME — lock a task behind a countdown; raise the stakes.
      requirePrep: (id, ms = PREP_DEFAULT_MS) => {
        set((st) => ({
          tasks: st.tasks.map((t) =>
            t.id === id ? { ...t, prepInvoked: true, prepUntil: Date.now() + ms } : t
          ),
        }))
        get().pushToast('ALFRED', 'Prep time logged, sir. Batman never fails with prep time. Do not embarrass us.', 'gold')
      },

      // ADOPT A ROBIN — delegate a low-threat task into oblivion.
      delegateTask: (id) => {
        set((st) => ({
          tasks: st.tasks.filter((t) => t.id !== id),
          signal: st.signal?.taskId === id ? null : st.signal,
        }))
        get().pushToast('ALFRED', ROBIN_TOAST, 'gold')
      },

      // BILLIONAIRE PLAYBOY ALIBI — the only way to clear a locked, critically
      // overdue task. Archives it as a tagged failure for the Arkham Wing.
      clearWithAlibi: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t) return
        set({
          tasks: st.tasks.filter((x) => x.id !== id),
          closedTasks: [
            { ...t, id: uid(), srcId: t.id, failed: true, rogue: null, alibiUsed: true, closedAt: Date.now(), closedDate: todayKey() },
            ...st.closedTasks,
          ].slice(0, 400),
          signal: st.signal?.taskId === id ? null : st.signal,
        })
        get().pushToast('PRESS RELEASE', 'Wayne Enterprises issues no further comment. The case is buried.', 'gold')
      },

      setSignal: (taskId) => set({ signal: { taskId, date: todayKey() } }),

      // Complete a task → award XP+coins, log history, roll Joker chaos.
      completeTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t || t.done) return
        const meta = THREAT[t.threat]
        const isSignal = st.signal?.taskId === id
        const mult = isSignal ? 3 : 1

        // permanent boss-defeat buff folds into every XP award
        const xpMult = 1 + st.bossBuffs * BOSS_BUFF_STEP
        let gainedXp = Math.round(meta.xp * mult * xpMult)
        let gainedCoins = meta.coins * mult
        let chaos = false

        // JOKER CHAOS — random skim unless shielded by Wayne Coins
        if (Math.random() < JOKER_CHANCE) {
          if (st.coins >= JOKER_SHIELD_COST) {
            // auto-spend shield (handled silently; user can disable via UI later)
            gainedCoins -= JOKER_SHIELD_COST
          } else {
            chaos = true
            gainedXp = Math.round(gainedXp * 0.4)
            gainedCoins = Math.max(0, Math.round(gainedCoins * 0.4))
          }
        }

        const { sector, unlocked } = applyXp(st.sectors, t.sector, gainedXp)

        const log = [...st.completionLog]
        const day = log.find((d) => d.date === todayKey())
        const isArkhamWin = t.threat === 'ARKHAM' ? 1 : 0
        if (day) {
          day.points += gainedXp
          day.count = (day.count || 0) + 1
          day.arkham = (day.arkham || 0) + isArkhamWin
        } else {
          log.push({ date: todayKey(), points: gainedXp, count: 1, arkham: isArkhamWin })
        }

        const isRoute = t.recur !== RECUR.NONE
        set({
          sectors: sector,
          coins: st.coins + gainedCoins,
          completionLog: log,
          upgradesEarned: st.upgradesEarned + unlocked.length,
          // Patrol routes stay resident (re-armed at midnight); one-off tasks archive out.
          tasks: isRoute
            ? st.tasks.map((x) => (x.id === id ? { ...x, done: true, lastDoneDate: todayKey() } : x))
            : st.tasks.filter((x) => x.id !== id),
          closedTasks: [
            { ...t, id: uid(), srcId: t.id, done: true, closedAt: Date.now(), closedDate: todayKey(), wasSignal: isSignal },
            ...st.closedTasks,
          ].slice(0, 400),
          signal: isSignal ? null : st.signal,
        })

        get().bumpStreak()
        get().dealBossDamage(meta.rank) // every closed case wounds the weekly Rogue
        unlocked.forEach((u) => get().pushToast('UPGRADE ACQUIRED', u, 'gold'))
        if (chaos) get().pushToast('ALFRED', pick(ALFRED.chaos), 'chaos')
        else get().pushToast('ALFRED', pick(ALFRED.done), 'gold')

        // Defeating a Riddler-mutated case breaks the cipher on the backlog.
        if (t.mutation === 'riddler') set({ riddlerScrambled: [] })

        // A scheduled Core Task closing marks its Detective Board node solved.
        if (t.coreId) set((s2) => ({ boardCores: s2.boardCores.map((c) => (c.id === t.coreId ? { ...c, done: true } : c)) }))

        // A completed patrol route re-arms at the next midnight rollover,
        // so nothing to respawn here — see rolloverCheck().
        return { gainedXp, gainedCoins, unlocked, chaos, isSignal }
      },

      // Punitive sweep — drain XP for tasks failed (called at rollover).
      failTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t) return
        const meta = THREAT[t.threat]
        const { sector } = applyXp(st.sectors, t.sector, -meta.penalty)
        set({
          sectors: sector,
          failedCount: st.failedCount + 1,
          streak: 0,
          tasks: st.tasks.filter((x) => x.id !== id),
          closedTasks: [
            { ...t, id: uid(), srcId: t.id, failed: true, rogue: null, closedAt: Date.now(), closedDate: todayKey() },
            ...st.closedTasks,
          ].slice(0, 400),
          signal: st.signal?.taskId === id ? null : st.signal,
          lastFearToxin: Date.now(),
        })
        get().pushToast('ALFRED', pick(ALFRED.fail), 'blood')
      },

      /* ─────────────────── PATROL ROUTES / ROLLOVER ─────────────── */
      // Called on mount and every minute. Detects a new calendar day,
      // fails un-actioned non-recurring tasks from prior days, and
      // regenerates due patrol routes.
      rolloverCheck: () => {
        const st = get()
        const today = todayKey()
        if (st.lastSeen === today) return

        const now = new Date()
        let workingSectors = get().sectors
        const survivors = []
        const newlyFailed = [] // archived for Arkham Wing tagging
        let failed = 0

        st.tasks.forEach((t) => {
          if (t.recur !== RECUR.NONE) {
            // Re-arm if due today; otherwise rest until its next scheduled day.
            const armed = dueToday(t.recur, t.days, now)
            // Soft miss: due again, still not completed (half penalty, High/Arkham
            // only — dailies shouldn't be ruinous). Rest days never penalize.
            const missed = armed && !t.done && t.lastDoneDate !== today
            if (missed && THREAT[t.threat].rank >= 2) {
              const drained = applyXp(workingSectors, t.sector, -Math.round(THREAT[t.threat].penalty * 0.5))
              workingSectors = drained.sector
              failed += 1
              newlyFailed.push({
                ...t, id: uid(), srcId: t.id, failed: true, rogue: null,
                closedAt: Date.now(), closedDate: today,
              })
            }
            survivors.push({ ...t, done: armed ? false : t.done, armed })
          } else if (t.status !== 'backlog' && !t.done && (t.scheduledFor || t.createdDate) < today && !t.locked) {
            // one-off, on-patrol & overdue → LOCK it (critically overdue). Penalty
            // applies once now; ×10 if prep time was invoked. Backlog intel and
            // future-scheduled cases are exempt. Cleared only via a Playboy Alibi.
            const meta = THREAT[t.threat]
            const mult = t.prepInvoked ? PREP_PENALTY_MULT : 1
            const drained = applyXp(workingSectors, t.sector, -meta.penalty * mult)
            workingSectors = drained.sector
            failed += 1
            survivors.push({ ...t, locked: true, lockedAt: Date.now() }) // mutation clock starts now
          } else if (!t.done) {
            survivors.push(t) // healthy, backlog, scheduled-ahead, or awaiting alibi
          }
        })

        // Two-Face: did a 7-day (or longer) streak just shatter?
        const streakShattered = failed > 0 && st.streak >= TWOFACE_STREAK

        set({
          tasks: survivors,
          sectors: workingSectors,
          closedTasks: [...newlyFailed, ...st.closedTasks].slice(0, 400),
          lastSeen: today,
          failedCount: st.failedCount + failed,
          streak: failed > 0 ? 0 : st.streak,
          lastFearToxin: failed > 0 ? Date.now() : st.lastFearToxin,
          pendingTwoFace: st.pendingTwoFace || streakShattered,
          notifiedSlots: {}, // fresh chrono log each new day
          slotResolutions: {}, // routine ticks/crosses reset at midnight
        })

        if (failed > 0) get().pushToast('ALFRED', pick(ALFRED.fail), 'blood')
        if (streakShattered) get().pushToast('TWO-FACE', 'A seven-night streak, broken. The coin must decide your fate.', 'chaos')
        get().pushToast('ALFRED', pick(ALFRED.greeting), 'gold')
      },

      // streak = consecutive calendar days (ending today) with >=1 completion
      bumpStreak: () => {
        const dates = new Set(get().completionLog.filter((d) => d.count > 0).map((d) => d.date))
        let streak = 0
        const cur = new Date()
        // require today to count
        while (dates.has(cur.toISOString().slice(0, 10))) {
          streak += 1
          cur.setDate(cur.getDate() - 1)
        }
        set({ streak })
      },

      /* ───────────────────────── COINS ─────────────────────────── */
      spendCoins: (n) => {
        const st = get()
        if (st.coins < n) return false
        set({ coins: st.coins - n })
        return true
      },

      /* ──────────────────── ALFRED / TOASTS ────────────────────── */
      pushToast: (label, text, tone = 'gold') => {
        const id = uid()
        set((st) => ({ toasts: [...st.toasts, { id, label, text, tone }] }))
        // browser notification, if granted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(`ALFRED // ${label}`, { body: text, silent: true })
          } catch (e) {
            /* notifications unavailable */
          }
        }
        setTimeout(() => get().dismissToast(id), 5200)
        return id
      },
      dismissToast: (id) =>
        set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),

      requestNotify: async () => {
        if (typeof Notification === 'undefined') return 'unsupported'
        try {
          const p = await Notification.requestPermission()
          set({ notifyPermission: p })
          if (p === 'granted')
            get().pushToast('ALFRED', 'I shall alert you the moment Gotham calls, sir.', 'gold')
          return p
        } catch (e) {
          return 'denied'
        }
      },

      /* ───────────────────── SELECTION ─────────────────────────── */
      selectSector: (key) => set({ selectedSector: key }),

      /* ════════════════════ THE ARMORY ═══════════════════════════ */
      // Buy a gadget with Wayne Coins. Returns 'ok' | 'owned' | 'poor'.
      buyGadget: (gadget) => {
        const st = get()
        if (st.gadgets.includes(gadget.id)) return 'owned'
        if (st.coins < gadget.cost) {
          get().pushToast('LUCIUS FOX', `${gadget.cost} WC required for the ${gadget.name}, sir. Funds short.`, 'blood')
          return 'poor'
        }
        set({ coins: st.coins - gadget.cost, gadgets: [...st.gadgets, gadget.id] })
        get().pushToast('WAYNE TECH', `${gadget.name} deployed to the utility belt. ${gadget.perk}`, 'gold')
        return 'ok'
      },

      /* ════════════ GCPD DISPATCH (weekly schedule) ══════════════ */
      assignSlot: (wd, mins, taskId) =>
        set((st) => ({ schedule: { ...st.schedule, [`${wd}:${mins}`]: taskId } })),
      clearSlot: (wd, mins) =>
        set((st) => {
          const next = { ...st.schedule }
          delete next[`${wd}:${mins}`]
          return { schedule: next }
        }),
      // Chrono-Notifications — fire an Oracle Override the minute a slot opens.
      checkChrono: () => {
        const st = get()
        const now = new Date()
        const wd = now.getDay()
        const mins = now.getHours() * 60 + now.getMinutes()
        const dateKey = todayKey()
        Object.entries(st.schedule).forEach(([key, taskId]) => {
          const [kwd, kmins] = key.split(':').map(Number)
          if (kwd !== wd || mins !== kmins) return // only at the exact opening minute
          const nk = `${dateKey}:${key}`
          if (st.notifiedSlots[nk]) return
          const task = st.tasks.find((t) => t.id === taskId)
          set({ notifiedSlots: { ...get().notifiedSlots, [nk]: true } })
          get().pushToast(
            'ORACLE OVERRIDE',
            `${pick(ORACLE_OVERRIDE)} → ${task ? task.title : 'scheduled objective'}`,
            'blood'
          )
        })
      },

      /* ════════════ V7 · NAVIGATION & CONTEXT PANEL ═════════════ */
      setTab: (tab) => set({ activeTab: tab }),
      openContext: (taskId) => set({ contextTaskId: taskId }),
      closeContext: () => set({ contextTaskId: null }),

      /* ════════════ V7 · DAILY ALFRED BRIEFING ══════════════════ */
      needsBriefing: () => get().lastLoginDate !== todayKey(),
      claimDailyBonus: () => {
        if (get().lastLoginDate === todayKey()) return
        set((st) => ({ coins: st.coins + DAILY_LOGIN_BONUS, lastLoginDate: todayKey() }))
        get().pushToast('ALFRED', `Daily commendation logged. +${DAILY_LOGIN_BONUS} WC, sir.`, 'gold')
      },

      /* ════════════ V7 · WEEKLY ROGUE BOSS FIGHT ════════════════ */
      // Ensure a live boss for the current week; rotate + scar on a new week.
      ensureBoss: () => {
        const st = get()
        const wk = weekKey()
        if (!st.boss) return set({ boss: freshBoss(null) })
        if (st.boss.weekKey !== wk) {
          const scars = st.boss.defeated
            ? st.bossScars
            : [...st.bossScars, { id: st.boss.id, name: st.boss.name, week: st.boss.weekKey }]
          if (!st.boss.defeated)
            get().pushToast(st.boss.name.toUpperCase(), 'The week ended. I escaped — and I left a scar on your Gotham.', 'blood')
          set({ boss: freshBoss(st.boss.id), bossScars: scars })
        }
      },
      // Completed tasks chip the boss's health.
      dealBossDamage: (rank) => {
        const st = get()
        if (!st.boss || st.boss.defeated) return
        const dmg = BOSS_DAMAGE[rank] || 10
        const hp = Math.max(0, st.boss.hp - dmg)
        if (hp <= 0) {
          set({ boss: { ...st.boss, hp: 0, defeated: true }, bossBuffs: st.bossBuffs + 1 })
          get().pushToast(st.boss.name.toUpperCase(), `Defeated before the week was out. Permanent +${Math.round(BOSS_BUFF_STEP * 100)}% XP secured.`, 'gold')
        } else {
          set({ boss: { ...st.boss, hp } })
        }
      },

      /* ════════════ V7 · UTILITY BELT ═══════════════════════════ */
      setBeltActive: (gadgetId) => set((st) => ({ beltActive: st.beltActive === gadgetId ? null : gadgetId })),

      /* ════════════ V9 · PERSISTENT SLOT RESOLUTION ════════════ */
      // Tick → award + the block stays green until midnight.
      resolveSlotDone: (wd, mins) => {
        const key = `${wd}:${mins}`
        const st = get()
        const taskId = st.schedule[key]
        const t = taskId ? st.tasks.find((x) => x.id === taskId) : null
        const cache = t ? { title: t.title, sector: t.sector, threat: t.threat } : { title: '—', sector: 'mind', threat: 'MEDIUM' }
        if (t) get().completeTask(t.id)
        const sched = { ...get().schedule }
        delete sched[key]
        set((s2) => ({ schedule: sched, slotResolutions: { ...s2.slotResolutions, [key]: { state: 'done', ...cache } } }))
      },
      // Cross → Joker Chaos + the block stays red until midnight.
      resolveSlotFail: (wd, mins) => {
        const key = `${wd}:${mins}`
        const st = get()
        const taskId = st.schedule[key]
        const t = taskId ? st.tasks.find((x) => x.id === taskId) : null
        const cache = t ? { title: t.title, sector: t.sector, threat: t.threat } : { title: '—', sector: 'mind', threat: 'MEDIUM' }
        if (t) get().failRoutineTask(t.id) // applies chaos + graveyard + unschedules
        set((s2) => ({ slotResolutions: { ...s2.slotResolutions, [key]: { state: 'failed', ...cache } } }))
      },
      // Smoke Pellet → forgive a FAILED slot, reset it to a pending case.
      smokeResetSlot: (wd, mins) => {
        const key = `${wd}:${mins}`
        const st = get()
        const res = st.slotResolutions[key]
        if (!res || res.state !== 'failed') return false
        const next = { ...st.slotResolutions }
        delete next[key]
        set({ slotResolutions: next, failedCount: Math.max(0, st.failedCount - 1) })
        const id = get().addTask({ title: res.title, sector: res.sector, threat: res.threat })
        get().assignSlot(wd, mins, id)
        get().pushToast('SMOKE PELLET', 'Vanished. The failure is forgiven — back to pending.', 'gold')
        return true
      },
      clearSlotResolutions: () => set({ slotResolutions: {} }),

      /* ════════════ V9 · UTILITY BELT (gadget effects) ═════════ */
      hackAd: () => {
        set({ adHackedUntil: Date.now() + 4 * 3600000 })
        get().pushToast('CRYPTO SEQUENCER', 'Signal hijacked. The broadcast is dark for 4 hours.', 'gold')
      },

      /* ════════════ V9 · QUICK-SCHEDULE (T hotkey) ═════════════ */
      setHoveredTask: (id) => set({ hoveredTaskId: id }),
      assignToTodayNextSlot: (taskId) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === taskId)
        if (!t) return false
        const wd = new Date().getDay()
        const nowMins = new Date().getHours() * 60 + new Date().getMinutes()
        // first empty 60-min slot from now until end of the patrol window
        for (let h = Math.max(5, Math.ceil(nowMins / 60)); h < 24; h++) {
          const mins = h * 60
          const key = `${wd}:${mins}`
          if (!st.schedule[key] && !st.slotResolutions[key]) {
            get().assignSlot(wd, mins, taskId)
            get().pushToast('DISPATCH', `Scheduled to today, ${String(h).padStart(2, '0')}:00.`, 'gold')
            return true
          }
        }
        get().pushToast('DISPATCH', 'No open slots left today, sir.', 'blood')
        return false
      },

      /* ════════════ V8 · BINARY ROUTINE FAIL + LAZARUS ══════════ */
      // Red 'X' on a routine task → Joker Chaos + the case rots in the Graveyard.
      failRoutineTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t) return
        const { sector } = applyXp(st.sectors, t.sector, -JOKER_CHAOS_XP)
        set({
          sectors: sector,
          coins: Math.max(0, st.coins - JOKER_CHAOS_COINS),
          failedCount: st.failedCount + 1,
          streak: 0,
          lastFearToxin: Date.now(),
          tasks: st.tasks.filter((x) => x.id !== id),
          graveyard: [{ id: uid(), srcId: t.id, title: t.title, sector: t.sector, threat: t.threat, streakAtFail: st.streak, failedAt: Date.now() }, ...st.graveyard].slice(0, 60),
          closedTasks: [{ ...t, id: uid(), srcId: t.id, failed: true, rogue: null, closedDate: todayKey(), closedAt: Date.now() }, ...st.closedTasks].slice(0, 400),
          signal: st.signal?.taskId === id ? null : st.signal,
        })
        // unschedule it from the dispatch grid
        const sched = { ...get().schedule }
        Object.keys(sched).forEach((k) => { if (sched[k] === id) delete sched[k] })
        set({ schedule: sched })
        get().pushToast('THE JOKER', 'A failure! HAHAHA. The case rots in the Graveyard now, Bats.', 'chaos')
      },
      // The Lazarus Pit — spend coins to revive a graveyard case, scarred green.
      reviveFromGraveyard: (graveId) => {
        const st = get()
        const g = st.graveyard.find((x) => x.id === graveId)
        if (!g) return false
        if (st.coins < LAZARUS_REVIVE_COST) {
          get().pushToast('RA\'S AL GHUL', `The Pit demands ${LAZARUS_REVIVE_COST} Wayne Coins, detective.`, 'blood')
          return false
        }
        set({
          coins: st.coins - LAZARUS_REVIVE_COST,
          graveyard: st.graveyard.filter((x) => x.id !== graveId),
          failedCount: Math.max(0, st.failedCount - 1),
          streak: Math.max(st.streak, g.streakAtFail || 0),
        })
        get().addTask({ title: g.title, sector: g.sector, threat: g.threat })
        // tag the freshly-created task with a permanent Lazarus scar
        set((s2) => ({ tasks: s2.tasks.map((t, i) => (i === 0 ? { ...t, lazarusScar: true } : t)) }))
        get().pushToast('THE LAZARUS PIT', 'Reborn — and forever scarred green. Do not waste this second life.', 'chaos')
        return true
      },

      /* ════════════ V8 · DETECTIVE BOARD ════════════════════════ */
      addCore: (title, sector) =>
        set((st) => ({
          boardCores: [...st.boardCores, { id: uid(), title: title.trim(), sector, x: 30 + Math.random() * 30, y: 38 + Math.random() * 16, done: false, taskId: null }],
        })),
      addSub: (title, coreId) =>
        set((st) => ({
          boardSubs: [...st.boardSubs, { id: uid(), title: title.trim(), coreId, done: false, x: 30 + Math.random() * 40, y: 55 + Math.random() * 30 }],
        })),
      toggleSub: (id) =>
        set((st) => ({ boardSubs: st.boardSubs.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) })),
      moveNode: (kind, id, x, y) =>
        set((st) =>
          kind === 'core'
            ? { boardCores: st.boardCores.map((n) => (n.id === id ? { ...n, x, y } : n)) }
            : { boardSubs: st.boardSubs.map((n) => (n.id === id ? { ...n, x, y } : n)) }
        ),
      removeCore: (id) =>
        set((st) => ({ boardCores: st.boardCores.filter((n) => n.id !== id), boardSubs: st.boardSubs.filter((s) => s.coreId !== id) })),
      removeSub: (id) => set((st) => ({ boardSubs: st.boardSubs.filter((n) => n.id !== id) })),
      // Core tasks can ONLY be completed via the Dispatch Grid: deploy one as a real task.
      scheduleCore: (coreId) => {
        const st = get()
        const core = st.boardCores.find((c) => c.id === coreId)
        if (!core || core.taskId) return
        const taskId = get().addTask({ title: core.title, sector: core.sector, threat: 'HIGH' })
        set((s2) => ({ tasks: s2.tasks.map((t) => (t.id === taskId ? { ...t, coreId } : t)), boardCores: s2.boardCores.map((c) => (c.id === coreId ? { ...c, taskId } : c)) }))
        get().pushToast('ALFRED', 'Core objective deployed to the Dispatch Grid, sir. Schedule it.', 'gold')
      },

      /* ════════════ V8 · WAYNE JOURNAL ══════════════════════════ */
      addJournal: (text, kind = 'thought') => {
        const v = (text || '').trim()
        if (!v) return
        set((st) => ({ journal: [{ id: uid(), text: v, at: Date.now(), kind }, ...st.journal].slice(0, 300) }))
      },

      /* ════════════ V8 · FOCUS MODE TOGGLE ══════════════════════ */
      setFocusStrict: (strict) => set({ focusStrict: strict }),

      /* ════════════ V8 · LUCIUS FOX R&D ═════════════════════════ */
      startResearch: (projectId) => {
        const st = get()
        const proj = RESEARCH_PROJECTS.find((p) => p.id === projectId)
        if (!proj || st.research.some((r) => r.projectId === projectId) || st.unlockedResearch.includes(projectId)) return
        if (st.coins < proj.cost) { get().pushToast('LUCIUS FOX', `Applied Sciences needs ${proj.cost} WC for that, sir.`, 'blood'); return }
        set({ coins: st.coins - proj.cost, research: [...st.research, { projectId, startedAt: Date.now() }] })
        get().pushToast('LUCIUS FOX', `${proj.name} is in development. Check back in ${RESEARCH_HOURS} hours.`, 'gold')
      },
      claimResearch: (projectId) => {
        const st = get()
        const r = st.research.find((x) => x.projectId === projectId)
        if (!r) return
        if (Date.now() - r.startedAt < RESEARCH_HOURS * 3600000) return
        const proj = RESEARCH_PROJECTS.find((p) => p.id === projectId)
        set({ research: st.research.filter((x) => x.projectId !== projectId), unlockedResearch: [...st.unlockedResearch, projectId] })
        if (proj?.kind === 'BUFF') set({ bossBuffs: get().bossBuffs + 0.5 }) // +5% folds into xpMult
        get().pushToast('LUCIUS FOX', `Research complete: ${proj?.name}. Deployed.`, 'gold')
      },

      /* ════════════ V8 · AUDIO MUTE ═════════════════════════════ */
      toggleMute: () => set((st) => ({ muted: !st.muted })),

      /* ════════════ V8 · ARKHAM INTERROGATION ═══════════════════ */
      submitInterrogation: (text, failCount) => {
        get().addJournal(text, 'interrogation')
        // writing the debrief refunds half the Joker Chaos the fails cost today
        const relief = Math.round(failCount * JOKER_CHAOS_COINS * INTERROGATION_PENALTY_RELIEF)
        set((st) => ({ coins: st.coins + relief, lastInterrogation: todayKey() }))
        if (relief > 0) get().pushToast('ALFRED', `Reflection logged. ${relief} WC of composure restored, sir.`, 'gold')
        else get().pushToast('ALFRED', 'Reflection logged. A clearer mind tomorrow, sir.', 'gold')
      },
      dismissInterrogation: () => set({ lastInterrogation: todayKey() }),

      /* ════════════ BAT-FAMILY NETWORK (delegation) ══════════════ */
      // Hand a case to a sidekick; it leaves your active board for their queue.
      assignTaskTo: (id, sidekickId) => {
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, assignedTo: sidekickId } : t)) }))
        const sk = SIDEKICK_BY_ID[sidekickId]
        if (sk) get().pushToast(sk.name.toUpperCase(), sk.line, 'gold')
      },
      // Pull a delegated case back onto your own board.
      recallTask: (id) =>
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, assignedTo: null } : t)) })),

      /* ════════════ ARKHAM MUTATION PROTOCOL ════════════════════ */
      // Run on the rollover tick: any case locked >24h metastasises into a Rogue.
      mutateOverdueTasks: () => {
        const st = get()
        const ripe = st.tasks.filter(
          (t) => t.locked && !t.mutation && !t.done && t.lockedAt && Date.now() - t.lockedAt > MUTATION_AGE_MS
        )
        if (ripe.length === 0) return
        let scrambled = [...st.riddlerScrambled]
        const mutatedIds = {}
        ripe.forEach((t) => {
          const mut = MUTATION_IDS[Math.floor(Math.random() * MUTATION_IDS.length)]
          mutatedIds[t.id] = mut
          get().pushToast(MUTATIONS[mut].rogue.toUpperCase(), MUTATIONS[mut].taunt, 'chaos')
          if (mut === 'riddler') {
            // cipher up to 3 random OTHER open cases
            const pool = st.tasks.filter((x) => x.id !== t.id && !x.done && !x.assignedTo).map((x) => x.id)
            for (let i = pool.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]
            }
            scrambled = Array.from(new Set([...scrambled, ...pool.slice(0, 3)]))
          }
        })
        set({
          tasks: st.tasks.map((t) => (mutatedIds[t.id] ? { ...t, mutation: mutatedIds[t.id] } : t)),
          riddlerScrambled: scrambled,
          lastFearToxin: Date.now(),
        })
      },

      /* ════════════ V5 · COMMAND CONSOLE (Cmd+K) ═════════════════ */
      openCommand: () => set({ commandOpen: true }),
      closeCommand: () => set({ commandOpen: false }),
      toggleCommand: () => set((st) => ({ commandOpen: !st.commandOpen })),

      /* ════════════ V5 · ORACLE'S WIRETAP (brain dump) ═══════════ */
      addWiretap: (text) => {
        const v = text.trim()
        if (!v) return
        set((st) => ({ wiretap: [{ id: uid(), text: v, at: Date.now() }, ...st.wiretap] }))
        get().pushToast('ORACLE', 'Intercept logged to the Wiretap. Process it at the Batcomputer.', 'hud')
      },
      removeWiretap: (id) => set((st) => ({ wiretap: st.wiretap.filter((w) => w.id !== id) })),
      // Promote raw intel into a real (backlog) case, then clear the intercept.
      processWiretap: (id, fields = {}) => {
        const st = get()
        const w = st.wiretap.find((x) => x.id === id)
        if (!w) return
        get().addTask({
          title: fields.title || w.text,
          sector: fields.sector || 'mind',
          threat: fields.threat || 'MEDIUM',
          status: 'backlog',
        })
        set({ wiretap: st.wiretap.filter((x) => x.id !== id) })
      },

      /* ════════════ V5 · BLACKGATE (kanban status moves) ═════════ */
      setStatus: (id, status) => {
        if (status === 'incarcerated') return get().completeTask(id) // door slams shut
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }))
      },

      /* ════════════ V5 · TWO-FACE (the coin decides) ════════════ */
      resolveTwoFace: () => {
        const clean = Math.random() < 0.5
        const st = get()
        if (clean) {
          set({ pendingTwoFace: false })
          get().pushToast('TWO-FACE', TWOFACE.cleanText, 'gold')
        } else {
          const sectorKey = 'mind'
          const { sector } = applyXp(st.sectors, sectorKey, -TWOFACE.scarredXp)
          set({
            pendingTwoFace: false,
            sectors: sector,
            coins: Math.max(0, st.coins - TWOFACE.scarredCoins),
            lastFearToxin: Date.now(),
          })
          get().pushToast('TWO-FACE', TWOFACE.scarredText, 'chaos')
        }
        return clean
      },

      /* ════════════════ COWL TOGGLE (duality) ═════════════════════ */
      setMode: (mode) => {
        set({ mode })
        get().pushToast('ALFRED', pick(mode === 'wayne' ? ALFRED.wayne : ALFRED.batman), mode === 'wayne' ? 'gold' : 'blood')
      },
      toggleMode: () => get().setMode(get().mode === 'batman' ? 'wayne' : 'batman'),

      /* ════════════ DETECTIVE VISION (focus session) ══════════════ */
      startFocus: (taskId, duration = FOCUS_DEFAULT_MS) => {
        // capture the active focus discipline (Arkham strict vs Oracle background)
        set({ focus: { active: true, taskId, duration, endsAt: Date.now() + duration, startedAt: Date.now(), strict: get().focusStrict } })
      },
      // Full session survived → bounty + complete the underlying task.
      completeFocus: () => {
        const f = get().focus
        if (!f) return
        set({ focus: null })
        const st = get()
        const task = st.tasks.find((t) => t.id === f.taskId)
        const sectorKey = task?.sector || 'mind'
        const { sector, unlocked } = applyXp(st.sectors, sectorKey, FOCUS_BOUNTY_XP)
        const log = [...st.completionLog]
        const day = log.find((d) => d.date === todayKey())
        if (day) { day.points += FOCUS_BOUNTY_XP; day.count = (day.count || 0) + 1 }
        else log.push({ date: todayKey(), points: FOCUS_BOUNTY_XP, count: 1 })
        set({
          sectors: sector,
          coins: st.coins + FOCUS_BOUNTY_COINS,
          completionLog: log,
          upgradesEarned: st.upgradesEarned + unlocked.length,
        })
        get().bumpStreak()
        if (task) get().completeTask(task.id) // the task itself is neutralised
        unlocked.forEach((u) => get().pushToast('UPGRADE ACQUIRED', u, 'gold'))
        get().pushToast('ALFRED', pick(ALFRED.focusDone), 'gold')
      },
      // Focus broken (tab-away, early exit, mid-session reload) → Joker penalty.
      breakFocus: () => {
        const f = get().focus
        if (!f) return
        set({ focus: null })
        const st = get()
        const task = st.tasks.find((t) => t.id === f.taskId)
        const sectorKey = task?.sector || 'mind'
        const { sector } = applyXp(st.sectors, sectorKey, -FOCUS_BREAK_XP_PENALTY)
        set({
          sectors: sector,
          coins: Math.max(0, st.coins - FOCUS_BREAK_COIN_PENALTY),
          streak: 0,
          lastFearToxin: Date.now(),
        })
        get().pushToast('ALFRED', pick(ALFRED.focusBroke), 'chaos')
      },

      /* ════════════ ARKHAM WING (rogue profiling) ═════════════════ */
      tagFailure: (closedId, rogue) => {
        const st = get()
        set({
          closedTasks: st.closedTasks.map((t) => (t.id === closedId ? { ...t, rogue } : t)),
          rogueStats: { ...st.rogueStats, [rogue]: (st.rogueStats[rogue] || 0) + 1 },
        })
      },

      /* ════════════ FOUNDATION — Tower of Babel contingencies ═════ */
      addContingency: (tpl) =>
        set((st) => ({ contingencies: [...st.contingencies, { ...tpl, enabled: true, armed: true, addedAt: Date.now() }] })),
      removeContingency: (id) =>
        set((st) => ({ contingencies: st.contingencies.filter((c) => c.id !== id) })),
      toggleContingency: (id) =>
        set((st) => ({ contingencies: st.contingencies.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)) })),
      // Basic evaluator — extended with real triggers when the vault UI ships.
      isSectorLocked: (sectorKey) => {
        // A contingency may lock a sector; placeholder hook for the lockout UI.
        return get().contingencies.some(
          (c) => c.enabled && c.armed && c.then?.type === 'lockSector' && c.then.sector === sectorKey
        )
      },

      /* ════════════ FOUNDATION — Lucius Fox R&D (coin sink) ═══════ */
      addPrototype: (title) =>
        set((st) => ({ rnd: [...st.rnd, { id: uid(), title: title.trim(), stage: 'idea', invested: 0 }] })),
      investInPrototype: (id) => {
        const st = get()
        const p = st.rnd.find((x) => x.id === id)
        if (!p) return false
        const idx = RND_STAGES.indexOf(p.stage)
        const nextStage = RND_STAGES[idx + 1]
        if (!nextStage) return false
        const cost = RND_STAGE_COST[nextStage]
        if (st.coins < cost) {
          get().pushToast('LUCIUS FOX', `Need ${cost} WC to advance “${p.title}”, sir.`, 'gold')
          return false
        }
        set({
          coins: st.coins - cost,
          rnd: st.rnd.map((x) => (x.id === id ? { ...x, stage: nextStage, invested: x.invested + cost } : x)),
        })
        get().pushToast('LUCIUS FOX', `“${p.title}” advanced to ${nextStage.toUpperCase()}.`, 'gold')
        return true
      },

      /* ════════════ FOUNDATION — Batsuit Telemetry (biometrics) ═══ */
      setBiometrics: (sleep, soreness) => {
        const bacta = sleep < BACTA_SLEEP_THRESHOLD || soreness >= BACTA_SORENESS_THRESHOLD
        set({ biometrics: { date: todayKey(), sleep, soreness, bacta } })
        if (bacta)
          get().pushToast('ALFRED', 'Engaging Bacta Tank Mode, sir. Tonight we heal, not hunt.', 'gold')
        return bacta
      },

      /* ════════════ FOUNDATION — The Lazarus Pit (grace + scar) ═══ */
      lazarusReset: () => {
        const st = get()
        const clearedTasks = st.tasks.length
        set({
          tasks: [], // overwhelmed slate, wiped clean
          signal: null,
          failedCount: 0, // overdue penalties forgiven
          focus: null,
          lastSeen: todayKey(),
          lazarus: { scars: [...st.lazarus.scars, { date: todayKey(), clearedTasks, at: Date.now() }] },
          lastFearToxin: Date.now(),
        })
        get().pushToast('RA\'S AL GHUL', 'The Pit forgives the body. It does not forgive the soul. The scar remains.', 'chaos')
      },

      /* ──────────────── ENCRYPTED BACKUP (export/import) ────────── */
      exportSave: () => {
        const { toasts, ...persistable } = get()
        void toasts
        return JSON.stringify(
          { _signature: 'WAYNE-OS-DKP', exportedAt: new Date().toISOString(), data: persistable },
          null,
          2
        )
      },
      importSave: (raw) => {
        try {
          const parsed = JSON.parse(raw)
          const data = parsed.data || parsed
          set({
            ...data,
            toasts: [],
            _streakToday: false,
          })
          get().pushToast('ALFRED', 'Your records are restored, Master Wayne. Welcome back.', 'gold')
          return true
        } catch (e) {
          get().pushToast('ALFRED', 'This file is corrupted, sir. I could not read it.', 'blood')
          return false
        }
      },

      hardReset: () => {
        set({
          firstNight: todayKey(),
          lastSeen: todayKey(),
          sectors: freshSectors(),
          coins: 0,
          streak: 0,
          failedCount: 0,
          upgradesEarned: 0,
          tasks: [],
          closedTasks: [],
          signal: null,
          completionLog: [],
          toasts: [],
          mode: 'batman',
          focus: null,
          gadgets: [],
          commandOpen: false,
          wiretap: [],
          pendingTwoFace: false,
          schedule: {},
          notifiedSlots: {},
          riddlerScrambled: [],
          activeTab: 'mission',
          contextTaskId: null,
          lastLoginDate: null,
          boss: null,
          bossBuffs: 0,
          bossScars: [],
          beltActive: null,
          boardCores: [],
          boardSubs: [],
          journal: [],
          graveyard: [],
          focusStrict: true,
          research: [],
          unlockedResearch: [],
          muted: false,
          lastInterrogation: null,
          slotResolutions: {},
          adHackedUntil: 0,
          hoveredTaskId: null,
          rogueStats: { riddler: 0, freeze: 0, ivy: 0, bane: 0 },
          contingencies: [],
          rnd: [],
          biometrics: { date: null, sleep: null, soreness: null, bacta: false },
          lazarus: { scars: [] }, // the WIPE is absolute — even the scars go
          _streakToday: false,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (st) => {
        // never persist transient UI noise (toasts, open-console flag, belt mode,
        // the contextual-panel target)
        const { toasts, commandOpen, beltActive, contextTaskId, hoveredTaskId, ...rest } = st
        void toasts
        void commandOpen
        void beltActive
        void contextTaskId
        void hoveredTaskId
        return rest
      },
    }
  )
)

/* ─────────────────────── DERIVED SELECTORS ─────────────────────── */
export const selectCompositeLevel = (st) =>
  SECTOR_ORDER.reduce((sum, k) => sum + st.sectors[k].lvl, 0)

// Build a continuous 30-day series for Recharts (zero-filled).
export function build30DaySeries(log) {
  const map = new Map(log.map((d) => [d.date, d]))
  const out = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = map.get(key)
    out.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      points: entry?.points || 0,
      count: entry?.count || 0,
    })
  }
  return out
}

// The Long Halloween — a continuous 365-day grid for the heatmap.
// Each cell: { date, points, count, arkham }. Zero-filled.
export function build365Series(log) {
  const map = new Map(log.map((d) => [d.date, d]))
  const out = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const e = map.get(key)
    out.push({ date: key, points: e?.points || 0, count: e?.count || 0, arkham: e?.arkham || 0 })
  }
  return out
}

// Active mutations present on the board → drives the OS-wide debuffs.
// Returns a Set of mutation ids ('freeze' | 'riddler' | 'scarecrow').
export function selectActiveMutations(tasks) {
  return new Set(tasks.filter((t) => !t.done && t.mutation).map((t) => t.mutation))
}

// Group delegated tasks by sidekick id → { nightwing:[...], ... }.
export function groupBySidekick(tasks) {
  const out = {}
  tasks.filter((t) => !t.done && t.assignedTo).forEach((t) => {
    ;(out[t.assignedTo] ||= []).push(t)
  })
  return out
}

// Group tasks into the three Blackgate columns. `closed` feeds Incarcerated.
// Delegated cases (assignedTo) are off the board — they're with the family.
export function groupForKanban(tasks, closedTasks) {
  const open = tasks.filter((t) => !t.done && !t.assignedTo)
  return {
    backlog: open.filter((t) => t.status === 'backlog'),
    patrol: open.filter((t) => t.status !== 'backlog'),
    incarcerated: closedTasks.filter((t) => !t.failed).slice(0, 12),
  }
}

// Threat-aware sort: Arkham first, then by creation recency.
export function sortByThreat(tasks) {
  return [...tasks].sort((a, b) => {
    const d = THREAT[b.threat].rank - THREAT[a.threat].rank
    if (d !== 0) return d
    return b.createdAt - a.createdAt
  })
}

// BatPanel image tiers (1–5) derived from sector mastery.
// Empire = Wealth+Allies · Machine = Project · Body = Body+Mind.
export const selectTiers = (st) => ({
  empireLevel: levelToTier(Math.round((st.sectors.wealth.lvl + st.sectors.allies.lvl) / 2)),
  machineLevel: levelToTier(st.sectors.project.lvl),
  bodyLevel: levelToTier(Math.round((st.sectors.body.lvl + st.sectors.mind.lvl) / 2)),
})

// The Rogue defeating you most (by tagged-failure count). null if none tagged.
export function dominantRogue(rogueStats) {
  let best = null
  let max = 0
  for (const k of ROGUE_ORDER) {
    if ((rogueStats[k] || 0) > max) { max = rogueStats[k]; best = k }
  }
  return best
}

// Failed, archived tasks that still need a Rogue assigned in the Arkham Wing.
export function untaggedFailures(closedTasks) {
  return closedTasks.filter((t) => t.failed && !t.rogue)
}
