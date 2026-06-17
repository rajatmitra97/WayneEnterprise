import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import { useStore, sortByThreat } from '../store'
import { SECTORS, SECTOR_ORDER, THREAT, THREAT_ORDER, RECUR, WEEKDAYS_FULL } from '../constants'
import Panel from './Panel'
import TaskItem from './TaskItem'
import EditTaskModal from './EditTaskModal'

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'arkham', label: 'Arkham' },
  { key: 'routes', label: 'Patrols' },
  { key: 'closed', label: 'Closed' },
]

export default function CaseFile() {
  const tasks = useStore((s) => s.tasks)
  const closed = useStore((s) => s.closedTasks)
  const addTask = useStore((s) => s.addTask)

  const [tab, setTab] = useState('open')
  const [editing, setEditing] = useState(null)
  const [adv, setAdv] = useState(false)

  // entry form
  const [title, setTitle] = useState('')
  const [sector, setSector] = useState('body')
  const [threat, setThreat] = useState('MEDIUM')
  const [recur, setRecur] = useState(RECUR.NONE)
  const [days, setDays] = useState([])

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title, sector, threat, recur, days })
    setTitle('')
    setThreat('MEDIUM')
    setRecur(RECUR.NONE)
    setDays([])
  }

  const toggleDay = (d) => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort()))

  const open = useMemo(() => sortByThreat(tasks.filter((t) => !t.done)), [tasks])
  const list = useMemo(() => {
    if (tab === 'open') return open
    if (tab === 'arkham') return open.filter((t) => t.threat === 'ARKHAM')
    if (tab === 'routes') return sortByThreat(tasks.filter((t) => t.recur !== RECUR.NONE))
    return closed.slice(0, 40)
  }, [tab, open, tasks, closed])

  const arkhamCount = open.filter((t) => t.threat === 'ARKHAM').length

  return (
    <>
      <Panel
        label="VI · Case File"
        title={<>The <em className="not-italic font-light text-bone-dim">Case File</em></>}
        right={`${open.length} OPEN · ${arkhamCount} ARKHAM`}
        className="col-span-12 lg:col-span-8"
      >
        <form onSubmit={submit} className="mb-3">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="define objective…"
              className="field flex-1"
            />
            <button type="submit" className="btn-gold flex items-center gap-1 text-[13px]">
              <Plus size={14} /> COMMIT
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="field">
              {SECTOR_ORDER.map((k) => (
                <option key={k} value={k}>{SECTORS[k].name}</option>
              ))}
            </select>
            <select value={threat} onChange={(e) => setThreat(e.target.value)} className="field">
              {THREAT_ORDER.map((k) => (
                <option key={k} value={k}>{THREAT[k].label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAdv((v) => !v)}
              className="flex items-center gap-1 font-display text-[10px] tracking-[0.2em] text-ash hover:text-bone"
            >
              PATROL ROUTE <ChevronDown size={12} className={adv ? 'rotate-180 transition' : 'transition'} />
            </button>
          </div>

          <AnimatePresence>
            {adv && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-wrap gap-2">
                  {[RECUR.NONE, RECUR.DAILY, RECUR.WEEKLY, RECUR.CUSTOM].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRecur(r)}
                      className={`border px-2.5 py-1 font-display text-[10px] tracking-[0.2em] transition ${
                        recur === r ? 'border-gold text-gold' : 'border-rule text-ash hover:border-bone-dim'
                      }`}
                    >
                      {r === RECUR.NONE ? 'ONE-OFF' : r}
                    </button>
                  ))}
                  {recur === RECUR.CUSTOM && (
                    <div className="flex gap-1">
                      {WEEKDAYS_FULL.map((d, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => toggleDay(i)}
                          className={`h-7 w-7 border font-display text-[11px] transition ${
                            days.includes(i) ? 'border-gold bg-gold/15 text-gold' : 'border-rule text-ash'
                          }`}
                        >
                          {d[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mb-2 flex gap-0 border-b border-rule">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-3 py-2 font-display text-[11px] uppercase tracking-[0.22em] transition ${
                tab === t.key ? 'text-bone' : 'text-ash hover:text-bone'
              }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.span layoutId="case-tab" className="absolute inset-x-0 -bottom-px h-px bg-gold" />
              )}
            </button>
          ))}
        </div>

        <div className="max-h-[340px] space-y-1 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {list.length === 0 ? (
              <p className="py-8 text-center font-serif text-[13.5px] italic text-ash-dim">
                {tab === 'closed' ? 'No closed cases yet. The night is young.' : 'A quiet night in Gotham. Define an objective.'}
              </p>
            ) : tab === 'closed' ? (
              list.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-rule/60 py-2 text-[12px]">
                  <span className={`font-mono ${t.failed ? 'text-blood line-through' : 'text-ash line-through'}`}>
                    {t.title}
                  </span>
                  <span className="font-display text-[9px] tracking-[0.2em] text-ash-dim">
                    {t.failed ? 'FAILED' : 'CLOSED'} · {t.closedDate}
                  </span>
                </div>
              ))
            ) : (
              list.map((t) => <TaskItem key={t.id} task={t} onEdit={setEditing} />)
            )}
          </AnimatePresence>
        </div>
      </Panel>

      <EditTaskModal task={editing} onClose={() => setEditing(null)} />
    </>
  )
}
