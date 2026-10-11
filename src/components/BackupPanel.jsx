/* Wayne-Tech Vault — export/import the full save as a JSON file so the
   crusade is never lost. Imports are validated and summarised first, and the
   current save is kept aside (localStorage 'wayneOSv3-preimport') before it is
   replaced. Also home to the night-boundary setting. */
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Upload, ShieldCheck, AlertTriangle, Moon } from 'lucide-react'
import { useStore, initialData, todayKey } from '../store'
import { NIGHT_ENDS_OPTIONS } from '../constants'
import { readSaveText, downloadText } from '../lib/saveFile'
import Panel from './Panel'

const hh = (h) => `${String(h).padStart(2, '0')}:00`

export default function BackupPanel() {
  const exportSave = useStore((s) => s.exportSave)
  const importSave = useStore((s) => s.importSave)
  const hardReset = useStore((s) => s.hardReset)
  const pushToast = useStore((s) => s.pushToast)
  const nightEndsHour = useStore((s) => s.nightEndsHour)
  const setNightEndsHour = useStore((s) => s.setNightEndsHour)
  const fileRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pending, setPending] = useState(null) // validated import awaiting confirmation

  const doExport = () => downloadText(`wayne-os-backup-${todayKey()}.json`, exportSave())

  const doImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = readSaveText(String(reader.result), initialData())
      if (!result.ok) pushToast('ALFRED', `${result.error} Nothing was changed, sir.`, 'blood')
      else setPending({ ...result, name: file.name })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const confirmImport = () => {
    importSave(pending.data)
    setPending(null)
  }

  return (
    <Panel
      label="XIV · Wayne-Tech Vault"
      title={<>Save <em className="not-italic font-light text-bone-dim">Backup</em></>}
      className="col-span-12 lg:col-span-6"
    >
      <p className="mb-4 flex items-start gap-2 font-serif text-[13.5px] italic text-bone-dim">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-acid" />
        Your record lives only in this browser. Export a copy before any reckless act:
        a new machine, a cleared cache, a moment of doubt. Backups are plain JSON, not encrypted.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={doExport} className="btn-gold flex items-center gap-2 text-[12px]">
          <Download size={14} /> EXPORT SAVE
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 border border-rule px-4 py-2 font-display text-[12px] uppercase tracking-[0.2em] text-bone-dim transition hover:border-acid hover:text-acid"
        >
          <Upload size={14} /> IMPORT SAVE
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={doImport} className="hidden" />
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="ml-auto flex items-center gap-2 border border-blood-dim px-4 py-2 font-display text-[12px] uppercase tracking-[0.2em] text-blood/80 transition hover:bg-blood/10"
          >
            <AlertTriangle size={14} /> WIPE
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <span className="font-serif text-[12px] italic text-blood">Erase the crusade? Export first.</span>
            <button
              onClick={() => {
                hardReset()
                setConfirmReset(false)
              }}
              className="bg-blood px-3 py-1.5 font-display text-[11px] tracking-[0.2em] text-bone"
            >
              CONFIRM
            </button>
            <button onClick={() => setConfirmReset(false)} className="font-display text-[11px] tracking-[0.2em] text-ash">
              NO
            </button>
          </div>
        )}
      </div>

      {/* validated import — confirm before anything is replaced */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border border-acid/40 bg-acid/5 p-3">
              <div className="mb-2 font-display text-[12px] tracking-[0.2em] text-acid">// VERIFIED SAVE · {pending.name}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[12px] text-bone sm:grid-cols-3">
                <span>open cases: {pending.summary.openCases}</span>
                <span>closed cases: {pending.summary.closedCases}</span>
                <span>coins: {pending.summary.coins} WC</span>
                <span>composite: LV {pending.summary.composite}</span>
                <span>streak: {pending.summary.streak}</span>
                <span>since: {pending.summary.firstNight}</span>
              </div>
              {pending.summary.exportedAt && (
                <div className="mt-1 font-mono text-[11px] text-ash">exported {pending.summary.exportedAt.slice(0, 16).replace('T', ' ')} UTC</div>
              )}
              {pending.warnings.length > 0 && (
                <div className="mt-2 font-mono text-[11px] text-gold">⚠ {pending.warnings.join(' · ')}</div>
              )}
              <p className="mt-2 font-serif text-[12.5px] italic text-bone-dim">
                This replaces your current record. The current save is kept aside in this browser first.
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={confirmImport} className="btn-gold text-[12px]">REPLACE MY SAVE</button>
                <button onClick={() => setPending(null)} className="font-display text-[11px] tracking-[0.2em] text-ash hover:text-bone">
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* night boundary */}
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <Moon size={16} className="text-gold" />
        <label htmlFor="night-ends" className="font-display text-[12px] tracking-[0.2em] text-bone">
          THE NIGHT ENDS AT
        </label>
        <select
          id="night-ends"
          value={nightEndsHour}
          onChange={(e) => setNightEndsHour(Number(e.target.value))}
          className="field h-9"
        >
          {NIGHT_ENDS_OPTIONS.map((h) => (
            <option key={h} value={h}>{hh(h)}</option>
          ))}
        </select>
        <span className="font-serif text-[12.5px] italic text-bone-dim">
          Work before {hh(nightEndsHour)} counts for the night before; rollover and penalties happen then.
        </span>
      </div>
    </Panel>
  )
}
