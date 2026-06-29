/* Procedural Gotham ambience for Detective Vision — no audio files.
   Rain = filtered white noise with slow amplitude flutter.
   Drone = two detuned low oscillators through a lowpass.
   All generated live via the Web Audio API. Must be started from a
   user gesture (the focus trigger) to satisfy autoplay policies. */

let ctx = null
let nodes = null

function makeNoiseBuffer(audioCtx) {
  const len = audioCtx.sampleRate * 2
  const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

export function startAmbience() {
  if (nodes) return // already running
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    return // Web Audio unavailable
  }
  if (ctx.state === 'suspended') ctx.resume()

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5)

  // ── rain ──
  const rain = ctx.createBufferSource()
  rain.buffer = makeNoiseBuffer(ctx)
  rain.loop = true
  const rainBand = ctx.createBiquadFilter()
  rainBand.type = 'bandpass'
  rainBand.frequency.value = 1400
  rainBand.Q.value = 0.5
  const rainGain = ctx.createGain()
  rainGain.gain.value = 0.22
  // slow flutter so the rain "breathes"
  const flutter = ctx.createOscillator()
  flutter.frequency.value = 0.18
  const flutterGain = ctx.createGain()
  flutterGain.gain.value = 0.06
  flutter.connect(flutterGain)
  flutterGain.connect(rainGain.gain)
  rain.connect(rainBand)
  rainBand.connect(rainGain)
  rainGain.connect(master)

  // ── low drone ──
  const droneGain = ctx.createGain()
  droneGain.gain.value = 0.16
  const droneFilter = ctx.createBiquadFilter()
  droneFilter.type = 'lowpass'
  droneFilter.frequency.value = 220
  const osc1 = ctx.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = 55 // A1
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = 58.27 // slight detune → beating
  osc1.connect(droneFilter)
  osc2.connect(droneFilter)
  droneFilter.connect(droneGain)
  droneGain.connect(master)

  rain.start()
  flutter.start()
  osc1.start()
  osc2.start()

  nodes = { master, rain, flutter, osc1, osc2 }
}

// A heavy cell-door slam — metallic clang + low thud. Fired when a case is
// dragged into Incarcerated at Blackgate. Self-contained, gesture-triggered.
export function playCellDoor() {
  let ac
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    return
  }
  const t0 = ac.currentTime

  // low thud
  const thud = ac.createOscillator()
  thud.type = 'sine'
  thud.frequency.setValueAtTime(120, t0)
  thud.frequency.exponentialRampToValueAtTime(38, t0 + 0.25)
  const thudGain = ac.createGain()
  thudGain.gain.setValueAtTime(0.9, t0)
  thudGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5)
  thud.connect(thudGain).connect(ac.destination)

  // metallic clang — noise burst through a high bandpass
  const len = ac.sampleRate * 0.4
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5)
  const clang = ac.createBufferSource()
  clang.buffer = buf
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2600
  bp.Q.value = 6
  const clangGain = ac.createGain()
  clangGain.gain.setValueAtTime(0.5, t0)
  clangGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4)
  clang.connect(bp).connect(clangGain).connect(ac.destination)

  thud.start(t0); thud.stop(t0 + 0.5)
  clang.start(t0 + 0.02)
  setTimeout(() => { try { ac.close() } catch (e) { /* closed */ } }, 800)
}

/* ═══════════════════════════════════════════════════════════════════
   IDENTITY SOUNDSCAPES (Directive 9) — a persistent ambient bed tied to
   the active identity. Wayne: light rain + warm pad. Bat: heavy rain,
   distant thunder, cave drips, low sonar drone. Procedural, no files.
   Must be started from a user gesture (browsers block autoplay).
   ═══════════════════════════════════════════════════════════════════ */
let sctx = null
let sceneNodes = null
let sceneId = null
let dripTimer = null
let thunderTimer = null

