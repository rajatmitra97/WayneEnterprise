/* ═══════════════════════════════════════════════════════════════════
   THE UTILITY BELT — persistent bottom dock of owned gadgets.
   Gadgets bought in the Armory live here as isometric PNGs. Arm the
   Batarang and the cursor becomes a crosshair: click a low-level case
   to slice it instantly (handled in TaskItem).
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { GADGETS, GADGET_ASSETS } from '../constants'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`

function GadgetSlot({ gadget, active, onClick }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.8 }}
      whileHover={{ y: -6, scale: 1.08 }}
      onClick={onClick}
      title={`${gadget.name}${gadget.id === 'batarang' ? ' — arm to slice a low-level case' : ''}`}
      className={`relative flex h-14 w-14 items-center justify-center rounded-lg border transition ${
        active ? 'border-hud bg-hud/15' : 'border-rule bg-void-card/80 hover:border-bone-dim'
      }`}
      style={active ? { boxShadow: '0 0 18px -2px rgba(214,37,22,0.7)' } : undefined}
    >
      <GadgetIcon gadget={gadget} />
      {gadget.id === 'batarang' && (
        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 font-display text-[8px] tracking-[0.1em] ${active ? 'bg-hud text-void' : 'bg-void text-ash'}`}>
          {active ? 'ARMED' : 'ARM'}
        </span>
      )}
    </motion.button>
  )
}

// PNG: /public/assets/gadgets/<id>.png — isometric render, with glyph fallback.
function GadgetIcon({ gadget }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <span className="flex h-9 w-9 items-center justify-center font-display text-[22px] text-hud">
        {gadget.id === 'batarang' ? '➤' : '◆'}
      </span>
    )
  }
  return (
    <img
      src={asset(GADGET_ASSETS[gadget.id] || '')}
      alt={gadget.name}
      onError={() => setBroken(true)}
      className="h-9 w-9 object-contain drop-shadow-2xl"
    />
  )
}

export default function UtilityBelt() {
  const owned = useStore((s) => s.gadgets)
  const beltActive = useStore((s) => s.beltActive)
  const setBeltActive = useStore((s) => s.setBeltActive)
  const setTab = useStore((s) => s.setTab)

  const ownedGadgets = GADGETS.filter((g) => owned.includes(g.id))

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[6200] flex justify-center pb-3">
      <motion.div
        layout
        className="glass hud-corners pointer-events-auto flex items-end gap-2.5 px-4 py-2.5"
        style={{ borderColor: 'rgba(214,37,22,0.4)' }}
      >
        <span className="mb-1 mr-1 font-display text-[10px] tracking-[0.25em] text-gotham-slate">// BELT</span>
        <AnimatePresence mode="popLayout">
          {ownedGadgets.length === 0 ? (
            <button
              onClick={() => setTab('cave')}
              className="pointer-events-auto px-2 py-3 font-serif text-[13px] italic text-ash-dim transition hover:text-bone"
            >
              Empty — requisition gear in The Cave →
            </button>
          ) : (
            ownedGadgets.map((g) => (
              <div key={g.id} className="relative">
                <GadgetSlot gadget={g} active={beltActive === g.id} onClick={() => g.id === 'batarang' ? setBeltActive('batarang') : null} />
                {/* glyph fallback overlay (shown if PNG missing) */}
                <span className="glyph-fb pointer-events-none absolute inset-0 hidden items-center justify-center font-display text-[20px] text-hud">
                  {g.id === 'batarang' ? '➤' : '◆'}
                </span>
              </div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
