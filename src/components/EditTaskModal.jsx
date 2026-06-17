/* Mission Modification — a spring-animated Framer Motion modal that edits
   a task's title, sector, threat level, and patrol schedule in place. */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../store'
import { SECTORS, SECTOR_ORDER, THREAT, THREAT_ORDER, RECUR, WEEKDAYS_FULL } from '../constants'

export default function EditTaskModal({ task, onClose }) {
  const update = useStore((s) => s.updateTask)
  const [title, setTitle] = useState('')
  const [sector, setSector] = useState('body')
  const [threat, setThreat] = useState('MEDIUM')
  const [recur, setRecur] = useState(RECUR.NONE)
  const [days, setDays] = useState([])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setSector(task.sector)
      setThreat(task.threat)
      setRecur(task.recur || RECUR.NONE)
      setDays(task.days || [])
    }
  }, [task])

  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort()))

  const save = () => {
    if (!title.trim()) return
    update(task.id, {
      title: title.trim(),
      sector,
      threat,
      recur,
      days: recur === RECUR.CUSTOM ? days : recur === RECUR.WEEKLY ? (days.length ? days : task.days) : [],
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className="fixed inset-0 z-[7000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass relative z-10 w-full max-w-lg p-6 shadow-gold"
          >
            <span className="panel-label">Mission Modification</span>
            <button onClick={onClose} className="absolute right-4 top-4 text-ash hover:text-bone">
              <X size={16} />
            </button>

            <h2 className="mb-5 font-serif text-[22px] text-bone">
              Modify the <em className="font-light text-bone-dim">Case</em>
            </h2>

            <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">OBJECTIVE</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              className="field mb-4 w-full"
              placeholder="define objective…"
            />

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">SECTOR</label>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="field w-full">
                  {SECTOR_ORDER.map((k) => (
                    <option key={k} value={k}>{SECTORS[k].name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">THREAT LEVEL</label>
                <select value={threat} onChange={(e) => setThreat(e.target.value)} className="field w-full">
                  {THREAT_ORDER.map((k) => (
                    <option key={k} value={k}>{THREAT[k].label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="mb-1 block font-display text-[10px] tracking-[0.25em] text-ash">PATROL ROUTE</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {[RECUR.NONE, RECUR.DAILY, RECUR.WEEKLY, RECUR.CUSTOM].map((r) => (
                <button
                  key={r}
                  onClick={() => setRecur(r)}
                  className={`border px-3 py-1.5 font-display text-[10px] tracking-[0.2em] transition ${
                    recur === r ? 'border-gold text-gold' : 'border-rule text-ash hover:border-bone-dim'
                  }`}
                >
                  {r === RECUR.NONE ? 'ONE-OFF' : r}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {recur === RECUR.CUSTOM && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex gap-1.5 overflow-hidden"
                >
                  {WEEKDAYS_FULL.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`h-9 w-9 border font-display text-[11px] transition ${
                        days.includes(i) ? 'border-gold bg-gold/15 text-gold' : 'border-rule text-ash hover:border-bone-dim'
                      }`}
                    >
                      {d[0]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={onClose} className="font-display text-[11px] tracking-[0.2em] text-ash hover:text-bone">
                CANCEL
              </button>
              <button onClick={save} className="btn-gold text-[13px]">
                COMMIT CHANGES
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
