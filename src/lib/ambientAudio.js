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
