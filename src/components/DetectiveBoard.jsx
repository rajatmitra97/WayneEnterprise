/* ═══════════════════════════════════════════════════════════════════
   THE DETECTIVE BOARD — connect the dots.
   Categories (the 6 sectors) → Core Tasks → Sub-Tasks, joined by red
   string (SVG). Drag nodes anywhere. Sub-tasks tick off here; Core
   tasks can ONLY be closed via the Dispatch Grid (deploy them).
   ═══════════════════════════════════════════════════════════════════ */
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Check, CalendarPlus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { SECTORS, SECTOR_ORDER, CATEGORY_ANCHORS } from '../constants'
import Panel from './Panel'

// percentage point → pixel inside the board
const px = (p, dim) => (p / 100) * dim

export default function DetectiveBoard() {
  const boardRef = useRef(null)
  const cores = useStore((s) => s.boardCores)
  const subs = useStore((s) => s.boardSubs)
  const addCore = useStore((s) => s.addCore)
  const addSub = useStore((s) => s.addSub)
  const toggleSub = useStore((s) => s.toggleSub)
  const moveNode = useStore((s) => s.moveNode)
  const removeCore = useStore((s) => s.removeCore)
  const removeSub = useStore((s) => s.removeSub)
  const scheduleCore = useStore((s) => s.scheduleCore)

  const [coreTitle, setCoreTitle] = useState('')
  const [coreSector, setCoreSector] = useState('body')
  const [subFor, setSubFor] = useState(null) // coreId to add a sub to
  const [subTitle, setSubTitle] = useState('')

  // board pixel size (fixed tall canvas; nodes positioned by %)
  const W = 1100
  const H = 620

  const coreAt = (c) => ({ x: px(c.x, W), y: px(c.y, H) })
  const catAt = (sector) => ({ x: px(CATEGORY_ANCHORS[sector].x, W), y: px(CATEGORY_ANCHORS[sector].y, H) })
  const subAt = (s) => ({ x: px(s.x, W), y: px(s.y, H) })

  const onDragEnd = (kind, id, info, node) => {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = Math.max(2, Math.min(96, ((node.x + info.offset.x) / W) * 100))
    const ny = Math.max(2, Math.min(96, ((node.y + info.offset.y) / H) * 100))
    moveNode(kind, id, nx, ny)
  }

  return (
    <Panel
      label="Detective Board"
      title="Connect the Dots"
      instruction="EVIDENCE WALL: CATEGORY → CORE → SUB"
      right={`${cores.length} CORES · ${subs.length} SUBS`}
      className="col-span-12"
      accent="#D62516"
    >
      {/* add-core bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={coreTitle} onChange={(e) => setCoreTitle(e.target.value)} placeholder="new core objective…" className="field h-10 flex-1 min-w-[180px]" />
        <select value={coreSector} onChange={(e) => setCoreSector(e.target.value)} className="field h-10">
          {SECTOR_ORDER.map((k) => <option key={k} value={k}>{SECTORS[k].name}</option>)}
        </select>
        <button onClick={() => { if (coreTitle.trim()) { addCore(coreTitle, coreSector); setCoreTitle('') } }} className="btn-gold flex h-10 items-center gap-1.5">
          <Plus className="h-5 w-5" /> PIN CORE
        </button>
      </div>

      {/* the corkboard */}
      <div className="overflow-auto rounded-lg border border-rule" style={{ background: 'radial-gradient(circle at 30% 20%, #1f0606, #0c0303 70%)' }}>
        <div ref={boardRef} className="relative" style={{ width: W, height: H }}>
          {/* red string */}
          <svg className="pointer-events-none absolute inset-0" width={W} height={H}>
            {cores.map((c) => {
              const a = catAt(c.sector); const b = coreAt(c)
              return <Thread key={'cc' + c.id} a={a} b={b} color="#D62516" />
            })}
            {subs.map((s) => {
              const core = cores.find((c) => c.id === s.coreId)
              if (!core) return null
              const a = coreAt(core); const b = subAt(s)
              return <Thread key={'cs' + s.id} a={a} b={b} color={s.done ? '#39ff14' : '#8a2a1e'} />
            })}
          </svg>

          {/* category nodes (fixed) */}
          {SECTOR_ORDER.map((k) => {
            const p = catAt(k)
            return (
              <div key={k} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
                <div className="flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2" style={{ borderColor: SECTORS[k].accent, background: `${SECTORS[k].accent}22` }}>
                  <span className="font-display text-[20px] leading-none" style={{ color: SECTORS[k].accent }}>{SECTORS[k].sigil}</span>
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-bone">{SECTORS[k].name}</span>
                </div>
              </div>
            )
          })}

          {/* core nodes (draggable) */}
          {cores.map((c) => {
            const p = coreAt(c)
            return (
              <motion.div
                key={c.id}
                drag dragMomentum={false}
                onDragEnd={(e, info) => onDragEnd('core', c.id, info, p)}
                className="group absolute z-10 w-44 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: p.x, top: p.y }}
              >
                <div className={`hud-corners rounded border bg-void-card p-2.5 ${c.done ? 'border-acid/70' : 'border-gold/60'}`} style={{ boxShadow: '0 6px 20px -8px rgba(0,0,0,0.9)' }}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-display text-[9px] tracking-[0.18em]" style={{ color: SECTORS[c.sector]?.accent }}>{SECTORS[c.sector]?.name?.toUpperCase()}</span>
                    <button onClick={() => removeCore(c.id)} className="text-ash opacity-0 transition hover:text-blood group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className={`font-tech text-[14px] font-medium leading-tight ${c.done ? 'text-acid line-through' : 'text-bone'}`}>{c.title}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {!c.done && !c.taskId && (
                      <button onClick={() => scheduleCore(c.id)} title="Deploy to Dispatch (only way to complete)" className="flex items-center gap-1 border border-gold/50 px-2 py-1 font-display text-[9px] tracking-[0.1em] text-gold transition hover:bg-gold/10">
                        <CalendarPlus className="h-3.5 w-3.5" /> DEPLOY
                      </button>
                    )}
                    {c.taskId && !c.done && <span className="font-display text-[9px] tracking-[0.12em] text-hud">▸ ON DISPATCH</span>}
                    {c.done && <span className="font-display text-[9px] tracking-[0.12em] text-acid">✓ SOLVED</span>}
                    <button onClick={() => setSubFor(subFor === c.id ? null : c.id)} title="Add sub-task" className="ml-auto flex items-center gap-1 border border-rule px-2 py-1 font-display text-[9px] text-ash transition hover:text-bone">
                      <Plus className="h-3.5 w-3.5" /> SUB
                    </button>
                  </div>
                  <AnimatePresence>
                    {subFor === c.id && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => { e.preventDefault(); if (subTitle.trim()) { addSub(subTitle, c.id); setSubTitle('') } }}
                        className="mt-2 overflow-hidden"
                      >
                        <input autoFocus value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="sub-task…" className="field h-8 w-full text-[12px]" />
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}

          {/* sub nodes (draggable, tickable) */}
          {subs.map((s) => {
            const p = subAt(s)
            return (
              <motion.div
                key={s.id}
                drag dragMomentum={false}
                onDragEnd={(e, info) => onDragEnd('sub', s.id, info, p)}
                className="group absolute z-10 flex w-36 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center gap-2 rounded border bg-void/90 px-2 py-1.5 active:cursor-grabbing"
                style={{ left: p.x, top: p.y, borderColor: s.done ? '#39ff14' : '#5a100b' }}
              >
                <button onClick={() => toggleSub(s.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${s.done ? 'border-acid bg-acid/20 text-acid' : 'border-ash text-transparent hover:text-acid'}`}>
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className={`min-w-0 flex-1 truncate font-mono text-[11px] ${s.done ? 'text-ash line-through' : 'text-bone'}`}>{s.title}</span>
                <button onClick={() => removeSub(s.id)} className="text-ash opacity-0 transition hover:text-blood group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
              </motion.div>
            )
          })}

          {cores.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="font-serif text-[15px] italic text-ash-dim">The wall is bare. Pin a core objective and start connecting the dots.</p>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

// A hanging red string (quadratic bezier with a slight sag).
function Thread({ a, b, color }) {
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2 + 26
  return (
    <>
      <path d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`} fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
      <circle cx={a.x} cy={a.y} r="3" fill={color} />
      <circle cx={b.x} cy={b.y} r="3" fill={color} />
    </>
  )
}
