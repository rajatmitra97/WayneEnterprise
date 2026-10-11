/* ═══════════════════════════════════════════════════════════════════
   THE CONTEXTUAL UPLINK — right-hand w-80 panel.
   Click a case → its dossier + editing controls slide in here, so the
   main view is never blocked by a floating modal.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Save, Check, Trash2 } from 'lucide-react'
import { useStore, threatLocked, abandonCost, nightWeekday } from '../store'
import { SECTORS, SECTOR_ORDER, THREAT, THREAT_ORDER, RECUR, WEEKDAYS_FULL } from '../constants'

export default function ContextPanel() {
  const id = useStore((s) => s.contextTaskId)
  const task = useStore((s) => (id ? s.tasks.find((t) => t.id === id) : null))
  const close = useStore((s) => s.closeContext)
  const update = useStore((s) => s.updateTask)
  const complete = useStore((s) => s.completeTask)
  const remove = useStore((s) => s.deleteTask)
  // terms are set at intake: threat (and one-off ↔ routine) lock after 10 minutes
  const locked = useStore((s) => (task ? threatLocked(s, task) : false))
  const [abandonQuote, setAbandonQuote] = useState(null)

  const [title, setTitle] = useState('')
  const [sector, setSector] = useState('body')
  const [threat, setThreat] = useState('MEDIUM')
  const [recur, setRecur] = useState(RECUR.NONE)
  const [days, setDays] = useState([])

  useEffect(() => {
    if (task) {
      setTitle(task.title); setSector(task.sector); setThreat(task.threat)
      setRecur(task.recur || RECUR.NONE); setDays(task.days || [])
    }
  }, [task])

  // a target that vanished (completed/deleted elsewhere) closes the panel
  useEffect(() => {
    if (id && !task) close()
  }, [id, task, close])
  useEffect(() => setAbandonQuote(null), [id])

  const askAbandon = () => {
    const cost = abandonCost(useStore.getState(), task)
    if (!cost || cost.free) { remove(id); close(); return }
    setAbandonQuote(cost)
  }

  const open = !!task
  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort()))
  const save = () => {
    if (!title.trim()) return
    // WEEKLY keeps its anchor weekday (wiping it meant the route never re-armed)
    const nextDays =
      recur === RECUR.CUSTOM ? days
      : recur === RECUR.WEEKLY ? (task.recur === RECUR.WEEKLY && task.days?.length ? task.days : [nightWeekday()])
      : []
    update(id, { title: title.trim(), sector, threat, recur, days: nextDays })
    close()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="sticky top-0 z-30 hidden h-screen w-80 shrink-0 overflow-y-auto border-l border-rule bg-void/95 p-5 backdrop-blur-xl lg:block"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-display text-xs uppercase tracking-widest text-gotham-slate">// CASE DOSSIER</span>
            <button onClick={close} className="text-ash transition hover:text-bone"><X className="h-5 w-5" /></button>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="border px-2 py-0.5 font-display text-[11px] font-semibold tracking-[0.12em]" style={{ color: THREAT[threat].color, borderColor: `${THREAT[threat].color}66` }}>
              {THREAT[threat].tag}
            </span>
            <span className="font-display text-[11px] tracking-[0.18em]" style={{ color: SECTORS[sector]?.accent }}>
              {SECTORS[sector]?.name?.toUpperCase()}
            </span>
          </div>

          <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">OBJECTIVE</label>
          <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className="field mb-4 w-full resize-none text-[15px]" />

          <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">SECTOR</label>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="field mb-4 w-full">
            {SECTOR_ORDER.map((k) => <option key={k} value={k}>{SECTORS[k].name}</option>)}
          </select>

          <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">
            THREAT LEVEL{locked && <span className="text-blood"> · LOCKED AT INTAKE</span>}
          </label>
          <select value={threat} onChange={(e) => setThreat(e.target.value)} disabled={locked} title={locked ? 'Threat is set at intake. It locks 10 minutes after commit, or once scheduled or signalled.' : undefined} className={`field mb-4 w-full ${locked ? 'cursor-not-allowed opacity-60' : ''}`}>
            {THREAT_ORDER.map((k) => <option key={k} value={k}>{THREAT[k].label}</option>)}
          </select>

          <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">PATROL ROUTE</label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[RECUR.NONE, RECUR.DAILY, RECUR.WEEKLY, RECUR.CUSTOM].map((r) => (
              <button key={r} onClick={() => setRecur(r)} className={`border px-2.5 py-1.5 font-display text-[10px] tracking-[0.16em] transition ${recur === r ? 'border-gold text-gold' : 'border-rule text-ash hover:text-bone'}`}>
                {r === RECUR.NONE ? 'ONE-OFF' : r}
              </button>
            ))}
          </div>
          {recur === RECUR.CUSTOM && (
            <div className="mb-4 flex gap-1.5">
              {WEEKDAYS_FULL.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)} className={`h-9 w-9 border font-display text-[11px] transition ${days.includes(i) ? 'border-gold bg-gold/15 text-gold' : 'border-rule text-ash'}`}>{d[0]}</button>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2">
            <button onClick={save} className="btn-gold flex w-full items-center justify-center gap-2"><Save className="h-5 w-5" /> SAVE CHANGES</button>
            <button onClick={() => { complete(id); close() }} className="flex w-full items-center justify-center gap-2 border border-acid/50 py-2 font-display text-[13px] tracking-[0.12em] text-acid transition hover:bg-acid/10"><Check className="h-5 w-5" /> CLOSE THE CASE</button>
            {abandonQuote ? (
              <div className="border border-blood/60 bg-blood/10 p-2.5">
                <div className="mb-2 font-display text-[12px] font-semibold tracking-[0.08em] text-blood">
                  ABANDON COUNTS AS A FAILURE: −{abandonQuote.xp} XP{abandonQuote.coins ? ` · −${abandonQuote.coins} WC` : ''}, STREAK RESETS
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { remove(id); close() }} className="flex-1 bg-blood py-1.5 font-display text-[12px] font-semibold tracking-[0.12em] text-bone">CONFIRM</button>
                  <button onClick={() => setAbandonQuote(null)} className="flex-1 border border-rule py-1.5 font-display text-[12px] tracking-[0.12em] text-ash hover:text-bone">KEEP THE CASE</button>
                </div>
              </div>
            ) : (
              <button onClick={askAbandon} className="flex w-full items-center justify-center gap-2 border border-blood-dim py-2 font-display text-[13px] tracking-[0.12em] text-blood/80 transition hover:bg-blood/10"><Trash2 className="h-5 w-5" /> ABANDON</button>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
