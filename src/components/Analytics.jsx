/* Batcomputer Analytics — 30-day historical telemetry with a reactive
   verdict that motivates or terrifies based on recent discipline. */
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useStore, build30DaySeries } from '../store'
import Panel from './Panel'

function verdict(series) {
  const last7 = series.slice(-7).reduce((s, d) => s + d.points, 0)
  const prev7 = series.slice(-14, -7).reduce((s, d) => s + d.points, 0)
  const activeDays = series.slice(-7).filter((d) => d.count > 0).length

  if (last7 === 0)
    return {
      tone: 'blood',
      text: 'Total silence on the monitors, Master Wayne. Gotham has been left to the wolves this week.',
    }
  if (last7 < prev7 * 0.6)
    return {
      tone: 'blood',
      text: 'Your discipline has faltered this week. The numbers are falling. Gotham is suffering for it.',
    }
  if (last7 > prev7 * 1.25 || activeDays >= 6)
    return {
      tone: 'gold',
      text: 'Unstoppable momentum detected. The city sleeps a little safer tonight.',
    }
  return {
    tone: 'bone',
    text: 'Holding the line, sir. Steady is survivable — but legends are not built on steady alone.',
  }
}

const TONE_COLOR = { gold: '#c9a24e', blood: '#b30000', bone: '#a8a395' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass border-gold/50 px-3 py-2">
      <div className="font-display text-[10px] tracking-[0.2em] text-ash">{label}</div>
      <div className="font-mono text-[13px] text-gold">{payload[0].value} XP</div>
      <div className="font-mono text-[11px] text-ash">{payload[0].payload.count} missions</div>
    </div>
  )
}

export default function Analytics() {
  const log = useStore((s) => s.completionLog)
  const series = useMemo(() => build30DaySeries(log), [log])
  const v = verdict(series)
  const total30 = series.reduce((s, d) => s + d.points, 0)
  const best = series.reduce((m, d) => Math.max(m, d.points), 0)

  return (
    <Panel
      label="XII · Batcomputer"
      title={<>Historical <em className="not-italic font-light text-bone-dim">Telemetry</em></>}
      right={`${total30} XP · 30 NIGHTS`}
      className="col-span-12"
    >
      <div
        className="mb-3 border-l-2 px-4 py-2.5 font-serif text-[15.5px] italic leading-snug"
        style={{ borderColor: TONE_COLOR[v.tone], color: v.tone === 'bone' ? '#e6e0d0' : TONE_COLOR[v.tone] }}
      >
        “{v.text}”
        <span className="mt-1 block font-display text-[9px] not-italic tracking-[0.3em] text-ash">
          — ALFRED, READING THE MONITORS
        </span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a24e" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#c9a24e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1d1d2a" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6a6759', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              interval={4}
              axisLine={{ stroke: '#1d1d2a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6a6759', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c9a24e', strokeOpacity: 0.3 }} />
            <Area
              type="monotone"
              dataKey="points"
              stroke="#c9a24e"
              strokeWidth={2}
              fill="url(#goldFade)"
              dot={false}
              activeDot={{ r: 4, fill: '#f0c668', stroke: '#050505' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between font-display text-[10px] tracking-[0.2em] text-ash">
        <span>BEST NIGHT · {best} XP</span>
        <span>DAILY AVG · {Math.round(total30 / 30)} XP</span>
      </div>
    </Panel>
  )
}
