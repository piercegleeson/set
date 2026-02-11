import { useState, useEffect, useCallback, useRef } from 'react'
import type { Card } from '../../types/card'
import { getDailyDeck, isValidSet, findValidSet, countValidSets, getTodayDateString } from '../../utils/gameLogic'
import { loadGameState, saveGameState } from '../../utils/storage'
import type { GameState } from '../../utils/storage'
import { Board } from '../Board/Board'
import { Card as CardComponent } from '../Card/Card'
import { GameInfo } from '../GameInfo/GameInfo'
import styles from './Game.module.css'

type GameStatus = 'playing' | 'won'
type FeedbackType = 'valid' | 'invalid' | null
type ShareStatus = 'idle' | 'copied'

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}


export function Game() {
  const [deck, setDeck] = useState<Card[]>([])
  const [board, setBoard] = useState<Card[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [initialized, setInitialized] = useState(false)
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle')

  const todayStr = getTodayDateString()
  const todayFormatted = formatDate(todayStr)

  const handleShare = async () => {
    const timeStr = `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
    const text = `Daily Set - ${todayFormatted}\n${score} sets found in ${timeStr}\nhttps://set.piercegleeson.com`

    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text)
    setShareStatus('copied')
    setTimeout(() => setShareStatus('idle'), 2000)
  }

  // Ref to track latest state for saving without causing effect re-runs
  const stateRef = useRef({ deck, board, score, time, gameStatus })
  stateRef.current = { deck, board, score, time, gameStatus }

  const saveCurrentState = useCallback(() => {
    const { deck, board, score, time, gameStatus } = stateRef.current
    const state: GameState = {
      deck,
      board,
      score,
      time,
      completed: gameStatus === 'won',
      totalSets: score,
    }
    saveGameState(state)
  }, [])

  // Initialize from localStorage or fresh daily deck
  const initGame = useCallback(() => {
    const saved = loadGameState()

    if (saved) {
      setDeck(saved.deck)
      setBoard(saved.board)
      setScore(saved.score)
      setTime(saved.time)
      setGameStatus(saved.completed ? 'won' : 'playing')
    } else {
      const dailyDeck = getDailyDeck()
      const initialBoard = dailyDeck.slice(0, 12)
      const remainingDeck = dailyDeck.slice(12)

      setDeck(remainingDeck)
      setBoard(initialBoard)
      setScore(0)
      setTime(0)
      setGameStatus('playing')
    }

    setSelectedIds([])
    setFeedback(null)
    setInitialized(true)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // Timer — only runs while playing and tab is visible
  useEffect(() => {
    if (gameStatus !== 'playing' || !initialized) return

    let interval: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (!interval) {
        interval = setInterval(() => setTime((t) => t + 1), 1000)
      }
    }

    const stop = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stop()
        saveCurrentState()
      } else {
        start()
      }
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [gameStatus, initialized, saveCurrentState])

  // Save time periodically (every 5 seconds) while playing
  useEffect(() => {
    if (gameStatus !== 'playing' || !initialized) return

    const interval = setInterval(() => {
      saveCurrentState()
    }, 5000)

    return () => clearInterval(interval)
  }, [gameStatus, initialized, saveCurrentState])

  // Check for win or auto-add cards when no valid set
  useEffect(() => {
    if (board.length === 0 || !initialized) return

    const hasSet = findValidSet(board) !== null
    if (!hasSet && deck.length === 0) {
      setGameStatus('won')
    } else if (!hasSet && deck.length > 0) {
      const newCards = deck.slice(0, 3)
      setDeck(deck.slice(3))
      setBoard([...board, ...newCards])
    }
  }, [board, deck, initialized])

  // Save on game won
  useEffect(() => {
    if (gameStatus === 'won' && initialized) {
      saveCurrentState()
    }
  }, [gameStatus, initialized, saveCurrentState])

  const handleCardClick = (card: Card) => {
    if (gameStatus !== 'playing' || feedback) return

    setSelectedIds((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id)
      }
      if (prev.length >= 3) return prev
      return [...prev, card.id]
    })
  }

  useEffect(() => {
    if (selectedIds.length !== 3) return

    const selectedCards = selectedIds.map((id) => board.find((c) => c.id === id)!)
    const valid = isValidSet(selectedCards)

    setFeedback(valid ? 'valid' : 'invalid')

    const timeout = setTimeout(() => {
      if (valid) {
        setScore((s) => s + 1)

        let newBoard = board.filter((c) => !selectedIds.includes(c.id))

        if (newBoard.length < 12 && deck.length > 0) {
          const cardsNeeded = Math.min(12 - newBoard.length, deck.length)
          const newCards = deck.slice(0, cardsNeeded)
          setDeck(deck.slice(cardsNeeded))
          newBoard = [...newBoard, ...newCards]
        }

        setBoard(newBoard)
        // Save after valid set found (will be picked up by the periodic save or next state change)
        setTimeout(() => saveCurrentState(), 50)
      }

      setSelectedIds([])
      setFeedback(null)
    }, 600)

    return () => clearTimeout(timeout)
  }, [selectedIds, board, deck, saveCurrentState])


  const setsOnBoard = countValidSets(board)

  return (
    <div  className={styles.container}>
      <div className={`${styles.indicator} ${feedback ? styles[feedback] : ''}`}></div>
      <div className={styles.game}>
        <header>
          <div className="game-title">
            <p className={styles.date}>{todayFormatted}</p>
            <h1 className={styles.title}>Daily Set</h1>
          </div>
          <div className={styles.timestat}>
            <span className={styles.label}>Time:</span>
            <span className={styles.value}>{formatTime(time)}</span>
          </div>
        </header>
        <div className={styles.boardWrapper}>
          <Board
            cards={board}
            selectedIds={[...selectedIds]}
            onCardClick={handleCardClick}
          />
        </div>
        <GameInfo
          score={score}
          setsOnBoard={setsOnBoard}
          deck={deck}
        />

        {gameStatus === 'won' && (
          <div className={styles.overlay}>
            <div className={styles.completionCard}>
              <h2 className={styles.completionTitle}>Game Complete!</h2>
              <p className={styles.completionDate}>{todayFormatted}</p>
              <div className={styles.completionStats}>
                <div className={styles.completionStat}>
                  <span className={styles.completionStatLabel}>Time</span>
                  <span className={styles.completionStatValue}>
                    {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className={styles.completionStat}>
                  <span className={styles.completionStatLabel}>Sets Found</span>
                  <span className={styles.completionStatValue}>{score}</span>
                </div>

              </div>
              <p className={styles.completionMessage}>Come back tomorrow for a new set!</p>
              <button className={styles.shareButton} onClick={handleShare}>
                {shareStatus === 'copied' ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h2>What’s this?</h2>
        <p>Daily Set is an online version of the cult pattern matching card game SET!. Everyone who visits today is being dealt the same game, so you can compare your time with friends if you wish.</p>
        <p>There are 85 cards in the deck, all unique, and you must gather them into sets of three. </p>
        <p>A set is three cards where, for each characteristic (color, number, shape, shading), the cards are either all the same or all different.</p>
        <p>Just try it, it will start to make sense!</p>
        <h2>Example Sets</h2>
        <div className={styles.example}>
          <CardComponent
            card={{ id: 'example-1', color: 'red', shape: 'circle', shading: 'solid', count: 3 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-2', color: 'blue', shape: 'diamond', shading: 'solid', count: 2 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-3', color: 'yellow', shape: 'square', shading: 'solid', count: 1 }}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
        <p>These share one characteristic (solid) and differ in all others.</p>

        <div className={styles.example}>
          <CardComponent
            card={{ id: 'example-4', color: 'yellow', shape: 'circle', shading: 'solid', count: 1 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-5', color: 'red', shape: 'diamond', shading: 'striped', count: 2 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-6  ', color: 'blue', shape: 'square', shading: 'empty', count: 3 }}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
        <p>These differ in all characteristics.</p>


        <div className={styles.example}>
          <CardComponent
            card={{ id: 'example-4', color: 'blue', shape: 'diamond', shading: 'striped', count: 2 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-5', color: 'yellow', shape: 'square', shading: 'striped', count: 2 }}
            isSelected={false}
            onClick={() => {}}
          />
          <CardComponent
            card={{ id: 'example-6  ', color: 'red', shape: 'circle', shading: 'striped', count: 2 }}
            isSelected={false}
            onClick={() => {}}
          />
        </div>
        <p>These share 2 characteristics (number and fill) and differ in two others (shape and colour).</p>

      </div>
    </div>
  )
}
