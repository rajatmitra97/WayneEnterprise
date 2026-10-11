/* ═══════════════════════════════════════════════════════════════════
   WAYNE OS // THE DARK KNIGHT PROTOCOL  ·  global state
   Zustand + persist middleware. localStorage key: 'wayneOSv3'.
   Owns: persistence, XP/levels, Wayne Coins, threat-sorted tasks,
   patrol-route regeneration at the night boundary, history log,
   the Bat-Signal, and Oracle comms (the single alert queue).
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSaveText, normalizeState } from './lib/saveFile'
import {
  SECTOR_ORDER,
  LEVELS_PER_SECTOR,
  UPGRADES,
  THREAT,
  RECUR,
  xpForLevel,
  ALFRED,
  FOCUS_BOUNTY_XP,
  FOCUS_BOUNTY_COINS,
  FOCUS_BREAK_XP_PENALTY,
  FOCUS_BREAK_COIN_PENALTY,
  FOCUS_DEFAULT_MS,
  ROGUE_ORDER,
  BACTA_SLEEP_THRESHOLD,
  BACTA_SORENESS_THRESHOLD,
  PREP_DEFAULT_MS,
  JOKER_CHAOS_XP,
  JOKER_CHAOS_COINS,
  PREP_PENALTY_MULT,
  levelToTier,
  SECTOR_TOKENS,
  THREAT_TOKENS,
  SCHEDULE_TOKENS,
  RECUR_TOKENS,
  TWOFACE_STREAK,
  ORACLE_OVERRIDE,
  MUTATION_AGE_MS,
  MUTATION_IDS,
  MUTATIONS,
  BOSSES,
  BOSS_DAMAGE,
  BOSS_BUFF_STEP,
  LAZARUS_REVIVE_COST,
  RESEARCH_PROJECTS,
  RESEARCH_HOURS,
  INTERROGATION_PENALTY_RELIEF,
  NIGHT_ENDS_HOUR,
  INTAKE_GRACE_MS,
  SIGNAL_THREATS,
  SIGNAL_MISS_MULT,
  HARVEY_DEAL,
  MUTATION_BOSS_HP,
  JOKER_TOLL_XP,
  ALERT_CAP_PER_NIGHT,
  HANDOFF_DEFAULT_NIGHTS,
} from './constants'

/* ═══════════════════════════════════════════════════════════════════
   TIME — local dates and the night boundary.
   Every date key is LOCAL (Dhaka, not UTC), and a "night" runs until
   nightEndsHour the next morning, so a 1 a.m. patrol still belongs to the
   night it started in. Never use toISOString() for a date key.
   ═══════════════════════════════════════════════════════════════════ */
let nightEndsHour = NIGHT_ENDS_HOUR
const pad2 = (n) => String(n).padStart(2, '0')
export const getNightEndsHour = () => nightEndsHour
export const localDateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
// The moment shifted back by the night boundary: 01:30 Tue → Mon's night.
export const nightDate = (d = new Date()) => {
  const x = new Date(d.getTime())
  x.setHours(x.getHours() - nightEndsHour)
  return x
}
export const todayKey = () => localDateKey(nightDate())
export const nightWeekday = () => nightDate().getDay()
export const keyToDate = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const shiftKey = (key, days) => {
  const d = keyToDate(key)
  d.setDate(d.getDate() + days)
  return localDateKey(d)
}

// ISO-ish week key so the boss rotates every Monday (at the night boundary).
function weekKey(date = keyToDate(todayKey())) {
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
  const out = { sector: null, threat: null, schedule: null, recur: null, days: [], prep: false }
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
  // "every …" — every day / every week / every weekday / every mon wed fri
  const DAY_WORDS = { sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tues: 2, tuesday: 2, wed: 3, wednesday: 3, thu: 4, thur: 4, thurs: 4, thursday: 4, fri: 5, friday: 5, sat: 6, saturday: 6 }
  text = text.replace(/\bevery\s+((?:(?:sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day|nesday|sday|urday|rsday)?|weekdays?|weekends?|week|day)(?:[\s,]+(?:and\s+)?(?:(?:sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)(?:day|nesday|sday|urday|rsday)?))*)/i, (m, list) => {
    const words = list.toLowerCase().split(/[\s,]+/).filter((w) => w && w !== 'and')
    if (words[0] === 'day') out.recur = RECUR.DAILY
    else if (words[0] === 'week') out.recur = RECUR.WEEKLY
    else if (words[0].startsWith('weekday')) { out.recur = RECUR.CUSTOM; out.days = [1, 2, 3, 4, 5] }
    else if (words[0].startsWith('weekend')) { out.recur = RECUR.CUSTOM; out.days = [0, 6] }
    else {
      const days = Array.from(new Set(words.map((w) => DAY_WORDS[w]).filter((d) => d !== undefined))).sort()
      if (days.length === 0) return m
      out.recur = RECUR.CUSTOM
      out.days = days
    }
    return ' '
  })
  // bare schedule / recurrence keywords
  Object.keys(SCHEDULE_TOKENS).forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i')
    if (re.test(text)) { out.schedule = SCHEDULE_TOKENS[kw]; text = text.replace(re, ' ') }
  })
  Object.keys(RECUR_TOKENS).forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, 'i')
    if (!out.recur && re.test(text)) { out.recur = RECUR_TOKENS[kw]; text = text.replace(re, ' ') }
  })

  out.title = text.replace(/\s+/g, ' ').trim()
  return out
}

