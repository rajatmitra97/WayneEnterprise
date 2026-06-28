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
import Sidebar from './components/Sidebar'
import ContextPanel from './components/ContextPanel'
import DailyBriefing from './components/DailyBriefing'
import RogueBossFight from './components/RogueBossFight'
import UtilityBelt from './components/UtilityBelt'

const pick = (a) => a[Math.floor(Math.random() * a.length)]

export default function App() {
  const rolloverCheck = useStore((s) => s.rolloverCheck)
  const checkChrono = useStore((s) => s.checkChrono)
  const mutateOverdueTasks = useStore((s) => s.mutateOverdueTasks)
  const ensureBoss = useStore((s) => s.ensureBoss)
  const activeTab = useStore((s) => s.activeTab)
  const beltActive = useStore((s) => s.beltActive)
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

  // Weekly Rogue boss — ensure one is live for the current week.
  useEffect(() => {
    ensureBoss()
    const t = setInterval(ensureBoss, 60_000)
    return () => clearInterval(t)
  }, [ensureBoss])

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
        <DailyBriefing />
        <UtilityBelt />

        {/* The OS materialises from inside his mind as the dive completes. */}
        <motion.div
          initial={{ opacity: 0, scale: 1.12, filter: 'blur(14px)' }}
          animate={
            revealed
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, scale: 1.12, filter: 'blur(14px)' }
          }
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className={beltActive === 'batarang' ? 'cursor-crosshair' : ''}
        >
          {/* ═══ DIRECTIVE 1 — Sidebar · Main view · Right contextual panel ═══ */}
          <div className="flex">
            <Sidebar />

            <div className="min-w-0 flex-1">
              <TopBar />
              <main className="mx-auto grid max-w-[1280px] grid-cols-12 gap-4 px-4 pb-28 pt-6 md:px-8">
                {activeTab === 'mission' && (
                  <>
                    <BatPanel />
                    <CommandBar />
                    <DispatchGrid />
                    <CaseFile />
                    <SidekickRoster />
                    <BatSignal />
                  </>
                )}

                {activeTab === 'cave' && (
                  <>
                    <Sectors />
                    <Armory />
                    <BackupPanel />
                    <Metrics />
                  </>
                )}

                {activeTab === 'batcomputer' && (
                  <>
                    <Analytics />
                    <BlackgateKanban />
                    <LongHalloweenHeatmap />
                  </>
                )}

                {activeTab === 'arkham' && (
                  <>
                    <RogueBossFight />
                    <RasPanel />
                  </>
                )}
              </main>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-6 py-4 font-display text-[10px] uppercase tracking-[0.3em] text-ash-dim md:px-8">
                <span>WAYNE OS · DARK KNIGHT PROTOCOL · V7</span>
                <em className="font-serif text-[11px] normal-case italic tracking-normal text-ash">
                  “It's not who you are underneath, but what you do, that defines you.”
                </em>
                <span>MMXXVI</span>
              </footer>
            </div>

            <ContextPanel />
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  )
}
