/* ═══════════════════════════════════════════════════════════════════
   THE ARKHAM CELL — stress-relief interrogation minigame (Directive 10).
   Click a captured Rogue rapidly. Each hit: a thud, a screen shake, a red
   impact frame, a humorous yelp. After 10 hits they break and cough up a
   hidden Wayne OS tip. PNG states: okay → hurt → plastered (vector fallback).
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { CELL_VILLAINS, CELL_BREAK_CLICKS, CELL_TAUNTS, CELL_TIPS } from '../constants'
import Panel from './Panel'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// a short, heavy thud (Web Audio, gesture-triggered by the click)
function thud() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)()
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(160, ac.currentTime)
    o.frequency.exponentialRampToValueAtTime(45, ac.currentTime + 0.18)
    g.gain.setValueAtTime(0.6, ac.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25)
    o.connect(g).connect(ac.destination)
    o.start(); o.stop(ac.currentTime + 0.26)
    setTimeout(() => { try { ac.close() } catch (e) { /* closed */ } }, 400)
  } catch (e) {
    /* audio unavailable */
  }
}

function VillainArt({ villain, stage, broken }) {
  const [broke, setBroke] = useState(false)
  const src = asset(villain.states[stage])
  if (broke) {
    return (
      <div className="flex h-56 w-56 items-center justify-center rounded-full border-2" style={{ borderColor: villain.color, background: `${villain.color}1a` }}>
        <span className="font-display text-[64px]" style={{ color: villain.color, filter: broken ? 'grayscale(0.4)' : 'none' }}>
          {broken ? '☉_☉' : stage === 'hurt' ? '>_<' : '◣◢'}
        </span>
      </div>
    )
  }
  return <img src={src} alt={villain.name} onError={() => setBroke(true)} className="pointer-events-none h-56 w-auto object-contain drop-shadow-2xl" />
}

export default function ArkhamCell() {
  const [vIndex, setVIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [taunt, setTaunt] = useState('')
  const [tip, setTip] = useState(null)
  const [impact, setImpact] = useState(false)
  const controls = useAnimationControls()
  const villain = CELL_VILLAINS[vIndex]
  const broken = hits >= CELL_BREAK_CLICKS
  const stage = broken ? 'plastered' : hits >= 4 ? 'hurt' : 'okay'

  const strike = () => {
    if (broken) return
    const next = hits + 1
    setHits(next)
    thud()
    setImpact(true); setTimeout(() => setImpact(false), 120)
    controls.start({ x: [-6, 6, -5, 4, 0], y: [3, -3, 2, 0] }, { duration: 0.28 })
    if (next >= CELL_BREAK_CLICKS) {
      setTaunt('')
      setTip(pick(CELL_TIPS))
    } else {
      setTaunt(pick(CELL_TAUNTS))
    }
  }

  const reset = () => {
    setHits(0); setTaunt(''); setTip(null)
    setVIndex((i) => (i + 1) % CELL_VILLAINS.length)
  }

  return (
    <Panel
      label="The Cell" title="Interrogation" instruction="STRESS RELIEF: HIT FOR INTEL"
      right={`${hits}/${CELL_BREAK_CLICKS}`}
      className="col-span-12 lg:col-span-6" accent={villain.color}
    >
      <motion.div
        animate={controls}
        className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden rounded-lg border border-rule"
        style={{ background: `radial-gradient(ellipse at 50% 10%, ${villain.color}18, #0c0303 70%)` }}
      >
        {/* red impact frame */}
        <AnimatePresence>
          {impact && <motion.div className="pointer-events-none absolute inset-0 z-20" initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} style={{ background: 'rgba(214,37,22,0.4)', mixBlendMode: 'screen' }} />}
        </AnimatePresence>

        {/* overhead spotlight */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -5%, rgba(255,255,255,0.1), transparent 45%)' }} />

        <div className="absolute left-4 top-3">
          <div className="font-display text-[10px] tracking-[0.3em] text-ash">DETAINEE</div>
          <div className="font-display text-[20px] font-bold" style={{ color: villain.color }}>{villain.name}</div>
        </div>

        {/* speech bubble */}
        <AnimatePresence mode="wait">
          {(taunt || tip) && (
            <motion.div
              key={tip || taunt}
              initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
              className="relative z-10 mb-3 max-w-sm rounded-xl border bg-void/90 px-4 py-2.5 text-center"
              style={{ borderColor: tip ? '#39ff14' : villain.color }}
            >
              <span className={`font-serif text-[15px] italic ${tip ? 'text-acid' : 'text-bone'}`}>{tip || taunt}</span>
              {tip && <div className="mt-1 font-display text-[9px] tracking-[0.3em] text-acid">▸ HE BROKE</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* the rogue — click target */}
        <motion.button
          onClick={strike}
          whileTap={{ scale: 0.92 }}
          disabled={broken}
          className={`relative z-10 ${broken ? 'cursor-default' : 'cursor-pointer'}`}
          title={broken ? 'He talked.' : 'Interrogate'}
        >
          <VillainArt villain={villain} stage={stage} broken={broken} />
        </motion.button>

        <div className="relative z-10 mt-4 font-mono text-[11px] tracking-[0.1em] text-ash">
          {broken ? 'He sang like a canary.' : 'CLICK TO INTERROGATE'}
        </div>
      </motion.div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11px] italic text-ash-dim">No Rogues were permanently harmed. Probably.</span>
        <button onClick={reset} className="flex items-center gap-1.5 border border-rule px-3 py-1.5 font-display text-[11px] tracking-[0.12em] text-bone-dim transition hover:text-bone">
          <RotateCcw className="h-4 w-4" /> NEXT DETAINEE
        </button>
      </div>
    </Panel>
  )
}
