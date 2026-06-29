/* ═══════════════════════════════════════════════════════════════════
   THE WAYNE MANOR JOURNAL — every intercepted thought and debrief, kept.
   A leather-bound ledger in Wayne Mode, a decrypted case-log in Bat Mode.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Feather } from 'lucide-react'
import { useStore } from '../store'
import { JOURNAL_KINDS } from '../constants'
import Panel from './Panel'

const fmt = (ts) => {
  const d = new Date(ts)
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export default function WayneJournal() {
  const journal = useStore((s) => s.journal)
  const addJournal = useStore((s) => s.addJournal)
  const mode = useStore((s) => s.mode)
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addJournal(text, 'thought')
    setText('')
  }

  const wayne = mode === 'wayne'

  return (
    <Panel
      label="The Journal"
      title="Wayne Manor Journal"
      instruction={wayne ? 'PRIVATE LEDGER · BY HAND' : 'DECRYPTED CASE-LOG'}
      right={`${journal.length} ENTRIES`}
      className="col-span-12 lg:col-span-6"
      accent={wayne ? '#b08d57' : '#D62516'}
    >
      <form onSubmit={submit} className="mb-3 flex items-center gap-2">
        <Feather className="h-5 w-5 shrink-0" style={{ color: wayne ? '#b08d57' : '#D62516' }} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={wayne ? 'Dear diary…' : 'Log an observation…'}
          className="field h-10 flex-1"
        />
        <button type="submit" className="btn-gold h-10 text-[13px]">WRITE</button>
      </form>

      <div
        className="max-h-[360px] space-y-2.5 overflow-y-auto rounded-lg p-3"
        style={
          wayne
            ? { background: 'linear-gradient(160deg,#efe7d2,#e6dcc2)', boxShadow: 'inset 0 2px 12px rgba(90,70,40,0.25)' }
            : { background: 'rgba(20,6,5,0.6)', border: '1px solid #5a100b' }
        }
      >
        {journal.length === 0 ? (
          <p className="py-8 text-center font-serif text-[14px] italic" style={{ color: wayne ? '#9a7b4a' : '#9c5248' }}>
            {wayne ? 'The pages are blank, Master Wayne.' : 'No intercepts logged.'}
          </p>
        ) : (
          journal.map((e) => {
            const meta = JOURNAL_KINDS[e.kind] || JOURNAL_KINDS.thought
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={wayne ? 'border-b border-[#cbb98e] pb-2' : 'border-l-2 pl-3'}
                style={!wayne ? { borderColor: meta.color } : undefined}
              >
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="font-display text-[9px] tracking-[0.2em]" style={{ color: wayne ? '#9a7b4a' : meta.color }}>
                    {meta.label}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: wayne ? '#9a7b4a' : '#9c5248' }}>{fmt(e.at)}</span>
                </div>
                <p
                  className={wayne ? 'font-serif text-[15px] italic leading-snug' : 'font-mono text-[13px] leading-snug'}
                  style={{ color: wayne ? '#3a2f1c' : '#dbe6e9' }}
                >
                  {e.text}
                </p>
              </motion.div>
            )
          })
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 font-display text-[9px] tracking-[0.2em] text-ash">
        <BookOpen className="h-3.5 w-3.5" /> {wayne ? 'WAYNE MANOR · STUDY' : 'BATCOMPUTER · ARCHIVE'}
      </div>
    </Panel>
  )
}
