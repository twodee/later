import { useState } from 'react'
import './App.css'

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'years']

const UNIT_MS = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  years: 365.25 * 24 * 60 * 60 * 1000,
}

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function App() {
  const [origin, setOrigin] = useState(toLocalDatetimeValue(new Date()))
  const [offsets, setOffsets] = useState([{ id: 1, amount: 1, unit: 'hours' }])
  const [nextId, setNextId] = useState(2)

  function addOffset() {
    setOffsets([...offsets, { id: nextId, amount: 1, unit: 'hours' }])
    setNextId(nextId + 1)
  }

  function removeOffset(id) {
    setOffsets(offsets.filter((o) => o.id !== id))
  }

  function updateOffset(id, field, value) {
    setOffsets(offsets.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  const resultMs =
    new Date(origin).getTime() +
    offsets.reduce((sum, o) => sum + Number(o.amount) * UNIT_MS[o.unit], 0)

  const result = isNaN(resultMs) ? null : new Date(resultMs)

  return (
    <div className="app">
      <h1>Later</h1>

      <section className="section">
        <label className="label">Origin</label>
        <input
          type="datetime-local"
          step="1"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="datetime-input"
        />
      </section>

      <section className="section">
        <label className="label">Offsets</label>
        {offsets.map((offset) => (
          <div key={offset.id} className="offset-row">
            <input
              type="number"
              value={offset.amount}
              onChange={(e) => updateOffset(offset.id, 'amount', e.target.value)}
              className="amount-input"
            />
            <select
              value={offset.unit}
              onChange={(e) => updateOffset(offset.id, 'unit', e.target.value)}
              className="unit-select"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <button onClick={() => removeOffset(offset.id)} className="remove-button" aria-label="Remove offset">✕</button>
          </div>
        ))}
        <button onClick={addOffset} className="add-button">+ Add offset</button>
      </section>

      <section className="section result-section">
        <label className="label">Result</label>
        <div className="result-row">
          <div className="result">
            {result ? result.toLocaleString() : '—'}
          </div>
          {result && (
            <button
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(result.toLocaleString())}
              aria-label="Copy result"
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>content_copy</span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
