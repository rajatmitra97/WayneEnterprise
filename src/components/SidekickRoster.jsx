/* ═══════════════════════════════════════════════════════════════════
   THE BAT-FAMILY NETWORK — sidekick comms grid.
   Portraits of the family; tap one to open their active queue. Cases
   delegated here have left your board. "Report back" = complete.
   Batcomputer: secure channel open to the network.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bird, Sparkles, Skull, Radio, Check, Undo2 } from 'lucide-react'
import { useStore, groupBySidekick } from '../store'
import { SIDEKICKS } from '../constants'
import Panel from './Panel'

const ICONS = { Bird, Sparkles, Skull, Radio }

export default function SidekickRoster() {
  const tasks = useStore((s) => s.tasks)
  const complete = useStore((s) => s.completeTask)
  const recall = useStore((s) => s.recallTask)
  const queues = groupBySidekick(tasks)
  const [open, setOpen] = useState(null)

  const active = open ? SIDEKICKS.find((s) => s.id === open) : null
  const queue = open ? queues[open] || [] : []
  const totalDeployed = Object.values(queues).reduce((n, q) => n + q.length, 0)

  return (
    <Panel
      label="The Bat-Family"
      title="Network Comms"
      instruction="SECURE CHANNEL: DELEGATE & TRACK"
      right={`${totalDeployed} DEPLOYED`}
      className="col-span-12 lg:col-span-4"
      accent="#1fb6b6"
    >
      <div className="grid grid-cols-5 gap-2">
        {SIDEKICKS.map((s) => {
          const Icon = ICONS[s.icon] || Bird
          const count = (queues[s.id] || []).length
          const isOpen = open === s.id
          return (
            <button
              key={s.id}
              onClick={() => setOpen(isOpen ? null : s.id)}
              title={`${s.name} — ${s.handle}`}
              className={`relative flex flex-col items-center gap-1 rounded border p-2 transition ${
                isOpen ? 'bg-bone/5' : 'border-rule hover:bg-bone/5'
              }`}
              style={{ borderColor: isOpen ? s.color : undefined }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border-2"
                style={{ borderColor: s.color, color: s.color, background: `${s.color}1a` }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-[9px] uppercase tracking-[0.08em] text-bone-dim">
                {s.name.split(' ')[0]}
              </span>
              {count > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full font-display text-[11px] font-bold text-void"
                  style={{ background: s.color }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="mb-2 flex items-baseline justify-between border-t border-rule pt-2.5">
              <span className="font-display text-[14px] font-semibold uppercase tracking-[0.08em]" style={{ color: active.color }}>
                {active.name}
              </span>
              <span className="font-display text-[10px] tracking-[0.2em] text-ash">{active.handle}</span>
            </div>
            {queue.length === 0 ? (
              <p className="py-4 text-center font-serif text-[13px] italic text-ash-dim">
                Standing by. No cases assigned.
              </p>
            ) : (
              <div className="space-y-1.5">
                {queue.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="flex items-center gap-2 rounded border border-rule px-2.5 py-2"
                    style={{ borderLeft: `3px solid ${active.color}` }}
                  >
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-bone">{t.title}</span>
                    <button
                      onClick={() => recall(t.id)}
                      title="Recall to your board"
                      className="flex h-8 w-8 items-center justify-center rounded text-ash transition hover:text-bone"
                    >
                      <Undo2 className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      onClick={() => complete(t.id)}
                      title="Report back (complete)"
                      className="flex h-8 w-8 items-center justify-center rounded border border-gold/50 text-gold transition hover:bg-gold/15"
                    >
                      <Check className="h-[18px] w-[18px]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {totalDeployed === 0 && !active && (
        <p className="mt-3 text-center font-serif text-[12.5px] italic text-ash-dim">
          No cases delegated. Use the Delegate action on any task.
        </p>
      )}
    </Panel>
  )
}
