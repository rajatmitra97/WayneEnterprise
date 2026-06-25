/* The Lazarus Pit — a hidden green pixel at the foot of the OS.
   Grace for the overwhelmed: forgives penalties and wipes the slate,
   but burns a permanent scar into the Batcomputer's memory. */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'

export default function LazarusPit() {
  const lazarusReset = useStore((s) => s.lazarusReset)
  const scars = useStore((s) => s.lazarus.scars.length)
  const [phase, setPhase] = useState('idle') // idle | warn | boil

  const submerge = () => {
    setPhase('boil')
    setTimeout(() => {
      lazarusReset()
      setPhase('idle')
    }, 2600)
  }

  return (
    <>
      {/* the hidden pixel */}
      <button
        aria-label="Lazarus Pit"
        onClick={() => setPhase('warn')}
        className="fixed bottom-1 left-1/2 z-[20] h-[6px] w-[6px] -translate-x-1/2 rounded-full"
        style={{ background: '#1aff8c', boxShadow: '0 0 8px 2px rgba(26,255,140,0.7)' }}
        title=""
      />

      <AnimatePresence>
        {phase === 'warn' && (
          <motion.div
            className="fixed inset-0 z-[8500] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" onClick={() => setPhase('idle')} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass relative z-10 w-full max-w-md p-6 text-center"
              style={{ borderColor: 'rgba(26,255,140,0.5)', boxShadow: '0 0 40px -8px rgba(26,255,140,0.5)' }}
            >
              <div className="mb-2 font-display text-[12px] tracking-[0.35em]" style={{ color: '#1aff8c' }}>
                THE LAZARUS PIT
              </div>
              <p className="mb-2 font-serif text-[19px] italic text-bone">
                “Death is not an escape. Rebirth requires sacrifice.”
              </p>
              <p className="mb-5 font-mono text-[12px] leading-relaxed text-bone-dim">
                The Pit forgives all overdue penalties and wipes your open slate clean.
                But it leaves a permanent <span style={{ color: '#1aff8c' }}>scar</span> on your
                record. {scars > 0 && `You already carry ${scars}.`}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={submerge}
                  className="px-4 py-2 font-display text-[12px] tracking-[0.2em] text-void"
                  style={{ background: '#1aff8c' }}
                >
                  SUBMERGE
                </button>
                <button onClick={() => setPhase('idle')} className="font-display text-[12px] tracking-[0.2em] text-ash hover:text-bone">
                  REFUSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {phase === 'boil' && (
          <motion.div
            className="fixed inset-0 z-[9000] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ animation: 'lazarus-shake 0.25s linear infinite' }}
          >
            <div className="lazarus-fill absolute inset-0" style={{ animation: 'lazarus-boil 1.6s ease-out forwards' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1.1] }}
                transition={{ duration: 2.4, times: [0, 0.3, 0.7, 1] }}
                className="text-center"
              >
                <div className="font-display text-[14px] tracking-[0.4em] text-[#04130b]">REBIRTH</div>
                <div className="mt-2 font-serif text-[26px] italic text-[#04130b]">The slate is clean.</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
