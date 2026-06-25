/* The Alfred Protocol — in-app toast stack. Browser notifications are
   fired from the store; these are the on-screen, framed messages. */
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ShieldAlert, Coins, X, Radio } from 'lucide-react'
import { useStore } from '../store'

const TONES = {
  gold: { border: 'border-gold/70', label: 'text-gold', icon: Bell, glow: 'shadow-gold' },
  blood: { border: 'border-blood/70', label: 'text-blood', icon: ShieldAlert, glow: 'shadow-arkham' },
  chaos: { border: 'border-chaos/70', label: 'text-chaos', icon: Coins, glow: '' },
  hud: { border: 'border-hud/70', label: 'text-hud', icon: Radio, glow: '' },
}

export default function AlfredToaster() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)

  return (
    <div className="fixed top-5 right-5 z-[6000] flex w-[340px] max-w-[88vw] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONES[t.tone] || TONES.gold
          const Icon = tone.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`glass ${tone.border} ${tone.glow} flex items-start gap-3 px-4 py-3`}
            >
              <Icon size={16} className={`mt-0.5 shrink-0 ${tone.label}`} />
              <div className="min-w-0 flex-1">
                <div className={`font-display text-[10px] uppercase tracking-[0.3em] ${tone.label}`}>
                  {t.label}
                </div>
                <div className="mt-0.5 font-serif text-[15px] italic leading-snug text-bone">
                  {t.text}
                </div>
              </div>
              <button onClick={() => dismiss(t.id)} className="text-ash transition hover:text-bone">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
