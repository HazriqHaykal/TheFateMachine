import { useState, useCallback } from 'react'

const STORAGE_KEY = 'fate_machine_stats'

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // localStorage unavailable — silent fail
  }
}

// Returns stats object: { [name]: { wins: number, totalSelections: number } }
// and helper functions to mutate it
export function useStatistics() {
  const [stats, setStats] = useState(loadStats)

  const recordWin = useCallback((name) => {
    setStats(prev => {
      const next = { ...prev }
      if (!next[name]) next[name] = { wins: 0, totalSelections: 0 }
      next[name] = {
        wins: next[name].wins + 1,
        totalSelections: next[name].totalSelections + 1,
      }
      saveStats(next)
      return next
    })
  }, [])

  const resetStats = useCallback(() => {
    setStats({})
    saveStats({})
  }, [])

  // Sorted leaderboard: [{ name, wins, totalSelections }]
  const leaderboard = Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name))

  return { stats, leaderboard, recordWin, resetStats }
}
