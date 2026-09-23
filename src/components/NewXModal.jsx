import React, { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

const CATEGORY_PRESETS = {
  Grounding: ['#ef6257', '#9b2f3f'],
  Creative: ['#f2924d', '#d04f8d'],
  Execution: ['#f6c453', '#f48f2e'],
  Relationship: ['#5bcf86', '#238f73'],
  Communication: ['#4f9fe8', '#6755d9'],
  Vision: ['#7a5ce7', '#4f46c7'],
  Integration: ['#a66ce6', '#df80c8'],
}

export default function NewXModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Execution')
  const [expectedMinutes, setExpectedMinutes] = useState(45)
  const [definitionOfDone, setDefinitionOfDone] = useState('')
  const [steps, setSteps] = useState('')

  const nextSteps = useMemo(
    () => steps.split('\n').map((step) => step.trim()).filter(Boolean).slice(0, 3),
    [steps],
  )

  const submit = (event) => {
    event.preventDefault()
    const cleanTitle = title.trim()
    const cleanDone = definitionOfDone.trim()
    if (!cleanTitle || !cleanDone || nextSteps.length === 0) return

    const [primaryColor, secondaryColor] = CATEGORY_PRESETS[category]
    onCreate({
      title: cleanTitle,
      category,
      expectedMinutes: Math.max(1, Number(expectedMinutes) || 1),
      definitionOfDone: cleanDone,
      nextSteps,
      primaryColor,
      secondaryColor,
    })
  }

  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="x-form-modal" onSubmit={submit}>
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div>
          <p className="eyebrow">DEFINE THE MISSION</p>
          <h2>Create a new X.</h2>
          <p className="muted">One observable outcome, one stopping condition, and only the next 1–3 actions.</p>
        </div>

        <label>
          <span>X title</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish client landing page" />
        </label>

        <div className="form-grid">
          <label>
            <span>Mode / color</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.keys(CATEGORY_PRESETS).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Expected minutes</span>
            <input
              type="number"
              min="1"
              max="1440"
              value={expectedMinutes}
              onChange={(e) => setExpectedMinutes(e.target.value)}
            />
          </label>
        </div>

        <label>
          <span>Definition of Done</span>
          <textarea
            value={definitionOfDone}
            onChange={(e) => setDefinitionOfDone(e.target.value)}
            placeholder="What observable condition means this X is actually finished?"
            rows={3}
          />
        </label>

        <label>
          <span>NEXT — one action per line, max 3</span>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={'Open current draft\nFix hero copy\nPublish and verify'}
            rows={4}
          />
          <small>{nextSteps.length}/3 actions ready</small>
        </label>

        <button className="primary-button" type="submit" disabled={!title.trim() || !definitionOfDone.trim() || nextSteps.length === 0}>
          <Plus size={18} />
          Add X to wheel
        </button>
      </form>
    </div>
  )
}
