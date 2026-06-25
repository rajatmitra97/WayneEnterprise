/* Pick a patrol length, then drop into Detective Vision. */
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, X, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import { FOCUS_DURATIONS } from '../constants'

export default function FocusLauncher({ task, onClose }) {
  const startFocus = useStore((s) => s.startFocus)
  const begin = (ms) => {
    startFocus(task.id, ms)
    onClose()
  }
  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className="fixed inset-0 z-[7500] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-void/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="glass relative z-10 w-full max-w-md p-6"
            style={{ borderColor: 'rgba(90,170,230,0.45)' }}
          >
            <span className="panel-label" style={{ color: '#5aaae6' }}>Detective Vision</span>
            <button onClick={onClose} className="absolute right-4 top-4 text-ash hover:text-bone">
              <X size={16} />
            </button>
            <div className="mb-1 flex items-center gap-2" style={{ color: '#5aaae6' }}>
              <Eye size={18} />
              <h2 className="font-serif text-[20px]">Enter the crime scene</h2>
            </div>
            <p className="mb-4 font-mono text-[12px] text-bone-dim">{task.title}</p>

            <div className="grid grid-cols-3 gap-2">
              {FOCUS_DURATIONS.map((d) => (
                <button
                  key={d.ms}
                  onClick={() => begin(d.ms)}
                  className="border border-rule px-2 py-3 text-center font-display text-[12px] tracking-[0.12em] text-bone-dim transition hover:border-[#5aaae6] hover:text-[#9fd2f2]"
                >
                  {d.label}
                </button>
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 font-serif text-[12.5px] italic text-blood/90">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Leave this tab or abort early and the Joker skims your XP and coins. The world fades. Stay in it.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
