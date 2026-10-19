import { useCallback, useRef, useState } from 'react'
import { initialGameState, isGameState, transition } from './game/engine.ts'
import type { GameAction } from './game/engine.ts'
import { getActionChanges } from './game/feedback.ts'
import type { FeedbackEvent } from './game/feedback.ts'
import { loadProgress, saveProgress } from './lib/storage.ts'

export function useGame() {
  const [state, setState] = useState(() => loadProgress(isGameState) ?? initialGameState())
  const current = useRef(state)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackEvent[]>([])
  const feedbackSerial = useRef(0)
  const heldRaceFeedback = useRef<{ raceId: string; event: FeedbackEvent } | null>(null)
  const shownRaceFeedback = useRef<string | null>(null)

  const showFeedback = useCallback((event: FeedbackEvent) => {
    setFeedback(events => [...events, event].slice(-3))
  }, [])

  const clearFeedback = useCallback((id: string) => {
    setFeedback(events => events.filter(event => event.id !== id))
  }, [])

  const releaseRaceFeedback = useCallback((raceId: string) => {
    const race = current.current.lastRace
    if (!race || race.id !== raceId || shownRaceFeedback.current === raceId) return
    shownRaceFeedback.current = raceId
    const held = heldRaceFeedback.current
    heldRaceFeedback.current = null
    if (held?.raceId === raceId) {
      showFeedback(held.event)
    } else {
      // A reloaded race still has its actual wager and payout, never a new draw.
      const amount = race.payout - race.stake
      if (amount) showFeedback({
        id: `feedback-${++feedbackSerial.current}`,
        changes: [{ key: 'coins', amount, label: 'moedas (aposta)', tone: amount > 0 ? 'gain' : 'loss' }],
      })
    }
  }, [showFeedback])

  const dispatch = useCallback((action: GameAction) => {
    const previous = current.current
    const next = transition(previous, action)
    if (next === previous) return next

    if (action.type === 'start') {
      setFeedback([])
      heldRaceFeedback.current = null
      shownRaceFeedback.current = null
    } else {
      const changes = getActionChanges(previous, next, action)
      if (changes.length) {
        const event = { id: `feedback-${++feedbackSerial.current}`, changes }
        if (next.lastRace) heldRaceFeedback.current = { raceId: next.lastRace.id, event }
        else showFeedback(event)
      }
    }

    current.current = next
    setState(next)
    setStorageUnavailable(!saveProgress(next))
    return next
  }, [showFeedback])

  return { state, dispatch, storageUnavailable, feedback, clearFeedback, releaseRaceFeedback }
}
