import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, Coins } from 'lucide-react'
import { useStore } from '../store'

export default function TopBar() {
  const [now, setNow] = useState(new Date())
  const coins = useStore((s) => s.coins)
  const notifyPermission = useStore((s) => s.notifyPermission)
  const requestNotify = useStore((s) => s.requestNotify)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  const granted = notifyPermission === 'granted'

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 border-b border-rule px-6 py-4 md:px-9">
      <div>
        <div className="font-display text-2xl tracking-[0.16em] text-bone">
          WAYNE OS <span className="text-gold">/ DKP</span>
        </div>
        <div className="-mt-1 font-serif text-[13px] italic text-ash">
          the dark knight protocol
        </div>
      </div>

      <div className="text-center font-display text-[11px] tracking-[0.35em] text-ash">
        <motion.span
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-1 block text-[34px] leading-none text-bone"
        >
          𓆩⚑𓆪
        </motion.span>
        PRO GOTHAM · PRO SE
      </div>

      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 font-display text-gold">
          <Coins size={16} />
          <span className="text-xl tabular-nums">{coins}</span>
          <span className="text-[10px] tracking-[0.2em] text-ash">WC</span>
        </div>
        <button
          onClick={requestNotify}
          title={granted ? 'Alfred is watching' : 'Enable Alfred notifications'}
          className={`rounded border px-2 py-1.5 transition ${
            granted
              ? 'border-gold/60 text-gold'
              : 'border-rule text-ash hover:border-bone-dim hover:text-bone'
          }`}
        >
          {granted ? <Bell size={15} /> : <BellOff size={15} />}
        </button>
        <div className="text-right">
          <div className="font-display text-xl tracking-[0.08em] text-bone-dim tabular-nums">
            {time}
          </div>
          <div className="font-serif text-[12px] italic text-ash">{date}</div>
        </div>
      </div>
    </header>
  )
}
