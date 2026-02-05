import type { Card, Color, Shape, Shading, Count } from '../types/card'

const COLORS: Color[] = ['red', 'green', 'purple']
const SHAPES: Shape[] = ['diamond', 'oval', 'squiggle']
const SHADINGS: Shading[] = ['solid', 'striped', 'empty']
const COUNTS: Count[] = [1, 2, 3]

export function generateDeck(): Card[] {
  const deck: Card[] = []

  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const shading of SHADINGS) {
        for (const count of COUNTS) {
          deck.push({
            id: `${color}-${shape}-${shading}-${count}`,
            color,
            shape,
            shading,
            count,
          })
        }
      }
    }
  }

  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

function allSameOrAllDifferent<T>(a: T, b: T, c: T): boolean {
  return (a === b && b === c) || (a !== b && b !== c && a !== c)
}

export function isValidSet(cards: Card[]): boolean {
  if (cards.length !== 3) return false

  const [a, b, c] = cards

  return (
    allSameOrAllDifferent(a.color, b.color, c.color) &&
    allSameOrAllDifferent(a.shape, b.shape, c.shape) &&
    allSameOrAllDifferent(a.shading, b.shading, c.shading) &&
    allSameOrAllDifferent(a.count, b.count, c.count)
  )
}

export function findValidSet(cards: Card[]): Card[] | null {
  for (let i = 0; i < cards.length - 2; i++) {
    for (let j = i + 1; j < cards.length - 1; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        const potential = [cards[i], cards[j], cards[k]]
        if (isValidSet(potential)) {
          return potential
        }
      }
    }
  }
  return null
}

export function countValidSets(cards: Card[]): number {
  let count = 0
  for (let i = 0; i < cards.length - 2; i++) {
    for (let j = i + 1; j < cards.length - 1; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        if (isValidSet([cards[i], cards[j], cards[k]])) {
          count++
        }
      }
    }
  }
  return count
}
