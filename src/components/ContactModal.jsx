import { useEffect } from 'react'

/**
 * Contact & Info popup triggered from the footer.
 * Reuses modal-backdrop / modal base styles; sized via .contact-modal.
 */
export default function ContactModal({ onClose }) {
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
      aria-label="Contact & Info"
    >
      <div className="modal contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="modal-context">Contact & Info</p>

        <p className="contact-about">
          America In Data is a project to make raw numbers from spreadsheets
          more interesting. I hope you enjoy the game and learn something new.
        </p>

        <div className="contact-links">
          <a
            href="mailto:andrew@americaindata.com"
            className="contact-link"
          >
            andrew@americaindata.com
          </a>
          <a
            href="https://andrewvu.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            Newsletter on Substack ↗
          </a>
        </div>
      </div>
    </div>
  )
}
