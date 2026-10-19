import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimalRace } from './components/AnimalRace.tsx'
import { ChoiceDialog } from './components/ChoiceDialog.tsx'
import { BoxArt, BOX_VISUALS } from './components/BoxArt.tsx'
import { getChoices, getOpeningCost, getRunValue, RARITY_LABELS, RARITY_VALUES, RELIC_LABELS } from './game/engine.ts'
import type { GameAction, GameState, Rarity, RelicId, Run, Upgrade } from './game/engine.ts'
import { lootboxes } from './game/lootboxes.ts'
import type { LootboxId } from './game/lootboxes.ts'
import { useGame } from './useGame.ts'
import './styles.css'
import './casino-layout.css'

const rarities: Rarity[] = ['comum', 'rara', 'epica', 'lendaria']
const boxNames = Object.fromEntries(lootboxes.map(box => [box.id, box.name]))
const biomeNames: Record<string, string> = { neutro: 'Salão da Fortuna', bosque: 'Salão do Bosque', bazar: 'Salão do Bazar', ruinas: 'Salão das Ruínas' }
const upgrades: { id: Upgrade; name: string; description: string }[] = [
  { id: 'vitality', name: 'Vitalidade', description: '+1 de vida inicial e máxima por nível.' },
  { id: 'energy', name: 'Energia', description: '+1 de energia a cada andar por nível.' },
  { id: 'fortune', name: 'Fortuna', description: '+1 moeda a cada abertura por nível.' },
]
const unlocks: { id: 'casca' | 'ninho'; description: string }[] = [
  { id: 'casca', description: 'Desbloqueia a relíquia que protege do primeiro ponto de dano por andar.' },
  { id: 'ninho', description: 'Desbloqueia a relíquia que gera uma caixa extra na Multiplicadora.' },
]
type Dispatch = (action: GameAction) => GameState
type Opening = { action: GameAction; type: LootboxId | 'starter'; rarity?: Rarity }

function UpgradeIcon({ type }: { type: Upgrade | 'casca' | 'ninho' }) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    {type === 'vitality' && <path d="M24 39 8 23C-2 10 17 2 24 14 31 2 50 10 40 23Z" />}
    {type === 'energy' && <path d="m28 3-19 25h13l-3 17 20-27H26Z" />}
    {type === 'fortune' && <><path d="m24 4 16 20-16 20L8 24Z" /><path d="M11 24h26M24 7l-5 17 5 16 5-16Z" fill="none" stroke="#382b35" /></>}
    {type === 'casca' && <><path d="m24 4 17 6v12c0 11-17 22-17 22S7 33 7 22V10Z" /><path d="m15 23 6 6 12-13" fill="none" stroke="#382b35" strokeWidth="3" /></>}
    {type === 'ninho' && <><path d="M6 22h36v19H6ZM4 13h40v9H4Z" /><path d="M24 13v28M24 13C7 14 9 0 17 5ZM24 13C41 14 39 0 31 5Z" fill="none" stroke="#382b35" strokeWidth="3" /></>}
  </svg>
}

function Arrow() {
  return <svg className="inline-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M3 3h10v10" /></svg>
}

