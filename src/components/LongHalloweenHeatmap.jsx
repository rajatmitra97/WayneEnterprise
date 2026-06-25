/* ═══════════════════════════════════════════════════════════════════
   THE LONG HALLOWEEN — a 365-night discipline heatmap.
   Empty=black · low=dark blue · high=bright cyan · Arkham night=crimson.
   Break a 7-night streak and Two-Face's coin decides your fate:
   the clean half forgives, the scarred half robs you blind.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, build365Series } from '../store'
import { HEATMAP_LEVELS, HEATMAP_ARKHAM } from '../constants'
import Panel from './Panel'

function colorFor(cell) {
  if (cell.arkham > 0) return HEATMAP_ARKHAM
  let c = HEATMAP_LEVELS[0].color
  for (const lvl of HEATMAP_LEVELS) if (cell.points >= lvl.min) c = lvl.color
  return c
}

// chunk 365 days into weeks (columns of 7), GitHub-style
function toWeeks(series) {
  const weeks = []
  for (let i = 0; i < series.length; i += 7) weeks.push(series.slice(i, i + 7))
  return weeks
}

export default function LongHalloweenHeatmap() {
  const log = useStore((s) => s.completionLog)
  const pendingTwoFace = useStore((s) => s.pendingTwoFace)
  const series = useMemo(() => build365Series(log), [log])
  const weeks = useMemo(() => toWeeks(series), [series])

  const activeDays = series.filter((d) => d.count > 0).length
  const arkhamNights = series.filter((d) => d.arkham > 0).length
  const [hover, setHover] = useState(null)

  // keep the coin overlay mounted through resolution + result, independent of
  // the store flag (which the toss clears immediately).
  const [coin, setCoin] = useState(false)
  useEffect(() => {
    if (pendingTwoFace) setCoin(true)
  }, [pendingTwoFace])

  return (
    <Panel
      label="XVII · The Long Halloween"
      title="The Long Halloween"
      right={`${activeDays} ACTIVE · ${arkhamNights} ARKHAM`}
      className="col-span-12"
      accent="#D62516"
    >
      <div className="relative overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  className="h-[11px] w-[11px] rounded-[2px] transition-transform hover:scale-150"
                  style={{
                    background: colorFor(cell),
                    boxShadow: cell.arkham > 0 ? `0 0 6px ${HEATMAP_ARKHAM}` : cell.points >= 90 ? '0 0 5px #D62516' : 'none',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="font-mono text-[11px] text-ash">
          {hover ? (
            <span>
              <span className="text-bone">{hover.date}</span> — {hover.points} XP · {hover.count} cases
              {hover.arkham > 0 && <span className="text-blood"> · ARKHAM NIGHT</span>}
            </span>
          ) : (
            'A year of nights. Each square is one.'
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[9px] tracking-[0.2em] text-ash">LESS</span>
          {HEATMAP_LEVELS.map((l) => (
            <span key={l.min} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: l.color }} />
          ))}
          <span className="h-[10px] w-[10px] rounded-[2px]" style={{ background: HEATMAP_ARKHAM, boxShadow: `0 0 5px ${HEATMAP_ARKHAM}` }} />
          <span className="font-display text-[9px] tracking-[0.2em] text-ash">MORE</span>
        </div>
      </div>

      <AnimatePresence>{coin && <TwoFaceCoin onClose={() => setCoin(false)} />}</AnimatePresence>
    </Panel>
  )
}

function TwoFaceCoin({ onClose }) {
  const resolve = useStore((s) => s.resolveTwoFace)
  const [flipping, setFlipping] = useState(false)
  const [face, setFace] = useState(null) // 'clean' | 'scarred'

  const flip = () => {
    if (flipping) return
    setFlipping(true)
    setTimeout(() => {
      const clean = resolve() // store decides + applies consequence
      setFace(clean ? 'clean' : 'scarred')
      setFlipping(false)
    }, 1600)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9200] flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-void/88 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="mb-2 font-display text-[13px] font-semibold tracking-[0.4em] text-chaos">TWO-FACE</div>
        <p className="mb-6 max-w-sm text-center font-serif text-[17px] italic text-bone">
          A seven-night streak, shattered. “You make your own luck,” Harvey said. Now the coin will judge you.
        </p>

        {/* the coin */}
        <motion.button
          onClick={flip}
          disabled={!!face}
          animate={flipping ? { rotateY: [0, 1800], scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="relative h-32 w-32 rounded-full"
          style={{ transformStyle: 'preserve-3d', perspective: 800 }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full border-2 font-display text-[40px]"
            style={{
              background: face === 'scarred'
                ? 'radial-gradient(circle at 40% 35%, #5a5a5a, #1a1a1a)'
                : 'radial-gradient(circle at 40% 35%, #ff8a4d, #8b6f33)',
              borderColor: face === 'scarred' ? '#8a2be2' : '#D73423',
              color: face === 'scarred' ? '#8a2be2' : '#05050a',
              boxShadow: face === 'scarred' ? '0 0 30px -4px #8a2be2' : '0 0 30px -4px #D73423',
            }}
          >
            {face === 'scarred' ? '☠' : face === 'clean' ? '★' : '?'}
          </div>
        </motion.button>

        <div className="mt-6 h-10 text-center">
          {!face ? (
            <button onClick={flip} disabled={flipping} className="btn-gold disabled:opacity-50">
              {flipping ? 'THE COIN IS IN THE AIR…' : 'TOSS THE COIN'}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
              <p className="font-serif text-[16px] italic" style={{ color: face === 'scarred' ? '#8a2be2' : '#D73423' }}>
                {face === 'scarred' ? 'The scarred half. Chance has robbed you.' : 'The clean half. You are forgiven — tonight.'}
              </p>
              <button onClick={onClose} className="btn-hud">ACCEPT FATE</button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
