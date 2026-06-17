import { motion } from 'framer-motion'
import { useStore } from '../store'
import { SECTORS, SECTOR_ORDER, UPGRADES, LEVELS_PER_SECTOR, xpForLevel } from '../constants'
import Panel from './Panel'

function SectorCard({ k, active, onClick }) {
  const meta = SECTORS[k]
  const s = useStore((st) => st.sectors[k])
  const need = xpForLevel(s.lvl)
  const pct = s.lvl >= LEVELS_PER_SECTOR ? 100 : Math.min(100, (s.xp / need) * 100)
  const next = UPGRADES[k][s.lvl] || 'MASTERED'

  return (
    <motion.button
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex flex-col gap-2 rounded border bg-void-card/70 p-3 text-left transition ${
        active ? 'border-gold bg-void-raised/80' : 'border-rule hover:border-bone-dim'
      }`}
    >
      {active && <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: meta.accent }} />}
      <div className="flex items-start justify-between">
        <span className="font-display text-[22px] leading-none" style={{ color: meta.accent }}>
          {meta.sigil}
        </span>
        <span className="font-display text-[9px] tracking-[0.3em] text-ash">{meta.house}</span>
      </div>
      <div className="font-serif text-[15px] font-medium text-bone">{meta.name}</div>
      <div className="flex items-end justify-between">
        <span className="font-display text-[24px] leading-none" style={{ color: meta.accent }}>
          {s.lvl}
          <span className="ml-1 text-[10px] tracking-[0.15em] text-ash">/ {LEVELS_PER_SECTOR}</span>
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden bg-rule">
        <motion.div
          className="h-full"
          style={{ background: meta.accent }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="truncate font-serif text-[11.5px] italic text-bone-dim">▸ {next}</div>
    </motion.button>
  )
}

export default function Sectors() {
  const selected = useStore((s) => s.selectedSector)
  const select = useStore((s) => s.selectSector)
  const sector = useStore((s) => s.sectors[selected])
  const meta = SECTORS[selected]
  const ladder = UPGRADES[selected]

  return (
    <>
      <Panel
        label="IV · The Pillars"
        title={<>The <em className="not-italic font-light text-bone-dim">Six Pillars</em></>}
        right="click to inspect"
        className="col-span-12 lg:col-span-8"
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {SECTOR_ORDER.map((k) => (
            <SectorCard key={k} k={k} active={selected === k} onClick={() => select(k)} />
          ))}
        </div>
      </Panel>

      <Panel
        label="V · Codex"
        title={<span className="text-[18px]" style={{ color: meta.accent }}>{meta.name}</span>}
        right={`${sector.lvl} / ${LEVELS_PER_SECTOR}`}
        className="col-span-12 lg:col-span-4"
        accent={meta.accent}
      >
        <div className="max-h-[240px] space-y-0 overflow-y-auto pr-1.5">
          {ladder.map((u, i) => {
            const unlocked = i < sector.lvl
            const current = i === sector.lvl
            return (
              <div
                key={i}
                className={`grid grid-cols-[26px_1fr] items-center gap-2.5 border-b border-dashed border-rule py-1.5 text-[13px] ${
                  current ? 'border-l-2 pl-2' : ''
                }`}
                style={current ? { borderLeftColor: meta.accent, background: `${meta.accent}11` } : undefined}
              >
                <span className="font-display text-[11px] tracking-[0.1em] text-ash">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`font-serif italic ${
                    unlocked ? 'not-italic text-bone' : current ? '' : 'text-bone-dim'
                  }`}
                  style={current ? { color: meta.accent } : undefined}
                >
                  {u}
                </span>
              </div>
            )
          })}
        </div>
      </Panel>
    </>
  )
}
