import { useState, useEffect, useRef } from 'react'
import ParticleBurst from './ParticleBurst'

// Milestone thresholds → particle colours (bronze / silver / gold)
const MILESTONES = {
  3:  '#bf8040',  // warm bronze
  5:  '#a0a8b0',  // cool silver
  10: '#d4a017',  // rich gold
}

export default function ScoreDisplay({ streak, bestStreak }) {
  const [bursts, setBursts]                 = useState([])
  const [milestoneColor, setMilestoneColor] = useState(null)
  const prevStreakRef  = useRef(0)
  const colorTimerRef = useRef(null)

  useEffect(() => {
    const prev = prevStreakRef.current
    prevStreakRef.current = streak

    if (streak > prev && MILESTONES[streak]) {
      const color = MILESTONES[streak]
      // Spawn a particle burst
      setBursts((bs) => [...bs, { id: Date.now(), color }])
      // Briefly tint the streak number the milestone colour
      setMilestoneColor(color)
      clearTimeout(colorTimerRef.current)
      colorTimerRef.current = setTimeout(() => setMilestoneColor(null), 700)
    } else if (streak < prev) {
      // Streak reset — clear any lingering colour immediately
      clearTimeout(colorTimerRef.current)
      setMilestoneColor(null)
    }
  }, [streak])

  const removeBurst = (id) => setBursts((bs) => bs.filter((b) => b.id !== id))

  return (
    <div className="score-display">
      <div className="score-item score-item--streak">
        <span className="score-label">streak</span>
        <span
          className="score-value"
          style={milestoneColor
            ? { color: milestoneColor, transition: 'color 0.15s ease' }
            : { transition: 'color 0.5s ease' }
          }
        >
          {streak}
        </span>

        {/* Particle bursts are positioned relative to this element */}
        {bursts.map((b) => (
          <ParticleBurst key={b.id} color={b.color} onDone={() => removeBurst(b.id)} />
        ))}
      </div>

      {bestStreak > 0 && (
        <div className="score-item">
          <span className="score-label">best</span>
          <span className="score-value">{bestStreak}</span>
        </div>
      )}
    </div>
  )
}
