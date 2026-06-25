/* ═══════════════════════════════════════════════════════════════════
   BLACKGATE PROCESSING FACILITY — the Kanban board.
   Three cells: Intel Gathered (backlog) · On Patrol (active) ·
   Incarcerated (done). Cards advance with Framer layoutId animation;
   committing a case to Incarcerated slams the cell door (audio + shake).
   Alfred: prisoner processing online, sir.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Lock } from 'lucide-react'
import { useStore, groupForKanban } from '../store'
import { SECTORS, THREAT, STATUS, STATUS_ORDER } from '../constants'
import { playCellDoor } from '../lib/ambientAudio'
import Panel from './Panel'

function Card({ task, column, onMove }) {
  const meta = THREAT[task.threat] || THREAT.MEDIUM
  const sector = SECTORS[task.sector]
  const isArkham = task.threat === 'ARKHAM'
  return (
    <motion.div
      layout
      layoutId={`kan-${task.id}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`hud-corners group relative border bg-void-card/70 p-2.5 ${
        isArkham ? 'border-blood/50' : 'border-rule'
      }`}
      style={{ borderLeftColor: meta.color, borderLeftWidth: 2 }}
    >
      <div className="mb-1.5 truncate font-mono text-[12px] text-bone">{task.title}</div>
      <div className="flex items-center justify-between">
        <span className="font-display text-[9px] tracking-[0.18em]" style={{ color: sector?.accent }}>
          {sector?.name?.toUpperCase() || 'CASE'}
        </span>
        <div className="flex items-center gap-1">
          {column !== 'backlog' && column !== 'incarcerated' && (
            <button onClick={() => onMove(task, 'backlog')} title="Send back to backlog" className="text-ash hover:text-bone">
              <ChevronLeft size={13} />
            </button>
          )}
          {column !== 'incarcerated' && (
            <button
              onClick={() => onMove(task, column === 'backlog' ? 'patrol' : 'incarcerated')}
              title={column === 'backlog' ? 'Deploy on patrol' : 'Incarcerate (done)'}
              className="text-ash hover:text-hud"
            >
              {column === 'backlog' ? <ChevronRight size={13} /> : <Lock size={12} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function BlackgateKanban() {
  const tasks = useStore((s) => s.tasks)
  const closed = useStore((s) => s.closedTasks)
  const setStatus = useStore((s) => s.setStatus)
  const cols = groupForKanban(tasks, closed)
  const [slam, setSlam] = useState(false)

  const move = (task, to) => {
    if (to === 'incarcerated') {
      playCellDoor()
      setSlam(true)
      setTimeout(() => setSlam(false), 450)
    }
    setStatus(task.id, to)
  }

  return (
    <Panel
      label="XVI · Blackgate"
      title="Blackgate Facility"
      right={`${cols.patrol.length} ON PATROL`}
      className="col-span-12"
      accent="#D62516"
    >
      <motion.div
        animate={slam ? { x: [0, -6, 5, -3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        {STATUS_ORDER.map((key) => {
          const s = STATUS[key]
          const list = cols[key]
          return (
            <div key={key} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between border-b border-rule pb-1.5">
                <span className="font-display text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: s.color }}>
                  {s.label}
                </span>
                <span className="font-display text-[10px] tracking-[0.2em] text-ash">{s.sub} · {list.length}</span>
              </div>
              <div className="hud-scan flex min-h-[120px] flex-1 flex-col gap-2 rounded border border-rule/40 p-2">
                <AnimatePresence mode="popLayout">
                  {list.length === 0 ? (
                    <p className="py-6 text-center font-serif text-[12px] italic text-ash-dim">
                      {key === 'incarcerated' ? 'No convictions yet.' : key === 'backlog' ? 'No raw intel.' : 'No active patrols.'}
                    </p>
                  ) : (
                    list.map((t) => <Card key={t.id} task={t} column={key} onMove={move} />)
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </motion.div>
    </Panel>
  )
}
