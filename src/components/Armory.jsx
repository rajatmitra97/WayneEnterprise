/* ═══════════════════════════════════════════════════════════════════
   THE ARMORY — Wayne Tech gadget shop. Cards unfold transformer-style:
   a mechanical two-flap deploy, corner brackets snapping into place, a
   spark ring on purchase. Spend Wayne Coins, fill the utility belt.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Anchor, Send, Cloud, Flame, ScanEye, Zap, Bird, Car,
  Coins, Check, ChevronRight, Lock,
} from 'lucide-react'
import { useStore } from '../store'
import { GADGETS } from '../constants'
import Panel from './Panel'

const ICONS = { Anchor, Send, Cloud, Flame, ScanEye, Zap, Bird, Car }

function GadgetCard({ gadget, owned, affordable, onBuy }) {
  const [open, setOpen] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const Icon = ICONS[gadget.icon] || Anchor

  const buy = () => {
    const res = onBuy(gadget)
    if (res === 'ok') {
      setDeploying(true)
      setTimeout(() => setDeploying(false), 700)
    }
  }

  return (
    <motion.div layout className="relative">
      <motion.button
        layout
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        className={`hud-corners relative flex w-full items-center gap-3 border bg-void-card/70 px-3 py-2.5 text-left transition ${
          owned ? 'border-gold/50' : open ? 'border-hud/60' : 'border-rule hover:border-bone-dim'
        }`}
      >
        {/* spark ring on deploy */}
        {deploying && (
          <span
            className="pointer-events-none absolute left-7 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold"
            style={{ animation: 'spark-ring 0.6s ease-out forwards' }}
          />
        )}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center border ${deploying ? 'gadget-deploy' : ''}`}
          style={{ borderColor: owned ? '#D73423' : '#1d1d2a', color: owned ? '#D73423' : '#D62516' }}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[15px] font-semibold uppercase tracking-[0.04em] text-bone">
              {gadget.name}
            </span>
          </div>
          <div className="font-display text-[10px] tracking-[0.25em] text-ash">{gadget.class}</div>
        </div>
        {owned ? (
          <span className="flex items-center gap-1 font-display text-[11px] tracking-[0.15em] text-gold">
            <Check size={13} /> EQUIPPED
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-display text-[14px] font-bold tabular-nums text-gold">
            <Coins size={13} /> {gadget.cost}
            <ChevronRight size={14} className={`text-ash transition-transform ${open ? 'rotate-90' : ''}`} />
          </span>
        )}
      </motion.button>

      {/* transformer unfold */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ rotateX: -90, transformOrigin: 'top' }}
              animate={{ rotateX: 0 }}
              exit={{ rotateX: -90 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hud-scan mx-1 border-x border-b border-hud/25 bg-void/60 p-3"
              style={{ transformPerspective: 700 }}
            >
              <p className="font-mono text-[12px] leading-relaxed text-bone-dim">{gadget.desc}</p>
              <p className="mt-1.5 font-serif text-[13px] italic text-hud/80">“{gadget.perk}”</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-[10px] tracking-[0.2em] text-ash">WAYNE TECH · CLASSIFIED</span>
                {owned ? (
                  <span className="font-display text-[12px] tracking-[0.15em] text-gold">IN UTILITY BELT</span>
                ) : (
                  <button
                    onClick={buy}
                    disabled={!affordable}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-display text-[12px] font-semibold uppercase tracking-[0.15em] transition ${
                      affordable
                        ? 'btn-gold'
                        : 'cursor-not-allowed border border-rule text-ash'
                    }`}
                  >
                    {affordable ? <>DEPLOY · {gadget.cost} WC</> : <><Lock size={12} /> {gadget.cost} WC</>}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Armory() {
  const coins = useStore((s) => s.coins)
  const owned = useStore((s) => s.gadgets)
  const buyGadget = useStore((s) => s.buyGadget)

  return (
    <Panel
      label="XV · The Armory"
      title="The Armory"
      instruction="REQUISITION: SPEND WAYNE COINS"
      right={`${owned.length}/${GADGETS.length} · ${coins} WC`}
      className="col-span-12 lg:col-span-6"
      accent="#D62516"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {GADGETS.map((g) => (
          <GadgetCard
            key={g.id}
            gadget={g}
            owned={owned.includes(g.id)}
            affordable={coins >= g.cost}
            onBuy={buyGadget}
          />
        ))}
      </div>
    </Panel>
  )
}
