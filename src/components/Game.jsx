import { useState, useEffect, useCallback } from 'react'
import { selectPair, isCorrect, formatPair } from '../utils/gameLogic'
import { questionTypes } from '../data/topics'
import ItemButton from './ItemButton'
import ScoreDisplay from './ScoreDisplay'
import InfoModal from './InfoModal'
import ContactModal from './ContactModal'
import VersionModal from './VersionModal'

// Share icon — arrow pointing up from a box
function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

// Link chain icon for the copy-link button
function CopyLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

// Circular refresh ring with a play triangle in the centre
function NextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {/* Circular refresh arrows */}
      <path
        d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3v5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Play triangle in the centre */}
      <polygon points="10,8.5 17,12 10,15.5" fill="currentColor" />
    </svg>
  )
}

/**
 * Pick a random question type and a valid item pair for it.
 * If the new type uses the same dataset as the previous round,
 * the previous pair is passed through to avoid repeating items.
 */
function pickRound(datasets, prevType, prevPair) {
  const type     = questionTypes[Math.floor(Math.random() * questionTypes.length)]
  const items    = datasets[type.dataPath]
  const lastPair = prevType?.dataPath === type.dataPath ? prevPair : null
  const pair     = selectPair(items, type.pairingKey, lastPair, type.valueKey)
  return { type, pair }
}

