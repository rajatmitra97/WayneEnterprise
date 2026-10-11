/* Oracle comms — the on-screen half of the single alert queue (see
   pushToast in the store). Exactly one message is shown at a time: the head
   of the queue. It leaves after TOAST_MS (or on ×), and the next one in
   priority order takes its place. */
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ShieldAlert, Coins, X, Radio } from 'lucide-react'
import { useStore } from '../store'
import { TOAST_MS } from '../constants'

const TONES = {
  gold: { border: 'border-gold/70', label: 'text-gold', icon: Bell, glow: 'shadow-gold' },
  blood: { border: 'border-blood/70', label: 'text-blood', icon: ShieldAlert, glow: 'shadow-arkham' },
  chaos: { border: 'border-chaos/70', label: 'text-chaos', icon: Coins, glow: '' },
  hud: { border: 'border-hud/70', label: 'text-hud', icon: Radio, glow: '' },
}

export default function AlfredToaster() {
  const head = useStore((s) => s.toasts[0])
  const waiting = useStore((s) => Math.max(0, s.toasts.length - 1))
  const dismiss = useStore((s) => s.dismissToast)

  // the head's clock only starts once it is actually on screen
  useEffect(() => {
    if (!head) return
    const t = setTimeout(() => dismiss(head.id), TOAST_MS)
    return () => clearTimeout(t)
  }, [head, dismiss])

  const tone = head ? TONES[head.tone] || TONES.gold : null
  const Icon = tone?.icon

  return (
    <div className="pointer-events-none fixed right-5 top-24 z-[6000] w-[340px] max-w-[88vw]">
      <AnimatePresence mode="wait">
        {head && (
          <motion.div
            key={head.id}
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`glass pointer-events-auto ${tone.border} ${tone.glow} flex items-start gap-3 px-4 py-3`}
          >
            <Icon size={16} className={`mt-0.5 shrink-0 ${tone.label}`} />
            <div className="min-w-0 flex-1">
              <div className={`flex items-center justify-between font-display text-[10px] uppercase tracking-[0.3em] ${tone.label}`}>
                <span>{head.label}</span>
                {waiting > 0 && <span className="tracking-[0.15em] text-ash">+{waiting}</span>}
              </div>
              <div className="mt-0.5 font-serif text-[15px] italic leading-snug text-bone">{head.text}</div>
            </div>
            <button onClick={() => dismiss(head.id)} className="text-ash transition hover:text-bone" aria-label="Dismiss">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
