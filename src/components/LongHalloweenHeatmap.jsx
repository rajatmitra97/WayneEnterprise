/* ═══════════════════════════════════════════════════════════════════
   THE LONG HALLOWEEN — a 365-night discipline heatmap.
   Empty=black · low=dark red · high=neon red · Arkham night=crimson glow.
   (Two-Face's coin used to live here; Harvey's Deal is now app-wide.)
   ═══════════════════════════════════════════════════════════════════ */
import { useMemo, useState } from 'react'
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
  const series = useMemo(() => build365Series(log), [log])
  const weeks = useMemo(() => toWeeks(series), [series])

  const activeDays = series.filter((d) => d.count > 0).length
  const arkhamNights = series.filter((d) => d.arkham > 0).length
  const [hover, setHover] = useState(null)

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

    </Panel>
  )
}