export const STORAGE_KEY = 'wayneOSv3'
export const PREIMPORT_KEY = 'wayneOSv3-preimport'
const uid = () => Math.random().toString(36).slice(2, 10)
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

// is a recurring task due tonight, given its schedule? (weekday = the NIGHT's
// weekday, so 01:00 Tuesday still checks Monday's routines)
function dueToday(recur, days, weekday = nightWeekday()) {
  if (recur === RECUR.DAILY) return true
  // WEEKLY & CUSTOM both resolve to a set of weekdays in days[] (0=Sun..6=Sat)
  if (recur === RECUR.WEEKLY || recur === RECUR.CUSTOM)
    return (days || []).includes(weekday)
  return false
}

/* ═══════════════════════════════════════════════════════════════════
   RULES OF ENGAGEMENT — pure checks shared by the store and the UI.
   ═══════════════════════════════════════════════════════════════════ */
const isScheduled = (st, id) => Object.values(st.schedule || {}).includes(id)
const graceStart = (t) => t.committedAt || t.createdAt || 0

// Why this case can't carry the Bat-Signal tonight, or null if it can.
export function signalBlock(st, t) {
  if (!t || t.done) return 'That case is already closed.'
  if (t.status === 'backlog') return 'Backlog intel cannot carry the Signal. Put it on patrol first.'
  if (t.locked) return 'A locked case needs an alibi, not a Signal.'
  if (t.assignedTo) return 'The Signal is yours, sir. Recall the case from the family first.'
  if (!SIGNAL_THREATS.includes(t.threat)) return 'The Signal is only lit for High or Arkham-level cases.'
  if (st.lastSignalDate === todayKey()) return 'The Signal is already lit tonight. Gotham gets one.'
  return null
}

// Threat is set at intake: editable for 10 minutes after a case is committed,
// never once it is scheduled or carries the Signal. Backlog intel stays open.
export function threatLocked(st, t, now = Date.now()) {
  if (!t) return true
  if (t.threatLocked) return true
  if (st.signal?.taskId === t.id) return true
  if (isScheduled(st, t.id)) return true
  if (t.status === 'backlog') return false
  return now - graceStart(t) >= INTAKE_GRACE_MS
}

// What abandoning this case would cost right now. Free inside the grace
// window, for backlog intel, and for routines not due tonight; otherwise it
// is a failure like any other (×10 Joker Chaos if Prep Time was invoked).
export function abandonCost(st, t, now = Date.now()) {
  if (!t) return null
  if (t.done) return { free: true, reason: 'closed', xp: 0, coins: 0 }
  if (t.status === 'backlog') return { free: true, reason: 'backlog', xp: 0, coins: 0 }
  if (!t.prepInvoked && now - graceStart(t) < INTAKE_GRACE_MS)
    return { free: true, reason: 'grace', xp: 0, coins: 0 }
  if (t.recur !== RECUR.NONE && (!dueToday(t.recur, t.days) || t.lastDoneDate === todayKey()))
    return { free: true, reason: 'resting', xp: 0, coins: 0 }
  const isSignal = st.signal?.taskId === t.id
  if (t.prepInvoked)
    return { free: false, reason: 'prep', xp: JOKER_CHAOS_XP * PREP_PENALTY_MULT, coins: JOKER_CHAOS_COINS * PREP_PENALTY_MULT, isSignal }
  const base = THREAT[t.threat].penalty
  return { free: false, reason: isSignal ? 'signal' : 'abandon', xp: base * (isSignal ? 1 + SIGNAL_MISS_MULT : 1), coins: 0, isSignal }
}

/* ═══════════════════════════════════════════════════════════════════
   PERSISTED DATA — the single list of what a save contains. Used by the
   store's initial state, the hard reset, export and the import validator.
   ═══════════════════════════════════════════════════════════════════ */
