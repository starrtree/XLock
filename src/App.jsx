import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import CosmicField from './components/CosmicField.jsx'
import StarCursor from './components/StarCursor.jsx'
import StarrVis from './components/StarrVis.jsx'
import SpotlightPanel from './components/SpotlightPanel.jsx'
import NewXModal from './components/NewXModal.jsx'
import CompletionModal from './components/CompletionModal.jsx'
import {
  cloudConfigured,
  hydrateState,
  persistState,
  readCachedState,
  writeCachedState,
} from './lib/persistence.js'
import {
  Check,
  CirclePause,
  Clock3,
  Cloud,
  CloudOff,
  LockKeyhole,
  Mic2,
  Orbit,
  Plus,
  RotateCcw,
  Sparkles,
  TimerReset,
  Vault,
  X,
} from 'lucide-react'

const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Build XLock MVP',
    category: 'Execution',
    primaryColor: '#f6c453',
    secondaryColor: '#f48f2e',
    expectedMinutes: 75,
    definitionOfDone: 'The core wheel → lock → focus → capture → complete loop works and persists.',
    nextSteps: ['Refine wheel interaction', 'Connect persistent state', 'Verify mobile behavior'],
    priority: 100,
    status: 'ready',
  },
  {
    id: 't2',
    title: 'THICKER website scope',
    category: 'Revenue',
    primaryColor: '#efb82f',
    secondaryColor: '#d9781c',
    expectedMinutes: 35,
    definitionOfDone: 'Client scope, product count, assets, and a bounded starter quote are ready.',
    nextSteps: ['Confirm product count', 'Confirm assets', 'Draft bounded quote'],
    priority: 92,
    status: 'ready',
  },
  {
    id: 't3',
    title: 'Theme song client',
    category: 'Music',
    primaryColor: '#e657a8',
    secondaryColor: '#823fd1',
    expectedMinutes: 50,
    definitionOfDone: 'Beat is selected, licensing tier is confirmed, and the first theme-song draft is exported.',
    nextSteps: ['Pick beat', 'Verify license', 'Record first draft'],
    priority: 84,
    status: 'ready',
  },
  {
    id: 't4',
    title: 'StarrTree service page',
    category: 'Communication',
    primaryColor: '#4f9fe8',
    secondaryColor: '#6755d9',
    expectedMinutes: 60,
    definitionOfDone: 'Visitors can immediately understand the top service offers and contact path.',
    nextSteps: ['Define top offers', 'Place proof', 'Add contact CTA'],
    priority: 72,
    status: 'ready',
  },
  {
    id: 't5',
    title: 'Meta glasses streaming research',
    category: 'Vision',
    primaryColor: '#7a5ce7',
    secondaryColor: '#4f46c7',
    expectedMinutes: 25,
    definitionOfDone: 'A one-page feasibility note identifies the simplest Meta glasses → stream pipeline.',
    nextSteps: ['Compare capture paths', 'Confirm Kick path', 'Record recommendation'],
    priority: 44,
    status: 'ready',
  },
]

function initialState() {
  const fallback = {
    tasks: INITIAL_TASKS,
    activeSession: null,
    captures: [],
    completions: [],
  }

  return readCachedState(fallback)
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `xlock-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatDuration(ms) {
  const safe = Math.max(0, ms)
  const total = Math.floor(safe / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function polar(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, inner, outer, startAngle, endAngle) {
  const a = polar(cx, cy, outer, startAngle)
  const b = polar(cx, cy, outer, endAngle)
  const c = polar(cx, cy, inner, endAngle)
  const d = polar(cx, cy, inner, startAngle)
  const large = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${a.x} ${a.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y}`,
    `L ${c.x} ${c.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y}`,
    'Z',
  ].join(' ')
}

function angleForPointer(evt, element) {
  const box = element.getBoundingClientRect()
  const cx = box.left + box.width / 2
  const cy = box.top + box.height / 2
  return (Math.atan2(evt.clientY - cy, evt.clientX - cx) * 180) / Math.PI
}

function normalizeAngle(delta) {
  let value = delta
  while (value > 180) value -= 360
  while (value < -180) value += 360
  return value
}

