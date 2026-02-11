import styles from './GameInfo.module.css'

interface GameInfoProps {
  score: number
  setsOnBoard: number
  deck: number
}

export function GameInfo({ time, score, setsOnBoard, deck }: GameInfoProps) {
  return (
    <div className={styles.gameInfo}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Sets Found:</span>
          <span className={styles.value}>{score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Sets on Board:</span>
          <span className={styles.value}>{setsOnBoard}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Cards remaining:</span>
          <span className={styles.value}>{deck.length}</span>
        </div>
      </div>
    </div>
  )
}
