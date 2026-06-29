import { useEffect, useState } from 'react'
import { Bell, BellOff, Coins, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store'
import CowlToggle from './CowlToggle'

export default function TopBar() {
  const [now, setNow] = useState(new Date())
  const coins = useStore((s) => s.coins)
  const notifyPermission = useStore((s) => s.notifyPermission)
  const requestNotify = useStore((s) => s.requestNotify)
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)

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
        <div className="font-display text-[30px] font-bold tracking-[0.12em] text-bone">
          WAYNE<span className="text-hud">OS</span> <span className="text-gold">/ DKP</span>
        </div>
        <div className="-mt-0.5 font-tech text-[14px] uppercase tracking-[0.18em] text-ash">
          tactical dark knight protocol
        </div>
      </div>

      <CowlToggle />

      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 font-display font-bold text-gold">
          <Coins size={18} />
          <span className="text-[26px] leading-none tabular-nums">{coins}</span>
          <span className="text-[12px] tracking-[0.2em] text-ash">WC</span>
        </div>
        <button
          onClick={toggleMute}
          title={muted ? 'Unmute ambience' : 'Mute ambience'}
          className={`rounded border px-2 py-1.5 transition ${
            muted ? 'border-rule text-ash hover:text-bone' : 'border-hud/60 text-hud'
          }`}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
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
          <div className="font-display text-[24px] font-semibold leading-none tracking-[0.08em] text-bone-dim tabular-nums">
            {time}
          </div>
          <div className="font-tech text-[13px] uppercase tracking-[0.12em] text-ash">{date}</div>
        </div>
      </div>
    </header>
  )
}
