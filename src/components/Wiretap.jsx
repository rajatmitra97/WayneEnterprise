/* ═══════════════════════════════════════════════════════════════════
   ORACLE'S WIRETAP — frictionless brain-dump. A floating intercept bar
   pinned bottom-left, always reachable. Raw thoughts land in the Wiretap
   Backlog as "intel" — not yet cases — to be processed at the Batcomputer.
   Oracle: I'm logging everything. Process it when you're at the cave.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Radio, ChevronUp, ArrowUpRight, X } from 'lucide-react'
import { useStore } from '../store'

export default function Wiretap() {
  const wiretap = useStore((s) => s.wiretap)
  const addWiretap = useStore((s) => s.addWiretap)
  const addJournal = useStore((s) => s.addJournal)
  const removeWiretap = useStore((s) => s.removeWiretap)
  const processWiretap = useStore((s) => s.processWiretap)
  const [text, setText] = useState('')
  const [openList, setOpenList] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addWiretap(text) // stays in the backlog for processing into a case…
    addJournal(text, 'thought') // …and is filed to the Wayne Journal (Directive 6)
    setText('')
  }

  return (
    <div className="fixed bottom-4 left-4 z-[6300] w-[330px] max-w-[80vw]">
      {/* backlog drawer */}
      <AnimatePresence>
        {openList && wiretap.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="glass hud-corners mb-2 max-h-[40vh] overflow-y-auto p-2"
            style={{ borderColor: 'rgba(214,37,22,0.35)' }}
          >
            <div className="mb-1 px-1 font-display text-[10px] tracking-[0.25em] text-hud">
              WIRETAP BACKLOG · {wiretap.length}
            </div>
            {wiretap.map((w) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="group flex items-center gap-2 border-b border-rule/60 px-1 py-1.5"
              >
                <Radio size={11} className="shrink-0 text-hud/60" />
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-bone-dim">{w.text}</span>
                <button
                  onClick={() => processWiretap(w.id)}
                  title="Process into a backlog case"
                  className="text-ash transition hover:text-hud"
                >
                  <ArrowUpRight size={13} />
                </button>
                <button onClick={() => removeWiretap(w.id)} title="Discard" className="text-ash transition hover:text-blood">
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the capture bar */}
      <form
        onSubmit={submit}
        className="glass hud-corners flex items-center gap-2 px-3 py-2"
        style={{ borderColor: 'rgba(214,37,22,0.4)' }}
      >
        <Radio size={15} className="shrink-0 animate-hud-pulse text-hud" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wiretap — capture a fleeting thought…"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-bone outline-none placeholder:text-ash"
        />
        {wiretap.length > 0 && (
          <button
            type="button"
            onClick={() => setOpenList((v) => !v)}
            className="flex items-center gap-1 font-display text-[11px] text-hud"
            title="Toggle backlog"
          >
            {wiretap.length}
            <ChevronUp size={13} className={openList ? 'rotate-180 transition' : 'transition'} />
          </button>
        )}
      </form>
    </div>
  )
}