export const initialData = () => ({
  // identity / time
  firstNight: todayKey(),
  lastSeen: todayKey(),
  version: 4,
  nightEndsHour: NIGHT_ENDS_HOUR,
  // progression
  sectors: freshSectors(),
  coins: 0, // Wayne Coins (WC)
  streak: 0,
  failedCount: 0,
  upgradesEarned: 0,
  // content
  tasks: [], // active
  closedTasks: [], // archive
  signal: null, // {taskId, date} — the Bat-Signal (3x)
  lastSignalDate: null, // the night the Signal was last lit (one per night)
  signalMisses: [], // [{date, title}] unanswered Signals (Crime Alley)
  selectedSector: 'body',
  // history — completionLog: [{ date:'YYYY-MM-DD', points, count, arkham }]
  completionLog: [],
  // Alfred / notifications
  notifyPermission: 'default',
  lastFearToxin: 0,
  // Cowl Toggle
  mode: 'batman', // 'wayne' | 'batman'
  // Detective Vision — {active, taskId, endsAt, duration}
  focus: null,
  // Arkham Wing
  rogueStats: { riddler: 0, freeze: 0, ivy: 0, bane: 0 },
  // The Armory
  gadgets: [],
  // V5 Oracle Integration
  wiretap: [], // raw intel backlog {id, text, at}
  harveyDeal: null, // {state:'offered'|'accepted', offeredOn, date, sector} — Harvey's Deal
  // GCPD Dispatch Grid
  schedule: {}, // slotKey "wd:mins" → taskId (repeats weekly)
  notifiedSlots: {}, // "YYYY-MM-DD:wd:mins" → true (chrono de-dupe, reset nightly)
  // V7 Gotham Paradigm
  activeTab: 'mission',
  lastLoginDate: null,
  boss: null,
  bossBuffs: 0,
  bossScars: [],
  // V8 Detective Board Update
  boardCores: [],
  boardSubs: [],
  journal: [],
  graveyard: [],
  focusStrict: true,
  research: [],
  unlockedResearch: [],
  muted: false,
  lastInterrogation: null,
  // V9
  slotResolutions: {},
  alertLog: { date: null, count: 0, dropped: 0 }, // unsolicited alerts shown tonight
  // FOUNDATION (full UI lands in a later stage)
  contingencies: [],
  biometrics: { date: null, sleep: null, soreness: null, bacta: false },
  lazarus: { scars: [] },
})
export const PERSISTED_KEYS = Object.keys(initialData())
export const persistedSlice = (st) =>
  PERSISTED_KEYS.reduce((acc, k) => {
    if (st[k] !== undefined) acc[k] = st[k]
    return acc
  }, {})

