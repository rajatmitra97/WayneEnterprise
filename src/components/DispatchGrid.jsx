/* ═══════════════════════════════════════════════════════════════════
   GCPD DISPATCH GRID — the Weekly Patrol Schedule. The new heart of the OS.
   Mon→Sun across, the patrol window down. Drop open cases onto time slots;
   blocks are colour-coded by threat. The live slot glows rust and a laser
   sweeps the active hour. Alfred: chronological patrol mapping online, sir.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, CalendarClock, Check } from 'lucide-react'
import { useStore } from '../store'
import {
  SECTORS, THREAT, DISPATCH_DAYS, DISPATCH_START_HOUR, DISPATCH_END_HOUR,
  GRANULARITIES, fmtSlot,
} from '../constants'
import Panel from './Panel'

export default function DispatchGrid() {
  const tasks = useStore((s) => s.tasks)
  const schedule = useStore((s) => s.schedule)
  const assignSlot = useStore((s) => s.assignSlot)
  const clearSlot = useStore((s) => s.clearSlot)
  const complete = useStore((s) => s.completeTask)
  const failRoutine = useStore((s) => s.failRoutineTask)

  const [gran, setGran] = useState(60) // minutes per block
  const [picking, setPicking] = useState(null) // { wd, mins } awaiting a task
  const [failingId, setFailingId] = useState(null) // jagged-strike animation target

  // play the jagged red strike, THEN send the case to the Graveyard
  const doFail = (id) => {
    setFailingId(id)
    setTimeout(() => { failRoutine(id); setFailingId(null) }, 460)
  }
  const [, tick] = useState(0) // keep the live-slot highlight current
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // build the vertical time axis
  const slots = useMemo(() => {
    const out = []
    for (let h = DISPATCH_START_HOUR * 60; h < DISPATCH_END_HOUR * 60; h += gran) out.push(h)
    return out
  }, [gran])

  // live position
  const now = new Date()
  const nowWd = now.getDay()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const liveSlot = Math.floor(nowMins / gran) * gran

  const byId = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks])
  const openUnscheduled = tasks.filter((t) => !t.done)

  const resolve = (wd, mins) => {
    const id = schedule[`${wd}:${mins}`]
    return id ? byId[id] : null
  }

  return (
    <Panel
      label="II · GCPD Dispatch"
      title="Weekly Patrol Schedule"
      instruction="DEPLOYMENT GRID: ASSIGN PATROL WINDOWS"
      right={
        <span className="flex items-center gap-2">
          {GRANULARITIES.map((g) => (
            <button
              key={g.minutes}
              onClick={() => setGran(g.minutes)}
              className={`border px-2 py-1 font-display text-[11px] tracking-[0.12em] transition ${
                gran === g.minutes ? 'border-gold bg-gold/15 text-gold' : 'border-rule text-ash hover:text-bone'
              }`}
            >
              {g.label}
            </button>
          ))}
        </span>
      }
      className="col-span-12"
      accent="#D73423"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* day header row */}
          <div
            className="grid border-b border-rule pb-2"
            style={{ gridTemplateColumns: `64px repeat(${DISPATCH_DAYS.length}, 1fr)` }}
          >
            <div />
            {DISPATCH_DAYS.map((d) => (
              <div
                key={d.wd}
                className={`text-center font-display text-[14px] font-semibold tracking-[0.16em] ${
                  d.wd === nowWd ? 'text-gold' : 'text-bone-dim'
                }`}
              >
                {d.label}
                {d.wd === nowWd && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />}
              </div>
            ))}
          </div>

          {/* time rows */}
          <div className="max-h-[460px] overflow-y-auto pr-1">
            {slots.map((mins) => (
              <div
                key={mins}
                className="grid border-b border-rule/40"
                style={{ gridTemplateColumns: `64px repeat(${DISPATCH_DAYS.length}, 1fr)` }}
              >
                {/* time gutter */}
                <div className="flex items-start justify-end pr-2 pt-1 font-mono text-[12px] tabular-nums text-ash">
                  {fmtSlot(mins)}
                </div>

                {DISPATCH_DAYS.map((d) => {
                  const task = resolve(d.wd, mins)
                  const isLive = d.wd === nowWd && mins === liveSlot
                  const meta = task ? THREAT[task.threat] : null
                  const overdueLive = isLive && task && !task.done
                  return (
                    <div
                      key={d.wd}
                      className={`relative m-0.5 min-h-[44px] rounded border ${
                        isLive ? 'animate-slot-glow border-gold/70' : 'border-rule/50'
                      }`}
                      style={{ background: isLive ? 'rgba(215,52,35,0.06)' : 'rgba(150,30,22,0.05)' }}
                    >
                      {/* scanning laser over the active hour */}
                      {isLive && <div className="dispatch-laser animate-laser-scan" />}

                      <AnimatePresence mode="popLayout">
                        {task ? (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            className={`group relative flex h-full w-full items-center gap-1 rounded px-1.5 py-1 ${
                              overdueLive ? 'animate-arkham-pulse' : ''
                            } ${task.lazarusScar ? 'ring-1 ring-[#39ff14]' : ''}`}
                            style={{
                              background: `${meta.color}22`,
                              borderLeft: `3px solid ${task.lazarusScar ? '#39ff14' : meta.color}`,
                              boxShadow: task.lazarusScar ? '0 0 12px -4px #39ff14' : undefined,
                            }}
                          >
                            <div className="relative min-w-0 flex-1">
                              <span className={`block truncate font-mono text-[12px] leading-tight ${failingId === task.id ? 'text-blood' : 'text-bone'}`}>{task.title}</span>
                              <span className="font-display text-[9px] tracking-[0.16em]" style={{ color: meta.color }}>
                                {SECTORS[task.sector]?.name?.toUpperCase() || 'CASE'}
                              </span>
                              {/* jagged red FAIL strike */}
                              {failingId === task.id && (
                                <motion.svg viewBox="0 0 100 12" preserveAspectRatio="none" className="pointer-events-none absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 overflow-visible" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                  <motion.polyline points="0,6 10,1 20,11 30,2 40,10 50,3 60,9 70,2 80,10 90,4 100,7" fill="none" stroke="#D62516" strokeWidth="2.5" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 0 4px #ff3422)' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} preserveAspectRatio="none" />
                                </motion.svg>
                              )}
                            </div>
                            {/* Directive 1 — binary resolution */}
                            <button onClick={() => complete(task.id)} title="Success" className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-acid/50 text-acid transition hover:bg-acid/15">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => doFail(task.id)} title="Failure — Joker Chaos" className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-blood/50 text-blood transition hover:bg-blood/15">
                              <X className="h-4 w-4" />
                            </button>
                            <button onClick={() => clearSlot(d.wd, mins)} title="Unassign" className="absolute -right-1 -top-1 text-ash opacity-0 transition hover:text-bone group-hover:opacity-100">
                              <X size={11} />
                            </button>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setPicking({ wd: d.wd, mins })}
                            className="flex h-full w-full items-center justify-center text-ash/30 transition hover:text-gold"
                            title="Assign a case"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* assignment picker */}
      <AnimatePresence>
        {picking && (
          <motion.div
            className="fixed inset-0 z-[7400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" onClick={() => setPicking(null)} />
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="glass hud-corners relative z-10 w-full max-w-md p-5"
              style={{ borderColor: 'rgba(215,52,35,0.45)' }}
            >
              <span className="panel-label">Dispatch · Assign</span>
              <div className="mb-3 flex items-center gap-2 text-gold">
                <CalendarClock size={18} />
                <h3 className="font-display text-[18px] font-semibold uppercase tracking-[0.08em]">
                  {DISPATCH_DAYS.find((d) => d.wd === picking.wd)?.label} · {fmtSlot(picking.mins)}
                </h3>
              </div>
              <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                {openUnscheduled.length === 0 ? (
                  <p className="py-6 text-center font-serif text-[13px] italic text-ash-dim">
                    No open cases. Decrypt new intel first.
                  </p>
                ) : (
                  openUnscheduled.map((t) => {
                    const meta = THREAT[t.threat]
                    return (
                      <button
                        key={t.id}
                        onClick={() => { assignSlot(picking.wd, picking.mins, t.id); setPicking(null) }}
                        className="flex w-full items-center gap-2 border border-rule px-3 py-2 text-left transition hover:border-gold/60"
                        style={{ borderLeft: `3px solid ${meta.color}` }}
                      >
                        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-bone">{t.title}</span>
                        <span className="font-display text-[10px] tracking-[0.12em]" style={{ color: meta.color }}>
                          {meta.tag}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}
