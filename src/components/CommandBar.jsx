/* ═══════════════════════════════════════════════════════════════════
   COMMAND BAR — the primary intake, upper-middle of the OS.
   The big DECRYPT trigger opens the full Batcomputer Command Console;
   the inline field commits a quick case without leaving the dashboard.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Command } from 'lucide-react'
import { useStore } from '../store'
import { SECTORS, SECTOR_ORDER, THREAT, THREAT_ORDER, MODES } from '../constants'
import Panel from './Panel'

export default function CommandBar() {
  const addTask = useStore((s) => s.addTask)
  const openCommand = useStore((s) => s.openCommand)
  const mode = useStore((s) => s.mode)
  const visible = MODES[mode].sectors

  const [title, setTitle] = useState('')
  const [sector, setSector] = useState(visible[0])
  const [threat, setThreat] = useState('MEDIUM')
  const eff = visible.includes(sector) ? sector : visible[0]

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title, sector: eff, threat })
    setTitle('')
    setThreat('MEDIUM')
  }

  return (
    <Panel
      label="I · Intake"
      title="Command Console"
      instruction="INPUT REQUIRED: SECURE NEW INTEL"
      right="⌘K"
      className="col-span-12"
      accent="#D73423"
    >
      <motion.button
        onClick={openCommand}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="hud-corners mb-3 flex w-full items-center justify-center gap-3 border border-hud/50 bg-hud/5 py-4 font-display text-[17px] font-semibold uppercase tracking-[0.22em] text-hud transition hover:bg-hud/15"
        style={{ boxShadow: '0 0 28px -8px rgba(214,37,22,0.6)' }}
      >
        <Command className="h-6 w-6 animate-hud-pulse" /> DECRYPT NEW INTEL
      </motion.button>

      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="quick-log an objective…  (⌘K for full parser)"
          className="field h-11 flex-1 text-[15px]"
        />
        <select value={eff} onChange={(e) => setSector(e.target.value)} className="field h-11">
          {SECTOR_ORDER.filter((k) => visible.includes(k)).map((k) => (
            <option key={k} value={k}>{SECTORS[k].name}</option>
          ))}
        </select>
        <select value={threat} onChange={(e) => setThreat(e.target.value)} className="field h-11">
          {THREAT_ORDER.map((k) => (
            <option key={k} value={k}>{THREAT[k].label}</option>
          ))}
        </select>
        <button type="submit" className="btn-gold flex h-11 items-center gap-1.5 text-[15px]">
          <Plus className="h-5 w-5" /> COMMIT
        </button>
      </form>
    </Panel>
  )
}
