import type { Card as CardType } from '../../types/card'
import styles from './Card.module.css'

interface CardProps {
  card: CardType
  isSelected: boolean
  onClick: () => void
}

function Shape({ shape, color, shading }: { shape: string; color: string; shading: string }) {
  const fillColor = shading === 'empty' ? 'transparent' : `var(--color-${color})`
  const strokeColor = `var(--color-${color})`
  const patternId = `stripes-${color}`

  const shapePaths: Record<string, React.ReactNode> = {
    diamond: (
      <polygon
        points="25,0 50,25 25,50 0,25"
        fill={shading === 'striped' ? `url(#${patternId})` : fillColor}
        stroke={strokeColor}
        strokeWidth="2"
      />
    ),
    circle: (
      <ellipse
        cx="26"
        cy="26"
        rx="23"
        ry="23"
        fill={shading === 'striped' ? `url(#${patternId})` : fillColor}
        stroke={strokeColor}
        strokeWidth="2"
      />
    ),
    square: (
      <rect
        x="4"
        y="4"
        width="42"
        height="42"
        fill={shading === 'striped' ? `url(#${patternId})` : fillColor}
        stroke={strokeColor}
        strokeWidth="2"
      />
    ),
  }

  return (
    <svg viewBox="0 0 50 50" className={styles.shape}>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
          <line x1="0" y1="0" x2="4" y2="0" stroke={strokeColor} strokeWidth="2" />
        </pattern>
      </defs>
      {shapePaths[shape]}
    </svg>
  )
}

export function Card({ card, isSelected, onClick }: CardProps) {
  const shapes = Array.from({ length: card.count }, (_, i) => (
    <Shape key={i} shape={card.shape} color={card.color} shading={card.shading} />
  ))

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.shapes}>{shapes}</div>
    </div>
  )
}
