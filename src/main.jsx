import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './premium-surfaces.css'
import './liquid-metal.css'
import './instrument-v2.css'
import './interaction-fixes.css'

class XLockErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('XLock crashed during render:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="fatal-fallback">
        <div className="fatal-mark">✦</div>
        <p className="eyebrow">XLOCK RECOVERY MODE</p>
        <h1>The interface hit a runtime error.</h1>
        <p>
          Your screen should never fail silently. Reload once; if this remains,
          the error below identifies what needs fixing.
        </p>
        <pre>{String(this.state.error?.message || this.state.error)}</pre>
        <button onClick={() => window.location.reload()}>Reload XLock</button>
      </main>
    )
  }
}

function pathMatches(event, selector) {
  return event.composedPath().some((node) => node instanceof Element && node.matches(selector))
}

function installXBlockInteractions() {
  const getSelectedSegment = () => document.querySelector('.app.unlocked .task-segment.selected')

  const dismissSelectedX = () => {
    const selectedSegment = getSelectedSegment()
    if (!selectedSegment) return

    selectedSegment.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }))
  }

  const handleOutsideClick = (event) => {
    if (!(event.target instanceof Element) || !getSelectedSegment()) return

    const protectedSelector = [
      '.task-segment',
      '.selection-card',
      '.top-actions',
      '.brand',
      '.capture-fab',
      '.modal-scrim',
      '.footer-bar',
      'button',
      'a',
      'input',
      'textarea',
      'select',
      'label',
    ].join(',')

    if (pathMatches(event, protectedSelector)) return
    dismissSelectedX()
  }

  const handleEscape = (event) => {
    if (event.key === 'Escape' && getSelectedSegment()) dismissSelectedX()
  }

  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
}

const root = document.getElementById('root')

if (!root) {
  document.body.innerHTML = '<main style="padding:32px;background:#07050d;color:white;min-height:100vh">XLock could not find its root element.</main>'
} else {
  createRoot(root).render(
    <React.StrictMode>
      <XLockErrorBoundary>
        <App />
      </XLockErrorBoundary>
    </React.StrictMode>,
  )

  installXBlockInteractions()
}
