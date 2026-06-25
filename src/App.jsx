import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useStore, selectActiveMutations } from './store'
import { ALFRED, BROODING_IDLE_MS, SCARECROW_INTERVAL_MS } from './constants'
import IntroSequence from './components/IntroSequence'
import TopBar from './components/TopBar'
import BatPanel from './components/BatPanel'
import BroodingOverlay from './components/BroodingOverlay'
import CommandBar from './components/CommandBar'
import Sectors from './components/Sectors'
import CaseFile from './components/CaseFile'
import BatSignal from './components/BatSignal'
import RasPanel from './components/RasPanel'
import Analytics from './components/Analytics'
import Metrics from './components/Metrics'
import BackupPanel from './components/BackupPanel'
import AlfredToaster from './components/AlfredToaster'
import DetectiveVision from './components/DetectiveVision'
import LazarusPit from './components/LazarusPit'
import Armory from './components/Armory'
import FlyingGadget from './components/FlyingGadget'
import CommandConsole from './components/CommandConsole'
import Wiretap from './components/Wiretap'
import BlackgateKanban from './components/BlackgateKanban'
import LongHalloweenHeatmap from './components/LongHalloweenHeatmap'
import DispatchGrid from './components/DispatchGrid'
import SidekickRoster from './components/SidekickRoster'

const pick = (a) => a[Math.floor(Math.random() * a.length)]

