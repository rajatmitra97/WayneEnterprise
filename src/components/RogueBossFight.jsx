/* ═══════════════════════════════════════════════════════════════════
   THE ARKHAM BOSS FIGHT — a shared weekly health bar.
   Every closed case wounds the week's escaped Rogue. Deplete the bar
   before Sunday midnight for a permanent XP multiplier. Fail → a scar.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { BOSS_DAMAGE, BOSS_BUFF_STEP, THREAT_ORDER, THREAT } from '../constants'
import Panel from './Panel'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`
const SEGMENTS = 24

export default function RogueBossFight() {
  const boss = useStore((s) => s.boss)
  const bossBuffs = useStore((s) => s.bossBuffs)
  const scars = useStore((s) => s.bossScars)

  if (!boss) {
    return (
      <Panel label="Arkham" title="Boss Fight" instruction="STAND BY: SYNCING THREAT FEED" className="col-span-12" accent="#D62516">
        <p className="py-8 text-center font-serif text-[14px] italic text-ash-dim">Triangulating this week's escapee…</p>
      </Panel>
    )
  }

  const pct = boss.hp / boss.maxHp
  const filled = Math.ceil(pct * SEGMENTS)

  return (
    <Panel
      label="Arkham"
      title="This Week's Escapee"
      instruction="WEEKLY TARGET: DEPLETE BEFORE SUNDAY"
      right={`+${Math.round(bossBuffs * BOSS_BUFF_STEP * 100)}% PERMA-XP`}
      className="col-span-12"
      accent={boss.color}
    >
      <div className="grid items-center gap-5 md:grid-cols-[260px_1fr]">
        {/* silhouette — PNG: /public/assets/boss-silhouette.png (or per-boss) */}
        <div className="relative flex h-64 items-end justify-center overflow-hidden rounded-lg border border-rule bg-gradient-to-b from-void-card to-void">
          <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 80%, ${boss.color}22, transparent 65%)` }} />
          <BossArt boss={boss} defeated={boss.defeated} />
          <div className="absolute left-3 top-3">
            <div className="font-display text-[10px] tracking-[0.3em] text-ash">{boss.tag}</div>
            <div className="font-display text-[24px] font-bold leading-none" style={{ color: boss.color }}>{boss.name}</div>
          </div>
        </div>

        {/* health + intel */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-[12px] tracking-[0.2em] text-ash">INTEGRITY</span>
            <span className="font-display text-[20px] font-bold tabular-nums" style={{ color: boss.defeated ? '#39ff14' : boss.color }}>
              {boss.hp}<span className="text-ash">/{boss.maxHp}</span>
            </span>
          </div>

          {/* segmented glowing health bar */}
          <div className="flex gap-[3px]">
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              const on = i < filled && !boss.defeated
              return (
                <motion.div
                  key={i}
                  className="h-7 flex-1 rounded-[2px]"
                  animate={{ opacity: on ? 1 : 0.18 }}
                  style={{
                    background: on ? boss.color : '#2a0707',
                    boxShadow: on ? `0 0 10px -2px ${boss.color}` : 'none',
                  }}
                />
              )
            })}
          </div>

          {boss.defeated ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded border border-acid/50 bg-acid/5 p-3">
              <div className="font-display text-[14px] font-bold tracking-[0.12em] text-acid">▸ VANQUISHED</div>
              <div className="mt-1 font-serif text-[13px] italic text-bone-dim">Caught before the week was out. Your permanent XP multiplier grows.</div>
            </motion.div>
          ) : (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {THREAT_ORDER.slice().reverse().map((k, i) => (
                <div key={k} className="rounded border border-rule px-2 py-1.5 text-center">
                  <div className="font-display text-[9px] tracking-[0.12em]" style={{ color: THREAT[k].color }}>{THREAT[k].label.split('-')[0]}</div>
                  <div className="font-display text-[16px] font-bold text-bone">{BOSS_DAMAGE[i]}<span className="text-[9px] text-ash"> dmg</span></div>
                </div>
              ))}
            </div>
          )}

          {scars.length > 0 && (
            <div className="mt-3 font-display text-[10px] tracking-[0.18em] text-blood">
              ✖ {scars.length} ESCAPED · GOTHAM SCARRED
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

// Gritty silhouette — PNG with a vector fallback until art is installed.
function BossArt({ boss, defeated }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <svg viewBox="0 0 120 200" className="relative z-10 h-[210px]" style={{ filter: defeated ? 'grayscale(1)' : `drop-shadow(0 0 26px ${boss.color}66)` }}>
        <path d="M60 12c12 0 20 9 20 22 0 7-3 12-7 16 10 5 17 16 17 30v60c0 18-13 30-30 30s-30-12-30-30v-60c0-14 7-25 17-30-4-4-7-9-7-16 0-13 8-22 20-22z"
          fill={defeated ? '#2a2a2a' : boss.color} opacity={defeated ? 0.4 : 0.85} />
        <circle cx="50" cy="34" r="3.5" fill="#060303" />
        <circle cx="70" cy="34" r="3.5" fill="#060303" />
      </svg>
    )
  }
  return (
    <motion.img
      src={asset('assets/boss-silhouette.png')}
      alt={boss.name}
      onError={() => setBroken(true)}
      animate={{ opacity: defeated ? 0.3 : 0.92 }}
      className="relative z-10 max-h-[230px] object-contain drop-shadow-2xl"
      style={{ filter: defeated ? 'grayscale(1)' : `drop-shadow(0 0 26px ${boss.color}55)` }}
    />
  )
}
