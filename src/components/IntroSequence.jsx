/* ═══════════════════════════════════════════════════════════════════
   THE CORTICAL SYNC — "Mind of the Bat" boot sequence.
   Beats: the cowl bleeds out of Vantablack → a HUD locks on and the
   neural bridge syncs → the camera PLUNGES through the eye down a synaptic
   warp tunnel → a white impact flash → the OS blooms up from inside his mind.
   Alfred: initiating neural bridge to Master Bruce's cerebral cortex…

   ⚠ Easing note: Framer/CSS cubic-bezier X control points MUST be in [0,1].
   The earlier curve [0.6,0.01,-0.05,0.9] had a negative X (-0.05) and threw
   at runtime — that is what froze the head and stranded the black screen.
   Every ease below is range-valid.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Heavy, cinematic, non-linear — but range-valid. easeInOutQuint-ish.
const DIVE_EASE = [0.83, 0, 0.17, 1]
const EMERGE_EASE = [0.16, 1, 0.3, 1] // easeOutExpo

const SYNC_HOLD = 2100 // cowl emerge + neural sync + held breath
const DIVE_MS = 1600 // the plunge into the eye

// Transform-origin pinned to the eye line. Percentages → responsive everywhere.
const EYE_ORIGIN = '50% 38%'
const HEAD_SRC = `${import.meta.env.BASE_URL}assets/batman-head.png`

export default function IntroSequence({ onReveal, onComplete }) {
  const [phase, setPhase] = useState('sync') // 'sync' | 'dive'
  const [sync, setSync] = useState(0) // neural-bridge % readout
  const [brokenImg, setBrokenImg] = useState(false)
  const finished = useRef(false)
  const revealed = useRef(false)
  const diving = phase === 'dive'

  // Reveal the OS exactly once, the instant the dive begins.
  const triggerReveal = () => {
    if (revealed.current) return
    revealed.current = true
    onReveal?.()
  }
  // Tear the intro down exactly once.
  const finish = () => {
    if (finished.current) return
    finished.current = true
    triggerReveal()
    onComplete?.()
  }
  // OVERRIDE — click / Esc / Enter aborts straight through the portal.
  const skip = () => {
    if (finished.current) return
    if (!diving) setPhase('dive')
    triggerReveal()
    setTimeout(finish, 260)
  }

  // Neural-sync counter during the hold (0 → 100).
  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / (SYNC_HOLD - 300)) * 100))
      setSync(p)
      if (p >= 100) clearInterval(iv)
    }, 40)
    return () => clearInterval(iv)
  }, [])

  // Scheduled plunge.
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('dive')
      triggerReveal()
    }, SYNC_HOLD)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard override.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      onClick={skip}
      className="fixed inset-0 z-[9999] flex cursor-pointer select-none items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="button"
      aria-label="Skip intro"
    >
      {/* 0 · Vantablack veil — dissolves during the dive to expose the OS */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: diving ? 0 : 1 }}
        transition={{ duration: 1.1, delay: diving ? 0.45 : 0, ease: 'easeIn' }}
      />

      {/* 1 · Synaptic warp tunnel — cyan streaks rushing past as we fly in */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax]"
        style={{
          x: '-50%', y: '-50%', transformOrigin: '50% 50%',
          background:
            'repeating-conic-gradient(from 0deg at 50% 50%, rgba(214,37,22,0) 0deg 3.2deg, rgba(214,37,22,0.30) 3.2deg 4deg)',
          maskImage: 'radial-gradient(circle, transparent 8%, #000 60%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 8%, #000 60%)',
        }}
        initial={{ scale: 0.25, opacity: 0, rotate: 0 }}
        animate={diving ? { scale: 7, opacity: [0, 0.85, 0], rotate: 26 } : { scale: 0.25, opacity: 0 }}
        transition={{ duration: DIVE_MS / 1000, ease: DIVE_EASE }}
      />

      {/* 2 · The cowl — emerges, breathes, then the camera PLUNGES into the eye */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        style={{ transformOrigin: EYE_ORIGIN, willChange: 'transform, opacity, filter' }}
        initial={{ scale: 0.84, opacity: 0, filter: 'blur(18px)' }}
        animate={
          diving
            ? { scale: 70, opacity: 0, filter: 'blur(3px)' }
            : { scale: 1.06, opacity: 1, filter: 'blur(0px)' }
        }
        transition={
          diving
            ? { duration: DIVE_MS / 1000, ease: DIVE_EASE }
            : { duration: (SYNC_HOLD - 100) / 1000, ease: EMERGE_EASE }
        }
        onAnimationComplete={() => diving && finish()}
      >
        {/* living glow behind the cowl */}
        <motion.div
          className="pointer-events-none absolute h-[55vh] w-[55vh] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(214,37,22,0.18), transparent 65%)' }}
          animate={{ opacity: diving ? [0.6, 1] : [0.35, 0.7, 0.35], scale: diving ? 1.5 : [1, 1.06, 1] }}
          transition={{ duration: diving ? DIVE_MS / 1000 : 3, repeat: diving ? 0 : Infinity, ease: 'easeInOut' }}
        />
        {brokenImg ? (
          <FallbackCowl />
        ) : (
          <img
            src={HEAD_SRC}
            alt=""
            draggable={false}
            onError={() => setBrokenImg(true)}
            className="relative max-h-[84vh] max-w-[90vw] object-contain"
            style={{ filter: 'drop-shadow(0 0 70px rgba(0,0,0,0.95)) drop-shadow(0 0 24px rgba(214,37,22,0.25))' }}
          />
        )}
      </motion.div>

      {/* 3 · HUD reticle + neural-sync readout — fades as the dive starts */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        animate={{ opacity: diving ? 0 : 1 }}
        transition={{ duration: diving ? 0.3 : 1, delay: diving ? 0 : 0.4 }}
      >
        <Reticle />
        <div className="mt-[16vh] text-center">
          <div className="font-display text-[13px] tracking-[0.5em] text-hud">
            NEURAL BRIDGE · {String(sync).padStart(3, '0')}%
          </div>
          <SyncBar pct={sync} />
        </div>
      </motion.div>

      {/* 4 · Impact flash at the apex of the plunge */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={diving ? { opacity: [0, 0, 0.92, 0] } : { opacity: 0 }}
        transition={{ duration: DIVE_MS / 1000, ease: 'easeIn', times: [0, 0.62, 0.82, 1] }}
      />

      {/* 5 · CRT scanlines + flicker */}
      <div className="batpanel-scanlines pointer-events-none absolute inset-0 opacity-40" />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-hud/[0.025]"
        animate={{ opacity: [0.2, 0.6, 0.25, 0.7, 0.3] }}
        transition={{ duration: 0.45, repeat: Infinity }}
      />

      {/* 6 · Override hint */}
      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        animate={{ opacity: diving ? 0 : 1 }}
        transition={{ duration: diving ? 0.25 : 1, delay: diving ? 0 : 1 }}
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-ash">CLICK · ESC · ENTER TO OVERRIDE</div>
      </motion.div>
    </motion.div>
  )
}

function SyncBar({ pct }) {
  return (
    <div className="mx-auto mt-2 h-[2px] w-[220px] overflow-hidden bg-hud/15">
      <div className="h-full bg-hud transition-[width] duration-100" style={{ width: `${pct}%`, boxShadow: '0 0 8px #D62516' }} />
    </div>
  )
}

/* Targeting overlay — brackets + a slow scanning ring on the cortex. */
function Reticle() {
  return (
    <motion.svg
      width="340" height="340" viewBox="0 0 340 340" fill="none"
      initial={{ scale: 1.25, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{ filter: 'drop-shadow(0 0 8px rgba(214,37,22,0.5))', marginTop: '-6vh' }}
    >
      {['M48 92 V48 H92', 'M292 92 V48 H248', 'M48 248 V292 H92', 'M292 248 V292 H248'].map((d, i) => (
        <path key={i} d={d} stroke="#D62516" strokeWidth="2" />
      ))}
      <line x1="170" y1="104" x2="170" y2="138" stroke="#D62516" strokeWidth="1.5" />
      <line x1="170" y1="202" x2="170" y2="236" stroke="#D62516" strokeWidth="1.5" />
      <line x1="104" y1="170" x2="138" y2="170" stroke="#D62516" strokeWidth="1.5" />
      <line x1="202" y1="170" x2="236" y2="170" stroke="#D62516" strokeWidth="1.5" />
      <motion.circle
        cx="170" cy="170" r="76" stroke="#D62516" strokeWidth="1" strokeDasharray="5 9"
        animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '170px 170px' }}
      />
      <text x="170" y="324" textAnchor="middle" fill="#D62516" fontSize="11" fontFamily="Chakra Petch, monospace" letterSpacing="3">
        TARGET LOCKED · CEREBRAL CORTEX
      </text>
    </motion.svg>
  )
}

/* Vector cowl fallback if /assets/batman-head.png isn't installed yet. */
function FallbackCowl() {
  return (
    <svg viewBox="0 0 200 200" className="relative h-[62vh] w-auto" style={{ filter: 'drop-shadow(0 0 50px rgba(214,37,22,0.3))' }}>
      <path
        d="M40 70c0-28 24-46 60-46s60 18 60 46c0 10-2 16-2 24 6 8 10 18 10 30 0 26-30 48-68 48s-68-22-68-48c0-12 4-22 10-30 0-8-2-14-2-24z"
        fill="#0b0b11" stroke="#1d1d2a" strokeWidth="2"
      />
      <path d="M52 40 L66 8 L80 44 Z" fill="#0b0b11" stroke="#1d1d2a" strokeWidth="2" />
      <path d="M148 40 L134 8 L120 44 Z" fill="#0b0b11" stroke="#1d1d2a" strokeWidth="2" />
      <path d="M70 96 l26 -6 0 14 -26 4 z" fill="#D62516" />
      <path d="M130 96 l-26 -6 0 14 26 4 z" fill="#D62516" />
    </svg>
  )
}
