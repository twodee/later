import { useState } from 'react';
import './App.css';
import { translations } from './i18n';

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'years', 'decades', 'score', 'centuries'];

const UNIT_MS = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
};

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function App() {
  const [origin, setOrigin] = useState(toLocalDatetimeValue(new Date()));
  const [offsets, setOffsets] = useState([{ id: 1, amount: 1, unit: 'hours' }]);
  const [nextId, setNextId] = useState(2);
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  function addOffset() {
    setOffsets([...offsets, { id: nextId, amount: 1, unit: 'hours' }]);
    setNextId(nextId + 1);
  }

  function removeOffset(id) {
    setOffsets(offsets.filter((o) => o.id !== id));
  }

  function updateOffset(id, field, value) {
    setOffsets(offsets.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  }

  const YEARS_PER_UNIT = { years: 1, decades: 10, score: 20, centuries: 100 };

  function computeResult() {
    const date = new Date(origin);
    if (isNaN(date.getTime())) return null;

    let totalYears = 0;
    let totalDays = 0;
    let totalMs = 0;
    for (const o of offsets) {
      const amount = Number(o.amount);
      if (o.unit in YEARS_PER_UNIT) {
        totalYears += amount * YEARS_PER_UNIT[o.unit];
      } else if (o.unit === 'days') {
        totalDays += amount;
      } else {
        totalMs += amount * UNIT_MS[o.unit];
      }
    }

    date.setFullYear(date.getFullYear() + totalYears);
    date.setDate(date.getDate() + totalDays);
    return new Date(date.getTime() + totalMs);
  }

  const result = computeResult();

  return (
    <div className="app">
      <div className="lang-switcher">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="lang-select"
          aria-label="Language"
        >
          {Object.keys(translations).map((code) => (
            <option key={code} value={code}>{code.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <h1>{t.appTitle}</h1>

      <section className="section">
        <label className="label">{t.origin}</label>
        <input
          type="datetime-local"
          step="1"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="datetime-input"
        />
      </section>

      <section className="section">
        <label className="label">{t.offsets}</label>
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
                <option key={u} value={u}>{t.units[u]}</option>
              ))}
            </select>
            <button onClick={() => removeOffset(offset.id)} className="remove-button" aria-label={t.removeOffset}>✕</button>
          </div>
        ))}
        <button onClick={addOffset} className="add-button">{t.addOffset}</button>
      </section>

      <section className="section result-section">
        <label className="label">{t.result}</label>
        <div className="result-row">
          <div className="result">
            {result ? result.toLocaleString(t.locale) : '—'}
          </div>
          {result && (
            <button
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(result.toLocaleString(t.locale))}
              aria-label={t.copyResult}
            >
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>content_copy</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