function Storefront() {
  return <div className="shop-keeper" aria-hidden="true"><svg className="shop-counter" viewBox="0 0 380 230">
    <defs><linearGradient id="counter-wood" x2="0" y2="1"><stop stopColor="#814e35" /><stop offset="1" stopColor="#392028" /></linearGradient></defs>
    <path d="M34 52h312v155H34Z" fill="#261b2c" stroke="#be9456" strokeWidth="3" />
    <path d="M23 26h334l-12 54c-15 18-30 18-46 0-15 18-30 18-46 0-15 18-30 18-46 0-15 18-30 18-46 0-15 18-30 18-46 0-15 18-30 18-46 0-15 18-30 18-46 0Z" fill="#743b55" stroke="#d7ac65" strokeWidth="3" />
    <path d="M70 27 69 80m46-53v53m46-53v53m46-53v53m46-53v53m46-53v53" stroke="#b77d69" strokeWidth="15" />
    <path d="M46 143h288v68H46Z" fill="url(#counter-wood)" stroke="#c4995d" strokeWidth="3" /><path d="M36 138h308v13H36Z" fill="#e0b576" />
    <path d="m169 155 21 32 21-32m-42 44h42" fill="none" stroke="#bd8c56" strokeWidth="2" />
    <path d="M71 103h53v34H71Z" fill="#3c897d" stroke="#e7bb70" strokeWidth="2" /><path d="m71 104 26 13 27-13m-27 13v20" fill="none" stroke="#e7bb70" strokeWidth="2" />
    <path d="m253 97-22 29 22 13 22-13Z" fill="#9874c7" stroke="#e2c283" strokeWidth="2" /><path d="M253 97v42m-22-13h44" stroke="#d8beed" fill="none" />
    <circle cx="189" cy="114" r="23" fill="#d2a06c" stroke="#edca8d" strokeWidth="2" /><path d="M158 99h63v7h-63Zm9-26h45v26h-45Z" fill="#262c34" stroke="#d8b573" strokeWidth="2" /><path d="M173 113h12m8 0h12m-20 0h8" stroke="#2c2430" strokeWidth="5" /><path d="m181 127 8 4 9-4" stroke="#60383b" fill="none" strokeWidth="2" />
    <g fill="#f8d795">{[47, 83, 119, 155, 191, 227, 263, 299, 335].map(x => <circle cx={x} cy="18" r="3" key={x} />)}</g>
  </svg></div>
}

function RuleBook() {
  return <>
    <details className="panel catalog"><summary>As 18 caixas do cassino</summary><dl>{lootboxes.map(box => <div key={box.id}><dt>{box.name}</dt><dd>{box.description}</dd></div>)}</dl></details>
    <details className="panel rules"><summary>Como jogar</summary>
      <p>Comece pela caixa dourada: ela revela gratuitamente três caixas aleatórias. Cada abertura normal custa energia e rende moedas e uma recompensa. Após cinco aberturas no andar, o chefe fica disponível.</p>
      <p>Retire-se entre caixas para guardar todo o saque. Sem energia suficiente, a retirada é automática ao resolver a caixa atual. Sem vida, guarda 25%, ou 75% com Seguro. Cada 5 moedas guardadas viram 1 essência.</p>
      <p>Raridades: comum 60%, rara 25%, épica 12% e lendária 3%. Cada animal tem 25% de chance de vencer a corrida. Acertar paga 3 vezes a aposta, incluindo o valor apostado. Todas as fichas são fictícias.</p>
      <p>Até quatro camadas e doze caixas pendentes. Excedentes viram moedas. Vença os três chefes para encerrar com vitória.</p>
    </details>
  </>
}

function Inventory({ run }: { run: Run }) {
  const relicCounts = run.relics.reduce<Partial<Record<RelicId, number>>>((counts, relic) => {
    counts[relic] = (counts[relic] ?? 0) + 1
    return counts
  }, {})
  return <section className="panel inventory">
    <p className="eyebrow">Fichas na mesa</p><h2>Seu saque</h2>
    <div className="inventory-total"><strong>{getRunValue(run)}</strong><span>moedas de valor total</span></div>
    <dl>{rarities.map(rarity => {
      const count = run.inventory.filter(item => item.rarity === rarity).length
      return <div key={rarity}><dt><i className={`rarity-dot rarity-${rarity}`} />{RARITY_LABELS[rarity]}</dt><dd>{count} <span>× {RARITY_VALUES[rarity]}</span></dd></div>
    })}</dl>
    <p className="fine-print">Guarde ou use as recompensas na Forja.</p>
    {Object.keys(relicCounts).length > 0 && <><h3>Relíquias equipadas</h3><ul className="relic-list">{Object.entries(relicCounts).map(([id, count]) => <li key={id}>{RELIC_LABELS[id as RelicId]} <strong>×{count}</strong></li>)}</ul></>}
    <div className="protection-status"><span aria-hidden="true">♜</span> {run.insured ? 'Seguro ativo · 75% protegido' : 'Proteção básica · 25%'}</div>
  </section>
}

