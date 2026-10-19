import { useEffect, useId, useRef } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { RUN_END_REASON_LABELS } from '../game/engine.ts'
import type { RunResult } from '../game/engine.ts'
import './run-summary-dialog.css'

const outcomeCopy = {
  victory: { label: 'Vitória', eyebrow: 'Os três chefes ficaram para trás', title: 'Você venceu a casa!', fallback: 'Você derrotou o último chefe e concluiu os três andares.' },
  defeat: { label: 'Derrota', eyebrow: 'Toda mesa tem uma última jogada', title: 'A sorte ainda vai virar.', fallback: 'Sua vida chegou a zero e a expedição terminou.' },
  retreat: { label: 'Retirada', eyebrow: 'Uma boa jogada também é saber parar', title: 'Seus ganhos estão a salvo.', fallback: 'Você encerrou a expedição e guardou o saque.' },
}

function OutcomeEmblem({ outcome }: { outcome: RunResult['outcome'] }) {
  return <svg className="run-summary-emblem" viewBox="0 0 128 128" aria-hidden="true">
    <circle className="summary-emblem-ring" cx="64" cy="64" r="57" />
    <circle className="summary-emblem-inner" cx="64" cy="64" r="47" />
    {outcome === 'victory' ? <g className="summary-trophy">
      <path className="summary-emblem-line" d="M43 34H25v13c0 16 13 23 28 23m32-36h18v13c0 16-13 23-28 23" />
      <path className="summary-emblem-solid" d="M41 25h46v25c0 19-16 29-19 30v13h15v10H45V93h15V80c-3-1-19-11-19-30Z" />
      <path className="summary-emblem-highlight" d="m64 35 5 10 11 2-8 8 2 11-10-6-10 6 2-11-8-8 11-2Z" />
    </g> : outcome === 'defeat' ? <g className="summary-broken-chip">
      <path className="summary-chip-left" d="M60 27a37 37 0 0 0 0 74l-7-20 12-15-12-18Z" />
      <path className="summary-chip-right" d="M69 27a37 37 0 0 1 0 74l-7-20 12-15-12-18Z" />
      <path className="summary-emblem-line summary-chip-left" d="m43 40 5 8m-20 11 10 2m-6 24 9-5" />
      <path className="summary-emblem-line summary-chip-right" d="m85 40-5 8m20 11-10 2m6 24-9-5" />
    </g> : <g className="summary-safe-chip">
      <circle className="summary-emblem-solid" cx="64" cy="64" r="36" />
      <circle className="summary-emblem-line summary-coin-rim" cx="64" cy="64" r="27" />
      <path className="summary-emblem-highlight" d="m64 42 17 22-17 22-17-22Z" />
      <path className="summary-emblem-line" d="M64 29v9m0 52v9M29 64h9m52 0h9M39 39l6 6m38 38 6 6M39 89l6-6m38-38 6-6" />
    </g>}
  </svg>
}

export function RunSummaryDialog({ result, onContinue }: {
  result: RunResult
  onContinue: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()
  const reasonId = useId()
  const copy = outcomeCopy[result.outcome]
  const reason = result.reason ? RUN_END_REASON_LABELS[result.reason] : copy.fallback
  const lost = Math.max(0, result.loot - result.kept)
  const number = (value: number) => value.toLocaleString('pt-BR')

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
      onContinue()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), summary, [tabindex="0"]')
    const first = focusable?.[0]
    const last = focusable?.[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      headingRef.current?.focus({ preventScroll: true })
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
      event.preventDefault()
      first.focus()
    }
  }

  return <div className={`run-summary-overlay summary-${result.outcome}`} onKeyDown={handleKeyDown}>
    <div className="run-summary-celebration" aria-hidden="true">
      <div className="summary-spotlight" />
      {Array.from({ length: result.outcome === 'retreat' ? 0 : 18 }, (_, index) => <i className="summary-flying-chip" key={index} style={{
        '--chip-index': index,
        '--chip-left': `${(index * 37 + 7) % 100}%`,
        '--chip-drift': `${((index * 53) % 180) - 90}px`,
        '--chip-turn': `${index % 2 === 0 ? 420 : -420}deg`,
      } as CSSProperties} />)}
    </div>
    <section className="run-summary-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId} aria-describedby={reasonId}>
      <header className="run-summary-header">
        <span className="run-summary-outcome">♦ {copy.label} ♦</span>
        <div className="run-summary-medallion"><OutcomeEmblem outcome={result.outcome} /></div>
        <p className="run-summary-eyebrow">{copy.eyebrow}</p>
        <h2 id={headingId} tabIndex={-1} ref={headingRef}>{copy.title}</h2>
        <p className="run-summary-reason" id={reasonId}><span>{result.outcome === 'defeat' ? 'Motivo da derrota' : 'Fim da expedição'}</span>{reason}</p>
      </header>

      <dl className="run-summary-stats" aria-label="Dados da expedição">
        <div><dt>Andar alcançado</dt><dd>{result.floor}<small> / 3</small></dd></div>
        <div><dt>Caixas abertas</dt><dd className={result.totalOpened === undefined ? 'summary-unrecorded' : undefined}>{result.totalOpened === undefined ? 'Não registrado' : number(result.totalOpened)}</dd></div>
        <div><dt>Saque encontrado</dt><dd>{number(result.loot)}<small> moedas</small></dd></div>
        <div className="summary-stat-kept"><dt>Saque guardado</dt><dd>{number(result.kept)}<small> moedas</small></dd></div>
        <div className={lost > 0 ? 'summary-stat-lost' : undefined}><dt>Saque perdido</dt><dd>{lost > 0 ? '−' : ''}{number(lost)}<small> moedas</small></dd></div>
        <div className="summary-stat-essence"><dt>Essência recebida</dt><dd>+{number(result.essence)}</dd></div>
      </dl>
      {result.totalOpened !== undefined && <p className="run-summary-count-note">A caixa inicial gratuita não entra na contagem de aberturas.</p>}

      {result.log.length > 0 && <details className="run-summary-history"><summary>Relembrar as jogadas <span aria-hidden="true">⌄</span></summary><ol>{result.log.map((entry, index) => <li key={index}>{entry}</li>)}</ol></details>}

      <div className="run-summary-footer">
        <p>Uma nova chance espera no Empório da Sorte.</p>
        <button className="run-summary-continue" onClick={onContinue}>Voltar à lojinha <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" /></svg></button>
      </div>
    </section>
  </div>
}