function TreeXMark({ compact = false }) {
  return (
    <svg className={compact ? 'tree-mark compact' : 'tree-mark'} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="goldMark" x1="0" x2="1">
          <stop offset="0" stopColor="#f9dd83" />
          <stop offset=".45" stopColor="#f2b632" />
          <stop offset="1" stopColor="#fff1ad" />
        </linearGradient>
      </defs>
      <path d="M35 42 L100 100 L165 42 M35 158 L100 100 L165 158" fill="none" stroke="url(#goldMark)" strokeWidth="9" strokeLinecap="round" />
      <path d="M100 36 L100 164" stroke="url(#goldMark)" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 78 C77 62 63 57 50 56 M100 82 C122 65 137 59 151 57 M100 96 C77 88 64 88 50 91 M100 98 C122 90 136 89 151 92" fill="none" stroke="url(#goldMark)" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 120 C81 134 72 147 67 164 M100 120 C119 134 129 147 135 164 M100 124 C92 142 89 157 88 174 M100 124 C108 142 112 157 112 174" fill="none" stroke="url(#goldMark)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="8" fill="#fff2b3" />
      <path d="M100 18 L104 30 L117 34 L104 38 L100 51 L96 38 L83 34 L96 30 Z" fill="#fff2b3" />
    </svg>
  )
}

function CaptureModal({ onClose, onSave, relatedTitle }) {
  const [text, setText] = useState('')
  const [type, setType] = useState('idea')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    const value = text.trim()
    if (!value) return
    onSave(value, type)
    setText('')
  }

  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="capture-modal">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close capture">
          <X size={18} />
        </button>
        <div className="singularity">
          <div className="singularity-core" />
          <div className="singularity-ring ring-a" />
          <div className="singularity-ring ring-b" />
        </div>
        <div>
          <p className="eyebrow">CAPTURE WITHOUT SWITCHING</p>
          <h2>Throw it into the vault.</h2>
          <p className="muted">It will be preserved{relatedTitle ? ` beside “${relatedTitle}”` : ''}. You do not need to follow it now.</p>
        </div>
        <label className="capture-type">
          <span>Store as</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="idea">Idea</option>
            <option value="project">Potential project</option>
            <option value="resource">Resource</option>
            <option value="research">Research question</option>
            <option value="note">Note</option>
          </select>
        </label>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
          }}
          placeholder="Get the thought out of your head…"
          rows={5}
        />
        <button className="primary-button" onClick={submit} disabled={!text.trim()}>
          <Sparkles size={18} />
          Capture & Return
        </button>
      </div>
    </div>
  )
}

