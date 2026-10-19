import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { Choice, Pending } from '../game/engine.ts'
import { lootboxes } from '../game/lootboxes.ts'
import { BoxArt } from './BoxArt.tsx'
import './choice-dialog.css'

export function ChoiceDialog({ pending, choices, onChoose }: {
  pending: Pending
  choices: Choice[]
  onChoose: (id: string) => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()
  const descriptionId = useId()
  const box = lootboxes.find(item => item.id === pending.kind)!

  useEffect(() => {
    const previousFocus = document.activeElement
    headingRef.current?.focus({ preventScroll: true })
    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && !previousFocus.closest('[inert]')) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (choices.some(choice => choice.id === 'pass' && !choice.disabled)) onChoose('pass')
      return
    }
    if (event.key !== 'Tab') return

    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    const first = buttons?.[0]
    const last = buttons?.[buttons.length - 1]
    if (!first || !last) {
      event.preventDefault()
      headingRef.current?.focus()
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return <div className="choice-overlay" onKeyDown={handleKeyDown}>
    <section className={`choice-dialog choice-panel choice-${pending.kind}`} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId} aria-describedby={descriptionId}>
      <div className="choice-intro">
        <div className="choice-art"><BoxArt type={pending.kind} /></div>
        <div>
          <p className="eyebrow">Escolha sua próxima jogada</p>
          {pending.box.type === 'espelho' && <p className="choice-reflection">Um reflexo da sua última escolha</p>}
          <h2 id={headingId} ref={headingRef} tabIndex={-1}>{box.name}</h2>
          <p id={descriptionId}>{box.description}</p>
        </div>
      </div>
      {pending.kind === 'apostas' && <p className="race-invitation"><span aria-hidden="true">⚑</span> Quatro animais na pista · 25% de chance cada · Acerto paga 3×</p>}
      <div className="choices">{choices.map(choice => <button className={choice.id === 'pass' ? 'choice-pass' : undefined} key={choice.id} disabled={choice.disabled} onClick={() => onChoose(choice.id)}>
        <strong>{choice.label}</strong><span>{choice.description}</span>
      </button>)}</div>
    </section>
  </div>
}
