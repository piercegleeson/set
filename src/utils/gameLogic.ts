import type { Card, Color, Shape, Shading, Count } from '../types/card'

const COLORS: Color[] = ['red', 'blue', 'yellow']
const SHAPES: Shape[] = ['diamond', 'circle', 'square']
const SHADINGS: Shading[] = ['solid', 'striped', 'empty']
const COUNTS: Count[] = [1, 2, 3]

// Seeded PRNG (mulberry32) — returns a function producing deterministic floats in [0,1)
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Hash a date string like "2026-02-05" into a numeric seed
function hashDateString(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return hash
}

export function getTodayDateString(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getTodaysSeed(): number {
  return hashDateString(getTodayDateString())
}

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

export function shuffleDeck(deck: Card[], randomFn: () => number = Math.random): Card[] {
  const shuffled = [...deck]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function getDailyDeck(): Card[] {
  const seed = getTodaysSeed()
  const rng = mulberry32(seed)
  return shuffleDeck(generateDeck(), rng)
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