export default function App() {
  const rolloverCheck = useStore((s) => s.rolloverCheck)
  const checkChrono = useStore((s) => s.checkChrono)
  const mutateOverdueTasks = useStore((s) => s.mutateOverdueTasks)
  const pushToast = useStore((s) => s.pushToast)
  const lastFearToxin = useStore((s) => s.lastFearToxin)
  const tasks = useStore((s) => s.tasks)
  const openCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks])
  const mode = useStore((s) => s.mode)

  // ── ARKHAM MUTATION debuffs active on the board ──
  const mutations = useMemo(() => selectActiveMutations(tasks), [tasks])
  const freezeActive = mutations.has('freeze')
  const scareActive = mutations.has('scarecrow')

  const [toxin, setToxin] = useState(false)
  const [brooding, setBrooding] = useState(false)
  const [scareNow, setScareNow] = useState(false)
  // Cortical Sync intro: `introDone` unmounts the overlay; `revealed` portals
  // the dashboard up from the darkness in lockstep with the dive.
  const [introDone, setIntroDone] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const fearRef = useRef(lastFearToxin)
  const idleRef = useRef(Date.now())
  const broodRef = useRef(Date.now())

  // Resolve any focus session left dangling by a reload/close.
  // Survived the clock → reward; interrupted → it counts as breaking focus.
  useEffect(() => {
    const { focus, completeFocus, breakFocus } = useStore.getState()
    if (focus) {
      if (Date.now() >= focus.endsAt) completeFocus()
      else breakFocus()
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Failsafe — never leave the OS stranded behind the intro. If the Cortical
  // Sync hasn't revealed within 6s (animation error, reduced-motion, etc.),
  // force the portal open.
  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed(true)
      setIntroDone(true)
    }, 6000)
    return () => clearTimeout(t)
  }, [])

  // Midnight rollover — fail overdue cases, re-arm patrol routes, and run the
  // Arkham Mutation Protocol on anything left to rot past 24h.
  useEffect(() => {
    rolloverCheck()
    mutateOverdueTasks()
    const t = setInterval(() => {
      rolloverCheck()
      mutateOverdueTasks()
    }, 60_000)
    return () => clearInterval(t)
  }, [rolloverCheck, mutateOverdueTasks])

  // Scarecrow debuff — fear-toxin jump-scares on a 2-minute cadence while any
  // Scarecrow mutation is loose.
  useEffect(() => {
    if (!scareActive) return
    const t = setInterval(() => {
      setScareNow(true)
      setTimeout(() => setScareNow(false), 750)
    }, SCARECROW_INTERVAL_MS)
    return () => clearInterval(t)
  }, [scareActive])

  // Chrono-Notifications — poll the Dispatch Grid for opening patrol slots.
  useEffect(() => {
    checkChrono()
    const t = setInterval(checkChrono, 20_000)
    return () => clearInterval(t)
  }, [checkChrono])

  // Fear-toxin screen flash whenever a penalty fires.
  useEffect(() => {
    if (lastFearToxin && lastFearToxin !== fearRef.current) {
      fearRef.current = lastFearToxin
      setToxin(true)
      const t = setTimeout(() => setToxin(false), 1200)
      return () => clearTimeout(t)
    }
  }, [lastFearToxin])

  // Alfred idle nudges — every few minutes of inactivity, if work is pending.
  useEffect(() => {
    const reset = () => (idleRef.current = Date.now())
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    const t = setInterval(() => {
      if (Date.now() - idleRef.current > 5 * 60_000 && openCount > 0) {
        pushToast('ALFRED', pick(ALFRED.idle), 'gold')
        idleRef.current = Date.now()
      }
    }, 60_000)
    return () => {
      clearInterval(t)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [openCount, pushToast])

  // Brooding Mode — after 3 minutes idle, the OS broods. Any activity exits.
  useEffect(() => {
    const activity = () => {
      broodRef.current = Date.now()
      setBrooding((b) => (b ? false : b))
    }
    window.addEventListener('pointermove', activity)
    window.addEventListener('pointerdown', activity)
    window.addEventListener('keydown', activity)
    const t = setInterval(() => {
      if (Date.now() - broodRef.current > BROODING_IDLE_MS) setBrooding(true)
    }, 5_000)
    return () => {
      clearInterval(t)
      window.removeEventListener('pointermove', activity)
      window.removeEventListener('pointerdown', activity)
      window.removeEventListener('keydown', activity)
    }
  }, [])

  return (
    // Mr. Freeze cryo-field — slow Framer's default transition app-wide (3×).
    <MotionConfig transition={freezeActive ? { duration: 3, ease: 'easeInOut' } : undefined}>
      <div
        className={`app-root mode-${mode} ${toxin ? 'animate-fear-toxin' : ''} ${
          freezeActive ? 'debuff-freeze' : ''
        } ${scareNow ? 'debuff-scare' : ''}`}
      >
        {/* THE CORTICAL SYNC — plays over a hidden dashboard, then dissolves */}
        <AnimatePresence>
          {!introDone && (
            <IntroSequence onReveal={() => setRevealed(true)} onComplete={() => setIntroDone(true)} />
          )}
        </AnimatePresence>

        <AlfredToaster />
        <CommandConsole />
        <Wiretap />
        <FlyingGadget />
        <DetectiveVision />
        <BroodingOverlay active={brooding} onExit={() => setBrooding(false)} />
        <LazarusPit />

        {/* The OS materialises from inside his mind as the dive completes. */}
        <motion.div
          initial={{ opacity: 0, scale: 1.12, filter: 'blur(14px)' }}
          animate={
            revealed
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, scale: 1.12, filter: 'blur(14px)' }
          }
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <TopBar />

          {/* ═══ DIRECTIVE 4 — strict vertical hierarchy ═══ */}
          <main className="mx-auto grid max-w-[1480px] grid-cols-12 gap-4 px-4 pb-24 pt-6 md:px-9">
            {/* 1 · TOP — the unified Protagonist / Bat Image panel */}
            <BatPanel />
            {/* 2 · UPPER-MIDDLE — the Add Task / Command Console */}
            <CommandBar />
            {/* 3 · LOWER-MIDDLE — the Weekly Routine / Dispatch Grid */}
            <DispatchGrid />
            {/* 4 · BOTTOM GRID — backlog, network, analytics, armory, telemetry */}
            <CaseFile />
            <SidekickRoster />
            <Sectors />
            <BatSignal />
            <RasPanel />
            <Analytics />
            <BlackgateKanban />
            <LongHalloweenHeatmap />
            <Armory />
            <BackupPanel />
            <Metrics />
          </main>

          <footer className="flex items-center justify-between border-t border-rule px-6 py-4 font-display text-[10px] uppercase tracking-[0.3em] text-ash-dim md:px-9">
            <span>WAYNE OS · THE DARK KNIGHT PROTOCOL · V6</span>
            <em className="font-serif text-[11px] normal-case italic tracking-normal text-ash">
              “It's not who you are underneath, but what you do, that defines you.”
            </em>
            <span>MMXXVI</span>
          </footer>
        </motion.div>
      </div>
    </MotionConfig>
  )
}
