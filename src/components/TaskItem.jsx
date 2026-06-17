import { motion } from 'framer-motion'
import { Check, Pencil, Trash2, Repeat, Radio } from 'lucide-react'
import { useStore } from '../store'
import { SECTORS, THREAT, RECUR, WEEKDAYS } from '../constants'

function recurLabel(t) {
  if (t.recur === RECUR.NONE) return null
  if (t.recur === RECUR.DAILY) return 'DAILY'
  if (t.recur === RECUR.WEEKLY) return 'WEEKLY'
  return (t.days || []).map((d) => WEEKDAYS[d]).join('')
}

export default function TaskItem({ task, onEdit }) {
  const complete = useStore((s) => s.completeTask)
  const remove = useStore((s) => s.deleteTask)
  const setSignal = useStore((s) => s.setSignal)
  const signal = useStore((s) => s.signal)

  const meta = THREAT[task.threat]
  const sector = SECTORS[task.sector] || { accent: '#6a6759', name: task.sector }
  const isArkham = task.threat === 'ARKHAM'
  const isSignal = signal?.taskId === task.id
  const rl = recurLabel(task)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24, height: 0 }}
      animate={{ opacity: task.done ? 0.45 : 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 28, height: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`group relative grid grid-cols-[26px_1fr_auto] items-center gap-3 rounded border-l-2 px-2 py-2.5 ${
        isArkham ? 'animate-arkham-pulse bg-blood/[0.06]' : 'border-l-transparent'
      }`}
      style={!isArkham ? { borderLeftColor: `${meta.color}66` } : { borderLeftColor: '#b30000' }}
    >
      {/* complete */}
      <button
        onClick={() => complete(task.id)}
        disabled={task.done}
        title="Strike it from the record"
        className={`flex h-5 w-5 items-center justify-center rounded-sm border transition ${
          task.done
            ? 'border-gold bg-gold/20 text-gold'
            : 'border-ash text-transparent hover:border-gold hover:text-gold'
        }`}
      >
        <Check size={13} />
      </button>

      {/* body */}
      <div className="min-w-0">
        <div className={`truncate font-mono text-[13px] ${task.done ? 'text-ash line-through' : 'text-bone'}`}>
          {task.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 font-display text-[9px] tracking-[0.18em]">
          <span style={{ color: sector.accent }}>{sector.name.toUpperCase()}</span>
          {rl && (
            <span className="flex items-center gap-1 text-batblue" style={{ color: '#7b8ec4' }}>
              <Repeat size={9} /> {rl}
            </span>
          )}
          {isSignal && (
            <span className="flex items-center gap-1 text-gold">
              <Radio size={9} /> BAT-SIGNAL ×3
            </span>
          )}
        </div>
      </div>

      {/* threat chip + actions */}
      <div className="flex items-center gap-2">
        <span
          className="border px-1.5 py-0.5 font-display text-[9px] tracking-[0.15em]"
          style={{ color: meta.color, borderColor: `${meta.color}66`, background: isArkham ? 'rgba(179,0,0,0.1)' : 'transparent' }}
        >
          {meta.tag}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {!isSignal && (
            <button onClick={() => setSignal(task.id)} title="Light the Bat-Signal (3× XP)" className="text-ash hover:text-gold">
              <Radio size={13} />
            </button>
          )}
          <button onClick={() => onEdit(task)} title="Modify mission" className="text-ash hover:text-acid">
            <Pencil size={13} />
          </button>
          <button onClick={() => remove(task.id)} title="Abandon" className="text-ash hover:text-blood">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
