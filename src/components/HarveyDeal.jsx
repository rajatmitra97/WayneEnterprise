/* ═══════════════════════════════════════════════════════════════════
   HARVEY'S DEAL — replaces the Two-Face coin flip.
   When a 7-night streak shatters, Harvey doesn't flip a coin: he offers a
   choice. Take the scar now, or bet tonight on it — close the target
   number of cases and walk away clean, miss and pay double. Unanswered by
   the next night, he takes the scar himself. While a bet is live, a small
   tracker shows tonight's count.
   ═══════════════════════════════════════════════════════════════════ */
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, todayKey } from '../store'
import { HARVEY_DEAL } from '../constants'

export default function HarveyDeal() {
  const deal = useStore((s) => s.harveyDeal)
  const closedTonight = useStore((s) => s.completionLog.find((d) => d.date === todayKey())?.count || 0)
  const acceptScar = useStore((s) => s.acceptScar)
  const takeDeal = useStore((s) => s.takeHarveyDeal)

  const offered = deal?.state === 'offered'
  const betLive = deal?.state === 'accepted' && deal.date === todayKey()

  return (
    <>
      <AnimatePresence>
        {offered && (
          <motion.div
            className="fixed inset-0 z-[9200] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-void/88 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="glass hud-corners relative z-10 w-full max-w-lg p-6"
              style={{ borderColor: 'rgba(138,43,226,0.5)' }}
            >
              <div className="mb-1 font-display text-[13px] font-semibold tracking-[0.4em] text-chaos">HARVEY'S DEAL</div>
              <p className="mb-5 font-serif text-[17px] italic leading-relaxed text-bone">
                “A seven-night streak, broken. I don't flip for men like you anymore. You choose.”
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={acceptScar}
                  className="border border-rule p-4 text-left transition hover:border-bone-dim hover:bg-bone/5"
                >
                  <div className="font-display text-[14px] font-semibold tracking-[0.1em] text-bone">TAKE THE SCAR</div>
                  <div className="mt-1 font-mono text-[12px] text-bone-dim">
                    −{HARVEY_DEAL.scarXp} XP and −{HARVEY_DEAL.scarCoins} WC now. Start clean tonight.
                  </div>
                </button>
                <button
                  onClick={takeDeal}
                  className="border border-chaos/60 bg-chaos/10 p-4 text-left transition hover:bg-chaos/20"
                >
                  <div className="font-display text-[14px] font-semibold tracking-[0.1em] text-chaos">DOUBLE OR NOTHING</div>
                  <div className="mt-1 font-mono text-[12px] text-bone-dim">
                    Close {HARVEY_DEAL.target} cases tonight and lose nothing. Miss, and pay −{HARVEY_DEAL.scarXp * 2} XP, −{HARVEY_DEAL.scarCoins * 2} WC.
                  </div>
                </button>
              </div>
              <p className="mt-4 font-serif text-[12.5px] italic text-ash">
                No answer by the next night, and Harvey takes the scar himself.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* live bet tracker */}
      {betLive && (
        <div className="glass fixed bottom-3 right-4 z-[6100] flex items-center gap-2 px-3 py-2" style={{ borderColor: 'rgba(138,43,226,0.5)' }}>
          <span className="font-display text-[10px] tracking-[0.25em] text-chaos">HARVEY'S DEAL</span>
          <span className="font-display text-[15px] font-bold text-bone">
            {Math.min(closedTonight, HARVEY_DEAL.target)}/{HARVEY_DEAL.target}
          </span>
          <span className="font-mono text-[11px] text-ash">closed tonight</span>
        </div>
      )}
    </>
  )
}
