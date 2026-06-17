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

  const cells = [
    { n: closedCount, l: 'missions executed' },
    { n: st.streak, l: 'consecutive nights on patrol' },
    { n: st.failedCount, l: 'missions failed in shame', tone: 'blood' },
    { n: st.upgradesEarned, l: 'upgrades earned', tone: 'acid' },
    { n: total, l: 'composite mastery' },
    { n: nights(st.firstNight), l: 'nights since the alley' },
  ]

  return (
    <Panel label="XIII · Telemetry" className="col-span-12">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span
              className={`font-display text-[30px] leading-none ${
                c.tone === 'blood' ? 'text-blood' : c.tone === 'acid' ? 'text-acid' : 'text-gold'
              }`}
            >
              {c.n}
            </span>
            <span className="font-serif text-[12px] italic text-ash">{c.l}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
