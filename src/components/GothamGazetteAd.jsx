/* ═══════════════════════════════════════════════════════════════════
   GOTHAM GAZETTE — immersive ad surface (Directive 5).
   A hacked digital billboard inside the Batcomputer. Wraps a standard
   Google AdSense <ins> slot; until a publisher id is configured it shows
   an in-world placeholder so nothing breaks. The Cryptographic Sequencer
   gadget can hack it dark for 4 hours (data-ad="1" drop target).
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Radio, Lock } from 'lucide-react'
import { useStore } from '../store'
import { GAZETTE_HEADERS } from '../constants'

// Set these once you have an AdSense account; left blank → safe placeholder.
const ADSENSE_CLIENT = '' // e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
const ADSENSE_SLOT = '' // e.g. '1234567890'

export default function GothamGazetteAd({ className = '' }) {
  const adHackedUntil = useStore((s) => s.adHackedUntil)
  const insRef = useRef(null)
  const header = useMemo(() => GAZETTE_HEADERS[Math.floor(Math.random() * GAZETTE_HEADERS.length)], [])
  const [, tick] = useState(0)

  const hacked = Date.now() < adHackedUntil
  const live = ADSENSE_CLIENT && ADSENSE_SLOT

  // keep the "hacked" countdown fresh
  useEffect(() => {
    if (!hacked) return
    const t = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [hacked])

  // push the AdSense slot once mounted (only if configured)
  useEffect(() => {
    if (!live || hacked) return
    try {
      // eslint-disable-next-line no-undef
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      /* adsense not loaded — placeholder remains */
    }
  }, [live, hacked])

  const remainingH = Math.ceil((adHackedUntil - Date.now()) / 3600000)

  return (
    <div data-ad="1" className={`hud-corners relative overflow-hidden rounded-lg border ${className}`} style={{ borderColor: 'rgba(214,37,22,0.5)', boxShadow: '0 0 22px -6px rgba(255,52,34,0.5)' }}>
      {/* billboard header */}
      <div className="flex items-center gap-2 border-b border-hud/25 bg-void/80 px-3 py-1.5">
        <Radio className="h-3.5 w-3.5 animate-hud-pulse text-hud" />
        <span className="truncate font-display text-[10px] tracking-[0.18em] text-hud">{header}</span>
      </div>

      {/* scanlines */}
      <div className="batpanel-scanlines pointer-events-none absolute inset-0 z-10 opacity-30" />

      <AnimatePresence mode="wait">
        {hacked ? (
          <motion.div
            key="hacked"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex min-h-[120px] flex-col items-center justify-center gap-2 bg-black p-4 text-center"
          >
            <Lock className="h-6 w-6 text-acid" />
            <div className="font-display text-[12px] tracking-[0.25em] text-acid">SIGNAL HIJACKED</div>
            <div className="font-mono text-[11px] text-ash">Broadcast dark for ~{Math.max(1, remainingH)}h. Sequencer engaged.</div>
          </motion.div>
        ) : live ? (
          <ins
            key="live"
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: 120, background: '#0c0303' }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={ADSENSE_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex min-h-[120px] flex-col items-center justify-center gap-1 p-4 text-center"
            style={{ background: 'radial-gradient(circle at 50% 30%, #1f0606, #0c0303 70%)' }}
          >
            <div className="font-serif text-[16px] italic text-bone-dim">“The night is darkest just before the dawn.”</div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-ash">AD SLOT · WAYNE ENTERPRISES SPONSOR NETWORK</div>
            <div className="mt-1 font-mono text-[9px] text-ash-dim">drag the Sequencer here to hack the feed</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
