/* ═══════════════════════════════════════════════════════════════════
   THE CASE FILE — the one list of what you owe Gotham.
   One intake only: the DECRYPT button (or Cmd/Ctrl+K) opens the Command
   Console; raw thoughts go through the Wiretap bar and wait under INTEL
   until you commit them to patrol. Handed-off cases stay here, marked.
   ═══════════════════════════════════════════════════════════════════ */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { useStore, sortByThreat } from '../store'
import { SECTORS, THREAT, RECUR, MODES } from '../constants'
import Panel from './Panel'
import TaskItem from './TaskItem'
import FocusLauncher from './FocusLauncher'
import AlibiModal from './AlibiModal'

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'intel', label: 'Intel' },
  { key: 'arkham', label: 'Arkham' },
  { key: 'routes', label: 'Patrols' },
  { key: 'closed', label: 'Closed' },
]

export default function CaseFile() {
  const tasks = useStore((s) => s.tasks)
  const closed = useStore((s) => s.closedTasks)
  const openCommand = useStore((s) => s.openCommand)
  const setStatus = useStore((s) => s.setStatus)
  const remove = useStore((s) => s.deleteTask)
  const mode = useStore((s) => s.mode)
  const visibleSectors = MODES[mode].sectors

  const [tab, setTab] = useState('open')
  const [focusing, setFocusing] = useState(null)
  const [alibiing, setAlibiing] = useState(null)

  // Cowl boundary: each identity only sees its own sectors' open, on-patrol cases.
  const open = useMemo(
    () => sortByThreat(tasks.filter((t) => !t.done && t.status !== 'backlog' && visibleSectors.includes(t.sector))),
    [tasks, visibleSectors]
  )
  const intel = useMemo(() => tasks.filter((t) => !t.done && t.status === 'backlog'), [tasks])
  const hiddenCount = tasks.filter((t) => !t.done && t.status !== 'backlog' && !visibleSectors.includes(t.sector)).length
  const list = useMemo(() => {
    if (tab === 'open') return open
    if (tab === 'intel') return intel
    if (tab === 'arkham') return open.filter((t) => t.threat === 'ARKHAM')
    if (tab === 'routes') return sortByThreat(tasks.filter((t) => t.recur !== RECUR.NONE && visibleSectors.includes(t.sector)))
    return closed.slice(0, 40)
  }, [tab, open, intel, tasks, closed, visibleSectors])

  const arkhamCount = open.filter((t) => t.threat === 'ARKHAM').length

  return (
    <>
      <Panel
        label="I · Case File"
        title={<>The <em className="not-italic font-light text-bone-dim">Case File</em></>}
        instruction="ACTIVE CASES: EXECUTE OR SUFFER"
        right={`${open.length} OPEN · ${arkhamCount} ARKHAM${hiddenCount ? ` · ${hiddenCount} OFF-DUTY` : ''}`}
        className="col-span-12 lg:col-span-8"
      >
        {/* the single intake — opens the Command Console (Cmd/Ctrl+K) */}
        <motion.button
          onClick={openCommand}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          className="hud-corners mb-3 flex w-full items-center justify-center gap-3 border border-hud/50 bg-hud/5 py-2.5 font-display text-[14px] font-semibold uppercase tracking-[0.2em] text-hud transition hover:bg-hud/15"
        >
          <span className="animate-hud-pulse">◉</span> DECRYPT NEW INTEL
          <kbd className="ml-1 border border-hud/40 px-1.5 py-0.5 font-mono text-[11px] tracking-normal text-hud/80">⌘K</kbd>
        </motion.button>

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
              {t.key === 'intel' && intel.length > 0 && <span className="ml-1 text-hud">{intel.length}</span>}
              {tab === t.key && (
                <motion.span layoutId="case-tab" className="absolute inset-x-0 -bottom-px h-px bg-gold" />
              )}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {list.length === 0 ? (
              <p className="py-8 text-center font-serif text-[13.5px] italic text-ash-dim">
                {tab === 'closed'
                  ? 'No closed cases yet. The night is young.'
                  : tab === 'intel'
                  ? 'No raw intel. Capture a thought in the Wiretap bar below.'
                  : 'A quiet night in Gotham. Decrypt new intel.'}
              </p>
            ) : tab === 'closed' ? (
              list.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-rule/60 py-2 text-[12px]">
                  <span className={`font-mono ${t.failed ? 'text-blood line-through' : 'text-ash line-through'}`}>{t.title}</span>
                  <span className="font-display text-[9px] tracking-[0.2em] text-ash-dim">
                    {t.failed ? (t.abandoned ? 'ABANDONED' : 'FAILED') : 'CLOSED'} · {t.closedDate}
                  </span>
                </div>
              ))
            ) : tab === 'intel' ? (
              list.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex items-center gap-3 border-b border-rule/60 px-1 py-2"
                >
                  <span className="min-w-0 flex-1 truncate font-tech text-[16px] text-bone">{t.title}</span>
                  <span className="font-display text-[10px] tracking-[0.14em]" style={{ color: SECTORS[t.sector]?.accent }}>
                    {SECTORS[t.sector]?.name?.toUpperCase()} · {THREAT[t.threat].tag}
                  </span>
                  <button
                    onClick={() => setStatus(t.id, 'patrol')}
                    title="Commit to patrol (the 10-minute intake window starts now)"
                    className="flex items-center gap-1 border border-gold/60 px-2 py-1 font-display text-[11px] tracking-[0.12em] text-gold transition hover:bg-gold/10"
                  >
                    <ArrowUpRight className="h-4 w-4" /> PUT ON PATROL
                  </button>
                  <button onClick={() => remove(t.id)} title="Discard intel (free)" className="text-ash transition hover:text-blood">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              list.map((t) => <TaskItem key={t.id} task={t} onFocus={setFocusing} onAlibi={setAlibiing} />)
            )}
          </AnimatePresence>
        </div>
      </Panel>

      <FocusLauncher task={focusing} onClose={() => setFocusing(null)} />
      <AlibiModal task={alibiing} onClose={() => setAlibiing(null)} />
    </>
  )
}
