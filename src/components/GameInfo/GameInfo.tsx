import styles from './GameInfo.module.css'

interface GameInfoProps {
  time: number
  score: number
  setsOnBoard: number
  onNewGame: () => void
  onHint: () => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function GameInfo({ time, score, setsOnBoard, onNewGame, onHint }: GameInfoProps) {
  return (
    <div className={styles.gameInfo}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>{formatTime(time)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Sets Found</span>
          <span className={styles.value}>{score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Sets on Board</span>
          <span className={styles.value}>{setsOnBoard}</span>
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.hintButton} onClick={onHint}>
          Hint
        </button>
        <button className={styles.newGameButton} onClick={onNewGame}>
          New Game
        </button>
      </div>
    </div>
  )
}
