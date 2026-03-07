import { useEffect } from 'react'
import { getCorrectItem } from '../utils/gameLogic'

/**
 * Small popup that appears after an answer is revealed.
 * Shows the exact values for both items and a comparison sentence.
 *
 * @param {Array}    pair    - [item1, item2] from the current round
 * @param {Object}   type    - The current question type config
 * @param {Function} onClose - Called when the modal should close
 */
export default function InfoModal({ pair, type, onClose }) {
  const [item1, item2] = pair
  const { valueKey, displayKey, contextLabel } = type

  const winner = getCorrectItem(item1, item2, valueKey)
  const loser  = winner === item1 ? item2 : item1

  const winnerVal = winner[valueKey]
  const loserVal  = loser[valueKey]
  const ratio     = loserVal > 0 ? winnerVal / loserVal : Infinity

  // Use the pre-formatted strings from the JSON data via the type config
  const winnerDisplay = winner[displayKey]
  const loserDisplay  = loser[displayKey]
  const context       = contextLabel

  // "2.4× as much as" for large gaps; "14% more than" for small ones
  // pctStr keeps at least 1 significant figure (e.g. 0.044% not 0%)
  const pct = (ratio - 1) * 100
  const pctStr = pct >= 1
    ? `${Math.round(pct)}%`
    : pct >= 0.1
    ? `${pct.toFixed(1)}%`
    : pct >= 0.01
    ? `${pct.toFixed(2)}%`
    : `${pct.toFixed(3)}%`
  const diff = ratio >= 2
    ? `${ratio.toFixed(1)}× as much as`
    : `${pctStr} more than`

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="More information"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-context">{context}</p>

        <p className="modal-summary">
          <strong>{winner.display_name}</strong> ({winnerDisplay}) is {diff}{' '}
          <strong>{loser.display_name}</strong> ({loserDisplay}).
        </p>

        <div className="modal-rows">
          <div className="modal-row modal-row--winner">
            <div className="modal-row-left">
              <span className="modal-row-name">{winner.display_name}</span>
              {type.idKey && (
                <span className="modal-row-id">{type.idLabel} {winner[type.idKey]}</span>
              )}
            </div>
            <span className="modal-row-value">{winnerDisplay}</span>
          </div>
          <div className="modal-row modal-row--loser">
            <div className="modal-row-left">
              <span className="modal-row-name">{loser.display_name}</span>
              {type.idKey && (
                <span className="modal-row-id">{type.idLabel} {loser[type.idKey]}</span>
              )}
            </div>
            <span className="modal-row-value">{loserDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
