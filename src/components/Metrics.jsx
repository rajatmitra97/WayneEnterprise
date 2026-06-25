import { useStore, selectCompositeLevel } from '../store'
import { todayKey } from '../store'
import Panel from './Panel'

function nights(firstNight) {
  const a = new Date(firstNight)
  const b = new Date(todayKey())
  return Math.max(0, Math.round((b - a) / 86400000))
}

export default function Metrics() {
  const st = useStore()
  const closedCount = st.closedTasks.filter((t) => !t.failed).length
  const total = selectCompositeLevel({ sectors: st.sectors })

  const scars = st.lazarus?.scars?.length || 0
  const cells = [
    { n: closedCount, l: 'missions executed' },
    { n: st.streak, l: 'consecutive nights on patrol' },
    { n: st.failedCount, l: 'missions failed in shame', tone: 'blood' },
    { n: st.upgradesEarned, l: 'upgrades earned', tone: 'acid' },
    { n: total, l: 'composite mastery' },
    scars > 0
      ? { n: scars, l: 'lazarus scars — never forgotten', tone: 'lazarus' }
      : { n: nights(st.firstNight), l: 'nights since the alley' },
  ]

  return (
    <Panel label="XIII · Telemetry" className="col-span-12">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span
              className={`font-display text-[42px] font-bold leading-none tabular-nums ${
                c.tone === 'blood' ? 'text-blood' : c.tone === 'acid' ? 'text-acid' : 'text-gold'
              }`}
              style={c.tone === 'lazarus' ? { color: '#1aff8c' } : undefined}
            >
              {c.n}
            </span>
            <span className="font-tech text-[14px] uppercase tracking-[0.08em] text-ash">{c.l}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
