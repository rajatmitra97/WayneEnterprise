import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* ═══════════════════════════════════════════════════════════════════
   FAILSAFE — the Batcomputer never goes fully dark.
   If any component throws during render, show the fault (and an escape
   hatch) instead of a blank white page. Also guards against a corrupt
   localStorage save crashing the boot.
   ═══════════════════════════════════════════════════════════════════ */
const SAVE_KEY = 'wayneOSv3'
const CRASH_KEY = 'wayneOSv3-crashbackup'

// Read the raw save without going through the (possibly broken) store.
function readRawSave() {
  try {
    return localStorage.getItem(SAVE_KEY)
  } catch (e) {
    return null
  }
}

function downloadRawSave() {
  const raw = readRawSave()
  if (!raw) return false
  let state = null
  try {
    const parsed = JSON.parse(raw)
    state = parsed && parsed.state ? parsed.state : parsed
  } catch (e) {
    state = null
  }
  // a readable save is wrapped like a normal export; an unreadable one is saved verbatim
  const text = state
    ? JSON.stringify({ _signature: 'WAYNE-OS-DKP', exportedAt: new Date().toISOString(), data: state }, null, 2)
    : raw
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wayne-os-crash-save-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

const btn = (bg, fg, border) => ({
  background: bg,
  color: fg,
  border: border || 'none',
  padding: '10px 18px',
  fontFamily: 'monospace',
  letterSpacing: '0.18em',
  cursor: 'pointer',
})

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, saved: false, confirmPurge: false }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    // surfaced in the deployed console for diagnostics
    console.error('WAYNE OS // render fault:', error, info)
  }
  download = () => {
    if (downloadRawSave()) this.setState({ saved: true })
  }
  purge = () => {
    // even a purge keeps one copy aside in this browser
    try {
      const raw = readRawSave()
      if (raw) localStorage.setItem(CRASH_KEY, raw)
      localStorage.removeItem(SAVE_KEY)
    } catch (e) {
      /* ignore */
    }
    location.reload()
  }
  render() {
    if (this.state.error) {
      const hasSave = !!readRawSave()
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#060303',
            color: '#f2dad6',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#D62516', letterSpacing: '0.3em', fontSize: 13 }}>⚠ BATCOMPUTER FAULT</div>
          <div style={{ fontSize: 20, maxWidth: 640 }}>A subsystem failed to initialise.</div>
          <pre
            style={{
              maxWidth: 720,
              whiteSpace: 'pre-wrap',
              fontSize: 12,
              color: '#cf9a92',
              background: '#1a0605',
              border: '1px solid #5a100b',
              padding: 14,
              borderRadius: 6,
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div style={{ fontSize: 13, maxWidth: 560, color: '#cf9a92' }}>
            Your record is still in this browser. Download it first, then try reloading.
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {hasSave && (
              <button onClick={this.download} style={btn('#D73423', '#060303')}>
                {this.state.saved ? 'SAVE DOWNLOADED ✓' : 'DOWNLOAD MY SAVE'}
              </button>
            )}
            <button onClick={() => location.reload()} style={btn('transparent', '#f2dad6', '1px solid #5a100b')}>
              RELOAD
            </button>
            {!this.state.confirmPurge ? (
              <button onClick={() => this.setState({ confirmPurge: true })} style={btn('transparent', '#9c5248', '1px solid #3a0a07')}>
                PURGE LOCAL SAVE…
              </button>
            ) : (
              <button onClick={this.purge} style={btn('#450808', '#f2dad6', '1px solid #D62516')}>
                {this.state.saved || !hasSave ? 'CONFIRM PURGE & REBOOT' : 'PURGE WITHOUT DOWNLOADING?'}
              </button>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
