/* Reusable glassmorphism panel with the engraved corner label. */
import { motion } from 'framer-motion'

export default function Panel({ label, title, right, children, className = '', accent }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`glass flex flex-col p-5 ${className}`}
      style={accent ? { borderColor: `${accent}55` } : undefined}
    >
      {label && <span className="panel-label">{label}</span>}
      {title && (
        <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-2.5">
          <h2 className="font-serif text-[22px] text-bone">{title}</h2>
          {right && (
            <span className="font-display text-[12px] uppercase tracking-[0.2em] text-ash">
              {right}
            </span>
          )}
        </div>
      )}
      {children}
    </motion.section>
  )
}
