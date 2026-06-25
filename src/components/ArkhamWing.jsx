/* The Arkham Wing — personify your failures. Tag each fallen mission with
   the Rogue responsible; the Batcomputer tracks who defeats you most. */
import { motion } from 'framer-motion'
import { useStore, dominantRogue, untaggedFailures } from '../store'
import { ROGUES, ROGUE_ORDER } from '../constants'

export default function ArkhamWing() {
  const closed = useStore((s) => s.closedTasks)
  const rogueStats = useStore((s) => s.rogueStats)
  const tagFailure = useStore((s) => s.tagFailure)

  const pending = untaggedFailures(closed)
  const total = ROGUE_ORDER.reduce((s, k) => s + (rogueStats[k] || 0), 0)
  const boss = dominantRogue(rogueStats)

  return (
    <div className="mt-5 border-t border-rule pt-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-serif text-[18px] italic text-bone">
          The <span className="text-blood">Arkham Wing</span>
        </h3>
        <span className="font-display text-[10px] tracking-[0.25em] text-ash">
          {total} INMATES PROFILED
        </span>
      </div>

      {/* who's winning */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROGUE_ORDER.map((k) => {
          const r = ROGUES[k]
          const n = rogueStats[k] || 0
          const pct = total ? (n / total) * 100 : 0
          const isBoss = boss === k
          return (
            <div
              key={k}
              className="relative overflow-hidden rounded border p-2.5"
              style={{ borderColor: isBoss ? r.color : '#1d1d2a', background: isBoss ? `${r.color}10` : 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[18px] leading-none" style={{ color: r.color }}>
                  {r.glyph}
                </span>
                <span className="font-display text-[20px] leading-none" style={{ color: r.color }}>
                  {n}
                </span>
              </div>
              <div className="mt-1 font-serif text-[12px] italic text-bone">{r.name}</div>
              <div className="mt-0.5 font-mono text-[9px] leading-tight text-ash">{r.cause}</div>
              <div className="mt-1.5 h-[2px] w-full bg-rule">
                <motion.div className="h-full" style={{ background: r.color }} animate={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* untagged failures awaiting a face */}
      {pending.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 font-display text-[10px] tracking-[0.25em] text-blood">
            ▸ {pending.length} FAILURE{pending.length > 1 ? 'S' : ''} AWAIT A NAME
          </div>
          <div className="max-h-[160px] space-y-2 overflow-y-auto pr-1">
            {pending.slice(0, 8).map((t) => (
              <div key={t.id} className="rounded border border-blood-dim/60 bg-blood/[0.05] p-2.5">
                <div className="mb-2 truncate font-mono text-[12px] text-bone-dim line-through">{t.title}</div>
                <div className="flex flex-wrap gap-1.5">
                  {ROGUE_ORDER.map((k) => {
                    const r = ROGUES[k]
                    return (
                      <button
                        key={k}
                        onClick={() => tagFailure(t.id, k)}
                        className="flex items-center gap-1 border px-2 py-1 font-display text-[10px] tracking-[0.1em] transition"
                        style={{ borderColor: `${r.color}55`, color: r.color }}
                      >
                        <span>{r.glyph}</span> {r.name.replace('The ', '')}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && total > 0 && boss && (
        <p className="mt-3 font-serif text-[13px] italic text-ash">
          Your nemesis is <span style={{ color: ROGUES[boss].color }}>{ROGUES[boss].name}</span>. Know your enemy.
        </p>
      )}
      {total === 0 && pending.length === 0 && (
        <p className="mt-3 font-serif text-[13px] italic text-ash-dim">
          No inmates yet. Fail a mission and you must name who beat you.
        </p>
      )}
    </div>
  )
}
