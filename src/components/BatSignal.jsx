import { motion } from 'framer-motion'
import { useStore } from '../store'
import { THREAT, SECTORS } from '../constants'
import Panel from './Panel'

export default function BatSignal() {
  const signal = useStore((s) => s.signal)
  const tasks = useStore((s) => s.tasks)
  const task = signal ? tasks.find((t) => t.id === signal.taskId) : null

  return (
    <Panel
      label="XI · The Bat-Signal"
      title={<>The <em className="not-italic font-light text-bone-dim">Signal</em></>}
      className="col-span-12 lg:col-span-6"
    >
      <div className="relative mb-3 flex h-[120px] items-center justify-center overflow-hidden rounded border border-ash-dim/60 bg-gradient-to-b from-[#0a0815] to-[#050308]">
        {task ? (
          <motion.svg
            viewBox="0 0 120 70"
            className="w-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <ellipse cx="60" cy="35" rx="52" ry="30" fill="rgba(201,162,78,0.12)" />
            <path
              d="M60 18c-4 0-6 4-7 8-5-7-14-10-23-9 4 4 5 8 4 13-6-3-14-1-19 4 8 0 11 4 13 9 2 9 14 17 32 17s30-8 32-17c1-5 5-9 13-9-5-5-13-7-19-4-1-5 0-9 4-13-9-1-18 2-23 9-1-4-3-8-7-8z"
              fill="#D73423"
            />
          </motion.svg>
        ) : (
          <span className="font-serif text-[14px] italic text-ash-dim">— quiet night —</span>
        )}
      </div>

      {task ? (
        <>
          <div className="mb-1 font-serif text-[16px] italic leading-snug text-gold">{task.title}</div>
          <div className="font-display text-[10px] uppercase tracking-[0.25em] text-ash">
            {SECTORS[task.sector]?.name} · {THREAT[task.threat].tag} · 3× XP
          </div>
        </>
      ) : (
        <>
          <div className="mb-1 font-serif text-[15px] italic text-ash-dim">no priority target.</div>
          <div className="font-display text-[10px] tracking-[0.25em] text-ash">
            LIGHT THE SIGNAL FROM ANY CASE
          </div>
        </>
      )}
    </Panel>
  )
}