function Store({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const { profile, result } = state
  return <>
    <section className="shop-intro panel" aria-labelledby="shop-heading">
      <div className="shop-copy"><p className="eyebrow shop-sign">Aberto entre expedições</p><h2 id="shop-heading">O Empório<br />da Sorte<span>.</span></h2><p>Um pouco de preparo.<br />Uma nova chance na mesa.</p>
        <button className="primary" onClick={() => dispatch({ type: 'start' })}>Começar expedição <Arrow /></button>
        <p className="fine-print">Sua caixa dourada está esperando.</p></div>
      <Storefront />
    </section>
    {result && <section className={`panel result result-${result.outcome}`} aria-labelledby="result-heading">
      <p className="eyebrow">De volta à lojinha · andar {result.floor}/3</p>
      <h2 id="result-heading">{result.outcome === 'victory' ? 'Você venceu a casa!' : result.outcome === 'defeat' ? 'A sorte ainda vai virar.' : 'Hora de guardar os ganhos.'}</h2>
      <div className="result-stats"><span><strong>{result.loot}</strong> saque encontrado</span><span><strong>{result.kept}</strong> moedas guardadas</span><span><strong>+{result.essence}</strong> essência</span></div>
      <details><summary>Relembrar a expedição</summary><ol className="event-log">{result.log.map((entry, index) => <li key={index}>{entry}</li>)}</ol></details>
    </section>}
    <section className="shop-products" aria-labelledby="products-heading">
      <div className="section-heading"><div><p className="eyebrow">Escolha seu próximo trunfo</p><h2 id="products-heading">Estante de melhorias</h2></div><span className="tag">Permanentes</span></div>
      <div className="shop-shelf">{upgrades.map(upgrade => {
        const level = profile.upgrades[upgrade.id]
        const price = 10 * (level + 1)
        return <article className={`product-card product-${upgrade.id}`} key={upgrade.id}>
          <div className="product-icon"><UpgradeIcon type={upgrade.id} /></div><span className="product-price">{level >= 3 ? 'Completa' : `${price} essência`}</span>
          <h3>{upgrade.name}</h3><p>{upgrade.description}</p>
          <div className="upgrade-level" aria-label={`Nível ${level} de 3`}>{[0, 1, 2].map(index => <span className={level > index ? 'filled' : ''} key={index} />)}<small>{level}/3</small></div>
          <button disabled={level >= 3 || profile.essence < price} onClick={() => dispatch({ type: 'upgrade', upgrade: upgrade.id })}>{level >= 3 ? 'Nível máximo' : `Comprar · ${price} essência`}</button>
        </article>
      })}</div>
      <div className="section-heading relic-shelf-heading"><div><p className="eyebrow">Novidades no seu caminho</p><h2>Relíquias para descobrir</h2></div></div>
      <div className="relic-shelf">{unlocks.map(unlock => {
        const unlocked = profile.unlockedRelics.includes(unlock.id)
        return <article className={`product-card product-${unlock.id}`} key={unlock.id}>
          <div className="product-icon"><UpgradeIcon type={unlock.id} /></div><span className="product-price">{unlocked ? 'Na coleção' : '15 essência'}</span><h3>{RELIC_LABELS[unlock.id]}</h3><p>{unlock.description}</p>
          <button disabled={unlocked || profile.essence < 15} onClick={() => dispatch({ type: 'unlock', relic: unlock.id })}>{unlocked ? 'Desbloqueada' : 'Desbloquear · 15 essência'}</button>
        </article>
      })}</div>
    </section>
  </>
}

export function App() {
  const { state, dispatch, storageUnavailable } = useGame()
  const { run, profile } = state
  const [opening, setOpening] = useState<Opening | null>(null)
  const [queuePage, setQueuePage] = useState(0)
  const openingLock = useRef(false)
  const mainPanel = useRef<HTMLElement>(null)
  const openingHeading = useRef<HTMLHeadingElement>(null)
  const choices = getChoices(state)
  const cost = run ? getOpeningCost(run) : 1
  const busy = Boolean(opening || state.lastRace)
  const sceneBlocked = busy || Boolean(run?.pending)
  const canAct = Boolean(run?.starterOpened && !run.pending && !busy)
  const pageCount = Math.max(1, Math.ceil((run?.queue.length ?? 0) / 3))
  const currentPage = Math.min(queuePage, pageCount - 1)
  const visibleBoxes = run?.queue.slice(currentPage * 3, currentPage * 3 + 3) ?? []

  const restoreGameFocus = useCallback(() => {
    requestAnimationFrame(() => mainPanel.current
      ?.querySelector<HTMLButtonElement>('.box-card:not(:disabled), .primary:not(:disabled)')
      ?.focus({ preventScroll: true }))
  }, [])

  const closeRace = useCallback(() => {
    dispatch({ type: 'dismiss-race' })
    restoreGameFocus()
  }, [dispatch, restoreGameFocus])

  const choose = (choiceId: string) => {
    const next = dispatch({ type: 'choose', choiceId })
    if (!next.run?.pending && !next.lastRace) restoreGameFocus()
  }

  const beginOpening = (action: GameAction, type: Opening['type'], rarity?: Rarity) => {
    if (openingLock.current || state.lastRace || run?.pending) return
    openingLock.current = true
    setOpening({ action, type, rarity })
  }

  useEffect(() => {
    if (!opening) return
    openingHeading.current?.focus()
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 60 : 950
    const timer = window.setTimeout(() => {
      const next = dispatch(opening.action)
      openingLock.current = false
      setOpening(null)
      if (!next.run?.pending) restoreGameFocus()
    }, duration)
    return () => window.clearTimeout(timer)
  }, [opening, dispatch, restoreGameFocus])

  useEffect(() => {
    setQueuePage(0)
    if (mainPanel.current) mainPanel.current.scrollTop = 0
  }, [run?.floor])

  useEffect(() => {
    setQueuePage(page => Math.min(page, pageCount - 1))
  }, [pageCount])

  const hud = run && <section className="casino-hud run-overview panel" aria-label="Recursos da expedição">
    <div className="section-heading">
      <div><p className="eyebrow">A casa está aberta</p><h2>Andar {run.floor}<span className="muted"> / 3</span></h2></div>
      <span className="tag">{run.opened >= 5 ? 'Chefe disponível' : `${run.opened}/5 para o chefe`}</span>
    </div>
    <dl className="resource-grid">
      <div><dt><span aria-hidden="true">♥</span> Vida</dt><dd key={`health-${run.health}`}>{run.health}<span>/{run.maxHealth}</span></dd></div>
      <div><dt><span aria-hidden="true">ϟ</span> Energia</dt><dd key={`energy-${run.energy}`}>{run.energy}</dd></div>
      <div><dt><span aria-hidden="true">◉</span> Moedas</dt><dd key={`coins-${run.coins}`}>{run.coins}</dd></div>
      <div><dt><svg className="hud-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="5" r="3" /><path d="m7 7 6 6m-3-3 2-2m0 4 2-2" /></svg> Chaves</dt><dd key={`keys-${run.keys}`}>{run.keys}</dd></div>
    </dl>
    <div className="run-actions">
      <button className="boss-button" onClick={() => beginOpening({ type: 'boss' }, 'chefe')} disabled={!canAct || run.opened < 5 || run.energy < cost}>Enfrentar chefe · {cost} energia</button>
      <button className="quiet" onClick={() => dispatch({ type: 'retreat' })} disabled={Boolean(run.pending) || busy}>Retirar com o saque</button>
    </div>
    <p className="fine-print hud-note">Proteção: {run.insured ? '75%' : '25%'}{run.curse > 0 ? ` · Maldição: +${run.curse} energia por abertura` : ''}</p>
  </section>

  const sceneHeader = <header className="masthead">
    <div className="brand-lockup">
      <span className="brand-emblem" aria-hidden="true">♠</span>
      <div><p className="eyebrow venue-label">{run ? 'O cassino das caixas' : 'A casa da próxima chance'}</p><h1>Gamblin<span aria-hidden="true">.</span></h1></div>
    </div>
    {hud}
    {!run
      ? <div className="profile-summary" aria-label="Progresso permanente"><span><strong>{profile.essence}</strong> essência</span><span><strong>{profile.runs}</strong> expedições</span><span><strong>{profile.wins}</strong> vitórias</span></div>
      : <div className="venue-badge"><span aria-hidden="true">♦</span> {biomeNames[run.biome]} <span aria-hidden="true">♦</span></div>}
  </header>

  const storageAlert = storageUnavailable && <p role="alert" className="storage-alert">Não foi possível salvar. Verifique se o navegador permite armazenamento antes de fechar a página.</p>

  return <>
    <div className={`app-shell ${run ? 'mode-casino' : 'mode-shop'}`} inert={sceneBlocked}>
      {run ? <>
        <div className="casino-fixed-area">
          {sceneHeader}
          {storageAlert}
          <main className="casino-stage" ref={mainPanel} aria-label="Mesa de jogo fixa">
            {!run.starterOpened ? <section className="starter table-stage panel" aria-labelledby="starter-heading">
              <span className="table-emblem" aria-hidden="true">♦ ♦ ♦</span><p className="eyebrow">Sua primeira mão</p>
              <div className="starter-halo"><BoxArt type="starter" /></div>
              <div className="table-caption"><h2 id="starter-heading">Tudo começa com uma caixa.</h2><p>Três caixas aleatórias. Nenhum custo.<br />Uma nova chance de desafiar a casa.</p></div>
              <button className="primary" onClick={() => beginOpening({ type: 'starter' }, 'starter')} disabled={busy}>Abrir caixa inicial <span aria-hidden="true">✦</span></button>
              <p className="fine-print">Abertura gratuita · Energia preservada</p>
            </section> : <section className="queue-section" aria-labelledby="queue-heading">
              <div className="section-heading">
                <div><p className="eyebrow">Qual será a próxima?</p><h2 id="queue-heading">Caixas na mesa</h2></div>
                <div className="queue-tools">
                  <span className="tag">{run.queue.length}/12 pendentes</span>
                  {pageCount > 1 && <nav className="queue-pagination" aria-label="Páginas de caixas">
                    <button aria-label="Página anterior de caixas" disabled={sceneBlocked || currentPage === 0} onClick={() => setQueuePage(currentPage - 1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" /></svg></button>
                    <span className="queue-page-label" role="status" aria-label={`Página ${currentPage + 1} de ${pageCount}`}>{currentPage + 1}/{pageCount}</span>
                    <button aria-label="Próxima página de caixas" disabled={sceneBlocked || currentPage === pageCount - 1} onClick={() => setQueuePage(currentPage + 1)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg></button>
                  </nav>}
                </div>
              </div>
              <div className="box-grid">{visibleBoxes.map((box, index) => <button className={`box-card box-${box.type} rarity-${box.rarity}`} key={box.id} style={{ '--box-accent': BOX_VISUALS[box.type].accent, '--card-index': index } as CSSProperties} disabled={!canAct || run.energy < cost} onClick={() => beginOpening({ type: 'open', boxId: box.id }, box.type, box.rarity)}>
                <span className="box-meta"><span>{RARITY_LABELS[box.rarity]}</span><span className="box-number">{String(currentPage * 3 + index + 1).padStart(2, '0')}</span></span>
                <BoxArt type={box.type} /><strong>{boxNames[box.type]}</strong><span className="box-cost">{cost} energia <span aria-hidden="true">·</span> camada {box.depth}</span>
              </button>)}</div>
            </section>}
          </main>
        </div>

        <div className="casino-bottom">
          <section className="casino-history-pane bottom-scroll" tabIndex={0} aria-label="Histórico da expedição">
            <div className="panel compact history-panel"><h2>O que aconteceu na mesa</h2><ol className="event-log" aria-live="polite" aria-relevant="additions text">{run.log.map((entry, index) => <li key={`${index}-${entry}`}>{entry}</li>)}</ol></div>
          </section>
          <aside className="casino-sheet-pane bottom-scroll" tabIndex={0} aria-label="Ficha da expedição">
            <Inventory run={run} />
            {run.contract && <section className="panel compact contract-panel"><h3>Contrato ativo</h3><p>{run.contract.remaining === 0 ? 'Conclua a escolha atual sem apostar para receber 10 moedas.' : `Abra mais ${run.contract.remaining} caixa(s) sem apostar para receber 10 moedas.`}</p></section>}
            {run.incubators.length > 0 && <section className="panel compact"><h3>Incubadoras</h3><div className="incubators">{run.incubators.map(incubator => <div key={incubator.id}><span>{RARITY_LABELS[rarities[Math.min(incubator.age, 3)] ?? 'comum']} · {incubator.age}/3 aberturas</span><button disabled={!canAct} onClick={() => dispatch({ type: 'collect', incubatorId: incubator.id })}>Coletar recompensa</button></div>)}</div></section>}
            <RuleBook />
          </aside>
        </div>
      </> : <>
        {sceneHeader}
        {storageAlert}
        <div className="game-layout shop-layout">
          <main className="scene-main scroll-panel" ref={mainPanel} aria-label="Loja entre expedições"><Store state={state} dispatch={dispatch} /></main>
          <aside className="scene-sidebar scroll-panel" aria-label="Informações da lojinha">
            <section className="panel shop-ledger"><p className="eyebrow">O livro da casa</p><h2>Seu próximo trunfo</h2><div className="inventory-total"><strong>{profile.essence}</strong><span>essências disponíveis</span></div><p>Melhorias acompanham você em todas as expedições. As relíquias desbloqueadas passam a aparecer nas caixas.</p><div className="protection-status">{profile.bankRemainder}/5 moedas para a próxima essência</div><p className="fine-print">Progresso salvo automaticamente neste navegador.</p></section>
            <RuleBook />
          </aside>
        </div>
      </>}
      <footer><span>18 caixas. Uma casa cheia de surpresas.</span><span>Fichas fictícias · Progresso local</span></footer>
    </div>

    {run?.pending && !busy && <ChoiceDialog key={run.pending.box.id} pending={run.pending} choices={choices} onChoose={choose} />}
    {opening && <div className="opening-overlay" role="dialog" aria-modal="true" aria-labelledby="opening-heading">
      <div className={`opening-scene effect-${BOX_VISUALS[opening.type].effect}`} style={{ '--opening-accent': BOX_VISUALS[opening.type].accent } as CSSProperties}>
        <div className="opening-rays" aria-hidden="true" />
        <div className="opening-sparks" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i className="opening-spark" key={index} style={{ '--index': index } as CSSProperties} />)}</div>
        <p className="eyebrow">{opening.rarity ? RARITY_LABELS[opening.rarity] : 'A casa guarda uma surpresa'}</p>
        <div className="opening-art"><BoxArt type={opening.type} opening /></div>
        <h2 className="opening-label" id="opening-heading" ref={openingHeading} tabIndex={-1}>{BOX_VISUALS[opening.type].label}</h2>
        <p>Revelando sua próxima jogada…</p><div className="opening-progress" aria-hidden="true" />
      </div>
    </div>}
    {state.lastRace && <AnimalRace key={state.lastRace.id} race={state.lastRace} onClose={closeRace} />}
  </>
}
