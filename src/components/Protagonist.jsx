import { motion } from 'framer-motion'
import { useStore, selectCompositeLevel } from '../store'
import { STAGES, SECTOR_ORDER, LEVELS_PER_SECTOR } from '../constants'
import Panel from './Panel'

function currentStage(total) {
  let cur = STAGES[0]
  for (const s of STAGES) if (total >= s.at) cur = s
  return cur
}

// The emblem sharpens (opacity + glow) as the user becomes Batman.
export default function Protagonist() {
  const sectors = useStore((s) => s.sectors)
  const total = selectCompositeLevel({ sectors })
  const max = SECTOR_ORDER.length * LEVELS_PER_SECTOR
  const pct = total / max
  const stage = currentStage(total)
  const glow = 6 + pct * 40

  return (
    <Panel
      label="I · The Protagonist"
      title={<>The <em className="not-italic font-light text-bone-dim">Protagonist</em></>}
      right={`LVL ${total}`}
      className="col-span-12 min-h-[520px] lg:col-span-4"
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded border border-ash-dim/60 bg-gradient-to-b from-void-card to-void">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 60%, rgba(201,162,78,${0.04 + pct * 0.18}), transparent 65%)`,
          }}
        />
        {/* Bat emblem — vector placeholder for the pixel-art engine */}
        <motion.svg
          viewBox="0 0 200 110"
          className="w-3/4"
          initial={false}
          animate={{ filter: `drop-shadow(0 0 ${glow}px rgba(201,162,78,${0.3 + pct * 0.5}))` }}
          transition={{ duration: 1.2 }}
        >
          <path
            d="M100 18c-6 0-9 6-10 12-8-10-22-16-36-14 6 6 8 12 7 20-10-4-22-2-30 6 12 0 18 6 20 14 4 14 22 26 49 26s45-12 49-26c2-8 8-14 20-14-8-8-20-10-30-6-1-8 1-14 7-20-14-2-28 4-36 14-1-6-4-12-10-12z"
            fill="#e6e0d0"
            opacity={0.28 + pct * 0.72}
          />
        </motion.svg>
      </div>

      <div className="mt-4 text-center">
        <div className="font-serif text-[24px] italic text-bone">{stage.codename}</div>
        <div className="mt-0.5 font-display text-[11px] uppercase tracking-[0.35em] text-gold">
          BRUCE THOMAS WAYNE
        </div>
        <div className="mt-1.5 font-mono text-[11px] italic text-ash">— {stage.stage} —</div>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-rule">
        <motion.div
          className="h-full bg-gold"
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        />
      </div>
    </Panel>
  )
}
