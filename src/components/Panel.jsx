/* Reusable tactical-console panel: glass surface, HUD corner brackets,
   a faint cyan scan sweep, and an engraved section label. */
import { motion } from 'framer-motion'

export default function Panel({ label, title, right, children, className = '', accent, instruction }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`glass hud-corners flex flex-col p-5 ${className}`}
      style={accent ? { borderColor: `${accent}55` } : undefined}
    >
      {/* clipped sweep layer — keeps the scan line inside the rounded frame
          without clipping the engraved label that floats above the border */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
        <div className="hud-sweep animate-scan-sweep" />
      </div>
      {label && <span className="panel-label">{label}</span>}
      {/* Directive 3 — Batcomputer terminal micro-copy */}
      {instruction && (
        <div className="mb-2 font-display text-xs uppercase tracking-widest text-gotham-slate">
          // {instruction}
        </div>
      )}
      {title && (
        <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2.5">
          <h2 className="font-display text-[24px] font-semibold uppercase tracking-[0.04em] text-bone">
            {title}
          </h2>
          {right && (
            <span className="font-display text-[13px] uppercase tracking-[0.2em] text-hud">
              {right}
            </span>
          )}
        </div>
      )}
      {children}
    </motion.section>
  )
}
