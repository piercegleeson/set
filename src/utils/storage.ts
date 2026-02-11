import type { Card } from '../types/card'
import { getTodayDateString } from './gameLogic'

export interface GameState {
  deck: Card[]
  board: Card[]
  score: number
  time: number
  completed: boolean
  totalSets: number
}

function getStorageKey(dateStr: string): string {
  return `set-daily-${dateStr}`
}

export function saveGameState(state: GameState): void {
  const key = getStorageKey(getTodayDateString())
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

export function isTodayCompleted(): boolean {
  const state = loadGameState()
  return state?.completed === true
}
