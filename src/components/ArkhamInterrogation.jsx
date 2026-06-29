/* ═══════════════════════════════════════════════════════════════════
   THE ARKHAM INTERROGATION — end-of-day reckoning.
   Fires at 23:30 (or when shutting down with unresolved failures). A
   stark, spotlit box: "You failed X today. Why?" Writing the debrief
   halves the Joker Chaos and files it to the Wayne Journal.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

export default function ArkhamInterrogation({ open, failCount, onClose }) {
  const submit = useStore((s) => s.submitInterrogation)
  const dismiss = useStore((s) => s.dismissInterrogation)
  const [text, setText] = useState('')

  const confess = () => {
    if (!text.trim()) return
    submit(text.trim(), failCount)
    setText('')
    onClose()
  }
  const refuse = () => {
    dismiss()
    setText('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9400] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* interrogation darkness + overhead spotlight */}
          <div className="absolute inset-0 bg-black/95" />
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.14), transparent 45%)' }} />

          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-lg text-center"
          >
            <div className="mb-2 font-display text-[12px] tracking-[0.4em] text-blood">ARKHAM INTERROGATION</div>
            <h2 className="mb-1 font-serif text-[30px] italic text-bone">
              You failed <span className="text-blood">{failCount}</span> {failCount === 1 ? 'case' : 'cases'} today.
            </h2>
            <p className="mb-6 font-serif text-[18px] italic text-bone-dim">Why?</p>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Confess. The only way out is through."
              className="w-full resize-none border-2 border-bone/20 bg-black/60 p-4 font-mono text-[15px] text-bone outline-none transition focus:border-blood"
              style={{ boxShadow: '0 0 40px -8px rgba(255,255,255,0.15)' }}
            />

            <div className="mt-5 flex items-center justify-center gap-4">
              <button onClick={refuse} className="font-display text-[11px] tracking-[0.2em] text-ash transition hover:text-bone-dim">
                REFUSE TO TALK
              </button>
              <button
                onClick={confess}
                disabled={!text.trim()}
                className="btn-gold px-6 text-[14px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                FILE DEBRIEF · HALVE THE CHAOS
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-ash">
              Writing the truth restores half your composure.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
