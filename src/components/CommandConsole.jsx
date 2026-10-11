/* ═══════════════════════════════════════════════════════════════════
   BATCOMPUTER COMMAND CONSOLE — the ONE intake for cases.
   Cmd/Ctrl+K anywhere (or the DECRYPT button). An omnibar that parses
   intel (#sector  !threat  tomorrow  daily  every mon wed  !prep) into a
   structured case, with toggles to override. "?" opens the field manual.
   Alfred: standing by for field orders, sir.
   ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Command, CornerDownLeft, Clock, Zap, HelpCircle } from 'lucide-react'
import { useStore, parseIntel } from '../store'
import { SECTORS, SECTOR_ORDER, THREAT, THREAT_ORDER, RECUR, WEEKDAYS_FULL, CONSOLE_TIPS } from '../constants'

export default function CommandConsole() {
  const open = useStore((s) => s.commandOpen)
  const close = useStore((s) => s.closeCommand)
  const toggle = useStore((s) => s.toggleCommand)
  const addTask = useStore((s) => s.addTask)
  const assignSlot = useStore((s) => s.assignSlot)
  const inputRef = useRef(null)

  const [raw, setRaw] = useState('')
  // manual overrides (null = follow the parser)
  const [ovSector, setOvSector] = useState(null)
  const [ovThreat, setOvThreat] = useState(null)
  const [prep, setPrep] = useState(false)
  const [ovRecur, setOvRecur] = useState(null) // null = follow the parser
  const [ovDays, setOvDays] = useState([])
  const [help, setHelp] = useState(false)
  // chrono-input (Directive 4) — date + start/end → auto-inject into Dispatch
  const [date, setDate] = useState('')
  const [startT, setStartT] = useState('')
  const [endT, setEndT] = useState('')

  // global hotkey
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape' && open) {
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, close, open])

  // focus + reset on open
  useEffect(() => {
    if (open) {
      setRaw(''); setOvSector(null); setOvThreat(null); setPrep(false); setOvRecur(null); setOvDays([]); setHelp(false)
      setDate(''); setStartT(''); setEndT('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const parsed = useMemo(() => parseIntel(raw), [raw])
  const sector = ovSector || parsed.sector || 'mind'
  const threat = ovThreat || parsed.threat || 'MEDIUM'
  const usePrep = prep || parsed.prep
  const schedule = parsed.schedule
  const recur = ovRecur || parsed.recur || RECUR.NONE
  const days = ovRecur === RECUR.CUSTOM ? ovDays : ovRecur ? [] : parsed.days || []
  const toggleDay = (d) => setOvDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort()))

  const commit = () => {
    const title = parsed.title
    if (!title) return
    if (recur === RECUR.CUSTOM && days.length === 0) return // pick at least one night
    const id = addTask({ title, sector, threat, recur, days, schedule, prep: usePrep })
    // Chrono-input: if a start time is set, inject into the Dispatch Grid slot.
    if (startT) {
      const [hh, mm] = startT.split(':').map(Number)
      const mins = hh * 60 + (mm || 0)
      const wd = date ? new Date(date + 'T00:00:00').getDay() : new Date().getDay()
      assignSlot(wd, mins, id)
    }
    close()
  }

  const tokenChips = useMemo(() => {
    const chips = []
    if (parsed.sector) chips.push({ k: '#' + parsed.sector, c: SECTORS[parsed.sector]?.accent })
    if (parsed.threat) chips.push({ k: '!' + parsed.threat.toLowerCase(), c: THREAT[parsed.threat].color })
    if (parsed.schedule != null) chips.push({ k: parsed.schedule === 0 ? 'tonight' : 'tomorrow', c: '#D62516' })
    if (parsed.recur) chips.push({ k: parsed.recur === RECUR.CUSTOM ? 'every ' + (parsed.days || []).map((d) => WEEKDAYS_FULL[d].toLowerCase()).join(' ') : parsed.recur.toLowerCase(), c: '#7b8ec4' })
    if (parsed.prep) chips.push({ k: '!prep', c: '#D73423' })
    return chips
  }, [parsed])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9500] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-void/85 backdrop-blur-md" onClick={close} />

          <motion.div
            initial={{ scale: 0.92, y: -28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="glass hud-corners relative z-10 w-full max-w-3xl overflow-hidden p-0"
            style={{ borderColor: 'rgba(214,37,22,0.5)', boxShadow: '0 0 60px -10px rgba(214,37,22,0.4)' }}
          >
            {/* header strip */}
            <div className="flex items-center justify-between border-b border-hud/20 px-5 py-2.5">
              <span className="flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.3em] text-hud">
                <Command size={14} /> BATCOMPUTER COMMAND CONSOLE
              </span>
              <button
                onClick={() => setHelp((v) => !v)}
                className={`flex items-center gap-1 font-tech text-[12px] uppercase tracking-[0.18em] transition ${help ? 'text-hud' : 'text-ash hover:text-bone'}`}
                title="Field manual"
              >
                <HelpCircle size={14} /> field manual
              </button>
            </div>

            {/* the omnibar */}
            <div className="px-5 pt-5">
              <input
                ref={inputRef}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  else if (e.key === '?' && !raw) { e.preventDefault(); setHelp((v) => !v) }
                }}
                placeholder="Describe the objective…  e.g.  shadow the docks #body !arkham tomorrow !prep"
                className="w-full bg-transparent font-tech text-[26px] font-medium text-bone outline-none placeholder:text-ash/60"
              />
              {/* parsed token chips */}
              <div className="mt-2 flex min-h-[22px] flex-wrap gap-1.5">
                {tokenChips.map((c, i) => (
                  <motion.span
                    key={c.k + i}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="border px-1.5 py-0.5 font-display text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: c.c, borderColor: `${c.c}66` }}
                  >
                    {c.k}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* toggles */}
            <div className="space-y-3 px-5 pb-4 pt-3">
              <ToggleRow label="SECTOR">
                {SECTOR_ORDER.map((k) => (
                  <Chip key={k} active={sector === k} color={SECTORS[k].accent} onClick={() => setOvSector(k)}>
                    {SECTORS[k].name.replace('The ', '')}
                  </Chip>
                ))}
              </ToggleRow>

              <ToggleRow label="THREAT">
                {[...THREAT_ORDER].reverse().map((k) => (
                  <Chip key={k} active={threat === k} color={THREAT[k].color} onClick={() => setOvThreat(k)}>
                    {THREAT[k].tag}
                  </Chip>
                ))}
              </ToggleRow>

              <ToggleRow label="ROUTE">
                {[RECUR.NONE, RECUR.DAILY, RECUR.WEEKLY, RECUR.CUSTOM].map((r) => (
                  <Chip key={r} active={recur === r} color="#7b8ec4" onClick={() => setOvRecur(r)}>
                    {r === RECUR.NONE ? 'ONE-OFF' : r === RECUR.CUSTOM ? 'NIGHTS' : r}
                  </Chip>
                ))}
                {recur === RECUR.CUSTOM &&
                  WEEKDAYS_FULL.map((d, i) => (
                    <Chip
                      key={d}
                      active={(ovRecur === RECUR.CUSTOM ? ovDays : days).includes(i)}
                      color="#D73423"
                      onClick={() => {
                        if (ovRecur !== RECUR.CUSTOM) { setOvRecur(RECUR.CUSTOM); setOvDays(days) }
                        toggleDay(i)
                      }}
                    >
                      {d.slice(0, 2)}
                    </Chip>
                  ))}
              </ToggleRow>

              {/* Directive 4 — chrono scheduling → Dispatch Grid */}
              <ToggleRow label="CHRONO">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field h-9" />
                <input type="time" value={startT} onChange={(e) => setStartT(e.target.value)} title="Start" className="field h-9" />
                <span className="self-center font-display text-[12px] text-ash">→</span>
                <input type="time" value={endT} onChange={(e) => setEndT(e.target.value)} title="End" className="field h-9" />
                {startT && <span className="self-center font-display text-[10px] tracking-[0.15em] text-hud">▸ AUTO-DISPATCH</span>}
              </ToggleRow>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <SwitchChip active={usePrep} color="#D73423" icon={Clock} onClick={() => setPrep((v) => !v)}>
                  REQUIRE PREP (15m)
                </SwitchChip>
                {schedule != null && (
                  <span className="ml-auto font-display text-[11px] tracking-[0.2em] text-hud">
                    SCHEDULED · {schedule === 0 ? 'TONIGHT' : 'TOMORROW'}
                  </span>
                )}
              </div>
            </div>

            {/* field manual */}
            <AnimatePresence>
              {help && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-hud/20"
                >
                  <div className="grid gap-x-6 gap-y-1.5 px-5 py-3 sm:grid-cols-[auto_1fr]">
                    {CONSOLE_TIPS.map(([k, v]) => (
                      <div key={k} className="contents">
                        <kbd className="font-mono text-[12px] text-hud">{k}</kbd>
                        <span className="font-mono text-[12px] text-bone-dim">{v}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-hud/20 px-5 py-3">
              <span className="font-mono text-[11px] text-ash">
                <kbd className="text-hud">#sector</kbd> · <kbd className="text-blood">!threat</kbd> ·{' '}
                <kbd className="text-bone-dim">tomorrow</kbd> · <kbd className="text-bone-dim">every mon wed</kbd> ·{' '}
                <kbd className="text-gold">!prep</kbd>
              </span>
              <button onClick={commit} disabled={!parsed.title || (recur === RECUR.CUSTOM && days.length === 0)} className="btn-gold flex items-center gap-2 disabled:opacity-40">
                <Zap size={14} /> COMMIT INTEL <CornerDownLeft size={13} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ToggleRow({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-display text-[10px] tracking-[0.2em] text-ash">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
function Chip({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="border px-2.5 py-1 font-display text-[11px] uppercase tracking-[0.1em] transition"
      style={{
        color: active ? '#05050a' : color,
        background: active ? color : 'transparent',
        borderColor: `${color}66`,
      }}
    >
      {children}
    </button>
  )
}
function SwitchChip({ active, color, icon: Icon, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 border px-2.5 py-1.5 font-display text-[11px] uppercase tracking-[0.1em] transition"
      style={{
        color: active ? '#05050a' : color,
        background: active ? color : 'transparent',
        borderColor: `${color}66`,
      }}
    >
      <Icon size={12} /> {children}
    </button>
  )
}
