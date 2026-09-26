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

function normalizeAngle(delta) {
  let value = delta
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}

function pointerAngle(event, element) {
  const box = element.getBoundingClientRect()
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  return (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI
}

function pathMatches(event, selector) {
  return event.composedPath().some((node) => node instanceof Element && node.matches(selector))
}

function installXBlockInteractions() {
  let currentBaseRotation = 0
  let dragging = false
  let dragStartAngle = 0
  let dragDelta = 0
  let dragWheel = null

  const getSelectedSegment = () => document.querySelector('.app.unlocked .task-segment.selected')
  const getTaskWheel = () => document.querySelector('.app.unlocked .task-wheel')
  const getWheelShell = () => document.querySelector('.app.unlocked .wheel-shell')

  const setWheelRotation = (wheel, rotation) => {
    if (!wheel) return
    wheel.style.setProperty('--xblock-rotation', `${rotation}deg`)
    wheel.style.setProperty('--xblock-counter-rotation', `${-rotation}deg`)
  }

  const nearestEquivalentRotation = (from, target) => {
    let value = target
    while (value - from > 180) value -= 360
    while (value - from < -180) value += 360
    return value
  }

  const syncSelectedBlockToTop = () => {
    const wheel = getTaskWheel()
    if (!wheel || dragging) return

    const segments = [...wheel.querySelectorAll('.task-segment')]
    const selected = segments.findIndex((segment) => segment.classList.contains('selected'))

    if (selected < 0 || segments.length === 0) {
      currentBaseRotation = nearestEquivalentRotation(currentBaseRotation, 0)
      setWheelRotation(wheel, currentBaseRotation)
      return
    }

    const slice = 360 / segments.length
    // App.jsx leaves a 4° visual gap at the end of each X block, so its
    // geometric center is 2° before the raw slice center.
    const selectedCenter = selected * slice - 2
    const target = -selectedCenter
    currentBaseRotation = nearestEquivalentRotation(currentBaseRotation, target)
    setWheelRotation(wheel, currentBaseRotation)
  }

  const dismissSelectedX = () => {
    const selectedSegment = getSelectedSegment()
    if (!selectedSegment) return

    // Re-use the existing React handler so React remains the source of truth.
    selectedSegment.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }))
  }

  const handleOutsideClick = (event) => {
    if (!(event.target instanceof Element) || !getSelectedSegment()) return

    // composedPath() is important here: task labels live inside SVG
    // foreignObjects, which can make Element.closest() unreliable in Safari.
    // A click on ANY X block therefore stays inside selection behavior and
    // React can switch directly from X A to X B without the click-away layer
    // clearing the new selection afterward.
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

  const handlePointerDown = (event) => {
    const selected = getSelectedSegment()
    const wheel = getTaskWheel()
    const shell = getWheelShell()
    if (!selected || !wheel || !shell || !pathMatches(event, '.wheel-shell')) return
    if (pathMatches(event, '.selection-card')) return

    dragging = true
    dragWheel = wheel
    dragStartAngle = pointerAngle(event, shell)
    dragDelta = 0
    wheel.classList.add('is-xblock-dragging')
  }

  const handlePointerMove = (event) => {
    if (!dragging || !dragWheel) return
    const shell = getWheelShell()
    if (!shell) return
    dragDelta = normalizeAngle(pointerAngle(event, shell) - dragStartAngle)
    setWheelRotation(dragWheel, currentBaseRotation + dragDelta)
  }

  const finishPointerDrag = () => {
    if (!dragging || !dragWheel) return
    const wheel = dragWheel
    dragging = false
    dragWheel = null
    wheel.classList.remove('is-xblock-dragging')

    // React handles the actual 28° lock threshold. If the gesture was only a
    // small inspection movement, visually spring the selected X block back to
    // its canonical 12 o'clock position.
    if (Math.abs(dragDelta) < 28) {
      setWheelRotation(wheel, currentBaseRotation)
    }
    dragDelta = 0
  }

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(syncSelectedBlockToTop)
  })

  const root = document.getElementById('root')
  if (root) {
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('pointermove', handlePointerMove, true)
  document.addEventListener('pointerup', finishPointerDrag, true)
  document.addEventListener('pointercancel', finishPointerDrag, true)

  window.requestAnimationFrame(syncSelectedBlockToTop)
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
