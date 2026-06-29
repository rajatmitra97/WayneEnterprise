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
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    // surfaced in the deployed console for diagnostics
    console.error('WAYNE OS // render fault:', error, info)
  }
  hardReset = () => {
    try {
      localStorage.removeItem('wayneOSv3')
    } catch (e) {
      /* ignore */
    }
    location.reload()
  }
  render() {
    if (this.state.error) {
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
          <div style={{ color: '#D62516', letterSpacing: '0.3em', fontSize: 13 }}>
            ⚠ BATCOMPUTER FAULT
          </div>
          <div style={{ fontSize: 20, maxWidth: 640 }}>
            A subsystem failed to initialise.
          </div>
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
          <button
            onClick={this.hardReset}
            style={{
              background: '#D73423',
              color: '#060303',
              border: 'none',
              padding: '10px 18px',
              fontFamily: 'monospace',
              letterSpacing: '0.18em',
              cursor: 'pointer',
            }}
          >
            PURGE LOCAL SAVE & REBOOT
          </button>
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
