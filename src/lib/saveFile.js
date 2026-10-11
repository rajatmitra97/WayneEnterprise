/* ═══════════════════════════════════════════════════════════════════
   WAYNE-TECH VAULT — save-file reading and validation.
   A save is never trusted blindly: it is unwrapped, checked key by key
   against the defaults, and summarised so the user can confirm before
   anything is replaced. Pure functions, no store access.
   ═══════════════════════════════════════════════════════════════════ */
import { SECTORS, SECTOR_ORDER, THREAT, LEVELS_PER_SECTOR, LEGACY_SIDEKICK_NAMES } from '../constants'

export const SAVE_SIGNATURE = 'WAYNE-OS-DKP'

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const kindOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
const finite = (n) => typeof n === 'number' && Number.isFinite(n)

// Accepts an exported file ({_signature, data}), a raw localStorage blob
// ({state, version}) or a bare state object. Returns the state object or null.
export function unwrapSave(parsed) {
  if (!isObj(parsed)) return null
  if (isObj(parsed.data) && (parsed._signature === SAVE_SIGNATURE || parsed.exportedAt)) return parsed.data
  if (isObj(parsed.state) && 'version' in parsed) return parsed.state
  return parsed
}

const validTask = (t) =>
  isObj(t) &&
  typeof t.id === 'string' &&
  typeof t.title === 'string' &&
  t.title.trim() !== '' &&
  !!SECTORS[t.sector] &&
  !!THREAT[t.threat]

function cleanSectors(raw, fallback) {
  const out = { ...fallback }
  if (!isObj(raw)) return out
  SECTOR_ORDER.forEach((k) => {
    const s = raw[k]
    if (isObj(s) && finite(s.xp) && finite(s.lvl)) {
      out[k] = {
        xp: Math.max(0, s.xp),
        lvl: Math.min(LEVELS_PER_SECTOR, Math.max(0, Math.round(s.lvl))),
      }
    }
  })
  return out
}

// Normalise any (possibly old or partial) state against the defaults.
// Unknown keys are dropped; wrong-typed keys fall back to their default.
export function normalizeState(input, defaults) {
  const warnings = []
  const data = {}
  const src = isObj(input) ? input : {}
  Object.keys(defaults).forEach((k) => {
    const def = defaults[k]
    if (!(k in src) || src[k] === undefined) {
      data[k] = def
      return
    }
    const v = src[k]
    // keys whose default is null may hold a value of any non-function kind
    if (def === null) {
      data[k] = typeof v === 'function' ? null : v
      return
    }
    if (kindOf(v) !== kindOf(def)) {
      warnings.push(`${k} had the wrong type and was reset`)
      data[k] = def
      return
    }
    data[k] = v
  })
  data.sectors = cleanSectors(src.sectors, defaults.sectors)
  data.coins = finite(data.coins) ? Math.max(0, Math.round(data.coins)) : 0

  const tasks = Array.isArray(src.tasks) ? src.tasks : []
  data.tasks = tasks.filter(validTask).map((t) => {
    // v1 → v2: cases "delegated" to the retired fictional roster keep a name
    if (t.assignedTo && LEGACY_SIDEKICK_NAMES[t.assignedTo])
      return { ...t, assignedTo: LEGACY_SIDEKICK_NAMES[t.assignedTo], followUpOn: t.followUpOn || null }
    return t
  })
  const droppedTasks = tasks.length - data.tasks.length
  if (droppedTasks) warnings.push(`${droppedTasks} damaged open case(s) skipped`)

  const closed = Array.isArray(src.closedTasks) ? src.closedTasks : []
  data.closedTasks = closed.filter((t) => isObj(t) && typeof t.title === 'string')
  data.completionLog = (Array.isArray(src.completionLog) ? src.completionLog : []).filter(
    (d) => isObj(d) && typeof d.date === 'string' && finite(d.points)
  )
  // an in-flight focus session would be punished as "broken" on load
  data.focus = null
  // v1 → v2: a pending Two-Face coin toss becomes an offer of Harvey's Deal
  if (src.pendingTwoFace === true && 'harveyDeal' in defaults && !data.harveyDeal)
    data.harveyDeal = { state: 'offered', offeredOn: defaults.lastSeen, sector: 'mind' }
  return { data, warnings, droppedTasks }
}

// Read a save file's text. Returns { ok, data, summary, warnings, error }.
export function readSaveText(text, defaults) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    return { ok: false, error: 'This file is not readable JSON. It may be corrupted.' }
  }
  const state = unwrapSave(parsed)
  if (!state || (!('sectors' in state) && !('tasks' in state))) {
    return { ok: false, error: 'This file is not a WAYNE OS save.' }
  }
  const { data, warnings, droppedTasks } = normalizeState(state, defaults)
  const composite = SECTOR_ORDER.reduce((n, k) => n + (data.sectors[k]?.lvl || 0), 0)
  return {
    ok: true,
    data,
    warnings,
    summary: {
      exportedAt: isObj(parsed) && typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null,
      firstNight: data.firstNight,
      openCases: data.tasks.filter((t) => !t.done).length,
      closedCases: data.closedTasks.filter((t) => !t.failed).length,
      coins: data.coins,
      streak: finite(data.streak) ? data.streak : 0,
      composite,
      droppedTasks,
    },
  }
}

// Wrap a state slice as a downloadable save-file string.
export function buildSaveText(stateSlice) {
  return JSON.stringify(
    { _signature: SAVE_SIGNATURE, exportedAt: new Date().toISOString(), data: stateSlice },
    null,
    2
  )
}

// Trigger a browser download of some text.
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
