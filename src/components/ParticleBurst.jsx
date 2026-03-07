import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 26

/**
 * Renders a burst of coloured particles that fly outward from the centre
 * of the nearest `position: relative` ancestor, then cleans itself up.
 *
 * @param {string}   color  - CSS colour for the particles
 * @param {Function} onDone - Called after the animation finishes
 */
export default function ParticleBurst({ color, onDone }) {
  // Generate particle data once and keep it stable across re-renders
  const particles = useRef(
    [...Array(PARTICLE_COUNT)].map(() => {
      const angle = Math.random() * 2 * Math.PI
      const dist  = 38 + Math.random() * 52
      return {
        dx:    Math.cos(angle) * dist,
        dy:    Math.sin(angle) * dist,
        size:  3 + Math.random() * 4.5,
        delay: Math.random() * 110,
      }
    }),
  ).current

  useEffect(() => {
    const t = setTimeout(onDone, 950)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="particle-container" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width:           p.size,
            height:          p.size,
            backgroundColor: color,
            animationDelay:  `${p.delay}ms`,
            '--dx':          `${p.dx}px`,
            '--dy':          `${p.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
