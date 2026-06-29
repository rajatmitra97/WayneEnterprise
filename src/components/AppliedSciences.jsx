/* ═══════════════════════════════════════════════════════════════════
   LUCIUS FOX — APPLIED SCIENCES.
   Lock Wayne Coins into 24-hour research (forces a next-day return), and
   run the Lazarus Pit on failed cases rotting in the Graveyard.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FlaskConical, Lock, Check, Skull } from 'lucide-react'
import { useStore } from '../store'
import { RESEARCH_PROJECTS, RESEARCH_HOURS, LAZARUS_REVIVE_COST, SECTORS } from '../constants'
import Panel from './Panel'

const RESEARCH_MS = RESEARCH_HOURS * 3600000
const countdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function AppliedSciences() {
  const coins = useStore((s) => s.coins)
  const research = useStore((s) => s.research)
  const unlocked = useStore((s) => s.unlockedResearch)
  const startResearch = useStore((s) => s.startResearch)
  const claimResearch = useStore((s) => s.claimResearch)
  const graveyard = useStore((s) => s.graveyard)
  const revive = useStore((s) => s.reviveFromGraveyard)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <Panel
      label="The Cave · R&D"
      title="Applied Sciences"
      instruction="LUCIUS FOX: INVEST · WAIT 24H · UNLOCK"
      right={`${coins} WC`}
      className="col-span-12 lg:col-span-6"
      accent="#D73423"
    >
      <div className="space-y-2">
        {RESEARCH_PROJECTS.map((p) => {
          const active = research.find((r) => r.projectId === p.id)
          const done = unlocked.includes(p.id)
          const remaining = active ? RESEARCH_MS - (Date.now() - active.startedAt) : null
          const ready = active && remaining <= 0
          return (
            <div key={p.id} className="flex items-center gap-3 rounded border border-rule bg-void-card/60 p-2.5">
              <FlaskConical className="h-6 w-6 shrink-0" style={{ color: done ? '#39ff14' : '#D73423' }} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13px] font-semibold tracking-[0.06em] text-bone">{p.name}</div>
                <div className="truncate font-mono text-[11px] text-ash">{p.desc}</div>
              </div>
              {done ? (
                <span className="flex items-center gap-1 font-display text-[11px] tracking-[0.12em] text-acid"><Check className="h-4 w-4" /> DEPLOYED</span>
              ) : ready ? (
                <button onClick={() => claimResearch(p.id)} className="btn-gold h-9 animate-pulse text-[12px]">CLAIM</button>
              ) : active ? (
                <span className="font-display text-[14px] tabular-nums text-hud">{countdown(remaining)}</span>
              ) : (
                <button onClick={() => startResearch(p.id)} disabled={coins < p.cost} className={`flex h-9 items-center gap-1.5 px-3 font-display text-[12px] tracking-[0.1em] ${coins >= p.cost ? 'btn-gold' : 'cursor-not-allowed border border-rule text-ash'}`}>
                  <Lock className="h-4 w-4" /> {p.cost}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* The Lazarus Graveyard */}
      <div className="mt-5 border-t border-rule pt-4">
        <div className="mb-2 flex items-center gap-2">
          <Skull className="h-5 w-5 text-acid" />
          <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-bone">The Graveyard</h3>
          <span className="ml-auto font-display text-[10px] tracking-[0.2em] text-ash">LAZARUS · {LAZARUS_REVIVE_COST} WC</span>
        </div>
        <AnimatePresence mode="popLayout">
          {graveyard.length === 0 ? (
            <p className="py-3 text-center font-serif text-[13px] italic text-ash-dim">No fallen cases. Keep it that way.</p>
          ) : (
            <div className="max-h-[200px] space-y-1.5 overflow-y-auto pr-1">
              {graveyard.map((g) => (
                <motion.div
                  key={g.id}
                  layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                  className="flex items-center gap-2 rounded border border-blood-dim/60 bg-blood/5 px-2.5 py-2"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-bone-dim line-through">{g.title}</span>
                  <span className="font-display text-[9px] tracking-[0.12em]" style={{ color: SECTORS[g.sector]?.accent }}>{SECTORS[g.sector]?.name?.toUpperCase()}</span>
                  <button
                    onClick={() => revive(g.id)}
                    disabled={coins < LAZARUS_REVIVE_COST}
                    className={`flex items-center gap-1 px-2 py-1 font-display text-[10px] tracking-[0.1em] transition ${coins >= LAZARUS_REVIVE_COST ? 'border border-acid/60 text-acid hover:bg-acid/10' : 'cursor-not-allowed border border-rule text-ash'}`}
                    style={coins >= LAZARUS_REVIVE_COST ? { boxShadow: '0 0 12px -3px #39ff14' } : undefined}
                  >
                    ✚ REVIVE
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </Panel>
  )
}
