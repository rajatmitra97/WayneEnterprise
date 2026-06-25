/* ═══════════════════════════════════════════════════════════════════
   THE DRONE — a Wayne Tech recon drone that periodically swoops in,
   hovers, and delivers a tactical reminder or a shot of motivation,
   then peels off. Click it to dismiss early; click "more" to cycle.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore, sortByThreat } from '../store'
import { THREAT } from '../constants'

const MOTIVATION = [
  'The night is long. Spend it building, not waiting.',
  'Discipline is the suit you never take off.',
  'Somewhere in Gotham, your future self is counting on this.',
  'You are one completed objective from momentum. Move.',
  'Fear is a tool. Use it on your excuses.',
  'The mission does not require you to feel ready.',
]
const APPEAR_EVERY = 80_000 // ~80s cadence
const DWELL = 9_000

export default function FlyingGadget() {
  const tasks = useStore((s) => s.tasks)
  const signal = useStore((s) => s.signal)
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState({ tag: 'WAYNE TECH', text: '' })

  const composeMessage = useCallback(() => {
    const open = tasks.filter((t) => !t.done)
    const signalTask = signal ? open.find((t) => t.id === signal.taskId) : null
    const arkham = sortByThreat(open).find((t) => t.threat === 'ARKHAM')
    if (signalTask) return { tag: 'BAT-SIGNAL', text: `Priority target still live: “${signalTask.title}” — 3× payoff awaits.` }
    if (arkham) return { tag: 'THREAT ALERT', text: `An Arkham-level case is loose: “${arkham.title}”. Neutralise it.` }
    if (open.length > 0) {
      const t = open[Math.floor(Math.random() * open.length)]
      return { tag: 'REMINDER', text: `Outstanding objective: “${t.title}” (${THREAT[t.threat].tag}).` }
    }
    return { tag: 'MOTIVATION', text: MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)] }
  }, [tasks, signal])

  const summon = useCallback(() => {
    setMsg(composeMessage())
    setVisible(true)
  }, [composeMessage])

  useEffect(() => {
    const first = setTimeout(summon, 22_000) // first sortie
    const iv = setInterval(summon, APPEAR_EVERY)
    return () => {
      clearTimeout(first)
      clearInterval(iv)
    }
  }, [summon])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), DWELL)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <div className="pointer-events-none fixed right-0 top-24 z-[6400] w-full max-w-[460px] md:right-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="drone"
            initial={{ x: 520, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 560, opacity: 0, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
            className="pointer-events-auto flex items-center justify-end gap-3 pr-2"
          >
            {/* message bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass hud-corners relative max-w-[340px] px-4 py-3"
              style={{ borderColor: 'rgba(214,37,22,0.45)' }}
            >
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="font-display text-[11px] font-semibold tracking-[0.28em] text-hud">
                  {msg.tag}
                </span>
                <button onClick={() => setVisible(false)} className="text-ash transition hover:text-bone">
                  <X size={13} />
                </button>
              </div>
              <p className="font-mono text-[12.5px] leading-snug text-bone">{msg.text}</p>
              <button
                onClick={() => setMsg(composeMessage())}
                className="mt-2 font-display text-[10px] tracking-[0.2em] text-ash transition hover:text-hud"
              >
                ▸ ANOTHER
              </button>
            </motion.div>

            {/* the drone itself — bobbing */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="shrink-0 drop-shadow-[0_0_12px_rgba(214,37,22,0.5)]"
            >
              <Drone />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Drone() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none">
      {/* wings */}
      <path
        d="M32 14c-5-7-14-10-24-8 5 3 7 6 7 11-7-2-13 1-14 6 9-1 14 2 18 7 3-5 8-7 13-7s10 2 13 7c4-5 9-8 18-7-1-5-7-8-14-6 0-5 2-8 7-11-10-2-19 1-24 8z"
        fill="#11141c"
        stroke="#D62516"
        strokeWidth="1"
      />
      {/* core */}
      <circle cx="32" cy="17" r="4" fill="#0a0d14" stroke="#D62516" strokeWidth="1" />
      <motion.circle
        cx="32" cy="17" r="1.6" fill="#D62516"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      {/* rotor blinks */}
      <motion.circle cx="9" cy="17" r="1.4" fill="#D62516" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <motion.circle cx="55" cy="17" r="1.4" fill="#D62516" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
    </svg>
  )
}
