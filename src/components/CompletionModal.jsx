import React, { useState } from 'react'
import { Check, X } from 'lucide-react'

const REASONS = [
  ['on-plan', 'Finished roughly as expected'],
  ['estimate-wrong', 'Estimate was wrong'],
  ['scope-expanded', 'Scope expanded'],
  ['blocker', 'A blocker added time'],
  ['distraction', 'Distraction added time'],
  ['extra-quality', 'Deliberate extra quality'],
  ['technical-tail', 'Export / upload / technical tail'],
]

export default function CompletionModal({
  onClose,
  onConfirm,
  taskTitle,
  overtime,
  completedSteps,
  totalSteps,
}) {
  const [reason, setReason] = useState(overtime ? 'estimate-wrong' : 'on-plan')
  const [note, setNote] = useState('')
  const [delivered, setDelivered] = useState(true)

  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="x-form-modal completion-modal">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div>
          <p className="eyebrow">COMPLETE X</p>
          <h2>{taskTitle}</h2>
          <p className="muted">
            {completedSteps}/{totalSteps} NEXT actions checked. Record one reason so UNI can improve future estimates.
          </p>
        </div>

        <label>
          <span>Primary timing lesson</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label>
          <span>Optional note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What most affected completion?"
            rows={3}
          />
        </label>

        <label className="check-row">
          <input type="checkbox" checked={delivered} onChange={(e) => setDelivered(e.target.checked)} />
          <span>Delivered / published / actually finished outside the app</span>
        </label>

        <button className="primary-button" onClick={() => onConfirm({ reason, note: note.trim(), delivered })}>
          <Check size={18} />
          Confirm completion
        </button>
      </div>
    </div>
  )
}
