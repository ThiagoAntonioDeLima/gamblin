import { useEffect, useRef } from 'react'
import { getChoices, getOpeningCost, getRunValue, RARITY_LABELS, RARITY_VALUES, RELIC_LABELS } from './game/engine.ts'
import type { Rarity, RelicId, Upgrade } from './game/engine.ts'
import { lootboxes } from './game/lootboxes.ts'
import { useGame } from './useGame.ts'
import './styles.css'

const rarities: Rarity[] = ['comum', 'rara', 'epica', 'lendaria']
const boxNames = Object.fromEntries(lootboxes.map(box => [box.id, box.name]))
const biomeNames: Record<string, string> = { neutro: 'Terras desconhecidas', bosque: 'Bosque', bazar: 'Bazar', ruinas: 'Ruínas' }
const upgrades: { id: Upgrade; name: string; description: string }[] = [
  { id: 'vitality', name: 'Vitalidade', description: '+1 de vida inicial e máxima por nível.' },
  { id: 'energy', name: 'Energia', description: '+1 de energia a cada andar por nível.' },
  { id: 'fortune', name: 'Fortuna', description: '+1 moeda a cada abertura por nível.' },
]
const unlocks: { id: 'casca' | 'ninho'; description: string }[] = [
  { id: 'casca', description: 'Ignora o primeiro ponto de dano de cada andar quando equipada.' },
  { id: 'ninho', description: 'A Multiplicadora gera uma caixa extra quando equipada.' },
]

function Chest({ ornate = false }: { ornate?: boolean }) {
  return (
    <svg viewBox="0 0 160 140" className={ornate ? 'chest chest-ornate' : 'chest'} aria-hidden="true">
      <path className="chest-lid" d="M28 63V48c0-24 104-24 104 0v15Z" />
      <path className="chest-body" d="M23 62h114v57H23Z" />
      <path className="chest-trim" d="M43 36v82m74-82v82M23 65h114M24 110h112" />
      <path className="chest-lock" d="m80 65 13 13-13 18-13-18Z" />
      {ornate && <>
        <path className="chest-trim" d="m60 44 20-17 20 17M30 83l14 12-14 11m100-23-14 12 14 11" />
        <path className="chest-spark" d="m15 22 3 9 9 3-9 3-3 9-3-9-9-3 9-3Zm125-15 3 9 9 3-9 3-3 9-3-9-9-3 9-3ZM80 3l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
      </>}
    </svg>
  )
}

