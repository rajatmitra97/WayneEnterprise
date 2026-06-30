/* ═══════════════════════════════════════════════════════════════════
   THE DETECTIVE BOARD — the Planning Phase (Directives 3 & 4).
   A large, scroll-pannable, zoomable corkboard. Categories (sectors) →
   Core stickies → Sub stickies, joined by red string. Drag a SUB sticky
   into the routine side-panel to push it into the Execution Phase.
   Core tasks are completed ONLY from the Dispatch Grid (deploy them).
   ═══════════════════════════════════════════════════════════════════ */
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Check, CalendarPlus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useStore } from '../store'
import {
  SECTORS, SECTOR_ORDER, CATEGORY_ANCHORS,
  DISPATCH_START_HOUR, DISPATCH_END_HOUR, fmtSlot,
} from '../constants'
import Panel from './Panel'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`
const px = (p, dim) => (p / 100) * dim
const W = 1300
const H = 760

// sticky-note PNGs with a styled fallback
function Sticky({ src, color, className, children }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className={`relative ${className}`}>
      {!broken ? (
        <img src={asset(src)} alt="" onError={() => setBroken(true)} className="pointer-events-none absolute inset-0 h-full w-full object-fill" draggable={false} />
      ) : (
        <div className="absolute inset-0 rounded" style={{ background: `${color}26`, border: `1px solid ${color}` }} />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

export default function DetectiveBoard() {
  const boardRef = useRef(null)
  const cores = useStore((s) => s.boardCores)
  const subs = useStore((s) => s.boardSubs)
  const schedule = useStore((s) => s.schedule)
  const resolutions = useStore((s) => s.slotResolutions)
  const addCore = useStore((s) => s.addCore)
  const addSub = useStore((s) => s.addSub)
  const toggleSub = useStore((s) => s.toggleSub)
  const moveNode = useStore((s) => s.moveNode)
  const removeCore = useStore((s) => s.removeCore)
  const removeSub = useStore((s) => s.removeSub)
  const scheduleCore = useStore((s) => s.scheduleCore)
  const addTask = useStore((s) => s.addTask)
  const assignSlot = useStore((s) => s.assignSlot)
  const pushToast = useStore((s) => s.pushToast)

  const [coreTitle, setCoreTitle] = useState('')
  const [coreSector, setCoreSector] = useState('body')
  const [subFor, setSubFor] = useState(null)
  const [subTitle, setSubTitle] = useState('')
  const [zoom, setZoom] = useState(1)

  const wd = new Date().getDay()
  const todaySlots = []
  for (let h = DISPATCH_START_HOUR; h < DISPATCH_END_HOUR; h++) todaySlots.push(h * 60)

  const coreAt = (c) => ({ x: px(c.x, W), y: px(c.y, H) })
  const catAt = (s) => ({ x: px(CATEGORY_ANCHORS[s].x, W), y: px(CATEGORY_ANCHORS[s].y, H) })
  const subAt = (s) => ({ x: px(s.x, W), y: px(s.y, H) })

  const onCoreDragEnd = (id, info, node) => {
    const nx = Math.max(2, Math.min(96, ((node.x + info.offset.x / zoom) / W) * 100))
    const ny = Math.max(2, Math.min(96, ((node.y + info.offset.y / zoom) / H) * 100))
    moveNode('core', id, nx, ny)
  }
  // A sub dropped over a routine slot → schedule it; otherwise just reposition.
  const onSubDragEnd = (sub, info, node) => {
    const els = document.elementsFromPoint(info.point.x, info.point.y)
    const slotEl = els.find((el) => el.getAttribute && el.getAttribute('data-routeslot'))
    if (slotEl) {
      const mins = Number(slotEl.getAttribute('data-routeslot'))
      const core = cores.find((c) => c.id === sub.coreId)
      const id = addTask({ title: sub.title, sector: core?.sector || 'mind', threat: 'MEDIUM' })
      assignSlot(wd, mins, id)
      pushToast('DISPATCH', `“${sub.title}” pushed into today, ${fmtSlot(mins)}.`, 'gold')
      return
    }
    const nx = Math.max(2, Math.min(96, ((node.x + info.offset.x / zoom) / W) * 100))
    const ny = Math.max(2, Math.min(96, ((node.y + info.offset.y / zoom) / H) * 100))
    moveNode('sub', sub.id, nx, ny)
  }

  return (
    <Panel
      label="Detective Board" title="The Planning Wall"
      instruction="DRAG A SUB-STICKY → ROUTINE TO EXECUTE"
      right={
        <span className="flex items-center gap-1.5">
          <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} className="border border-rule p-1 text-ash hover:text-bone"><ZoomOut className="h-4 w-4" /></button>
          <span className="w-10 text-center font-mono text-[11px] text-bone-dim">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} className="border border-rule p-1 text-ash hover:text-bone"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={() => setZoom(1)} className="border border-rule p-1 text-ash hover:text-bone"><Maximize className="h-4 w-4" /></button>
        </span>
      }
      className="col-span-12" accent="#D62516"
    >
      {/* add-core bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={coreTitle} onChange={(e) => setCoreTitle(e.target.value)} placeholder="new core objective…" className="field h-10 min-w-[180px] flex-1" />
        <select value={coreSector} onChange={(e) => setCoreSector(e.target.value)} className="field h-10">
          {SECTOR_ORDER.map((k) => <option key={k} value={k}>{SECTORS[k].name}</option>)}
        </select>
        <button onClick={() => { if (coreTitle.trim()) { addCore(coreTitle, coreSector); setCoreTitle('') } }} className="btn-gold flex h-10 items-center gap-1.5"><Plus className="h-5 w-5" /> PIN CORE</button>
      </div>

      <div className="flex gap-3">
        {/* the corkboard (scroll-pan + zoom) */}
        <div className="min-w-0 flex-1 overflow-auto rounded-lg border border-rule" style={{ maxHeight: 560, background: 'radial-gradient(circle at 30% 20%, #1f0606, #0c0303 70%)' }}>
          <div style={{ width: W * zoom, height: H * zoom }}>
            <div ref={boardRef} className="relative origin-top-left" style={{ width: W, height: H, transform: `scale(${zoom})` }}>
              {/* red string */}
              <svg className="pointer-events-none absolute inset-0" width={W} height={H}>
                {cores.map((c) => <Thread key={'cc' + c.id} a={catAt(c.sector)} b={coreAt(c)} color="#D62516" />)}
                {subs.map((s) => {
                  const core = cores.find((c) => c.id === s.coreId)
                  if (!core) return null
                  return <Thread key={'cs' + s.id} a={coreAt(core)} b={subAt(s)} color={s.done ? '#39ff14' : '#8a2a1e'} />
                })}
              </svg>

              {/* categories */}
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

              {/* core stickies */}
              {cores.map((c) => {
                const p = coreAt(c)
                return (
                  <motion.div key={c.id} drag dragMomentum={false} onDragEnd={(e, info) => onCoreDragEnd(c.id, info, p)}
                    className="group absolute z-10 w-44 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing" style={{ left: p.x, top: p.y }}>
                    <Sticky src="assets/major-sticky.png" color={c.done ? '#39ff14' : SECTORS[c.sector]?.accent} className="p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-display text-[9px] tracking-[0.18em]" style={{ color: SECTORS[c.sector]?.accent }}>{SECTORS[c.sector]?.name?.toUpperCase()}</span>
                        <button onClick={() => removeCore(c.id)} className="text-ash opacity-0 transition hover:text-blood group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className={`font-tech text-[14px] font-semibold leading-tight ${c.done ? 'text-acid line-through' : 'text-bone'}`}>{c.title}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        {!c.done && !c.taskId && (
                          <button onClick={() => scheduleCore(c.id)} title="Deploy to Dispatch (only way to complete)" className="flex items-center gap-1 border border-gold/50 px-2 py-1 font-display text-[9px] tracking-[0.1em] text-gold hover:bg-gold/10"><CalendarPlus className="h-3.5 w-3.5" /> DEPLOY</button>
                        )}
                        {c.taskId && !c.done && <span className="font-display text-[9px] tracking-[0.12em] text-hud">▸ ON DISPATCH</span>}
                        {c.done && <span className="font-display text-[9px] tracking-[0.12em] text-acid">✓ SOLVED</span>}
                        <button onClick={() => setSubFor(subFor === c.id ? null : c.id)} title="Add sub-task" className="ml-auto flex items-center gap-1 border border-rule px-2 py-1 font-display text-[9px] text-ash hover:text-bone"><Plus className="h-3.5 w-3.5" /> SUB</button>
                      </div>
                      <AnimatePresence>
                        {subFor === c.id && (
                          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            onSubmit={(e) => { e.preventDefault(); if (subTitle.trim()) { addSub(subTitle, c.id); setSubTitle('') } }} className="mt-2 overflow-hidden">
                            <input autoFocus value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="sub-task…" className="field h-8 w-full text-[12px]" />
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </Sticky>
                  </motion.div>
                )
              })}

              {/* sub stickies */}
              {subs.map((s) => {
                const p = subAt(s)
                return (
                  <motion.div key={s.id} drag dragMomentum={false} dragElastic={0.2} onDragEnd={(e, info) => onSubDragEnd(s, info, p)} whileDrag={{ scale: 1.1, zIndex: 50 }}
                    className="group absolute z-10 w-36 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing" style={{ left: p.x, top: p.y }}>
                    <Sticky src="assets/sub-sticky.png" color={s.done ? '#39ff14' : '#9c5248'} className="flex items-center gap-2 px-2 py-1.5">
                      <button onClick={() => toggleSub(s.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${s.done ? 'border-acid bg-acid/20 text-acid' : 'border-ash text-transparent hover:text-acid'}`}><Check className="h-3.5 w-3.5" /></button>
                      <span className={`min-w-0 flex-1 truncate font-mono text-[11px] ${s.done ? 'text-ash line-through' : 'text-bone'}`}>{s.title}</span>
                      <button onClick={() => removeSub(s.id)} className="text-ash opacity-0 transition hover:text-blood group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                    </Sticky>
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
        </div>

        {/* routine drop side-panel (Execution Phase) */}
        <div className="hidden w-44 shrink-0 md:block">
          <div className="mb-2 font-display text-xs uppercase tracking-widest text-gotham-slate">// TODAY'S ROUTINE</div>
          <div className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
            {todaySlots.map((mins) => {
              const key = `${wd}:${mins}`
              const filled = schedule[key] || resolutions[key]
              return (
                <div key={mins} data-routeslot={mins}
                  className={`flex items-center gap-2 rounded border px-2 py-2 text-[11px] ${filled ? 'border-gold/40 bg-gold/5' : 'border-dashed border-rule'}`}>
                  <span className="font-mono tabular-nums text-ash">{fmtSlot(mins)}</span>
                  <span className="truncate font-display tracking-[0.1em] text-ash-dim">{filled ? '● BOOKED' : 'drop here'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Panel>
  )
}

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
