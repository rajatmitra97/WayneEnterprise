/* The Cowl Toggle — heavy skeuomorphic switch enforcing the boundary
   between Bruce Wayne (public/admin) and The Batman (deep work/violence). */
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { MODES } from '../constants'

export default function CowlToggle() {
  const mode = useStore((s) => s.mode)
  const toggle = useStore((s) => s.toggleMode)
  const isBat = mode === 'batman'
  const m = MODES[mode]

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={toggle}
        aria-label="Toggle identity"
        className="group relative h-[34px] w-[160px] overflow-hidden rounded-full border transition-colors duration-500"
        style={{
          borderColor: isBat ? '#2a2a36' : '#d9c79a',
          background: isBat
            ? 'linear-gradient(180deg,#0b0b12,#05050a)'
            : 'linear-gradient(180deg,#efe7d2,#cdbf9c)',
          boxShadow: isBat
            ? 'inset 0 2px 6px rgba(0,0,0,0.9), 0 0 14px -6px #D62516'
            : 'inset 0 2px 6px rgba(255,255,255,0.5), 0 0 16px -6px #D73423',
        }}
      >
        {/* track labels */}
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 font-display text-[11px] tracking-[0.15em] transition-opacity"
          style={{ color: '#05050a', opacity: isBat ? 0 : 0.8 }}
        >
          WAYNE
        </span>
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-[11px] tracking-[0.15em] transition-opacity"
          style={{ color: '#D62516', opacity: isBat ? 0.9 : 0 }}
        >
          BATMAN
        </span>

        {/* sliding knob */}
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className="absolute top-1/2 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full text-[14px]"
          style={{
            left: isBat ? 'calc(100% - 30px)' : '4px',
            background: isBat
              ? 'radial-gradient(circle at 35% 30%, #2a2a36, #050509)'
              : 'radial-gradient(circle at 35% 30%, #fff8e6, #D73423)',
            boxShadow: isBat ? '0 2px 6px rgba(0,0,0,0.8)' : '0 2px 6px rgba(0,0,0,0.4)',
            color: isBat ? '#D62516' : '#05050a',
          }}
        >
          {isBat ? '🦇' : '$'}
        </motion.span>
      </button>

      <div className="text-center">
        <div
          className="font-display text-[12px] tracking-[0.32em]"
          style={{ color: m.accent }}
        >
          {m.label}
        </div>
        <div className="font-serif text-[10.5px] italic text-ash">{m.sub}</div>
      </div>
    </div>
  )
}
