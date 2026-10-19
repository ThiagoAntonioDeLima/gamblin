import { useCallback, useRef, useState } from 'react'
import { initialGameState, isGameState, transition } from './game/engine.ts'
import type { GameAction } from './game/engine.ts'
import { loadProgress, saveProgress } from './lib/storage.ts'

export function useGame() {
  const [state, setState] = useState(() => loadProgress(isGameState) ?? initialGameState())
  const current = useRef(state)
  const [storageUnavailable, setStorageUnavailable] = useState(false)

  const dispatch = useCallback((action: GameAction) => {
    const next = transition(current.current, action)
    if (next === current.current) return

    current.current = next
    setState(next)
    setStorageUnavailable(!saveProgress(next))
  }, [])

  return { state, dispatch, storageUnavailable }
}
