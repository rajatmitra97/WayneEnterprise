/* ═══════════════════════════════════════════════════════════════════
   THE TACTICAL UTILITY BELT — functional drag-and-drop gadgets.
   Drag a gadget onto the world; on drop we read what's under the pointer
   (data-* attributes) and fire its effect.
     · Batarang  → pending low-threat slot → instant COMPLETE
     · Smoke      → a FAILED (red) slot → forgive, reset to PENDING
     · Sequencer  → the Gazette ad → hack & hide for 4 hours
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store'
import { GADGETS, GADGET_ASSETS, GADGET_TOOLS } from '../constants'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`

function GadgetIcon({ gadget }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return <span className="flex h-9 w-9 items-center justify-center font-display text-[22px] text-hud">{gadget.id === 'batarang' ? '➤' : '◆'}</span>
  }
  return <img src={asset(GADGET_ASSETS[gadget.id] || '')} alt={gadget.name} onError={() => setBroken(true)} className="pointer-events-none h-9 w-9 object-contain drop-shadow-2xl" />
}

export default function UtilityBelt() {
  const owned = useStore((s) => s.gadgets)
  const setTab = useStore((s) => s.setTab)
  const resolveDone = useStore((s) => s.resolveSlotDone)
  const smokeReset = useStore((s) => s.smokeResetSlot)
  const hackAd = useStore((s) => s.hackAd)
  const pushToast = useStore((s) => s.pushToast)

  const [hint, setHint] = useState(null) // tooltip gadget id
  const [slash, setSlash] = useState(null) // {x,y} success flash position

  const ownedGadgets = GADGETS.filter((g) => owned.includes(g.id))

  // resolve a drop: find a data-slot / data-ad element under the pointer
  const handleDrop = (gadgetId, point) => {
    const els = document.elementsFromPoint(point.x, point.y)
    const slotEl = els.find((el) => el.getAttribute && el.getAttribute('data-slot'))
    const adEl = els.find((el) => el.getAttribute && el.getAttribute('data-ad') === '1')
    const tool = GADGET_TOOLS[gadgetId]
    const flash = () => { setSlash({ x: point.x, y: point.y }); setTimeout(() => setSlash(null), 500) }

    if (gadgetId === 'batarang' && slotEl) {
      if (slotEl.getAttribute('data-state') === 'pending' && slotEl.getAttribute('data-low') === '1') {
        const [wd, mins] = slotEl.getAttribute('data-slot').split(':').map(Number)
        resolveDone(wd, mins); flash()
        pushToast('BATARANG', 'Sliced clean. Case closed.', 'gold'); return
      }
      pushToast('BATARANG', 'Only pending, low-threat cases can be sliced.', 'blood'); return
    }
    if (gadgetId === 'smoke' && slotEl) {
      if (slotEl.getAttribute('data-state') === 'failed') {
        const [wd, mins] = slotEl.getAttribute('data-slot').split(':').map(Number)
        smokeReset(wd, mins); flash(); return
      }
      pushToast('SMOKE PELLET', 'Smoke only forgives a FAILED slot.', 'blood'); return
    }
    if (gadgetId === 'optics' && adEl) { hackAd(); flash(); return }
    if (tool) pushToast(gadgetId.toUpperCase(), `Drop on: ${tool.target}.`, 'blood')
  }

  return (
    <>
      {/* success flash where a gadget landed */}
      <AnimatePresence>
        {slash && (
          <motion.div
            className="pointer-events-none fixed z-[8200]"
            style={{ left: slash.x, top: slash.y }}
            initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="-ml-6 -mt-6 h-12 w-12 rounded-full border-2 border-hud" style={{ boxShadow: '0 0 20px #ff3422' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[6200] flex justify-center pb-3">
        <motion.div layout className="glass hud-corners pointer-events-auto flex items-end gap-2.5 px-4 py-2.5" style={{ borderColor: 'rgba(214,37,22,0.4)' }}>
          <span className="mb-1 mr-1 font-display text-[10px] tracking-[0.25em] text-gotham-slate">// BELT</span>
          {ownedGadgets.length === 0 ? (
            <button onClick={() => setTab('cave')} className="px-2 py-3 font-serif text-[13px] italic text-ash-dim transition hover:text-bone">
              Empty — requisition gear in The Cave →
            </button>
          ) : (
            ownedGadgets.map((g) => {
              const tool = GADGET_TOOLS[g.id]
              return (
                <div key={g.id} className="relative">
                  {/* terminal tooltip */}
                  <AnimatePresence>
                    {hint === g.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        className="glass pointer-events-none absolute bottom-[64px] left-1/2 w-52 -translate-x-1/2 p-2"
                        style={{ borderColor: 'rgba(214,37,22,0.5)' }}
                      >
                        <div className="font-display text-[11px] font-semibold tracking-[0.12em] text-hud">{g.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] leading-tight text-bone-dim">{tool ? `DRAG → ${tool.target}` : g.desc}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    drag={!!tool}
                    dragSnapToOrigin
                    dragMomentum={false}
                    whileDrag={{ scale: 1.2, zIndex: 9000, cursor: 'grabbing' }}
                    onDragEnd={(e, info) => handleDrop(g.id, info.point)}
                    onHoverStart={() => setHint(g.id)}
                    onHoverEnd={() => setHint(null)}
                    whileHover={{ y: -6 }}
                    className={`relative flex h-14 w-14 items-center justify-center rounded-lg border bg-void-card/80 transition ${tool ? 'cursor-grab border-hud/40 hover:border-hud' : 'border-rule'}`}
                  >
                    <GadgetIcon gadget={g} />
                    {tool && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-void px-1.5 font-display text-[8px] tracking-[0.1em] text-hud">
                        {tool.verb}
                      </span>
                    )}
                  </motion.button>
                </div>
              )
            })
          )}
        </motion.div>
      </div>
    </>
  )
}
