import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarClock, CheckCircle2, GitBranch, RefreshCw } from 'lucide-react'
import { getBridgeAccessToken } from '../lib/persistence.js'

function formatDue(raw) {
  if (!raw) return 'No deadline'
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw
  const date = new Date(raw)
  if (!Number.isFinite(date.getTime())) return raw
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function StarrLignFeed() {
  const [refreshCount, setRefreshCount] = useState(0)
  const [feed, setFeed] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setStatus('loading')
      try {
        const token = await getBridgeAccessToken()
        if (!token) throw new Error('Cloud sign-in is required')
        const response = await fetch('/api/xlock/tasks', {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Bridge not available')
        const payload = await response.json()
        if (!payload?.success || !Array.isArray(payload.tasks)) throw new Error('Invalid task feed')
        if (cancelled) return
        setFeed(payload)
        setStatus('ready')
      } catch {
        if (cancelled) return
        setFeed(null)
        setStatus('unavailable')
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshCount])

  const candidates = feed?.tasks || []
  const nowCandidate = candidates.find((task) => task.isReady) || candidates[0]
  const horizon = candidates.filter((task) => task.sourceTaskId !== nowCandidate?.sourceTaskId).slice(0, 3)

  return (
    <section className="starrlign-feed" aria-label="StarrLign task horizon">
      <header className="starrlign-feed-heading">
        <div>
          <span className="starrlign-feed-eyebrow">STARRLIGN · TASK SOURCE</span>
          <h2>What deserves attention?</h2>
        </div>
        <div className="starrlign-feed-actions">
          <span className="starrlign-readonly">READ-ONLY</span>
          <button type="button" className="starrlign-refresh" onClick={() => setRefreshCount((n) => n + 1)}
            aria-label="Refresh StarrLign task feed" disabled={status === 'loading'}>
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {status === 'loading' ? (
        <p className="starrlign-feed-muted" role="status">Checking your StarrLign task signal…</p>
      ) : status === 'unavailable' ? (
        <p className="starrlign-feed-muted" role="status">
          The secure StarrLign connection is not enabled yet. Your existing XLock focus tasks are unchanged.
        </p>
      ) : !nowCandidate ? (
        <p className="starrlign-feed-muted">No active committed tasks found in StarrLign.</p>
      ) : (
        <div className="starrlign-feed-grid">
          <article className="starrlign-now-candidate">
            <span className="starrlign-feed-eyebrow">SUGGESTED NEXT · NOT LOCKED</span>
            <strong>{nowCandidate.title}</strong>
            <div className="starrlign-task-facts">
              <span><CalendarClock size={13} />{formatDue(nowCandidate.due)}</span>
              <span><GitBranch size={13} />{nowCandidate.unlocksCount} downstream</span>
            </div>
            <p className="starrlign-feed-muted">
              {nowCandidate.blockedByIds.length
                ? 'Waiting for ' + nowCandidate.blockedByIds.length + ' prerequisite task(s).'
                : nowCandidate.reasons[0] || 'Available to work on.'}
            </p>
            {nowCandidate.nextSteps?.length > 0 && (
              <div className="starrlign-next-preview">
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>{nowCandidate.nextSteps[0]}</span>
              </div>
            )}
          </article>
          <div className="starrlign-horizon-preview">
            <span className="starrlign-feed-eyebrow">HORIZON · UP TO 3</span>
            {horizon.map((task) => (
              <div className="starrlign-horizon-row" key={task.sourceTaskId}>
                <span className="starrlign-horizon-title">{task.title}</span>
                <span className="starrlign-horizon-date">
                  {task.isReady ? <ArrowUpRight size={12} /> : <GitBranch size={12} />}
                  {task.isReady ? formatDue(task.due) : 'Blocked'}
                </span>
              </div>
            ))}
            {!horizon.length && <p className="starrlign-feed-muted">Nothing else approaching.</p>}
            <small className="starrlign-feed-freshness">
              StarrLign records · updated {new Date(feed.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </small>
          </div>
        </div>
      )}
    </section>
  )
}
