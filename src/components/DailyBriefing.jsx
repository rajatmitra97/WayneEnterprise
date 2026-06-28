/* ═══════════════════════════════════════════════════════════════════
   THE DAILY ALFRED BRIEFING — the retention loop.
   Fires once per calendar day. Alfred recaps yesterday, flags today's
   top target, and hands over a daily login commendation (+Wayne Coins).
   ═══════════════════════════════════════════════════════════════════ */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, sortByThreat, todayKey } from '../store'
import { DAILY_LOGIN_BONUS, ALFRED_BRIEF_OPEN, THREAT } from '../constants'

const asset = (p) => `${import.meta.env.BASE_URL}${p}`
const pick = (a) => a[Math.floor(Math.random() * a.length)]

export default function DailyBriefing() {
  const lastLoginDate = useStore((s) => s.lastLoginDate)
  const claim = useStore((s) => s.claimDailyBonus)
  const tasks = useStore((s) => s.tasks)
  const log = useStore((s) => s.completionLog)
  const streak = useStore((s) => s.streak)

  const [dismissed, setDismissed] = useState(false)
  const [brokenImg, setBrokenImg] = useState(false)
  const show = lastLoginDate !== todayKey() && !dismissed

  // yesterday's output + today's priority
  const { yesterdayCount, priority, greeting } = useMemo(() => {
    const y = new Date(); y.setDate(y.getDate() - 1)
    const yKey = y.toISOString().slice(0, 10)
    const yEntry = log.find((d) => d.date === yKey)
    const top = sortByThreat(tasks.filter((t) => !t.done && !t.assignedTo))[0]
    return { yesterdayCount: yEntry?.count || 0, priority: top, greeting: pick(ALFRED_BRIEF_OPEN) }
  }, [log, tasks])

  const accept = () => { claim(); setDismissed(true) }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-void/85 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.9, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="glass hud-corners relative z-10 w-full max-w-lg overflow-hidden p-0"
          >
            <div className="flex items-center gap-4 border-b border-rule px-6 py-5">
              {/* PNG: Alfred portrait → /public/assets/alfred-avatar.png */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold/60 bg-void-card">
                {brokenImg ? (
                  <div className="flex h-full w-full items-center justify-center font-serif text-2xl italic text-gold">A</div>
                ) : (
                  <img src={asset('assets/alfred-avatar.png')} alt="Alfred" onError={() => setBrokenImg(true)} className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <div className="font-display text-[11px] tracking-[0.3em] text-gold">ALFRED PENNYWORTH</div>
                <div className="font-serif text-[20px] italic text-bone">The Daily Briefing</div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="font-serif text-[17px] italic leading-relaxed text-bone">“{greeting}”</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-rule bg-void/50 p-3">
                  <div className="font-display text-[9px] tracking-[0.25em] text-ash">YESTERDAY</div>
                  <div className="font-display text-[26px] font-bold text-gold">{yesterdayCount}<span className="ml-1 text-[11px] text-ash">closed</span></div>
                </div>
                <div className="rounded border border-rule bg-void/50 p-3">
                  <div className="font-display text-[9px] tracking-[0.25em] text-ash">PATROL STREAK</div>
                  <div className="font-display text-[26px] font-bold text-gold">{streak}<span className="ml-1 text-[11px] text-ash">nights</span></div>
                </div>
              </div>

              <div className="rounded border border-rule bg-void/50 p-3">
                <div className="mb-1 font-display text-[9px] tracking-[0.25em] text-ash">TODAY'S PRIORITY TARGET</div>
                {priority ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate font-mono text-[14px] text-bone">{priority.title}</span>
                    <span className="shrink-0 font-display text-[10px] tracking-[0.12em]" style={{ color: THREAT[priority.threat].color }}>
                      {THREAT[priority.threat].tag}
                    </span>
                  </div>
                ) : (
                  <span className="font-serif text-[14px] italic text-ash">A clean board, sir. Define a new objective.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-rule px-6 py-4">
              <span className="font-display text-[11px] tracking-[0.2em] text-gold">+ {DAILY_LOGIN_BONUS} WAYNE COINS</span>
              <button onClick={accept} className="btn-gold text-[14px]">ACCEPT BRIEFING</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
