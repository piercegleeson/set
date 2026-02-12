import type { Card as CardType } from '../../types/card'
import { Card } from '../Card/Card'
import styles from './Board.module.css'

interface BoardProps {
  cards: CardType[]
  selectedIds: string[]
  hintIds: string[]
  onCardClick: (card: CardType) => void
}

export function Board({ cards, selectedIds, hintIds, onCardClick }: BoardProps) {
  return (
    <div className={styles.board}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          isSelected={selectedIds.includes(card.id)}
          isHinted={hintIds.includes(card.id)}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  )
}