function noiseBuffer(ac, seconds = 2) {
  const len = ac.sampleRate * seconds
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

export function startSoundscape(mode) {
  // already on this scene → just (re)resume; lets the first user gesture
  // un-suspend a context the browser blocked on autoplay.
  if (sctx && sceneId === mode && sceneNodes) {
    try { sctx.resume() } catch (e) { /* ignore */ }
    return
  }
  stopSoundscape()
  try {
    sctx = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    return
  }
  if (sctx.state === 'suspended') sctx.resume()
  const isBat = mode !== 'wayne'

  const master = sctx.createGain()
  master.gain.value = 0
  master.connect(sctx.destination)
  master.gain.linearRampToValueAtTime(isBat ? 0.42 : 0.3, sctx.currentTime + 3)

  // ── rain (heavier + lower for the cave) ──
  const rain = sctx.createBufferSource()
  rain.buffer = noiseBuffer(sctx)
  rain.loop = true
  const rainBand = sctx.createBiquadFilter()
  rainBand.type = 'bandpass'
  rainBand.frequency.value = isBat ? 900 : 1700
  rainBand.Q.value = 0.4
  const rainGain = sctx.createGain()
  rainGain.gain.value = isBat ? 0.3 : 0.14
  rain.connect(rainBand).connect(rainGain).connect(master)
  rain.start()

  // ── warm pad (Wayne) or sonar drone (Bat) ──
  const oscA = sctx.createOscillator()
  const oscB = sctx.createOscillator()
  const padFilter = sctx.createBiquadFilter()
  padFilter.type = 'lowpass'
  padFilter.frequency.value = isBat ? 200 : 600
  const padGain = sctx.createGain()
  padGain.gain.value = isBat ? 0.18 : 0.1
  if (isBat) {
    oscA.type = 'sine'; oscA.frequency.value = 52
    oscB.type = 'sine'; oscB.frequency.value = 55.5 // low sonar beat
  } else {
    oscA.type = 'triangle'; oscA.frequency.value = 220 // warm A3
    oscB.type = 'sine'; oscB.frequency.value = 277.18 // C#4 — major-third warmth
  }
  oscA.connect(padFilter); oscB.connect(padFilter)
  padFilter.connect(padGain).connect(master)
  oscA.start(); oscB.start()

  sceneNodes = { master, rain, oscA, oscB }
  sceneId = mode

  // ── Bat-only: cave drips + distant thunder ──
  if (isBat) {
    const drip = () => {
      if (!sctx || sceneId !== mode) return
      const o = sctx.createOscillator()
      const g = sctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(1400 + Math.random() * 600, sctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(500, sctx.currentTime + 0.12)
      g.gain.setValueAtTime(0.0001, sctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.12, sctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, sctx.currentTime + 0.25)
      o.connect(g).connect(master)
      o.start(); o.stop(sctx.currentTime + 0.3)
      dripTimer = setTimeout(drip, 2500 + Math.random() * 5000)
    }
    dripTimer = setTimeout(drip, 1800)

    const thunder = () => {
      if (!sctx || sceneId !== mode) return
      const n = sctx.createBufferSource()
      n.buffer = noiseBuffer(sctx, 1.5)
      const lp = sctx.createBiquadFilter()
      lp.type = 'lowpass'; lp.frequency.value = 220
      const g = sctx.createGain()
      g.gain.setValueAtTime(0.0001, sctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.35, sctx.currentTime + 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, sctx.currentTime + 1.6)
      n.connect(lp).connect(g).connect(master)
      n.start(); n.stop(sctx.currentTime + 1.7)
      thunderTimer = setTimeout(thunder, 18000 + Math.random() * 25000)
    }
    thunderTimer = setTimeout(thunder, 9000)
  }
}

export function stopSoundscape() {
  if (dripTimer) { clearTimeout(dripTimer); dripTimer = null }
  if (thunderTimer) { clearTimeout(thunderTimer); thunderTimer = null }
  if (!sctx || !sceneNodes) { sceneId = null; return }
  const old = sceneNodes
  const oldCtx = sctx
  sceneNodes = null; sceneId = null; sctx = null
  try {
    old.master.gain.cancelScheduledValues(oldCtx.currentTime)
    old.master.gain.linearRampToValueAtTime(0, oldCtx.currentTime + 0.8)
  } catch (e) { /* ignore */ }
  setTimeout(() => {
    try { old.rain.stop(); old.oscA.stop(); old.oscB.stop(); oldCtx.close() } catch (e) { /* torn down */ }
  }, 900)
}

export function stopAmbience() {
  if (!ctx || !nodes) return
  const { master } = nodes
  try {
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
  } catch (e) {
    /* ignore */
  }
  const toStop = nodes
  const oldCtx = ctx
  nodes = null
  ctx = null
  setTimeout(() => {
    try {
      toStop.rain.stop()
      toStop.flutter.stop()
      toStop.osc1.stop()
      toStop.osc2.stop()
      oldCtx.close()
    } catch (e) {
      /* already torn down */
    }
  }, 900)
}
