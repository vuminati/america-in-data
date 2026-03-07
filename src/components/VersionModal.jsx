import { useEffect } from 'react'

/**
 * Version history popup triggered from the footer "V1.0" link.
 * Add new entries to VERSIONS (newest first) as the project evolves.
 */
const VERSIONS = [
  {
    version: 'V1.0',
    date: 'March 2026',
    description: 'Initial release',
  },
]

export default function VersionModal({ onClose }) {
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
      aria-label="Version history"
    >
      <div className="modal version-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-context">Version History</p>

        <div className="version-list">
          {VERSIONS.map(({ version, date, description }) => (
            <div key={version} className="version-item">
              <span className="version-tag">{version}</span>
              <span className="version-desc">
                {date && <span className="version-date">{date} — </span>}
                {description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
