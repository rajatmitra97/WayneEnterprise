/* Billionaire Playboy Alibi Generator — the only way to clear a locked,
   critically overdue task. Pick your shame, issue the press release. */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Newspaper, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import { ALIBIS } from '../constants'

const randomAlibi = () => ALIBIS[Math.floor(Math.random() * ALIBIS.length)]

export default function AlibiModal({ task, onClose }) {
  const clearWithAlibi = useStore((s) => s.clearWithAlibi)
  const [alibi, setAlibi] = useState(randomAlibi)

  useEffect(() => {
    if (task) setAlibi(randomAlibi())
  }, [task])

  const issue = () => {
    clearWithAlibi(task.id)
    onClose()
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className="fixed inset-0 z-[7600] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-void/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="glass relative z-10 w-full max-w-lg p-6"
            style={{ borderColor: 'rgba(201,162,78,0.4)' }}
          >
            <span className="panel-label">Damage Control</span>
            <div className="mb-1 flex items-center gap-2 text-gold">
              <Newspaper size={18} />
              <h2 className="font-serif text-[21px]">Generate Alibi for the Press</h2>
            </div>
            <p className="mb-4 font-mono text-[12px] text-bone-dim">
              The case <span className="text-blood line-through">{task.title}</span> went critically
              overdue. Master Wayne cannot be seen to fail. A statement is required.
            </p>

            <div className="relative mb-5 border border-rule bg-void/60 p-4">
              <div className="mb-2 font-display text-[9px] tracking-[0.3em] text-ash">OFFICIAL STATEMENT</div>
              <p className="font-serif text-[18px] italic leading-snug text-bone">“{alibi}”</p>
              <button
                onClick={() => setAlibi(randomAlibi())}
                title="Spin another"
                className="absolute right-3 top-3 text-ash transition hover:text-gold"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="font-display text-[11px] tracking-[0.2em] text-ash hover:text-bone">
                NOT YET
              </button>
              <button onClick={issue} className="btn-gold text-[13px]">
                ISSUE PRESS RELEASE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
