import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ANIMALS } from '../game/engine.ts'
import type { AnimalId, RaceResult } from '../game/engine.ts'
import './animal-race.css'

type RacePhase = 'ready' | 'running' | 'finished'

const PREPARATION_MS = 650
const DURATION_MS = 4_000
const ANIMAL_COLORS: Record<AnimalId, string> = {
  coruja: '#d8adff',
  raposa: '#ffb36b',
  lobo: '#8fcfff',
  sapo: '#a4f3a2',
}

// This seed changes the choreography, never the winner supplied by the engine.
function choreographySeed(id: string) {
  let seed = 0
  for (const character of id) seed = (seed * 31 + character.charCodeAt(0)) >>> 0
  return seed
}

function AnimalPortrait({ animal }: { animal: AnimalId }) {
  return <svg viewBox="0 0 100 84" className={`race-animal race-animal-${animal}`} aria-hidden="true">
    <ellipse className="race-animal-shadow" cx="51" cy="77" rx="30" ry="4" />
    {animal === 'coruja' && <>
      <path fill="#9264ad" d="M30 56 11 43l4 23 20 6m36-16 19-13-4 23-20 6" />
      <path fill="#c093dc" d="m25 24-2-18 20 9h17L78 6l-3 20c18 38 6 50-24 50S10 62 25 24" />
      <path fill="#e8d7ed" d="M27 38c-5-20 20-24 24-10 5-14 30-10 24 10-3 11-15 19-24 24-11-6-20-13-24-24" />
      <circle cx="38" cy="34" r="9" fill="#fff5d4" /><circle cx="65" cy="34" r="9" fill="#fff5d4" />
      <circle cx="41" cy="34" r="4.5" fill="#241e3f" /><circle cx="68" cy="34" r="4.5" fill="#241e3f" />
      <circle cx="42" cy="32" r="1.6" fill="white" /><circle cx="69" cy="32" r="1.6" fill="white" />
      <path fill="#efb854" d="m45 45 7 10 7-10Z" />
      <path d="m37 72-5 7m9-6 1 6m19-6-1 6m5-7 6 7" stroke="#efb854" strokeWidth="4" strokeLinecap="round" />
      <path d="m40 62 4 3m5-4 4 3m5-3 4 3" stroke="#aa7bc2" strokeWidth="2" strokeLinecap="round" />
    </>}
    {animal === 'raposa' && <>
      <path fill="#cb6e36" d="M33 59C8 80 4 47 15 37c-1 17 18 2 25 17" />
      <path fill="#fff0ce" d="M15 37c-5 5-8 14-6 21l12-5c-5-2-7-7-6-16" />
      <path fill="#e88b46" d="M30 43c-10 14-8 28 9 30h25c14-2 15-16 1-28" />
      <path fill="#ed9750" d="m33 30-7-25 24 14 15-2L85 5l-2 28c7 21-12 35-27 35S24 54 33 30" />
      <path fill="#602f3d" d="m32 14 4 17 10-9m31-8L67 25l11 7" />
      <path fill="#fff0ce" d="M31 39c8 1 20 5 25 13 5-8 16-12 28-13-2 18-18 26-28 27-10-2-23-10-25-27" />
      <path d="m42 36 7 3m17 0 7-4" stroke="#3c3039" strokeWidth="3.5" strokeLinecap="round" />
      <path fill="#3c3039" d="m49 49 14 0-7 8Z" />
      <path className="race-animal-feet" d="m37 68-6 8h13m16-8 4 8h10" fill="none" stroke="#733b35" strokeWidth="6" strokeLinecap="round" />
    </>}
    {animal === 'lobo' && <>
      <path fill="#667f9e" d="M33 54C11 61 7 49 8 39c7 10 15 6 24 6" />
      <path fill="#829ebd" d="m24 42 2-18L27 6l21 15 17-1L83 5l1 29 8 18-17 8-1 11H35l-3-13Z" />
      <path fill="#c0d6e7" d="m25 42 26 5 29-7-5 17-15 13-25-5-9-12Z" />
      <path fill="#485b7a" d="m32 14 2 15 9-7m35-8-9 9 9 7" />
      <path d="m36 35 9 2m18 0 10-3" stroke="#263f56" strokeWidth="3.5" strokeLinecap="round" />
      <path fill="#253a4a" d="m47 47 17 0-7 9Z" />
      <path d="M57 55v6m-7-1 7 2 7-2" fill="none" stroke="#4d677c" strokeWidth="2" strokeLinecap="round" />
      <path className="race-animal-feet" d="m37 66-4 10h12m17-10 3 10h12" fill="none" stroke="#526c8b" strokeWidth="6" strokeLinecap="round" />
      <path fill="#d5e5ed" d="m26 48 7 3-3 11-8-4m51-6 8-5 5 12-10 5" />
    </>}
    {animal === 'sapo' && <>
      <ellipse cx="28" cy="63" rx="18" ry="12" fill="#4c9b6e" transform="rotate(-23 28 63)" />
      <ellipse cx="74" cy="63" rx="18" ry="12" fill="#4c9b6e" transform="rotate(23 74 63)" />
      <ellipse cx="51" cy="51" rx="31" ry="25" fill="#7fc37a" />
      <ellipse cx="51" cy="58" rx="23" ry="15" fill="#c9dfa0" />
      <circle cx="32" cy="29" r="16" fill="#7fc37a" /><circle cx="68" cy="29" r="16" fill="#7fc37a" />
      <circle cx="33" cy="28" r="10" fill="#f4f3bd" /><circle cx="69" cy="28" r="10" fill="#f4f3bd" />
      <ellipse cx="36" cy="28" rx="4" ry="7" fill="#214c48" /><ellipse cx="72" cy="28" rx="4" ry="7" fill="#214c48" />
      <circle cx="37" cy="25" r="1.5" fill="white" /><circle cx="73" cy="25" r="1.5" fill="white" />
      <path d="M35 48q16 14 33-1" fill="none" stroke="#3c7754" strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="43" r="4" fill="#e8a694" /><circle cx="76" cy="43" r="4" fill="#e8a694" />
      <path className="race-animal-feet" d="m23 69-9 8m9-6-1 7m56-9 9 8m-9-6 1 7" stroke="#5eab71" strokeWidth="5" strokeLinecap="round" />
    </>}
  </svg>
}

