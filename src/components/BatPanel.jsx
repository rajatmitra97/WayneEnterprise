/* ═══════════════════════════════════════════════════════════════════
   BatPanel — the cinematic centerpiece of the OS.
   Three parallax layers (Empire / Machine / Body) whose imagery swaps
   as you climb tiers 1–5. Subtle 3D mouse-tracking via Framer Motion
   motion values; dramatic AnimatePresence swap on level-up; CRT scanlines.
   ═══════════════════════════════════════════════════════════════════ */
import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useStore, selectTiers } from '../store'

// Resolve through Vite's base so assets work in dev AND on GitHub Pages.
const asset = (p) => `${import.meta.env.BASE_URL}${p}`

// Per-image fallback so the panel looks intentional before the 15 composites
// are dropped into /public/assets. Renders a labelled gradient instead.
function LayerImage({ src, label, accent, fit }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${accent}33, transparent 60%), linear-gradient(160deg,#0a0a12,#050507)`,
        }}
      >
        <span className="mb-6 font-display text-[12px] tracking-[0.4em]" style={{ color: `${accent}aa` }}>
          {label}
        </span>
      </div>
    )
  }
  // Empire = cover (full-frame backdrop). Machine/Body = contain, floor-anchored,
  // so the whole subject fits inside the panel and the backdrop shows behind it.
  return (
    <img
      src={src}
      alt={label}
      onError={() => setBroken(true)}
      className={`absolute inset-0 h-full w-full ${
        fit === 'contain' ? 'object-contain object-bottom' : 'object-cover object-center'
      }`}
      draggable={false}
    />
  )
}

// One parallax plane: applies its own depth offset, swaps image on level change.
function ParallaxLayer({ src, level, x, y, scale, z, label, accent, slideFrom, fit }) {
  return (
    <motion.div className="absolute inset-0" style={{ x, y, scale, zIndex: z }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${label}-${level}`}
          initial={{ opacity: 0, x: slideFrom, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -slideFrom * 0.6, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <LayerImage src={src} label={label} accent={accent} fit={fit} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default function BatPanel() {
  const ref = useRef(null)
  // select the stable sectors reference, then derive tiers locally — avoids
  // re-rendering on unrelated store changes (toasts, focus, etc.).
  const sectors = useStore((s) => s.sectors)
  const { empireLevel, machineLevel, bodyLevel } = selectTiers({ sectors })

  // raw pointer position, -0.5 … 0.5 within the panel
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  // smooth it — heavy, deliberate motion
  const sx = useSpring(px, { stiffness: 90, damping: 22 })
  const sy = useSpring(py, { stiffness: 90, damping: 22 })

  // Each layer shifts at a different magnitude (deeper = less, foreground = more).
  const bgX = useTransform(sx, [-0.5, 0.5], [14, -14])
  const bgY = useTransform(sy, [-0.5, 0.5], [10, -10])
  const midX = useTransform(sx, [-0.5, 0.5], [28, -28])
  const midY = useTransform(sy, [-0.5, 0.5], [20, -20])
  const fgX = useTransform(sx, [-0.5, 0.5], [48, -48])
  const fgY = useTransform(sy, [-0.5, 0.5], [34, -34])
  // a faint counter-tilt on the whole frame for depth
  const rotX = useTransform(sy, [-0.5, 0.5], [4, -4])
  const rotY = useTransform(sx, [-0.5, 0.5], [-5, 5])

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div className="col-span-12 flex justify-center">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
        className="glass relative h-80 w-full max-w-4xl overflow-hidden rounded-xl border-white/5"
      >
        {/* deep vignette base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06060b] to-[#020204]" />

        {/* Empire: full-frame cover backdrop (slight overscan for parallax). */}
        <ParallaxLayer
          src={asset(`assets/empire/level-${empireLevel}.jpg`)}
          level={empireLevel} x={bgX} y={bgY} scale={1.12} z={0}
          label="EMPIRE" accent="#D73423" slideFrom={40} fit="cover"
        />
        {/* Machine: contained, floor-anchored so the vehicle fits, backdrop visible. */}
        <ParallaxLayer
          src={asset(`assets/machine/level-${machineLevel}.png`)}
          level={machineLevel} x={midX} y={midY} scale={1.0} z={10}
          label="MACHINE" accent="#c0392b" slideFrom={70} fit="contain"
        />
        {/* Body: contained foreground hero, fits fully within the panel. */}
        <ParallaxLayer
          src={asset(`assets/body/level-${bodyLevel}.png`)}
          level={bodyLevel} x={fgX} y={fgY} scale={1.02} z={20}
          label="BODY" accent="#D62516" slideFrom={100} fit="contain"
        />

        {/* edge darkening so parallax never reveals a hard border */}
        <div className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_120px_40px_rgba(2,2,4,0.95)]" />

        {/* CRT scanlines + flicker */}
        <div className="batpanel-scanlines pointer-events-none absolute inset-0 z-40" />
        <div className="pointer-events-none absolute inset-0 z-40 animate-flicker bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,160,255,0.05),transparent_55%)]" />

        {/* HUD readout */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between p-4">
          <div className="font-display text-[11px] tracking-[0.3em] text-bone-dim">
            WAYNE OS · LIVE COMPOSITE
          </div>
          <div className="flex gap-4">
            {[
              { l: 'EMPIRE', v: empireLevel, c: '#D73423' },
              { l: 'MACHINE', v: machineLevel, c: '#c0392b' },
              { l: 'BODY', v: bodyLevel, c: '#D62516' },
            ].map((t) => (
              <div key={t.l} className="text-right">
                <div className="font-display text-[9px] tracking-[0.3em] text-ash">{t.l}</div>
                <div className="font-display text-[18px] leading-none" style={{ color: t.c }}>
                  {t.v}<span className="text-[10px] text-ash">/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* corner ticks */}
        <Corner className="left-2 top-2 border-l border-t" />
        <Corner className="right-2 top-2 border-r border-t" />
        <Corner className="bottom-2 left-2 border-b border-l" />
        <Corner className="bottom-2 right-2 border-b border-r" />
      </motion.div>
    </div>
  )
}

function Corner({ className }) {
  return <span className={`pointer-events-none absolute z-50 h-3.5 w-3.5 border-bone/30 ${className}`} />
}
