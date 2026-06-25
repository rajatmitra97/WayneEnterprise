/* ═══════════════════════════════════════════════════════════════════
   TASK ITEM — scaled-up tactical row (Directive 4) + the DOPAMINE TAKEDOWN
   completion sequence (Directive 5): rust flash, CASE CLOSED stamp, a
   batarang slash through the title, a particle burst, then a spring shrink.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Trash2, Repeat, Radio, Eye, Clock, Baby, Newspaper, Flame } from 'lucide-react'
import { useStore } from '../store'
import { SECTORS, THREAT, RECUR, WEEKDAYS, PREP_DEFAULT_MS } from '../constants'

function recurLabel(t) {
  if (t.recur === RECUR.NONE) return null
  if (t.recur === RECUR.DAILY) return 'DAILY'
  if (t.recur === RECUR.WEEKLY) return 'WEEKLY'
  return (t.days || []).map((d) => WEEKDAYS[d]).join('')
}
const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// palette particle colors for the burst
const BURST = ['#D73423', '#a83423', '#D62516', '#9c5248', '#ff5638']
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2 + Math.random()
  const dist = 60 + Math.random() * 70
  return { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, c: BURST[i % BURST.length], d: Math.random() * 0.1 }
})

// Big, satisfying icon button — generous hitbox (Directive 4).
function IconBtn({ icon: Icon, onClick, title, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-10 w-10 items-center justify-center rounded transition hover:bg-bone/5 ${className}`}
    >
      <Icon className="h-6 w-6" />
    </button>
  )
}

export default function TaskItem({ task, onEdit, onFocus, onAlibi }) {
  const complete = useStore((s) => s.completeTask)
  const remove = useStore((s) => s.deleteTask)
  const setSignal = useStore((s) => s.setSignal)
  const requirePrep = useStore((s) => s.requirePrep)
  const delegate = useStore((s) => s.delegateTask)
  const signal = useStore((s) => s.signal)

  const meta = THREAT[task.threat]
  const sector = SECTORS[task.sector] || { accent: '#9c5248', name: task.sector }
  const isArkham = task.threat === 'ARKHAM'
  const isSignal = signal?.taskId === task.id
  const rl = recurLabel(task)
  const lowThreat = meta.rank <= 1
  const locked = !!task.locked

  const [now, setNow] = useState(Date.now())
  const [closing, setClosing] = useState(false)
  const prepActive = task.prepInvoked && task.prepUntil && now < task.prepUntil
  const enraged = task.prepInvoked && task.prepUntil && now >= task.prepUntil && !task.done

  useEffect(() => {
    if (!task.prepInvoked || task.done) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [task.prepInvoked, task.done])

  // THE DOPAMINE TAKEDOWN — play the sequence, then actually close the case.
  const takedown = () => {
    if (closing) return
    setClosing(true)
    setTimeout(() => complete(task.id), 760)
  }

  const accentBorder = enraged ? '#D62516' : locked ? '#D73423' : isArkham ? '#D62516' : `${meta.color}66`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -24, height: 0 }}
      animate={{ opacity: task.done ? 0.45 : 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, scale: 0, transition: { type: 'spring', stiffness: 420, damping: 18 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`group relative grid grid-cols-[40px_1fr_auto] items-center gap-3 overflow-hidden rounded border-l-2 px-3 py-3 ${
        enraged ? 'bg-blood/[0.12]' : isArkham ? 'animate-arkham-pulse bg-blood/[0.06]' : locked ? 'bg-gold/[0.05]' : 'border-l-transparent'
      }`}
      style={{ borderLeftColor: accentBorder }}
    >
      {/* complete — large target */}
      <button
        onClick={takedown}
        disabled={task.done || closing}
        title="Close the case"
        className={`flex h-9 w-9 items-center justify-center rounded-md border-2 transition ${
          task.done || closing ? 'border-gold bg-gold/25 text-gold' : 'border-ash text-transparent hover:border-gold hover:bg-gold/10 hover:text-gold'
        }`}
      >
        <Check className="h-5 w-5" />
      </button>

      {/* body — bigger, glanceable type */}
      <div className="min-w-0">
        <div className={`relative truncate font-tech text-[18px] font-medium leading-tight ${task.done || closing ? 'text-ash' : enraged ? 'text-blood' : 'text-bone'}`}>
          {task.title}
          {/* batarang slash */}
          {closing && (
            <motion.span
              className="absolute left-0 top-1/2 h-[2px] bg-gold"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '105%', opacity: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 8px #D73423' }}
            />
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2.5 font-display text-[11px] tracking-[0.16em]">
          <span style={{ color: sector.accent }}>{sector.name.toUpperCase()}</span>
          {rl && <span className="flex items-center gap-1" style={{ color: '#D62516' }}><Repeat className="h-3.5 w-3.5" /> {rl}</span>}
          {isSignal && <span className="flex items-center gap-1 text-gold"><Radio className="h-3.5 w-3.5" /> BAT-SIGNAL ×3</span>}
          {prepActive && <span className="flex items-center gap-1 text-gold"><Clock className="h-3.5 w-3.5" /> PREP {fmt(task.prepUntil - now)}</span>}
          {enraged && <span className="flex items-center gap-1 text-blood"><Flame className="h-3.5 w-3.5" /> ENRAGED · ×10</span>}
          {locked && <span className="text-gold">CRITICALLY OVERDUE · LOCKED</span>}
        </div>
      </div>

      {/* threat chip + actions */}
      <div className="flex items-center gap-1.5">
        <span
          className="border px-2 py-1 font-display text-[11px] font-semibold tracking-[0.12em]"
          style={{ color: meta.color, borderColor: `${meta.color}66`, background: isArkham ? 'rgba(145,45,36,0.12)' : 'transparent' }}
        >
          {meta.tag}
        </span>

        {locked ? (
          <button
            onClick={() => onAlibi(task)}
            className="flex items-center gap-2 border border-gold/60 bg-gold/10 px-3 py-2 font-display text-[12px] font-semibold tracking-[0.1em] text-gold transition hover:bg-gold/20"
          >
            <Newspaper className="h-[18px] w-[18px]" /> ALIBI
          </button>
        ) : (
          <div className="flex items-center gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            <IconBtn icon={Eye} onClick={() => onFocus(task)} title="Detective Vision" className="text-ash hover:text-hud" />
            {!task.prepInvoked && <IconBtn icon={Clock} onClick={() => requirePrep(task.id, PREP_DEFAULT_MS)} title="Require Prep Time" className="text-ash hover:text-gold" />}
            {!isSignal && <IconBtn icon={Radio} onClick={() => setSignal(task.id)} title="Light the Bat-Signal" className="text-ash hover:text-gold" />}
            <IconBtn icon={Pencil} onClick={() => onEdit(task)} title="Modify mission" className="text-ash hover:text-acid" />
            {lowThreat && <IconBtn icon={Baby} onClick={() => delegate(task.id)} title="Adopt a Robin" className="text-ash hover:text-gold" />}
            <IconBtn icon={Trash2} onClick={() => remove(task.id)} title={task.prepInvoked ? 'Abandon — Joker Chaos ×10!' : 'Abandon'} className={task.prepInvoked ? 'text-blood/70 hover:text-blood' : 'text-ash hover:text-blood'} />
          </div>
        )}
      </div>

      {/* ═══ THE DOPAMINE TAKEDOWN OVERLAY ═══ */}
      <AnimatePresence>
        {closing && (
          <>
            {/* rust flash */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-10 bg-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0] }}
              transition={{ duration: 0.5, times: [0, 0.25, 1] }}
            />
            {/* CASE CLOSED stamp */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="case-closed-stamp px-4 py-1.5 text-[20px]"
                initial={{ scale: 1.8, rotate: -18, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 14, delay: 0.12 }}
              >
                CASE CLOSED
              </motion.div>
            </motion.div>
            {/* particle burst */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              {PARTICLES.map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ background: p.c, boxShadow: `0 0 8px ${p.c}` }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 0.6, delay: p.d, ease: 'easeOut' }}
                />
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
