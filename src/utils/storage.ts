import type { Card } from '../types/card'
import { getTodayDateString } from './gameLogic'

export interface GameState {
  date: string
  deck: Card[]
  board: Card[]
  score: number
  time: number
  completed: boolean
  hintCount: number
}

function getStorageKey(dateStr: string): string {
  return `set-daily-${dateStr}`
}

export function saveGameState(state: GameState): void {
  const today = getTodayDateString()
  // Only save if the game belongs to today — prevents yesterday's
  // in-progress game from being saved under today's key after midnight
  if (state.date !== today) return
  const key = getStorageKey(today)
  try {
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadGameState(): GameState | null {
  const key = getStorageKey(getTodayDateString())
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data) as GameState
  } catch {
    return null
  }
}
