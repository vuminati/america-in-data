import { useState } from 'react'

// ─── Change this password to anything you want ────────────────────────────────
const ACCESS_PASSWORD = 'america2024'
// ─────────────────────────────────────────────────────────────────────────────

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    // Stay unlocked for the rest of the browser session
    return sessionStorage.getItem('aid-unlocked') === '1'
  })
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)

  if (unlocked) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === ACCESS_PASSWORD) {
      sessionStorage.setItem('aid-unlocked', '1')
      setUnlocked(true)
    } else {
      setError(true)
      setShake(true)
      setInput('')
      setTimeout(() => {
        setShake(false)
        setError(false)
      }, 600)
    }
  }

  return (
    <div className="gate">
      <div className="gate-card">
        {/* Reuse the same logo markup as the footer */}
        <div className="footer-logo gate-logo" aria-label="America in Data">
          <span className="logo-word">AMERICA</span>
          <span className="logo-in">in</span>
          <span className="logo-word">DATA</span>
        </div>

        <form
          className={`gate-form${shake ? ' gate-form--shake' : ''}`}
          onSubmit={handleSubmit}
        >
          <input
            className={`gate-input${error ? ' gate-input--error' : ''}`}
            type="password"
            placeholder="Password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          <button className="gate-btn" type="submit">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
