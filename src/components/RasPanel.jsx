import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Skull } from 'lucide-react'
import { useStore } from '../store'
import { RAS_GENERIC, RAS_PRAISE } from '../constants'
import Panel from './Panel'

export default function RasPanel() {
  const streak = useStore((s) => s.streak)
  const failed = useStore((s) => s.failedCount)
  const open = useStore((s) => s.tasks.filter((t) => !t.done).length)

  // Ra's praises a strong streak, otherwise mocks — sharper with idle/failure.
  const pool = useMemo(() => {
    if (streak >= 3) return RAS_PRAISE
    const lines = [...RAS_GENERIC]
    if (open >= 3) lines.push(`You hold ${open} open cases. A man with a list is not a man.`)
    if (failed > 0) lines.push(`You have failed ${failed} times. I am keeping count. So is Gotham.`)
    return lines
  }, [streak, open, failed])

  const [i, setI] = useState(() => Math.floor(Math.random() * pool.length))
  const line = pool[i % pool.length]
  const praising = streak >= 3

  return (
    <Panel
      label="VII · The Demon's Head"
      title={<>Ra's <em className="not-italic font-light text-bone-dim">al Ghul</em></>}
      className="col-span-12 lg:col-span-6"
      accent="#8a2be2"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center border border-chaos/50 bg-chaos/10 text-chaos">
          <Skull size={22} />
        </div>
        <div>
          <div className="font-serif text-[14px] italic text-chaos">the Demon's Head</div>
          <div className="font-display text-[9px] tracking-[0.3em] text-ash">SENSEI · ANTAGONIST</div>
        </div>
      </div>

      <motion.div
        key={line}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[96px] border-l-2 bg-chaos/[0.04] px-4 py-3 font-serif text-[15.5px] italic leading-relaxed text-bone"
        style={{ borderColor: praising ? '#c9a24e' : '#8a2be2' }}
      >
        “{line}”
        <span className="mt-2 block font-display text-[9px] not-italic tracking-[0.3em] text-chaos">
          — RA'S AL GHUL
        </span>
      </motion.div>

      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setI((x) => x + 1)}
          className="font-display text-[10px] tracking-[0.2em] text-ash hover:text-chaos"
        >
          ▸ NEXT
        </button>
      </div>
    </Panel>
  )
}
