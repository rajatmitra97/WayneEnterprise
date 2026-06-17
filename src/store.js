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
} from './constants'

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

      /* ───────────────────────── TASKS ───────────────────────── */
      addTask: ({ title, sector, threat, recur = RECUR.NONE, days = [], signal = false }) => {
        // WEEKLY anchors to today's weekday unless explicit days supplied.
        const resolvedDays =
          recur === RECUR.WEEKLY && (!days || days.length === 0)
            ? [new Date().getDay()]
            : days
        const t = {
          id: uid(),
          title: title.trim(),
          sector,
          threat,
          recur,
          days: resolvedDays,
          createdAt: Date.now(),
          createdDate: todayKey(),
          done: false,
        }
        set((st) => ({ tasks: [t, ...st.tasks] }))
        if (signal) get().setSignal(t.id)
        if (threat === 'ARKHAM') get().pushToast('ALFRED', pick(ALFRED.arkham), 'blood')
        return t.id
      },

      updateTask: (id, patch) =>
        set((st) => ({
          tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((st) => ({
          tasks: st.tasks.filter((t) => t.id !== id),
          signal: st.signal?.taskId === id ? null : st.signal,
        })),

      setSignal: (taskId) => set({ signal: { taskId, date: todayKey() } }),

      // Complete a task → award XP+coins, log history, roll Joker chaos.
      completeTask: (id) => {
        const st = get()
        const t = st.tasks.find((x) => x.id === id)
        if (!t || t.done) return
        const meta = THREAT[t.threat]
        const isSignal = st.signal?.taskId === id
        const mult = isSignal ? 3 : 1

        let gainedXp = meta.xp * mult
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
        if (day) {
          day.points += gainedXp
          day.count = (day.count || 0) + 1
        } else {
          log.push({ date: todayKey(), points: gainedXp, count: 1 })
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
        unlocked.forEach((u) => get().pushToast('UPGRADE ACQUIRED', u, 'gold'))
        if (chaos) get().pushToast('ALFRED', pick(ALFRED.chaos), 'chaos')
        else get().pushToast('ALFRED', pick(ALFRED.done), 'gold')

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
            { ...t, id: uid(), srcId: t.id, failed: true, closedAt: Date.now(), closedDate: todayKey() },
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
            }
            survivors.push({ ...t, done: armed ? false : t.done, armed })
          } else if (!t.done && t.createdDate < today) {
            // one-off & overdue → FAIL, full penalty (the punitive system)
            const meta = THREAT[t.threat]
            const drained = applyXp(workingSectors, t.sector, -meta.penalty)
            workingSectors = drained.sector
            failed += 1
          } else if (!t.done) {
            survivors.push(t)
          }
        })

        set({
          tasks: survivors,
          sectors: workingSectors,
          lastSeen: today,
          failedCount: st.failedCount + failed,
          streak: failed > 0 ? 0 : st.streak,
          lastFearToxin: failed > 0 ? Date.now() : st.lastFearToxin,
        })

        if (failed > 0) get().pushToast('ALFRED', pick(ALFRED.fail), 'blood')
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
          _streakToday: false,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (st) => {
        // never persist transient UI noise
        const { toasts, ...rest } = st
        void toasts
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

// Threat-aware sort: Arkham first, then by creation recency.
export function sortByThreat(tasks) {
  return [...tasks].sort((a, b) => {
    const d = THREAT[b.threat].rank - THREAT[a.threat].rank
    if (d !== 0) return d
    return b.createdAt - a.createdAt
  })
}
