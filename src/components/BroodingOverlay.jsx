/* ═══════════════════════════════════════════════════════════════════
   Brooding Mode — after 3 minutes idle, the OS dims and broods.
   Rain falls. An overly-edgy inner monologue types itself out.
   The first flicker of the mouse shatters it like glass.
   `active` and `onExit` are driven by the idle watcher in App.jsx.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BROODING_QUOTES } from '../constants'

// shard geometry for the glass-shatter exit
const SHARDS = [
  'polygon(0 0, 38% 0, 22% 46%, 0 64%)',
  'polygon(38% 0, 100% 0, 70% 40%, 22% 46%)',
  'polygon(100% 0, 100% 52%, 70% 40%)',
  'polygon(0 64%, 22% 46%, 52% 78%, 30% 100%, 0 100%)',
  'polygon(22% 46%, 70% 40%, 100% 52%, 78% 100%, 52% 78%)',
  'polygon(100% 52%, 100% 100%, 78% 100%)',
  'polygon(30% 100%, 52% 78%, 78% 100%)',
]

function Typewriter({ text }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const t = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(t)
          return v
        }
        return v + 1
      })
    }, 45) // slow, deliberate
    return () => clearInterval(t)
  }, [text])
  return (
    <span>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block w-2 animate-flicker text-bone/70">▍</span>
    </span>
  )
}

export default function BroodingOverlay({ active, onExit }) {
  const quote = useMemo(
    () => BROODING_QUOTES[Math.floor(Math.random() * BROODING_QUOTES.length)],
    // pick a fresh quote each activation
    [active]
  )

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="brood"
          className="fixed inset-0 z-[8800] overflow-hidden"
          // moving the mouse (or any pointer move) exits — handled in App,
          // but we also catch it here for immediacy.
          onMouseMove={onExit}
          onPointerDown={onExit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* the dimming veil — drops the OS to ~20% brightness */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
          <div className="brood-rain" />

          {/* monologue */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-2xl text-center"
            >
              <div className="mb-4 font-display text-[11px] tracking-[0.45em] text-ash">
                — BROODING —
              </div>
              <p className="font-serif text-[26px] italic leading-relaxed text-bone md:text-[32px]">
                “<Typewriter text={quote} />”
              </p>
              <div className="mt-8 font-display text-[10px] tracking-[0.35em] text-ash-dim">
                MOVE TO RETURN TO THE NIGHT
              </div>
            </motion.div>
          </div>

          {/* glass-shatter exit: shards only become visible on exit */}
          <div className="pointer-events-none absolute inset-0">
            {SHARDS.map((clip, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 bg-black"
                style={{ clipPath: clip, WebkitClipPath: clip }}
                initial={{ opacity: 0 }}
                exit={{
                  opacity: [0.9, 0],
                  x: (i % 2 ? 1 : -1) * (60 + i * 26),
                  y: 40 + i * 30,
                  rotate: (i % 2 ? 1 : -1) * (16 + i * 4),
                }}
                transition={{ duration: 0.55, ease: 'easeIn' }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
