/* Wayne-Tech Data Persistence — Encrypted Backup. Export/import the full
   save as a JSON file so the crusade is never lost. */
import { useRef, useState } from 'react'
import { Download, Upload, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import Panel from './Panel'

export default function BackupPanel() {
  const exportSave = useStore((s) => s.exportSave)
  const importSave = useStore((s) => s.importSave)
  const hardReset = useStore((s) => s.hardReset)
  const fileRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const doExport = () => {
    const blob = new Blob([exportSave()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wayne-os-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => importSave(String(reader.result))
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Panel
      label="XIV · Wayne-Tech Vault"
      title={<>Encrypted <em className="not-italic font-light text-bone-dim">Backup</em></>}
      className="col-span-12"
    >
      <p className="mb-4 flex items-start gap-2 font-serif text-[13.5px] italic text-bone-dim">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-acid" />
        Your record is sealed in the cave's local vault. Export a copy before any reckless act —
        a new machine, a cleared cache, a moment of doubt.
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
        <input ref={fileRef} type="file" accept="application/json" onChange={doImport} className="hidden" />

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="ml-auto flex items-center gap-2 border border-blood-dim px-4 py-2 font-display text-[12px] uppercase tracking-[0.2em] text-blood/80 transition hover:bg-blood/10"
          >
            <AlertTriangle size={14} /> WIPE
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <span className="font-serif text-[12px] italic text-blood">Erase the crusade?</span>
            <button
              onClick={() => {
                hardReset()
                setConfirmReset(false)
              }}
              className="bg-blood px-3 py-2 font-display text-[11px] tracking-[0.2em] text-bone"
            >
              CONFIRM
            </button>
            <button onClick={() => setConfirmReset(false)} className="font-display text-[11px] tracking-[0.2em] text-ash">
              NO
            </button>
          </div>
        )}
      </div>
    </Panel>
  )
}