function VaultPanel({ title, items, onClose, emptyText }) {
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vault-panel">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <p className="eyebrow">{title}</p>
        <div className="vault-list">
          {items.length === 0 ? <p className="muted">{emptyText}</p> : items.map((item, index) => (
            <article className="vault-item" key={item.id ?? index}>
              <span>{new Date(item.createdAt ?? item.completedAt).toLocaleString()}</span>
              <strong>{item.text ?? item.title}</strong>
              {item.relatedX && <small>{item.relatedX}</small>}
              {item.type && <small>Type: {item.type}</small>}
              {item.actualMs != null && <small>Actual: {formatDuration(item.actualMs)}</small>}
              {item.reason && <small>Lesson: {item.reason}</small>}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(initialState)
  const [selectedId, setSelectedId] = useState(null)
  const [captureOpen, setCaptureOpen] = useState(false)
  const [newXOpen, setNewXOpen] = useState(false)
  const [completionOpen, setCompletionOpen] = useState(false)
  const [panel, setPanel] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [drag, setDrag] = useState({ active: false, start: 0, delta: 0 })
  const [syncState, setSyncState] = useState({
    mode: cloudConfigured() ? 'cloud' : 'local',
    status: cloudConfigured() ? 'connecting' : 'ready',
    error: null,
  })
  const wheelRef = useRef(null)
  const hydratedRef = useRef(false)

  const tasks = useMemo(
    () => [...state.tasks].filter((t) => t.status !== 'done').sort((a, b) => b.priority - a.priority),
    [state.tasks],
  )

  const selected = tasks.find((task) => task.id === selectedId) ?? null
  const sessionTask = state.activeSession
    ? state.tasks.find((task) => task.id === state.activeSession.taskId)
    : null

  useEffect(() => {
    let cancelled = false

    hydrateState(state).then((result) => {
      if (cancelled) return
      if (result.state) setState(result.state)
      hydratedRef.current = true
      setSyncState({
        mode: result.mode,
        status: result.status,
        error: result.error ?? null,
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    writeCachedState(state)
    if (!hydratedRef.current) return

    setSyncState((current) => ({
      ...current,
      status: current.mode === 'cloud' ? 'syncing' : 'ready',
    }))

    const id = window.setTimeout(() => {
      persistState(state).then((result) => {
        setSyncState({
          mode: result.mode,
          status: result.status,
          error: result.error ?? null,
        })
      })
    }, 450)

    return () => window.clearTimeout(id)
  }, [state])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const active = state.activeSession?.activeTimeout
    if (!active || now < active.end) return
    setState((prev) => {
      if (!prev.activeSession?.activeTimeout) return prev
      const finished = prev.activeSession.activeTimeout
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          pausedMs: (prev.activeSession.pausedMs || 0) + (finished.end - finished.start),
          activeTimeout: null,
        },
      }
    })
  }, [now, state.activeSession?.activeTimeout])

  const expectedMs = (sessionTask?.expectedMinutes ?? 0) * 60_000
  const activeTimeoutElapsed = state.activeSession?.activeTimeout
    ? Math.min(now, state.activeSession.activeTimeout.end) - state.activeSession.activeTimeout.start
    : 0
  const elapsedMs = state.activeSession
    ? Math.max(0, now - state.activeSession.startedAt - (state.activeSession.pausedMs || 0) - activeTimeoutElapsed)
    : 0
  const remainingMs = expectedMs - elapsedMs
  const progress = expectedMs ? Math.min(1, elapsedMs / expectedMs) : 0

  const lockTask = () => {
    if (!selected) return
    setState((prev) => ({
      ...prev,
      activeSession: {
        taskId: selected.id,
        startedAt: Date.now(),
        pausedMs: 0,
        activeTimeout: null,
        tokens: { ten: false, thirty: false },
        blocked: false,
        completedSteps: [],
        blockerEvents: [],
      },
      tasks: prev.tasks.map((t) => (t.id === selected.id ? { ...t, status: 'doing' } : t)),
    }))
    setSelectedId(null)
    setDrag({ active: false, start: 0, delta: 0 })
  }

  const startTimeout = (minutes, key) => {
    if (!state.activeSession || state.activeSession.activeTimeout || state.activeSession.tokens?.[key]) return
    const start = Date.now()
    setState((prev) => ({
      ...prev,
      activeSession: {
        ...prev.activeSession,
        activeTimeout: { start, end: start + minutes * 60_000, minutes },
        tokens: { ...prev.activeSession.tokens, [key]: true },
      },
    }))
  }

  const createTask = (draft) => {
    setState((prev) => {
      const highestPriority = Math.max(0, ...prev.tasks.map((task) => task.priority ?? 0))
      return {
        ...prev,
        tasks: [
          {
            id: makeId(),
            ...draft,
            priority: highestPriority + 10,
            status: 'ready',
          },
          ...prev.tasks,
        ],
      }
    })
    setNewXOpen(false)
  }

  const toggleStep = (index) => {
    if (!state.activeSession) return
    setState((prev) => {
      if (!prev.activeSession) return prev
      const completed = new Set(prev.activeSession.completedSteps ?? [])
      if (completed.has(index)) completed.delete(index)
      else completed.add(index)
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          completedSteps: [...completed].sort((a, b) => a - b),
        },
      }
    })
  }

  const toggleBlocked = () => {
    setState((prev) => {
      if (!prev.activeSession) return prev
      const becomingBlocked = !prev.activeSession.blocked
      return {
        ...prev,
        activeSession: {
          ...prev.activeSession,
          blocked: becomingBlocked,
          blockerEvents: becomingBlocked
            ? [...(prev.activeSession.blockerEvents ?? []), { at: Date.now() }]
            : (prev.activeSession.blockerEvents ?? []),
        },
      }
    })
  }

  const requestComplete = () => {
    if (!state.activeSession || !sessionTask) return
    setCompletionOpen(true)
  }

  const finalizeCompletion = ({ reason, note, delivered }) => {
    if (!state.activeSession || !sessionTask) return

    const completion = {
      id: makeId(),
      taskId: sessionTask.id,
      title: sessionTask.title,
      completedAt: Date.now(),
      actualMs: elapsedMs,
      expectedMs,
      overtimeMs: Math.max(0, elapsedMs - expectedMs),
      reason,
      note,
      delivered,
      completedSteps: state.activeSession.completedSteps ?? [],
      blockerCount: state.activeSession.blockerEvents?.length ?? 0,
    }

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === sessionTask.id ? { ...t, status: 'done' } : t)),
      completions: [completion, ...prev.completions],
      activeSession: null,
    }))
    setCompletionOpen(false)
  }

  const saveCapture = (text, type = 'idea') => {
    setState((prev) => ({
      ...prev,
      captures: [
        {
          id: makeId(),
          text,
          type,
          createdAt: Date.now(),
          relatedX: sessionTask?.title ?? selected?.title ?? null,
        },
        ...prev.captures,
      ],
    }))
    setCaptureOpen(false)
  }

  const resetDemo = () => {
    if (!window.confirm('Replace the current XLock state with the demo tasks?')) return
    setState({ tasks: INITIAL_TASKS, activeSession: null, captures: [], completions: [] })
    setSelectedId(null)
  }

  const handlePointerDown = (e) => {
    if (!selected || !wheelRef.current) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ active: true, start: angleForPointer(e, wheelRef.current), delta: 0 })
  }

  const handlePointerMove = (e) => {
    if (!drag.active || !wheelRef.current) return
    const current = angleForPointer(e, wheelRef.current)
    setDrag((prev) => ({ ...prev, delta: normalizeAngle(current - prev.start) }))
  }

  const handlePointerUp = () => {
    if (!drag.active) return
    if (Math.abs(drag.delta) >= 28) {
      lockTask()
    } else {
      setDrag({ active: false, start: 0, delta: 0 })
    }
  }

  if (state.activeSession && sessionTask) {
    const timeout = state.activeSession.activeTimeout
    const timeoutRemaining = timeout ? Math.max(0, timeout.end - now) : 0
    const accent = sessionTask.primaryColor

    return (
      <main className="app locked" style={{ '--accent': accent, '--accent2': sessionTask.secondaryColor }}>
        <CosmicField
          colors={[sessionTask.secondaryColor, '#090313', sessionTask.primaryColor, '#1b1033']}
          intensity={0.5}
          speed={0.08}
        />
        <StarCursor />
        <header className="topbar locked-topbar">
          <div className="brand">
            <TreeXMark compact />
            <div>
              <span>XO</span>
              <small>XLOCK ACTIVE</small>
            </div>
          </div>
          <div className="lock-status">
            <LockKeyhole size={15} />
            One mission
          </div>
        </header>

        <section className="focus-stage">
          <div className="starrx-presence" aria-hidden="true">
            <div className="starrx-halo" />
            <div className="starrx-silhouette">
              <TreeXMark compact />
            </div>
            <span>STARRX</span>
          </div>

          <div className="focus-starrvis">
            <StarrVis
              compact
              mood={timeout ? 'sleepy' : state.activeSession.blocked ? 'warning' : remainingMs < 0 ? 'thinking' : 'excited'}
              message={
                timeout
                  ? 'Timeout active. I’ll bring you back.'
                  : state.activeSession.blocked
                    ? 'Solve only the blocker.'
                    : remainingMs < 0
                      ? 'Overtime. Finish the definition, not perfection.'
                      : 'Locked in.'
              }
            />
          </div>

          <div
            className={`focus-instrument ${timeout ? 'is-paused' : ''}`}
            style={{ '--progress': `${progress * 360}deg` }}
          >
            <div className="focus-ring ring-outer" />
            <div className="focus-ring ring-progress" />
            <div className="focus-ring ring-inner" />
            <div className="focus-core">
              <p className="eyebrow">{timeout ? 'TIMEOUT ACTIVE' : remainingMs >= 0 ? 'CURRENT X' : 'OVERTIME'}</p>
              <h1>{sessionTask.title}</h1>
              <div className="timer-readout">
                {timeout ? formatDuration(timeoutRemaining) : formatDuration(elapsedMs)}
              </div>
              <div className="timer-meta">
                {timeout ? (
                  <span>{timeout.minutes} minute timeout · returns automatically</span>
                ) : remainingMs >= 0 ? (
                  <span>{formatDuration(remainingMs)} remaining of {sessionTask.expectedMinutes}m</span>
                ) : (
                  <span className="overtime">OVER +{formatDuration(Math.abs(remainingMs))}</span>
                )}
              </div>
              <div className="definition">
                <span>Definition of Done</span>
                <p>{sessionTask.definitionOfDone}</p>
              </div>
            </div>
          </div>

          <div className="next-stack">
            <p className="eyebrow">NEXT</p>
            {sessionTask.nextSteps.slice(0, 3).map((step, index) => {
              const done = state.activeSession.completedSteps?.includes(index)
              return (
                <button
                  type="button"
                  className={`next-step next-step-button ${done ? 'done' : ''}`}
                  key={step}
                  onClick={() => toggleStep(index)}
                >
                  <span>{done ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </button>
              )
            })}
          </div>

          <div className="focus-actions">
            <button className="complete-button" onClick={requestComplete} disabled={!!timeout}>
              <Check size={20} />
              Complete X
            </button>
            <button className="secondary-button" onClick={() => setCaptureOpen(true)}>
              <Orbit size={19} />
              Capture Thought
            </button>
            <button
              className={`secondary-button ${state.activeSession.blocked ? 'active' : ''}`}
              onClick={toggleBlocked}
            >
              <CirclePause size={18} />
              {state.activeSession.blocked ? 'Blocker flagged' : 'I’m Blocked'}
            </button>
          </div>

          <div className="timeout-dock">
            <button
              className="timeout-token"
              disabled={!!timeout || state.activeSession.tokens?.ten}
              onClick={() => startTimeout(10, 'ten')}
            >
              <span className="token-orb"><TimerReset size={22} /></span>
              <strong>10 MIN</strong>
              <small>{state.activeSession.tokens?.ten ? 'SPENT' : '×1'}</small>
            </button>
            <button
              className="timeout-token"
              disabled={!!timeout || state.activeSession.tokens?.thirty}
              onClick={() => startTimeout(30, 'thirty')}
            >
              <span className="token-orb"><Clock3 size={22} /></span>
              <strong>30 MIN</strong>
              <small>{state.activeSession.tokens?.thirty ? 'SPENT' : '×1'}</small>
            </button>
          </div>

          {state.activeSession.blocked && (
            <div className="blocker-note">
              <Sparkles size={16} />
              Solve only the blocker. Do not open a new mission.
            </div>
          )}
        </section>

        <button className="capture-fab" onClick={() => setCaptureOpen(true)} aria-label="Capture thought">
          <Orbit size={23} />
        </button>

        {captureOpen && (
          <CaptureModal
            relatedTitle={sessionTask.title}
            onClose={() => setCaptureOpen(false)}
            onSave={saveCapture}
          />
        )}

        {completionOpen && (
          <CompletionModal
            taskTitle={sessionTask.title}
            overtime={remainingMs < 0}
            completedSteps={state.activeSession.completedSteps?.length ?? 0}
            totalSteps={sessionTask.nextSteps.slice(0, 3).length}
            onClose={() => setCompletionOpen(false)}
            onConfirm={finalizeCompletion}
          />
        )}
      </main>
    )
  }

  const segmentCount = Math.max(tasks.length, 1)
  const slice = 360 / segmentCount

  return (
    <main className="app unlocked">
      <CosmicField
        colors={['#130822', '#40195f', '#071730', '#9b5d1f']}
        intensity={0.56}
        speed={0.1}
      />
      <StarCursor />
      <header className="topbar">
        <div className="brand">
          <TreeXMark compact />
          <div>
            <span>XO</span>
            <small>CELESTIAL COMMITMENT INSTRUMENT</small>
          </div>
        </div>

        <div className="top-actions">
          <span
            className={`sync-pill ${syncState.status}`}
            title={syncState.error || (syncState.mode === 'cloud' ? 'Supabase sync enabled' : 'Local-first mode')}
          >
            {syncState.mode === 'cloud' && syncState.status !== 'offline'
              ? <Cloud size={14} />
              : <CloudOff size={14} />}
            {syncState.status === 'syncing'
              ? 'Syncing'
              : syncState.mode === 'cloud' && syncState.status === 'synced'
                ? 'Cloud'
                : 'Local'}
          </span>
          <button className="ghost-button" onClick={() => setNewXOpen(true)}>
            <Plus size={16} /> New X
          </button>
          <button className="ghost-button" onClick={() => setPanel('vault')}>
            <Vault size={16} /> Vault {state.captures.length}
          </button>
          <button className="ghost-button" onClick={() => setPanel('history')}>
            <Check size={16} /> Done {state.completions.length}
          </button>
        </div>
      </header>

      <section className="unlocked-stage">
        <motion.div
          className="intro-copy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">ONE FOCUS · INFINITE POSSIBILITY</p>
          <h1><span>Choose one.</span><span>Finish it.</span></h1>
          <p>Inspect the missions around the dial. When one deserves your attention, turn the instrument and lock in.</p>
        </motion.div>

        {tasks.length > 0 ? (
          <motion.div
            className={`wheel-shell ${selected ? 'has-selection' : ''}`}
            initial={{ opacity: 0, scale: .94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: .72, delay: .08, ease: [0.22, 1, 0.36, 1] }}
            ref={wheelRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="orbital-decoration orbit-one" />
            <div className="orbital-decoration orbit-two" />
            <svg
              className="task-wheel"
              viewBox="0 0 700 700"
              role="list"
              aria-label="Available X tasks"
              style={{ transform: `rotate(${selected ? drag.delta : 0}deg)` }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="7" result="soft" />
                  <feColorMatrix in="soft" type="matrix"
                    values="1 0 0 0 0.35  0 1 0 0 0.22  0 0 1 0 0.02  0 0 0 .72 0" result="goldSoft" />
                  <feMerge>
                    <feMergeNode in="goldSoft" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="coreGradient" cx="38%" cy="30%" r="78%">
                  <stop offset="0" stopColor="#2f2840" />
                  <stop offset=".28" stopColor="#16121f" />
                  <stop offset=".7" stopColor="#09080d" />
                  <stop offset="1" stopColor="#030305" />
                </radialGradient>
                <linearGradient id="coreRim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff6c8" stopOpacity=".9" />
                  <stop offset=".2" stopColor="#d9a94c" stopOpacity=".64" />
                  <stop offset=".55" stopColor="#69501e" stopOpacity=".32" />
                  <stop offset=".82" stopColor="#f6d77c" stopOpacity=".74" />
                  <stop offset="1" stopColor="#fff8d6" stopOpacity=".4" />
                </linearGradient>
              </defs>
              {tasks.map((task, index) => {
                const start = index * slice - slice / 2
                const end = start + slice - 4
                const mid = (start + end) / 2
                const lift = selectedId === task.id ? 18 : 0
                const liftPoint = polar(0, 0, lift, mid)
                return (
                  <g
                    key={task.id}
                    className={`task-segment ${selectedId === task.id ? 'selected' : ''}`}
                    role="listitem"
                    tabIndex="0"
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedId(task.id)}
                    onClick={(e) => {
                      if (drag.active && Math.abs(drag.delta) > 4) return
                      e.stopPropagation()
                      setSelectedId((current) => (current === task.id ? null : task.id))
                    }}
                    style={{ transform: `translate(${liftPoint.x}px, ${liftPoint.y}px)` }}
                  >
                    <path
                      d={arcPath(350, 350, 175, 300, start, end)}
                      fill={`url(#segment-${index})`}
                      stroke={selectedId === task.id ? '#fff4bc' : 'rgba(231,202,133,.34)'}
                      strokeWidth={selectedId === task.id ? 3.2 : 1.4}
                      filter={selectedId === task.id ? 'url(#selectedGlow)' : undefined}
                    />
                    <defs>
                      <linearGradient id={`segment-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#ffffff" stopOpacity=".18" />
                        <stop offset=".12" stopColor={task.primaryColor} stopOpacity=".72" />
                        <stop offset=".58" stopColor={task.secondaryColor} stopOpacity=".48" />
                        <stop offset=".86" stopColor={task.primaryColor} stopOpacity=".28" />
                        <stop offset="1" stopColor="#050407" stopOpacity=".9" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const label = polar(350, 350, 238, mid)
                      return (
                        <foreignObject x={label.x - 74} y={label.y - 31} width="148" height="62">
                          <div className="segment-label">
                            <strong>{task.title}</strong>
                            <small>{task.expectedMinutes}m</small>
                          </div>
                        </foreignObject>
                      )
                    })()}
                  </g>
                )
              })}

              <circle cx="350" cy="350" r="149" className="core-rim-disc" />
              <circle cx="350" cy="350" r="142" className="core-disc" fill="url(#coreGradient)" />
              <circle cx="350" cy="350" r="118" className="core-inner-disc" />
              <foreignObject x="245" y="245" width="210" height="210">
                <div className="wheel-core">
                  <div className="core-sigil"><TreeXMark compact /></div>
                  <strong>{selected ? 'X SELECTED' : 'UNI'}</strong>
                  <span>{selected ? selected.title : 'EXECUTION CORE'}</span>
                  <small>{selected ? 'Turn 28° to commit' : 'Choose deliberately'}</small>
                </div>
              </foreignObject>
            </svg>

            <div className="north-star-marker">
              <span />
              <small>UNI</small>
            </div>

            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.id}
                  className="selection-card visible"
                  initial={{ opacity: 0, y: 14, scale: .985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: .985 }}
                  transition={{ duration: .24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SpotlightPanel className="selection-material" spotlight="rgba(255, 224, 143, .16)">
                    <div className="selection-meta">
                      <span>{selected.category}</span>
                      <span>{selected.expectedMinutes} MIN</span>
                    </div>
                    <h2>{selected.title}</h2>
                    <p>{selected.definitionOfDone}</p>
                    <div className="selection-next">
                      {selected.nextSteps.slice(0, 3).map((step, index) => (
                        <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
                      ))}
                    </div>
                    <div className="commit-instruction">
                      <div className="commit-icon"><RotateCcw size={17} /></div>
                      <span>Turn the dial 28° to lock X</span>
                      <strong>{Math.min(100, Math.round((Math.abs(drag.delta) / 28) * 100))}%</strong>
                    </div>
                  </SpotlightPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty-complete">
            <TreeXMark />
            <p className="eyebrow">ALL CLEAR</p>
            <h2>You finished every current X.</h2>
            <div className="empty-actions">
              <button className="primary-button" onClick={() => setNewXOpen(true)}>
                <Plus size={18} /> Create an X
              </button>
              <button className="secondary-button" onClick={resetDemo}>
                <RotateCcw size={18} /> Restore demo tasks
              </button>
            </div>
          </div>
        )}

        <motion.div
          className="starrvis-perch"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .45, delay: .3 }}
        >
          <div className="starrvis-console-label">STARRVIS</div>
          <StarrVis
            compact
            mood={selected ? 'curious' : 'idle'}
            message={selected ? 'Commit when it feels right.' : 'One mission. I’ll hold the rest.'}
          />
        </motion.div>
      </section>

      <footer className="footer-bar">
        <span>{tasks.length} available X{tasks.length === 1 ? '' : 's'}</span>
        <button onClick={resetDemo}>Reset demo</button>
      </footer>

      <button className="capture-fab" onClick={() => setCaptureOpen(true)} aria-label="Capture thought">
        <Orbit size={23} />
      </button>

      {captureOpen && (
        <CaptureModal
          relatedTitle={selected?.title}
          onClose={() => setCaptureOpen(false)}
          onSave={saveCapture}
        />
      )}

      {newXOpen && (
        <NewXModal
          onClose={() => setNewXOpen(false)}
          onCreate={createTask}
        />
      )}

      {panel === 'vault' && (
        <VaultPanel
          title="STARRTRACK VAULT"
          items={state.captures}
          onClose={() => setPanel(null)}
          emptyText="No captured thoughts yet."
        />
      )}

      {panel === 'history' && (
        <VaultPanel
          title="COMPLETION HISTORY"
          items={state.completions}
          onClose={() => setPanel(null)}
          emptyText="No completed Xs yet."
        />
      )}
    </main>
  )
}
