/* Detective Vision — the world fades out. A 90-minute flow-state crucible.
   Tab away or abort early → focus breaks → Joker Chaos penalty.
   Survive the full session → bounty, and the task is neutralised. */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useStore } from '../store'
import { startAmbience, stopAmbience } from '../lib/ambientAudio'

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function DetectiveVision() {
  const focus = useStore((s) => s.focus)
  const task = useStore((s) => (focus ? s.tasks.find((t) => t.id === focus.taskId) : null))
  const completeFocus = useStore((s) => s.completeFocus)
  const breakFocus = useStore((s) => s.breakFocus)

  const [remaining, setRemaining] = useState(focus ? focus.endsAt - Date.now() : 0)
  const [confirming, setConfirming] = useState(false)
  const endedRef = useRef(false)

  const active = !!focus

  // ambience lifecycle
  useEffect(() => {
    if (!active) return
    endedRef.current = false
    startAmbience()
    return () => stopAmbience()
  }, [active])

  // countdown + completion
  useEffect(() => {
    if (!active) return
    const tick = () => {
      const left = focus.endsAt - Date.now()
      setRemaining(left)
      if (left <= 0 && !endedRef.current) {
        endedRef.current = true
        completeFocus()
      }
    }
    tick()
    const t = setInterval(tick, 250)
    return () => clearInterval(t)
  }, [active, focus, completeFocus])

  // Page Visibility — leaving the tab breaks focus ONLY under Arkham (strict)
  // rules. Oracle (background) mode lets the timer run while you work elsewhere.
  useEffect(() => {
    if (!active || !focus?.strict) return
    const onHide = () => {
      if (document.hidden && !endedRef.current) {
        endedRef.current = true
        breakFocus()
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [active, focus, breakFocus])

  const abort = () => {
    if (endedRef.current) return
    endedRef.current = true
    breakFocus()
  }

  const total = focus ? focus.duration : 1
  const pct = focus ? Math.min(100, Math.max(0, ((total - remaining) / total) * 100)) : 0

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[8000] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: 'rgba(2,4,8,0.94)', backdropFilter: 'blur(8px)' }}
        >
          {/* sonar pulses */}
          <div className="pointer-events-none absolute inset-0">
            <span className="sonar" />
            <span className="sonar" style={{ animationDelay: '1s' }} />
            <span className="sonar" style={{ animationDelay: '2s' }} />
          </div>
          <div className="dv-rain" />

          {/* HUD */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 22 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="mb-4 flex items-center gap-2 font-display text-[12px] tracking-[0.4em]" style={{ color: '#5aaae6' }}>
              <Eye size={16} /> DETECTIVE VISION ENGAGED
            </div>

            <div
              className="font-display tabular-nums leading-none"
              style={{ fontSize: 'clamp(72px,16vw,150px)', color: '#cfeaff', textShadow: '0 0 40px rgba(90,170,230,0.6)' }}
            >
              {fmt(remaining)}
            </div>

            <div className="mt-6 h-[3px] w-[min(420px,80vw)] overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg,#5aaae6,#cfeaff)' }}
                animate={{ width: `${pct}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="mt-8 max-w-md px-4 text-center">
              <div className="font-display text-[10px] tracking-[0.3em] text-ash">THE CASE</div>
              <div className="mt-1 font-serif text-[20px] italic" style={{ color: '#9fd2f2' }}>
                {task ? task.title : 'the work itself'}
              </div>
            </div>

            <div className="mt-12 h-10">
              {!confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="font-display text-[11px] tracking-[0.3em] text-ash transition hover:text-blood"
                >
                  ▸ BREAK FOCUS
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-serif text-[13px] italic text-blood">Abort? The Joker is watching.</span>
                  <button onClick={abort} className="bg-blood px-3 py-1.5 font-display text-[11px] tracking-[0.2em] text-bone">
                    ABANDON
                  </button>
                  <button onClick={() => setConfirming(false)} className="font-display text-[11px] tracking-[0.2em] text-ash hover:text-bone">
                    STAY
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
