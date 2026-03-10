import { useState, useEffect } from 'react';
import './App.css';
import { translations } from './i18n';

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'years', 'score'];

const UNIT_MS = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  years: 365.25 * 24 * 60 * 60 * 1000,
  score: 20 * 365.25 * 24 * 60 * 60 * 1000,
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
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

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

  const resultMs =
    new Date(origin).getTime() +
    offsets.reduce((sum, o) => sum + Number(o.amount) * UNIT_MS[o.unit], 0);

  const result = isNaN(resultMs) ? null : new Date(resultMs);

  return (
    <div className="app">
      <div className="lang-switcher">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={t.toggleTheme}
        >
          <span className="material-icons">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
        </button>
        {Object.keys(translations).map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`lang-button${lang === code ? ' lang-button--active' : ''}`}
            aria-label={translations[code].langLabel}
          >
            {code.toUpperCase()}
          </button>
        ))}
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
