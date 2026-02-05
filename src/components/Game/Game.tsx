import { useState, useEffect, useCallback } from 'react'
import type { Card } from '../../types/card'
import { generateDeck, shuffleDeck, isValidSet, findValidSet, countValidSets } from '../../utils/gameLogic'
import { Board } from '../Board/Board'
import { GameInfo } from '../GameInfo/GameInfo'
import styles from './Game.module.css'

type GameStatus = 'playing' | 'won'
type FeedbackType = 'valid' | 'invalid' | null

export function Game() {
  const [deck, setDeck] = useState<Card[]>([])
  const [board, setBoard] = useState<Card[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [hintCards, setHintCards] = useState<string[]>([])

  const initGame = useCallback(() => {
    const newDeck = shuffleDeck(generateDeck())
    const initialBoard = newDeck.slice(0, 12)
    const remainingDeck = newDeck.slice(12)

    setDeck(remainingDeck)
    setBoard(initialBoard)
    setSelectedIds([])
    setScore(0)
    setTime(0)
    setGameStatus('playing')
    setFeedback(null)
    setHintCards([])
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (gameStatus !== 'playing') return

    const interval = setInterval(() => {
      setTime((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStatus])

  useEffect(() => {
    if (board.length === 0) return

    const hasSet = findValidSet(board) !== null
    if (!hasSet && deck.length === 0) {
      setGameStatus('won')
    } else if (!hasSet && deck.length > 0) {
      // Auto-add 3 cards when no valid set exists
      const newCards = deck.slice(0, 3)
      setDeck(deck.slice(3))
      setBoard([...board, ...newCards])
    }
  }, [board, deck])

  const handleCardClick = (card: Card) => {
    if (gameStatus !== 'playing' || feedback) return

    setSelectedIds((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id)
      }
      if (prev.length >= 3) return prev
      return [...prev, card.id]
    })
    setHintCards([])
  }

  useEffect(() => {
    if (selectedIds.length !== 3) return

    const selectedCards = selectedIds.map((id) => board.find((c) => c.id === id)!)
    const valid = isValidSet(selectedCards)

    setFeedback(valid ? 'valid' : 'invalid')

    const timeout = setTimeout(() => {
      if (valid) {
        setScore((s) => s + 1)

        // Remove the set from the board
        let newBoard = board.filter((c) => !selectedIds.includes(c.id))

        // If board has less than 12 cards and deck has cards, deal more
        if (newBoard.length < 12 && deck.length > 0) {
          const cardsNeeded = Math.min(12 - newBoard.length, deck.length)
          const newCards = deck.slice(0, cardsNeeded)
          setDeck(deck.slice(cardsNeeded))
          newBoard = [...newBoard, ...newCards]
        }

        setBoard(newBoard)
      }

      setSelectedIds([])
      setFeedback(null)
    }, 600)

    return () => clearTimeout(timeout)
  }, [selectedIds, board, deck])

  const handleHint = () => {
    const validSet = findValidSet(board)
    if (validSet) {
      setHintCards([validSet[0].id])
    }
  }

  const setsOnBoard = countValidSets(board)

  return (
    <div className={styles.game}>
      <h1 className={styles.title}>Set</h1>
      <GameInfo
        time={time}
        score={score}
        setsOnBoard={setsOnBoard}
        onNewGame={initGame}
        onHint={handleHint}
      />
      <div className={`${styles.boardWrapper} ${feedback ? styles[feedback] : ''}`}>
        <Board
          cards={board}
          selectedIds={[...selectedIds, ...hintCards]}
          onCardClick={handleCardClick}
        />
      </div>
      {gameStatus === 'won' && (
        <div className={styles.winMessage}>
          <h2>Congratulations!</h2>
          <p>You found all {score} sets in {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}!</p>
          <button className={styles.playAgain} onClick={initGame}>
            Play Again
          </button>
        </div>
      )}
      <div className={styles.deckInfo}>
        Cards remaining in deck: {deck.length}
      </div>
    </div>
  )
}
