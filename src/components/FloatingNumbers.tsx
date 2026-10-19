import { useEffect, useRef } from 'react'
import type { FeedbackEvent } from '../game/feedback.ts'
import './floating-numbers.css'

const FEEDBACK_DURATION_MS = 1_300

interface FloatingNumbersProps {
  events: FeedbackEvent[]
  onComplete: (id: string) => void
}

function FloatingReceipt({ event, onComplete }: { event: FeedbackEvent; onComplete: FloatingNumbersProps['onComplete'] }) {
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    const timer = window.setTimeout(() => completeRef.current(event.id), FEEDBACK_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [event.id])

  return <section className="floating-receipt" aria-label="Alterações da caixa" data-feedback-id={event.id}>
    <p className="floating-receipt-caption"><span aria-hidden="true">✦</span> Alterações da caixa</p>
    <ul className="floating-receipt-changes">
      {event.changes.map(change => <li key={change.key} className={`floating-change floating-change-${change.tone}`} data-resource={change.key}>
        <strong>{change.amount > 0 ? '+' : '−'}{Math.abs(change.amount)}{change.suffix}</strong>{' '}
        <span>{change.label}</span>
      </li>)}
    </ul>
  </section>
}

export function FloatingNumbers({ events, onComplete }: FloatingNumbersProps) {
  return <div className="floating-numbers" aria-live="polite" aria-relevant="additions" aria-atomic="false">
    {events.map(event => <FloatingReceipt key={event.id} event={event} onComplete={onComplete} />)}
  </div>
}
