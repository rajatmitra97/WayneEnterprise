/* ═══════════════════════════════════════════════════════════════════
   THE MAINFRAME UPLINK — left navigation rail.
   Vantablack, w-20 collapsed → w-64 on hover. Routes the main view.
   ═══════════════════════════════════════════════════════════════════ */
import { motion } from 'framer-motion'
import { Crosshair, Mountain, MonitorDot, Skull } from 'lucide-react'
import { useStore } from '../store'
import { TABS } from '../constants'

const ICONS = { Crosshair, Mountain, MonitorDot, Skull }

export default function Sidebar() {
  const activeTab = useStore((s) => s.activeTab)
  const setTab = useStore((s) => s.setTab)
  const boss = useStore((s) => s.boss)

  return (
    <motion.aside
      initial={false}
      whileHover="open"
      animate="closed"
      variants={{ closed: { width: 80 }, open: { width: 256 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="group/side sticky top-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden border-r border-rule bg-void/95 backdrop-blur-xl"
    >
      {/* crest */}
      <div className="flex h-[68px] items-center gap-3 border-b border-rule px-5">
        <span className="font-display text-[26px] leading-none text-gold">𓆩⚑𓆪</span>
        <span className="whitespace-nowrap font-display text-[16px] font-bold tracking-[0.18em] text-bone opacity-0 transition-opacity duration-200 group-hover/side:opacity-100">
          WAYNE<span className="text-hud">OS</span>
        </span>
      </div>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
        {TABS.map((t) => {
          const Icon = ICONS[t.icon] || Crosshair
          const active = activeTab === t.id
          const alert = t.id === 'arkham' && boss && !boss.defeated
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-4 rounded-lg px-[18px] py-3 transition ${
                active ? 'bg-gold/15 text-gold' : 'text-ash hover:bg-bone/5 hover:text-bone'
              }`}
            >
              {active && (
                <motion.span layoutId="side-active" className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-gold" />
              )}
              <span className="relative shrink-0">
                <Icon className="h-6 w-6" />
                {alert && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-blood" />}
              </span>
              <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/side:opacity-100">
                <span className="block font-display text-[15px] font-semibold leading-tight">{t.label}</span>
                <span className="block font-display text-[9px] tracking-[0.2em] text-ash">{t.sub}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="whitespace-nowrap border-t border-rule px-5 py-4 font-display text-[9px] tracking-[0.3em] text-ash-dim opacity-0 transition-opacity group-hover/side:opacity-100">
        DARK KNIGHT PROTOCOL · V7
      </div>
    </motion.aside>
  )
}