export default function Game() {
  const [datasets, setDatasets]       = useState(null)
  const [currentType, setCurrentType] = useState(null)
  const [pair, setPair]               = useState(null)
  const [revealed, setRevealed]       = useState(false)
  const [selectedSide, setSelectedSide] = useState(null)
  const [streak, setStreak]           = useState(0)
  const [bestStreak, setBestStreak]   = useState(0)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showCopied, setShowCopied]         = useState(false)
  const [showLinkCopied, setShowLinkCopied] = useState(false)
  const [showVersion, setShowVersion]       = useState(false)

  // Load all unique data files in parallel on mount
  useEffect(() => {
    const uniquePaths = [...new Set(questionTypes.map((t) => t.dataPath))]

    Promise.all(
      uniquePaths.map((path) =>
        fetch(path)
          .then((r) => {
            if (!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`)
            return r.json()
          })
          .then((data) => ({ path, data })),
      ),
    )
      .then((results) => {
        const loaded = {}
        results.forEach(({ path, data }) => { loaded[path] = data })
        setDatasets(loaded)
        const { type, pair } = pickRound(loaded, null, null)
        setCurrentType(type)
        setPair(pair)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSelect = useCallback(
    (side) => {
      if (revealed || !pair || !currentType) return

      setSelectedSide(side)
      setRevealed(true)

      const selectedItem = side === 'left' ? pair[0] : pair[1]
      const correct = isCorrect(selectedItem, pair[0], pair[1], currentType.valueKey)

      if (correct) {
        setStreak((s) => {
          const next = s + 1
          setBestStreak((b) => Math.max(b, next))
          return next
        })
      } else {
        setStreak(0)
      }
    },
    [revealed, pair, currentType],
  )

  const handleShare = useCallback(async () => {
    const text = streak > 0
      ? `I'm on a ${streak}-question streak on America in Data! 🇺🇸`
      : 'Higher or lower with real US government data. 🇺🇸'
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'America in Data', text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }
    } catch {
      // user cancelled or permission denied — do nothing
    }
  }, [streak])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowLinkCopied(true)
      setTimeout(() => setShowLinkCopied(false), 2000)
    } catch {
      // permission denied — do nothing
    }
  }, [])

  const handleNext = useCallback(() => {
    if (!revealed || !datasets) return
    setShowModal(false)
    const { type, pair: newPair } = pickRound(datasets, currentType, pair)
    setCurrentType(type)
    setPair(newPair)
    setRevealed(false)
    setSelectedSide(null)
  }, [revealed, datasets, currentType, pair])

  // Keyboard shortcut: Enter / Space to advance after reveal
  useEffect(() => {
    function onKey(e) {
      if (revealed && (e.key === 'Enter' || e.key === ' ') && !showModal) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, showModal, handleNext])

  if (loading) return <div className="game-loading"><span>Loading&hellip;</span></div>
  if (error)   return <div className="game-loading"><span>Error: {error}</span></div>
  if (!pair || !currentType) return null

  const [item1, item2] = pair

  // Determine button states
  let state1 = 'idle'
  let state2 = 'idle'
  if (revealed && selectedSide) {
    const selectedItem = selectedSide === 'left' ? pair[0] : pair[1]
    const correct = isCorrect(selectedItem, pair[0], pair[1], currentType.valueKey)
    if (selectedSide === 'left') {
      state1 = correct ? 'correct' : 'incorrect'
      state2 = 'dimmed'
    } else {
      state1 = 'dimmed'
      state2 = correct ? 'correct' : 'incorrect'
    }
  }

  // Smart formatting: increase decimals until both values display differently
  const [display1, display2] = formatPair(
    item1[currentType.valueKey],
    item2[currentType.valueKey],
    currentType.formatType,
  )

  // For CPI (percent formatType), compute an extra "$X,XXX.XX from $80k household budget" line
  function cpiSubValue(item) {
    const dollars = (item[currentType.valueKey] / 100) * 80_000
    const dollarsStr = dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return `${dollarsStr} from $80k household budget`
  }
  const subValue1 = currentType.formatType === 'percent' ? cpiSubValue(item1) : null
  const subValue2 = currentType.formatType === 'percent' ? cpiSubValue(item2) : null

  return (
    <div className="game">
      <header className="game-header">
        <div className="header-actions">
          <button
            className="share-btn"
            onClick={handleShare}
            aria-label="Share"
            title="Share"
          >
            {showCopied ? <span className="share-btn-copied">Copied!</span> : <ShareIcon />}
          </button>
          <button
            className="share-btn"
            onClick={handleCopyLink}
            aria-label="Copy link"
            title="Copy link"
          >
            {showLinkCopied ? <span className="share-btn-copied">Copied!</span> : <CopyLinkIcon />}
          </button>
        </div>
        <ScoreDisplay streak={streak} bestStreak={bestStreak} />
      </header>

      <main className="game-main">
        <h1 className="question">{currentType.question}</h1>

        <div className="game-area">
          <ItemButton
            item={item1}
            onClick={() => handleSelect('left')}
            state={state1}
            revealed={revealed}
            displayValue={display1}
            subValue={subValue1}
          />

          {/* Always in the DOM; CSS fades it in/out to avoid layout shift */}
          <button
            className={`next-btn${revealed ? ' next-btn--active' : ''}`}
            onClick={revealed ? handleNext : undefined}
            aria-label="Next round"
            title="Next round (Enter)"
            tabIndex={revealed ? 0 : -1}
          >
            <NextIcon />
          </button>

          <ItemButton
            item={item2}
            onClick={() => handleSelect('right')}
            state={state2}
            revealed={revealed}
            displayValue={display2}
            subValue={subValue2}
          />
        </div>
      </main>

      <footer className="game-footer">
        {/* More info sits just above the divider line */}
        <div className="footer-above-line">
          <button
            className={`more-info-btn${revealed ? '' : ' more-info-btn--hidden'}`}
            onClick={revealed ? () => setShowModal(true) : undefined}
            tabIndex={revealed ? 0 : -1}
            aria-hidden={!revealed}
          >
            more info
          </button>
        </div>

        <div className="footer-grid">
          <div className="footer-left">
            <span className="footer-attribution">
              Created by Andrew Vu -{' '}
              <button className="version-btn" onClick={() => setShowVersion(true)}>V1.0</button>
            </span>
            <button
              className="footer-contact-btn"
              onClick={() => setShowContact(true)}
            >
              Contact & Info
            </button>
          </div>

          <div className="footer-logo" aria-label="America in Data">
            <span className="logo-word">AMERICA</span>
            <span className="logo-in">in</span>
            <span className="logo-word">DATA</span>
          </div>

          <span className="footer-source">{currentType.source}</span>
        </div>
      </footer>

      {showModal && (
        <InfoModal
          pair={pair}
          type={currentType}
          onClose={() => setShowModal(false)}
        />
      )}

      {showContact && (
        <ContactModal onClose={() => setShowContact(false)} />
      )}

      {showVersion && (
        <VersionModal onClose={() => setShowVersion(false)} />
      )}
    </div>
  )
}