export function App() {
  const { state, dispatch, storageUnavailable } = useGame()
  const { run, profile, result } = state
  const choiceHeading = useRef<HTMLHeadingElement>(null)
  const pendingId = run?.pending?.box.id
  const choices = getChoices(state)
  const cost = run ? getOpeningCost(run) : 1
  const canAct = Boolean(run?.starterOpened && !run.pending)
  const relicCounts = run?.relics.reduce<Partial<Record<RelicId, number>>>((counts, relic) => {
    counts[relic] = (counts[relic] ?? 0) + 1
    return counts
  }, {}) ?? {}

  useEffect(() => {
    if (pendingId) choiceHeading.current?.focus()
  }, [pendingId])

  return (
    <div className="app-shell">
      <header className="masthead">
        <div><p className="eyebrow">Um roguelite de surpresas</p><h1>Gamblin<span aria-hidden="true">.</span></h1></div>
        <div className="profile-summary" aria-label="Progresso permanente">
          <span><strong>{profile.essence}</strong> essência</span>
          <span><strong>{profile.runs}</strong> expedições</span>
          <span><strong>{profile.wins}</strong> vitórias</span>
        </div>
      </header>

      {storageUnavailable && <p role="alert" className="storage-alert">Não foi possível salvar o progresso. Verifique se o navegador permite armazenamento antes de fechar a página.</p>}

      <div className="game-layout">
        <main>
          {!run && <section className="panel welcome" aria-labelledby="welcome-heading">
            <p className="eyebrow">Caixas dentro de caixas</p>
            <h2 id="welcome-heading">Até onde vai a sua sorte?</h2>
            <p>Explore três andares, descubra combinações e escolha a hora de guardar o saque.</p>
            <button className="primary" onClick={() => dispatch({ type: 'start' })}>Começar expedição</button>
            <p className="fine-print">Apostas com fichas fictícias. Progresso salvo neste navegador.</p>
          </section>}

          {!run && result && <section className={`panel result result-${result.outcome}`} aria-labelledby="result-heading">
            <p className="eyebrow">Expedição encerrada · andar {result.floor}/3</p>
            <h2 id="result-heading">{result.outcome === 'victory' ? 'Os três andares são seus!' : result.outcome === 'defeat' ? 'Uma chance para recomeçar.' : 'Saque guardado. Hora de respirar.'}</h2>
            <div className="result-stats">
              <span><strong>{result.loot}</strong> saque encontrado</span>
              <span><strong>{result.kept}</strong> moedas guardadas</span>
              <span><strong>+{result.essence}</strong> essência</span>
            </div>
            <p className="fine-print">{profile.bankRemainder}/5 moedas guardadas para a próxima essência.</p>
            <details><summary>Histórico da expedição</summary><ol>{result.log.map((entry, index) => <li key={index}>{entry}</li>)}</ol></details>
          </section>}

          {run && <>
            <section className="run-overview panel" aria-label="Recursos da expedição">
              <div className="section-heading"><div><p className="eyebrow">{biomeNames[run.biome] ?? run.biome}</p><h2>Andar {run.floor}<span className="muted"> / 3</span></h2></div><span className="tag">{run.opened >= 5 ? 'Chefe disponível' : `${run.opened}/5 aberturas para o chefe`}</span></div>
              <dl className="resource-grid">
                <div><dt>Vida</dt><dd>{run.health}<span>/{run.maxHealth}</span></dd></div>
                <div><dt>Energia</dt><dd>{run.energy}</dd></div>
                <div><dt>Moedas</dt><dd>{run.coins}</dd></div>
                <div><dt>Chaves</dt><dd>{run.keys}</dd></div>
              </dl>
              <div className="run-actions">
                <button onClick={() => dispatch({ type: 'boss' })} disabled={!canAct || run.opened < 5 || run.energy < cost}>Enfrentar chefe · {cost} energia</button>
                <button className="quiet" onClick={() => dispatch({ type: 'retreat' })} disabled={Boolean(run.pending)}>Retirar com o saque</button>
              </div>
              <p className="fine-print">Saque atual: {getRunValue(run)} moedas · Proteção na derrota: {run.insured ? '75%' : '25%'}{run.curse > 0 ? ` · Maldição: +${run.curse} energia por abertura` : ''}</p>
            </section>

            {!run.starterOpened && <section className="starter panel" aria-labelledby="starter-heading">
              <p className="eyebrow">O começo de toda expedição</p>
              <Chest ornate />
              <h2 id="starter-heading">Três surpresas esperam por você.</h2>
              <p>Abra a caixa inicial e descubra as três caixas aleatórias da sua jornada.</p>
              <button className="primary" onClick={() => dispatch({ type: 'starter' })}>Abrir caixa inicial</button>
            </section>}

            {run.pending && <section className="panel choice-panel" aria-labelledby="choice-heading">
              <p className="eyebrow">{run.pending.box.type === 'espelho' ? 'Um reflexo da sua última escolha' : 'A caixa se abriu'}</p>
              <h2 id="choice-heading" ref={choiceHeading} tabIndex={-1}>{boxNames[run.pending.kind]}</h2>
              <p>{lootboxes.find(box => box.id === run.pending?.kind)?.description}</p>
              <div className="choices">{choices.map(choice => <button key={choice.id} disabled={choice.disabled} onClick={() => dispatch({ type: 'choose', choiceId: choice.id })}>
                <strong>{choice.label}</strong><span>{choice.description}</span>
              </button>)}</div>
            </section>}

            {run.starterOpened && <section className="queue-section" aria-labelledby="queue-heading">
              <div className="section-heading"><h2 id="queue-heading">Caixas encontradas</h2><span className="muted">{run.queue.length}/12 pendentes</span></div>
              <div className="box-grid">{run.queue.map(box => <button className={`box-card rarity-${box.rarity}`} key={box.id} disabled={!canAct || run.energy < cost} onClick={() => dispatch({ type: 'open', boxId: box.id })}>
                <span className="box-meta">{RARITY_LABELS[box.rarity]} · camada {box.depth}</span>
                <Chest />
                <strong>{boxNames[box.type]}</strong>
                <span>Abrir · {cost} energia</span>
              </button>)}</div>
            </section>}

            {run.contract && <section className="panel compact"><h3>Contrato ativo</h3><p>Abra mais {run.contract.remaining} caixa(s) sem apostar para receber 10 moedas.</p></section>}

            {run.incubators.length > 0 && <section className="panel compact"><h3>Incubadoras</h3><div className="incubators">{run.incubators.map(incubator => <div key={incubator.id}>
              <span>{RARITY_LABELS[rarities[Math.min(incubator.age, 3)] ?? 'comum']} · {incubator.age}/3 aberturas</span>
              <button disabled={!canAct} onClick={() => dispatch({ type: 'collect', incubatorId: incubator.id })}>Coletar recompensa</button>
            </div>)}</div></section>}

            <section className="panel compact"><h3>Histórico</h3><ol className="event-log" aria-live="polite" aria-relevant="additions text">{run.log.slice(-6).map((entry, index) => <li key={`${run.log.length}-${index}`}>{entry}</li>)}</ol></section>
          </>}

          <details className="panel catalog"><summary>Conheça as 18 caixas</summary><dl>{lootboxes.map(box => <div key={box.id}><dt>{box.name}</dt><dd>{box.description}</dd></div>)}</dl></details>
          <details className="panel rules"><summary>Como jogar</summary>
            <p>Abra caixas, resolva suas escolhas e vença o chefe de cada andar. Ele fica disponível após cinco aberturas. Abrir custa energia; sem energia suficiente, você se retira automaticamente ao resolver a caixa atual. Sem vida, a expedição termina em derrota.</p>
            <p>Você pode se retirar entre caixas para guardar todo o saque. Na derrota, guarda 25%, ou 75% com Seguro. Cada 5 moedas guardadas viram 1 essência para melhorias permanentes.</p>
            <p>Raridades: comum 60%, rara 25%, épica 12% e lendária 3%. Nas apostas, cada uma das quatro criaturas tem 25% de chance. Acertar paga 3 vezes a aposta, incluindo o valor apostado.</p>
            <p>Caixas internas ocupam até quatro camadas; a fila guarda doze caixas. Excedentes viram moedas. As fichas são fictícias.</p>
          </details>
        </main>

        <aside aria-label="Inventário e melhorias">
          {run && <section className="panel inventory"><h2>Seu saque</h2><p className="fine-print">Recompensas viram moedas ao sair ou podem alimentar a Forja.</p><dl>{rarities.map(rarity => {
            const count = run.inventory.filter(item => item.rarity === rarity).length
            return <div key={rarity}><dt>{RARITY_LABELS[rarity]}</dt><dd>{count} <span>× {RARITY_VALUES[rarity]}</span></dd></div>
          })}</dl>{Object.keys(relicCounts).length > 0 && <><h3>Relíquias da expedição</h3><ul className="relic-list">{Object.entries(relicCounts).map(([id, count]) => <li key={id}>{RELIC_LABELS[id as RelicId]} <strong>×{count}</strong></li>)}</ul></>}</section>}

          <section className="panel upgrades"><p className="eyebrow">Entre expedições</p><h2>Melhorias permanentes</h2><p className="fine-print">Use essência para preparar sua próxima jornada.</p>
            {upgrades.map(upgrade => {
              const level = profile.upgrades[upgrade.id]
              const price = 10 * (level + 1)
              return <div className="upgrade" key={upgrade.id}><div className="section-heading"><h3>{upgrade.name}</h3><span className="muted">{level}/3</span></div><p>{upgrade.description}</p><button disabled={Boolean(run) || level >= 3 || profile.essence < price} onClick={() => dispatch({ type: 'upgrade', upgrade: upgrade.id })}>{level >= 3 ? 'Nível máximo' : `Melhorar · ${price} essência`}</button></div>
            })}
            <h3 className="unlock-heading">Novas relíquias</h3>
            {unlocks.map(unlock => {
              const unlocked = profile.unlockedRelics.includes(unlock.id)
              return <div className="upgrade" key={unlock.id}><h3>{RELIC_LABELS[unlock.id]}</h3><p>{unlock.description}</p><button disabled={Boolean(run) || unlocked || profile.essence < 15} onClick={() => dispatch({ type: 'unlock', relic: unlock.id })}>{unlocked ? 'Desbloqueada' : 'Desbloquear · 15 essência'}</button></div>
            })}
          </section>
        </aside>
      </div>
      <footer>Gamblin · 18 caixas, incontáveis surpresas · Fichas fictícias</footer>
    </div>
  )
}