export const useStore = create(
  persist(
    (set, get) => ({
      // ── everything a save holds (see initialData above) ──
      ...initialData(),

      // ── transient UI state (never persisted — see partialize) ──
      toasts: [], // {id, label, text, tone}
      commandOpen: false, // Batcomputer Command Console (Cmd+K)
      contextTaskId: null, // right contextual panel target
      beltActive: null, // active Utility Belt gadget (e.g. 'batarang')
      hoveredTaskId: null, // task under the cursor, for the 'T' hotkey

      /* ───────────────────────── TASKS ───────────────────────── */
      addTask: ({
        title, sector, threat, recur = RECUR.NONE, days = [], signal = false,
        status = 'patrol', prep = false, schedule = null, lockThreat = false,
      }) => {
        // WEEKLY anchors to tonight's weekday unless explicit days supplied.
        const resolvedDays =
          recur === RECUR.WEEKLY && (!days || days.length === 0)
            ? [nightWeekday()]
            : days
        // schedule = night offset (0 tonight, 1 tomorrow …) → a scheduledFor key
        const scheduledFor = schedule != null ? shiftKey(todayKey(), schedule) : null
        const now = Date.now()
        const t = {
          id: uid(),
          title: title.trim(),
          sector,
          threat,
          recur,
          days: resolvedDays,
          status,
          scheduledFor,
          createdAt: now,
          committedAt: status === 'backlog' ? null : now, // the intake grace clock
          createdDate: todayKey(),
          done: false,
          ...(lockThreat ? { threatLocked: true } : {}),
        }
        set((st) => ({ tasks: [t, ...st.tasks] }))
        if (signal) get().setSignal(t.id)
        if (prep) get().requirePrep(t.id)
        if (threat === 'ARKHAM') get().pushToast('ALFRED', pick(ALFRED.arkham), 'blood')
        return t.id
      },

      // Edit a case. The threat is set at intake: after the 10-minute grace
      // window (or once scheduled / signalled) it can no longer be changed.
      updateTask: (id, patch) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t) return false
        const next = { ...patch }
        let refused = false
        const isLocked = threatLocked(st, t)
        if (next.threat && next.threat !== t.threat && isLocked) {
          delete next.threat
          refused = true
          get().pushToast('ALFRED', 'The threat level was set at intake, sir. Gotham does not renegotiate.', 'blood')
        }
        // turning a one-off into a routine (or back) after intake would dodge
        // the overdue lock — refused; changing a routine's days is fine
        const wasRoutine = t.recur !== RECUR.NONE
        const willBeRoutine = (next.recur ?? t.recur) !== RECUR.NONE
        if (isLocked && wasRoutine !== willBeRoutine) {
          delete next.recur
          delete next.days
          refused = true
          get().pushToast('ALFRED', 'A one-off case cannot become a patrol route after intake, sir, nor the reverse.', 'blood')
        }
        set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...next } : x)) }))
        return !refused
      },

      // ABANDON — striking a case is free only inside the intake grace window
      // (or for backlog intel / resting routines). Otherwise it is a failure:
      // the threat's penalty (×3 if it carried the Signal, Joker Chaos ×10 if
      // Prep Time was invoked), the streak breaks, and the case goes to the
      // Arkham Wing to be named. Returns the cost that was applied.
      deleteTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t) return null
        const cost = abandonCost(st, t)
        const schedule = { ...st.schedule }
        Object.keys(schedule).forEach((k) => { if (schedule[k] === id) delete schedule[k] })
        const signal = st.signal?.taskId === id ? null : st.signal
        const tasks = st.tasks.filter((x) => x.id !== id)

        if (cost.free) {
          set({ tasks, schedule, signal })
          if (cost.reason === 'grace') get().pushToast('ALFRED', 'Struck from the record before it was logged, sir.', 'gold')
          return cost
        }

        const { sector } = applyXp(st.sectors, t.sector, -cost.xp)
        set({
          tasks,
          schedule,
          signal,
          sectors: sector,
          coins: Math.max(0, st.coins - cost.coins),
          streak: 0,
          failedCount: st.failedCount + 1,
          lastFearToxin: Date.now(),
          closedTasks: [
            { ...t, id: uid(), srcId: t.id, failed: true, abandoned: true, rogue: null, closedAt: Date.now(), closedDate: todayKey() },
            ...st.closedTasks,
          ].slice(0, 400),
          signalMisses: cost.isSignal
            ? [{ date: todayKey(), title: t.title, abandoned: true }, ...st.signalMisses].slice(0, 60)
            : st.signalMisses,
        })
        if (cost.reason === 'prep')
          get().pushToast('THE JOKER', 'You invoked prep time and ran anyway? HAHAHA. The price is TEN times steeper, Bats.', 'chaos')
        else if (cost.reason === 'signal')
          get().pushToast('CRIME ALLEY', `You lit the Signal and walked away. Gotham saw it. −${cost.xp} XP.`, 'blood')
        else
          get().pushToast('ALFRED', `Case abandoned, sir. −${cost.xp} XP. It goes to the Arkham Wing to be named.`, 'blood')
        return cost
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

      // THE BAT-SIGNAL — one per night, High or Arkham only, locked once lit.
      setSignal: (taskId) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === taskId)
        const block = signalBlock(st, t)
        if (block) {
          get().pushToast('ALFRED', block, 'blood')
          return false
        }
        set({ signal: { taskId, date: todayKey() }, lastSignalDate: todayKey() })
        get().pushToast('ALFRED', pick(ALFRED.signalUp), 'gold')
        return true
      },

      // Complete a task → award XP+coins, log history, roll Joker chaos.
      completeTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t || t.done) return
        const meta = THREAT[t.threat]
        const isSignal = st.signal?.taskId === id && st.signal.date === todayKey()
        const mult = isSignal ? 3 : 1

        // permanent boss-defeat buff folds into every XP award
        const xpMult = 1 + st.bossBuffs * BOSS_BUFF_STEP
        // A completion is never taxed (law 2: punish inaction, never action).
        const gainedXp = Math.round(meta.xp * mult * xpMult)
        const gainedCoins = meta.coins * mult

        const { sector, unlocked } = applyXp(st.sectors, t.sector, gainedXp)

        const log = [...st.completionLog]
        const dayIdx = log.findIndex((d) => d.date === todayKey())
        const isArkhamWin = t.threat === 'ARKHAM' ? 1 : 0
        if (dayIdx >= 0) {
          const day = log[dayIdx]
          log[dayIdx] = { ...day, points: day.points + gainedXp, count: (day.count || 0) + 1, arkham: (day.arkham || 0) + isArkhamWin }
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
          signal: st.signal?.taskId === id ? null : st.signal,
        })

        get().bumpStreak()
        get().dealBossDamage(meta.rank) // every closed case wounds the weekly Rogue
        unlocked.forEach((u) => get().pushToast('UPGRADE ACQUIRED', u, 'gold', { priority: 1 }))
        get().pushToast('ALFRED', pick(ALFRED.done), 'gold', { priority: 3 })

        // A scheduled Core Task closing marks its Detective Board node solved.
        if (t.coreId) set((s2) => ({ boardCores: s2.boardCores.map((c) => (c.id === t.coreId ? { ...c, done: true } : c)) }))

        // A completed patrol route re-arms at the next midnight rollover,
        // so nothing to respawn here — see rolloverCheck().
        return { gainedXp, gainedCoins, unlocked, isSignal }
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
        // Only ever roll FORWARD (a changed night boundary must not replay a night).
        if (st.lastSeen && st.lastSeen >= today) return

        const lastNight = shiftKey(today, -1)
        const lastNightWd = keyToDate(lastNight).getDay()
        const tonightWd = keyToDate(today).getDay()
        let workingSectors = get().sectors
        const survivors = []
        const newlyFailed = [] // archived for Arkham Wing tagging
        let failed = 0

        st.tasks.forEach((t) => {
          if (t.recur !== RECUR.NONE) {
            // Re-arm if due tonight; otherwise rest until its next scheduled night.
            const armed = dueToday(t.recur, t.days, tonightWd)
            // Soft miss: it was due LAST night and wasn't closed then (half
            // penalty, High/Arkham only — dailies shouldn't be ruinous). Rest
            // nights never penalize.
            const wasDue = dueToday(t.recur, t.days, lastNightWd)
            const missed = wasDue && t.lastDoneDate !== lastNight && (t.createdDate || '') <= lastNight
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
          } else if (t.assignedTo && t.followUpOn && t.followUpOn >= today && !t.done) {
            survivors.push(t) // handed off — exempt from the lock until its follow-up night
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

        // CRIME ALLEY — a Signal lit on an earlier night and never answered.
        // (Completing or abandoning the case clears the Signal, so if it is
        // still lit at rollover, nobody came.) Costs double the case's penalty.
        let signalMissed = null
        if (st.signal && st.signal.date < today) {
          const t = st.tasks.find((x) => x.id === st.signal.taskId)
          const penalty = (THREAT[t?.threat]?.penalty || THREAT.HIGH.penalty) * SIGNAL_MISS_MULT
          const drained = applyXp(workingSectors, t?.sector || 'mind', -penalty)
          workingSectors = drained.sector
          failed += 1
          signalMissed = { date: st.signal.date, title: t?.title || 'the priority target', penalty }
        }

        // THE JOKER — patrol windows booked for last night that still hold an
        // open case. He only ever hits commitments you ignored.
        const openIds = new Set(st.tasks.filter((t) => !t.done && !t.locked && t.status !== 'backlog').map((t) => t.id))
        const knownIds = new Set(st.tasks.map((t) => t.id))
        const ignored = Object.entries(st.schedule).filter(
          ([k, id]) => Number(k.split(':')[0]) === lastNightWd && openIds.has(id)
        )
        let jokerToll = 0
        ignored.forEach(([, id]) => {
          const t = st.tasks.find((x) => x.id === id)
          const drained = applyXp(workingSectors, t.sector, -JOKER_TOLL_XP)
          workingSectors = drained.sector
          jokerToll += JOKER_TOLL_XP
        })
        // slots pointing at cases that no longer exist are swept
        const schedule = Object.fromEntries(Object.entries(st.schedule).filter(([, id]) => knownIds.has(id)))

        // HARVEY'S DEAL — settle last night's bet, or an offer left unanswered.
        let coins = st.coins
        let harveyDeal = st.harveyDeal
        let harveyNote = null
        if (harveyDeal?.state === 'accepted' && harveyDeal.date < today) {
          const closed = st.completionLog.find((d) => d.date === harveyDeal.date)?.count || 0
          if (closed >= HARVEY_DEAL.target) {
            harveyNote = { tone: 'gold', text: `${closed} cases closed. The coin lands clean — you walk away unscarred.` }
          } else {
            workingSectors = applyXp(workingSectors, harveyDeal.sector, -HARVEY_DEAL.scarXp * 2).sector
            coins = Math.max(0, coins - HARVEY_DEAL.scarCoins * 2)
            harveyNote = { tone: 'blood', text: `${closed} of ${HARVEY_DEAL.target}. You bet and lost: −${HARVEY_DEAL.scarXp * 2} XP, −${HARVEY_DEAL.scarCoins * 2} WC.` }
          }
          harveyDeal = null
        } else if (harveyDeal?.state === 'offered' && harveyDeal.offeredOn < today) {
          // no answer by the next night: Harvey takes the scar
          workingSectors = applyXp(workingSectors, harveyDeal.sector, -HARVEY_DEAL.scarXp).sector
          coins = Math.max(0, coins - HARVEY_DEAL.scarCoins)
          harveyNote = { tone: 'blood', text: `You never answered. Harvey took the scar: −${HARVEY_DEAL.scarXp} XP, −${HARVEY_DEAL.scarCoins} WC.` }
          harveyDeal = null
        }
        // a 7-night (or longer) streak just shattered → offer the deal
        const streakShattered = failed > 0 && st.streak >= TWOFACE_STREAK
        if (streakShattered && !harveyDeal) {
          harveyDeal = { state: 'offered', offeredOn: today, sector: newlyFailed[0]?.sector || 'mind' }
        }

        set({
          tasks: survivors,
          sectors: workingSectors,
          coins,
          schedule,
          closedTasks: [...newlyFailed, ...st.closedTasks].slice(0, 400),
          lastSeen: today,
          failedCount: st.failedCount + failed,
          streak: failed > 0 ? 0 : st.streak,
          lastFearToxin: failed > 0 || jokerToll > 0 ? Date.now() : st.lastFearToxin,
          harveyDeal,
          notifiedSlots: {}, // fresh chrono log each new night
          slotResolutions: {}, // routine ticks/crosses reset at the night boundary
          signal: signalMissed ? null : st.signal,
          signalMisses: signalMissed ? [signalMissed, ...st.signalMisses].slice(0, 60) : st.signalMisses,
        })

        // every message here is unsolicited → it goes through the nightly alert cap
        if (signalMissed)
          get().pushToast('CRIME ALLEY', `The Signal burned all night over “${signalMissed.title}”. No one came. −${signalMissed.penalty} XP.`, 'blood', { alert: true, priority: 0, notify: true })
        if (harveyNote) get().pushToast('TWO-FACE', harveyNote.text, harveyNote.tone, { alert: true, priority: 1 })
        if (jokerToll > 0)
          get().pushToast('THE JOKER', `You booked ${ignored.length} patrol window${ignored.length > 1 ? 's' : ''} last night and never showed. HAHA. −${jokerToll} XP.`, 'chaos', { alert: true, priority: 2 })
        if (failed > 0 && !signalMissed) get().pushToast('ALFRED', pick(ALFRED.fail), 'blood', { alert: true, priority: 2 })
      },

      // streak = consecutive calendar days (ending today) with >=1 completion
      bumpStreak: () => {
        const dates = new Set(get().completionLog.filter((d) => d.count > 0).map((d) => d.date))
        let streak = 0
        let key = todayKey() // require tonight to count
        while (dates.has(key)) {
          streak += 1
          key = shiftKey(key, -1)
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

      /* ──────────── ORACLE COMMS — the single alert queue ────────────
         Everything the OS says goes through here. The toaster shows one
         message at a time (the head of the queue); the rest wait in
         priority order and the queue never holds more than 4.
           opts.alert    — unsolicited (you didn't just cause it). Capped at
                           ALERT_CAP_PER_NIGHT per night; extras are dropped.
                           The Signal (priority 0) always gets through.
           opts.priority — 0 Signal · 1 patrol start / rank · 2 warnings · 3 chatter
           opts.notify   — also raise a system notification (patrol start and
                           the Signal only)
         ──────────────────────────────────────────────────────────────── */
      pushToast: (label, text, tone = 'gold', opts = {}) => {
        const { alert = false, priority = 2, notify = false } = opts
        const st = get()
        if (st.toasts.some((t) => t.label === label && t.text === text)) return null
        if (alert) {
          const night = todayKey()
          const log = st.alertLog?.date === night ? st.alertLog : { date: night, count: 0, dropped: 0 }
          if (log.count >= ALERT_CAP_PER_NIGHT && priority > 0) {
            set({ alertLog: { ...log, dropped: log.dropped + 1 } })
            return null
          }
          set({ alertLog: { ...log, count: log.count + 1 } })
        }
        const id = uid()
        const toast = { id, label, text, tone, priority, at: Date.now() }
        set((s2) => {
          const [head, ...tail] = s2.toasts
          if (!head) return { toasts: [toast] }
          // the head is on screen — never yank it; sort only what waits
          const waiting = [...tail, toast].sort((a, b) => a.priority - b.priority || a.at - b.at)
          // over 3 waiting: drop the least important, and among those the
          // OLDEST — the newest message is the one about what you just did
          while (waiting.length > 3) {
            let drop = 0
            waiting.forEach((t, i) => {
              const d = waiting[drop]
              if (t.priority > d.priority || (t.priority === d.priority && t.at < d.at)) drop = i
            })
            waiting.splice(drop, 1)
          }
          return { toasts: [head, ...waiting] }
        })
        if (notify && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(`WAYNE OS // ${label}`, { body: text, silent: false })
          } catch (e) {
            /* notifications unavailable */
          }
        }
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
            'blood',
            { alert: true, priority: 1, notify: true }
          )
        })
      },

      /* ════════════ V7 · NAVIGATION & CONTEXT PANEL ═════════════ */
      setTab: (tab) => set({ activeTab: tab }),
      openContext: (taskId) => set({ contextTaskId: taskId }),
      closeContext: () => set({ contextTaskId: null }),

      /* ════════════ V7 · DAILY ALFRED BRIEFING ══════════════════ */
      needsBriefing: () => get().lastLoginDate !== todayKey(),
      // The briefing is a ritual, not a slot machine: no coins for showing up.
      markBriefed: () => set({ lastLoginDate: todayKey() }),
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
            get().pushToast(st.boss.name.toUpperCase(), 'The week ended. I escaped — and I left a scar on your Gotham.', 'blood', { alert: true, priority: 2 })
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
          get().pushToast(st.boss.name.toUpperCase(), `Defeated before the week was out. Permanent +${Math.round(BOSS_BUFF_STEP * 100)}% XP secured.`, 'gold', { priority: 1 })
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
        const id = get().addTask({ title: res.title, sector: res.sector, threat: res.threat, lockThreat: true })
        get().assignSlot(wd, mins, id)
        get().pushToast('SMOKE PELLET', 'Vanished. The failure is forgiven — back to pending.', 'gold')
        return true
      },
      clearSlotResolutions: () => set({ slotResolutions: {} }),

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
        get().addTask({ title: g.title, sector: g.sector, threat: g.threat, lockThreat: true })
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
        const taskId = get().addTask({ title: core.title, sector: core.sector, threat: 'HIGH', lockThreat: true })
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

      /* ════════════ THE FAMILY — real hand-offs ══════════════════ */
      // Hand a case to a real person. It stays in your Case File, marked
      // "with <name>", and is exempt from the overdue lock only until its
      // follow-up night. Closing it is still your job: confirm it's done.
      handOff: (id, to, followUpOn) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        const name = (to || '').trim()
        if (!t || !name) return false
        if (st.signal?.taskId === id) {
          get().pushToast('ALFRED', 'The Signal is yours, sir. It cannot be handed off.', 'blood')
          return false
        }
        const follow = followUpOn && followUpOn >= todayKey() ? followUpOn : shiftKey(todayKey(), HANDOFF_DEFAULT_NIGHTS)
        set({ tasks: st.tasks.map((x) => (x.id === id ? { ...x, assignedTo: name, followUpOn: follow } : x)) })
        get().pushToast('ALFRED', `Handed to ${name}. I shall remind you to check on ${follow}, sir.`, 'gold', { priority: 3 })
        return true
      },
      // Take a handed-off case back onto your own plate.
      takeBack: (id) =>
        set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, assignedTo: null, followUpOn: null } : t)) })),

      /* ════════════ ARKHAM MUTATION PROTOCOL ════════════════════ */
      // Run on the rollover tick: any case locked >24h metastasises into a
      // Rogue — and that Rogue FEEDS the weekly boss. The tool itself is
      // never degraded (law 3: penalties cost the city, not the tool).
      mutateOverdueTasks: () => {
        const st = get()
        const ripe = st.tasks.filter(
          (t) => t.locked && !t.mutation && !t.done && t.lockedAt && Date.now() - t.lockedAt > MUTATION_AGE_MS
        )
        if (ripe.length === 0) return
        const mutatedIds = {}
        ripe.forEach((t) => {
          mutatedIds[t.id] = MUTATION_IDS[Math.floor(Math.random() * MUTATION_IDS.length)]
        })
        const feed = ripe.length * MUTATION_BOSS_HP
        const boss = st.boss && !st.boss.defeated
          ? { ...st.boss, hp: st.boss.hp + feed, maxHp: st.boss.maxHp + feed }
          : st.boss
        set({
          tasks: st.tasks.map((t) => (mutatedIds[t.id] ? { ...t, mutation: mutatedIds[t.id] } : t)),
          boss,
          lastFearToxin: Date.now(),
        })
        const first = MUTATIONS[mutatedIds[ripe[0].id]]
        const fed = boss && boss !== st.boss ? ` ${boss.name} grows stronger: +${feed} HP.` : ''
        get().pushToast(first.rogue.toUpperCase(), `${first.taunt}${fed}`, 'chaos', { alert: true, priority: 2 })
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
        set((st) => ({
          tasks: st.tasks.map((t) => {
            if (t.id !== id) return t
            // leaving the backlog = committing to the case: the intake grace clock starts
            const committedAt = t.status === 'backlog' && status !== 'backlog' ? Date.now() : t.committedAt
            return { ...t, status, committedAt }
          }),
        }))
      },

      /* ════════════ HARVEY'S DEAL (a choice, not a coin) ═════════════ */
      // Take the scar now…
      acceptScar: () => {
        const st = get()
        const deal = st.harveyDeal
        if (!deal || deal.state !== 'offered') return
        const { sector } = applyXp(st.sectors, deal.sector, -HARVEY_DEAL.scarXp)
        set({
          sectors: sector,
          coins: Math.max(0, st.coins - HARVEY_DEAL.scarCoins),
          harveyDeal: null,
          lastFearToxin: Date.now(),
        })
        get().pushToast('TWO-FACE', `The scar is yours: −${HARVEY_DEAL.scarXp} XP, −${HARVEY_DEAL.scarCoins} WC. Start again tonight.`, 'chaos', { priority: 1 })
      },
      // …or bet tonight on it: close HARVEY_DEAL.target cases and walk away clean.
      takeHarveyDeal: () => {
        const st = get()
        const deal = st.harveyDeal
        if (!deal || deal.state !== 'offered') return
        set({ harveyDeal: { ...deal, state: 'accepted', date: todayKey() } })
        get().pushToast('TWO-FACE', `Double or nothing. Close ${HARVEY_DEAL.target} cases tonight.`, 'chaos', { priority: 1 })
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
        // the bounty adds points; the mission itself is counted once, by completeTask
        const extra = task ? 0 : 1
        const idx = log.findIndex((d) => d.date === todayKey())
        if (idx >= 0) log[idx] = { ...log[idx], points: log[idx].points + FOCUS_BOUNTY_XP, count: (log[idx].count || 0) + extra }
        else log.push({ date: todayKey(), points: FOCUS_BOUNTY_XP, count: extra })
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

      /* ════════════ FOUNDATION — Batsuit Telemetry (biometrics) ═══ */
      setBiometrics: (sleep, soreness) => {
        const bacta = sleep < BACTA_SLEEP_THRESHOLD || soreness >= BACTA_SORENESS_THRESHOLD
        set({ biometrics: { date: todayKey(), sleep, soreness, bacta } })
        if (bacta)
          get().pushToast('ALFRED', 'Engaging Bacta Tank Mode, sir. Tonight we heal, not hunt.', 'gold')
        return bacta
      },

      /* ──────────────── WAYNE-TECH VAULT (export / import) ──────────── */
      // The save as a downloadable JSON string (persisted data only).
      exportSave: () => buildSaveText(persistedSlice(get())),

      // Replace the save with already-validated data (see readSaveText). The
      // current save is first copied to localStorage[PREIMPORT_KEY] so an
      // import can always be undone by hand.
      importSave: (data) => {
        try {
          const cur = localStorage.getItem(STORAGE_KEY)
          if (cur) localStorage.setItem(PREIMPORT_KEY, cur)
        } catch (e) {
          /* storage unavailable — continue */
        }
        const { data: clean } = normalizeState(data, initialData())
        nightEndsHour = clean.nightEndsHour ?? NIGHT_ENDS_HOUR
        set({ ...clean, toasts: [], contextTaskId: null, commandOpen: false, beltActive: null, hoveredTaskId: null })
        get().pushToast('ALFRED', 'Your records are restored, Master Wayne. Welcome back.', 'gold')
        return true
      },

      hardReset: () => {
        nightEndsHour = NIGHT_ENDS_HOUR
        // the WIPE is absolute — even the scars go
        set({ ...initialData(), toasts: [], contextTaskId: null, commandOpen: false, beltActive: null, hoveredTaskId: null })
      },

      // The hour the night ends (local). Rollover only ever moves forward, so
      // changing this never replays or skips a night's penalties twice.
      setNightEndsHour: (h) => {
        const hour = Math.min(6, Math.max(0, Math.round(Number(h) || 0)))
        nightEndsHour = hour
        set({ nightEndsHour: hour })
        get().pushToast('ALFRED', `Very good, sir. The night now ends at ${String(hour).padStart(2, '0')}:00.`, 'gold')
      },
    }),
    {
      name: STORAGE_KEY,
      // v1 = Phase 0: local night keys, Signal rules, validated saves.
      // v2 = Phase 1: cut features' keys dropped, hand-offs use real names.
      version: 2,
      // Older saves (v0) are normalised against the defaults; nothing is lost
      // except damaged cases and an in-flight focus session.
      migrate: (persisted) => normalizeState(persisted, initialData()).data,
      partialize: (st) => persistedSlice(st),
      onRehydrateStorage: () => (st) => {
        if (st && Number.isFinite(st.nightEndsHour)) nightEndsHour = st.nightEndsHour
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
  const today = todayKey()
  for (let i = 29; i >= 0; i--) {
    const key = shiftKey(today, -i)
    const d = keyToDate(key)
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
  const today = todayKey()
  for (let i = 364; i >= 0; i--) {
    const key = shiftKey(today, -i)
    const e = map.get(key)
    out.push({ date: key, points: e?.points || 0, count: e?.count || 0, arkham: e?.arkham || 0 })
  }
  return out
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