function Trophy() {
  return <svg className="race-trophy" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M14 10H6v8c0 7 6 11 13 11m15-19h8v8c0 7-6 11-13 11" fill="none" stroke="#f9c55d" strokeWidth="4" />
    <path d="M13 5h22v13c0 11-8 15-8 15v6h7v5H14v-5h7v-6s-8-4-8-15Z" fill="#edb850" />
    <path d="m24 10 2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1Z" fill="#fff0ae" />
  </svg>
}

export function AnimalRace({ race, onClose }: { race: RaceResult; onClose: () => void }) {
  const [phase, setPhase] = useState<RacePhase>('ready')
  const [reducedMotion, setReducedMotion] = useState(false)
  const dialogRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const runnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const finishedRef = useRef(false)
  const closeRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()
  closeRef.current = onClose
  const selected = ANIMALS.find(animal => animal.id === race.selected)!
  const winner = ANIMALS.find(animal => animal.id === race.winner)!
  const won = race.selected === race.winner
  const net = race.payout - race.stake

  useEffect(() => {
    const previousFocus = document.activeElement
    headingRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (finishedRef.current) closeRef.current()
      }
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
      )
      const first = focusable?.[0]
      const last = focusable?.[focusable.length - 1]
      if (!first || !last) {
        event.preventDefault()
        headingRef.current?.focus()
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    let animationFrame = 0
    let disposed = false
    let startedAt: number | null = null
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const seed = choreographySeed(race.id)
    const progress = ANIMALS.map(() => 0)
    let running = false
    finishedRef.current = false
    setPhase('ready')
    setReducedMotion(media.matches)
    runnerRefs.current.forEach(runner => runner?.style.setProperty('--race-progress', '0'))

    function complete() {
      if (disposed) return
      cancelAnimationFrame(animationFrame)
      runnerRefs.current.forEach((runner, index) => {
        const animal = ANIMALS[index]!
        const finish = animal.id === race.winner ? 1 : .70 + ((seed + index * 7) % 3) * .055
        runner?.style.setProperty('--race-progress', String(finish))
      })
      finishedRef.current = true
      setPhase('finished')
    }

    function animate(now: number) {
      if (disposed) return
      startedAt ??= now
      const elapsed = now - startedAt
      if (elapsed >= DURATION_MS) {
        complete()
        return
      }
      if (elapsed >= PREPARATION_MS) {
        if (!running) {
          running = true
          setPhase('running')
        }
        const fraction = (elapsed - PREPARATION_MS) / (DURATION_MS - PREPARATION_MS)
        ANIMALS.forEach((animal, index) => {
          const finish = animal.id === race.winner ? 1 : .70 + ((seed + index * 7) % 3) * .055
          const rhythm = Math.sin(fraction * 9 + (seed % 17) + index * 2) * .075 * Math.sin(fraction * Math.PI)
          const next = Math.max(progress[index]!, Math.min(finish, finish * fraction + rhythm))
          progress[index] = next
          runnerRefs.current[index]?.style.setProperty('--race-progress', next.toFixed(4))
        })
      }
      animationFrame = requestAnimationFrame(animate)
    }

    function handleMotionPreference(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
      if (event.matches) complete()
    }
    media.addEventListener('change', handleMotionPreference)
    if (media.matches) complete()
    else animationFrame = requestAnimationFrame(animate)
    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      media.removeEventListener('change', handleMotionPreference)
    }
    // A render with the same persisted event must never restart the race.
  }, [race.id, race.winner])

  return <div className="race-overlay">
    <section
      ref={dialogRef}
      className={`animal-race race-phase-${phase}${reducedMotion ? ' race-reduced-motion' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className="race-header">
        <span className="race-marquee" aria-hidden="true">♠ · GRANDE PRÊMIO GAMBLIN · ♦</span>
        <h2 id={titleId} ref={headingRef} tabIndex={-1}>Corrida dos bichos</h2>
        <p id={descriptionId}>Sua aposta: <strong>{selected.name}</strong> · {race.stake} {race.stake === 1 ? 'ficha' : 'fichas'} · prêmio possível: {race.stake * 3}</p>
      </header>

      <div className="race-status" role="status" aria-live="polite" aria-atomic="true">
        {phase === 'ready' ? <><span className="race-status-light" />Prepare-se…</> : phase === 'running' ? <><span className="race-status-light" />Corrida em andamento!</> : <><Trophy />{winner.name} venceu!</>}
      </div>

      <div className="race-track" aria-label="Pistas dos quatro animais">
        <div className="race-track-captions" aria-hidden="true"><span>Largada</span><span>Chegada</span></div>
        {ANIMALS.map((animal, index) => <div
          className={`race-lane${animal.id === race.selected ? ' race-lane-selected' : ''}${phase === 'finished' && animal.id === race.winner ? ' race-lane-winner' : ''}`}
          key={animal.id}
          style={{ '--animal-color': ANIMAL_COLORS[animal.id], '--lane-delay': `${index * -.13}s` } as CSSProperties}
        >
          <div className="race-lane-caption"><span className="race-lane-number">0{index + 1}</span><strong>{animal.name}</strong>{animal.id === race.selected && <span className="race-bet-marker">Sua aposta</span>}{phase === 'finished' && animal.id === race.winner && <span className="race-winner-marker">Vencedor</span>}</div>
          <div className="race-course">
            <div className="race-lane-dashes" aria-hidden="true" />
            <div className="race-start-line" aria-hidden="true" />
            <div className="race-finish-line" aria-hidden="true" />
            <div className="race-runner-range"><div className="race-runner" ref={element => { runnerRefs.current[index] = element }}>
              <span className="race-speed-lines" aria-hidden="true"><i /><i /><i /></span>
              <AnimalPortrait animal={animal.id} />
            </div></div>
          </div>
        </div>)}
      </div>

      {phase === 'finished' ? <div className={`race-outcome ${won ? 'race-outcome-win' : 'race-outcome-loss'}`}>
        <div className="race-outcome-copy"><p>{won ? 'A sorte correu com você!' : 'A chegada decidiu.'}</p><strong>{won ? `Você recebeu ${race.payout} fichas` : `Você perdeu ${race.stake} ${race.stake === 1 ? 'ficha' : 'fichas'}`}</strong><span>Aposta: {race.stake} · Retorno: {race.payout} · Saldo: {net > 0 ? '+' : ''}{net}</span></div>
        <button className="race-continue" onClick={onClose}>Voltar à mesa <svg className="race-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" /></svg></button>
      </div> : <p className="race-suspense">Quatro competidores. Uma linha de chegada.<span>25% de chance por animal · retorno de 3× ao acertar</span></p>}
      <p className="race-footnote">Fichas fictícias · Quatro animais, chances iguais.</p>
    </section>
  </div>
}
