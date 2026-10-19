import { lootboxes } from './lootboxes.ts'
import type { LootboxId } from './lootboxes.ts'

export type Rarity = 'comum' | 'rara' | 'epica' | 'lendaria'
export type RelicId = 'ima' | 'bateria' | 'coracao' | 'casca' | 'ninho'
export type Upgrade = 'vitality' | 'energy' | 'fortune'

export interface Profile {
  essence: number
  bankRemainder: number
  runs: number
  wins: number
  upgrades: Record<Upgrade, number>
  unlockedRelics: RelicId[]
}

export interface Box {
  id: string
  type: LootboxId
  rarity: Rarity
  depth: number
}

export interface Reward {
  id: string
  rarity: Rarity
}

export interface Incubator {
  id: string
  age: number
}

export interface Contract {
  remaining: number
}

export interface Pending {
  box: Box
  kind: LootboxId
  offers?: Box[]
  relicOffers?: RelicId[]
  prize?: number
  descents?: number
  origin?: Box
}

export interface Run {
  floor: number
  health: number
  maxHealth: number
  energy: number
  coins: number
  keys: number
  opened: number
  queue: Box[]
  inventory: Reward[]
  relics: RelicId[]
  incubators: Incubator[]
  contract: Contract | null
  insured: boolean
  curse: number
  heat: number
  biome: string
  pending: Pending | null
  log: string[]
  nextId: number
  lastBox: Box | null
  shellUsed: number
  starterOpened: boolean
}

export interface RunResult {
  outcome: 'retreat' | 'defeat' | 'victory'
  loot: number
  kept: number
  essence: number
  floor: number
  log: string[]
}

export type AnimalId = typeof ANIMALS[number]['id']

export interface RaceResult {
  id: string
  winner: AnimalId
  selected: AnimalId
  stake: number
  payout: number
}

export interface GameState {
  profile: Profile
  run: Run | null
  result: RunResult | null
  lastRace?: RaceResult | null
}

export interface Choice {
  id: string
  label: string
  description: string
  disabled?: boolean
}

export type GameAction =
  | { type: 'start' }
  | { type: 'dismiss-race' }
  | { type: 'starter' }
  | { type: 'open'; boxId: string }
  | { type: 'choose'; choiceId: string }
  | { type: 'boss' }
  | { type: 'retreat' }
  | { type: 'collect'; incubatorId: string }
  | { type: 'upgrade'; upgrade: Upgrade }
  | { type: 'unlock'; relic: 'casca' | 'ninho' }

const RARITIES: Rarity[] = ['comum', 'rara', 'epica', 'lendaria']
const RELICS: RelicId[] = ['ima', 'bateria', 'coracao', 'casca', 'ninho']
const BOX_TYPES: string[] = lootboxes.map(box => box.id)

export const RARITY_VALUES: Record<Rarity, number> = {
  comum: 2,
  rara: 5,
  epica: 10,
  lendaria: 20,
}

export const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  rara: 'Rara',
  epica: 'Épica',
  lendaria: 'Lendária',
}

export const RELIC_LABELS: Record<RelicId, string> = {
  ima: 'Ímã',
  bateria: 'Bateria',
  coracao: 'Coração',
  casca: 'Casca',
  ninho: 'Ninho',
}

export function initialGameState(): GameState {
  return {
    profile: {
      essence: 0,
      bankRemainder: 0,
      runs: 0,
      wins: 0,
      upgrades: { vitality: 0, energy: 0, fortune: 0 },
      unlockedRelics: [],
    },
    run: null,
    result: null,
    lastRace: null,
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function integer(value: unknown, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function rarity(value: unknown): value is Rarity {
  return typeof value === 'string' && RARITIES.includes(value as Rarity)
}

function relic(value: unknown): value is RelicId {
  return typeof value === 'string' && RELICS.includes(value as RelicId)
}

function entityId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function validBox(value: unknown): value is Box {
  return record(value) && entityId(value.id) && typeof value.type === 'string' &&
    BOX_TYPES.includes(value.type) && rarity(value.rarity) && integer(value.depth, 1, 4)
}

function validRace(value: unknown): value is RaceResult {
  return record(value) && entityId(value.id) &&
    ANIMALS.some(animal => animal.id === value.winner) &&
    ANIMALS.some(animal => animal.id === value.selected) &&
    integer(value.stake) && [1, 5, 10].includes(value.stake) &&
    value.payout === (value.winner === value.selected ? value.stake * 3 : 0)
}

function validPending(value: unknown): value is Pending {
  if (!record(value) || !validBox(value.box) || typeof value.kind !== 'string' || !BOX_TYPES.includes(value.kind)) return false
  if (value.kind === 'espelho' || (value.kind !== value.box.type && (value.box.type !== 'espelho' || value.kind === 'chefe'))) return false
  if (value.offers !== undefined && (!Array.isArray(value.offers) || value.offers.length !== 3 || !value.offers.every(validBox))) return false
  if (value.relicOffers !== undefined && (!Array.isArray(value.relicOffers) || value.relicOffers.length < 1 || value.relicOffers.length > 3 || !value.relicOffers.every(relic) || new Set(value.relicOffers).size !== value.relicOffers.length)) return false
  if (value.prize !== undefined && !integer(value.prize)) return false
  if (value.descents !== undefined && !integer(value.descents, 0, 3)) return false
  if (value.origin !== undefined && !validBox(value.origin)) return false
  if (value.kind === 'oraculo' && value.offers === undefined) return false
  if (value.kind === 'reliquia' && value.relicOffers === undefined) return false
  if (value.kind === 'paradoxo' && (value.prize === undefined || value.descents === undefined)) return false
  const childDepth = Math.min(4, value.box.depth + 1)
  if (value.offers !== undefined && (value.kind !== 'oraculo' || value.offers.some(box => box.type === 'chefe' || box.depth !== childDepth))) return false
  if (value.relicOffers !== undefined && value.kind !== 'reliquia') return false
  if ((value.prize !== undefined || value.descents !== undefined || value.origin !== undefined) && value.kind !== 'paradoxo') return false
  if (value.kind === 'paradoxo') {
    const descents = value.descents as number
    if (value.prize !== 4 * 2 ** descents) return false
    if (descents === 0 && value.origin !== undefined) return false
    if (descents > 0 && (!validBox(value.origin) || !['paradoxo', 'espelho'].includes(value.origin.type) ||
      value.box.type !== 'paradoxo' || value.box.depth !== value.origin.depth + descents)) return false
  }
  return true
}

function validRun(value: unknown): value is Run {
  if (!record(value) || !integer(value.floor, 1, 3) || !integer(value.maxHealth, 1) ||
    !integer(value.health, 0, value.maxHealth) || !integer(value.energy) || !integer(value.coins) ||
    !integer(value.keys) || !integer(value.opened) || !integer(value.curse) || !integer(value.heat) ||
    !integer(value.nextId, 1) || !integer(value.shellUsed) || typeof value.insured !== 'boolean' || typeof value.starterOpened !== 'boolean' ||
    !['neutro', 'bosque', 'bazar', 'ruinas'].includes(value.biome as string) || !strings(value.log)) return false
  if (!Array.isArray(value.queue) || value.queue.length > 12 || !value.queue.every(validBox) || value.queue.some(box => box.type === 'chefe')) return false
  if (!Array.isArray(value.inventory) || !value.inventory.every(item => record(item) && entityId(item.id) && rarity(item.rarity))) return false
  if (!Array.isArray(value.relics) || !value.relics.every(relic)) return false
  if (!Array.isArray(value.incubators) || !value.incubators.every(item => record(item) && entityId(item.id) && integer(item.age, 0, 3))) return false
  if (value.contract !== null && (!record(value.contract) || !integer(value.contract.remaining, value.pending === null ? 1 : 0, 3))) return false
  if (value.pending !== null && !validPending(value.pending)) return false
  if (value.lastBox !== null && (!validBox(value.lastBox) || ['espelho', 'chefe'].includes(value.lastBox.type))) return false
  if (value.shellUsed > value.relics.filter(item => item === 'casca').length) return false
  if (!value.starterOpened && (value.queue.length !== 0 || value.pending !== null || value.inventory.length !== 0 ||
    value.incubators.length !== 0 || value.opened !== 0 || value.floor !== 1 || value.coins !== 0 || value.keys !== 0 ||
    value.relics.length !== 0 || value.contract !== null || value.insured || value.curse !== 0 || value.heat !== 0 ||
    value.biome !== 'neutro' || value.lastBox !== null || value.shellUsed !== 0 || value.nextId !== 1)) return false
  const ids = [
    ...value.queue.map(box => box.id),
    ...value.inventory.map(item => item.id),
    ...value.incubators.map(item => item.id),
    ...(value.pending ? [value.pending.box.id, ...(value.pending.offers?.map(box => box.id) ?? [])] : []),
  ]
  if (new Set(ids).size !== ids.length) return false
  const serialLimit = value.nextId
  const historicalIds = [
    ...(value.lastBox ? [value.lastBox.id] : []),
    ...(value.pending?.origin ? [value.pending.origin.id] : []),
  ]
  return [...ids, ...historicalIds].every(id => {
    const serial = /^(?:box|reward|incubator)-(\d+)$/.exec(id)
    return !serial || Number(serial[1]) < serialLimit
  })
}

/** Validates persisted data before any game or interface code can access it. */
export function isGameState(value: unknown): value is GameState {
  if (!record(value) || !record(value.profile)) return false
  if (value.lastRace !== undefined && value.lastRace !== null && !validRace(value.lastRace)) return false
  const profile = value.profile
  if (!integer(profile.essence) || !integer(profile.bankRemainder, 0, 4) || !integer(profile.runs) ||
    !integer(profile.wins, 0, profile.runs) || !record(profile.upgrades) ||
    !integer(profile.upgrades.vitality, 0, 3) || !integer(profile.upgrades.energy, 0, 3) ||
    !integer(profile.upgrades.fortune, 0, 3) || !Array.isArray(profile.unlockedRelics) ||
    !profile.unlockedRelics.every(item => item === 'casca' || item === 'ninho') ||
    new Set(profile.unlockedRelics).size !== profile.unlockedRelics.length) return false
  if (value.run !== null && !validRun(value.run)) return false
  if (value.result !== null) {
    const result = value.result
    if (!record(result) || !['retreat', 'defeat', 'victory'].includes(result.outcome as string) ||
      !integer(result.loot) || !integer(result.kept, 0, result.loot) || !integer(result.essence) ||
      !integer(result.floor, 1, 3) || !strings(result.log)) return false
  }
  return value.run === null || value.result === null
}

function log(run: Run, message: string): void {
  run.log = [...run.log.slice(-99), message]
}

function nextId(run: Run, prefix: string): string {
  return `${prefix}-${run.nextId++}`
}

function sample(random: () => number): number {
  const value = random()
  return Number.isFinite(value) ? Math.min(1 - Number.EPSILON, Math.max(0, value)) : 0
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(sample(random) * items.length)]!
}

function relicCount(run: Run, id: RelicId): number {
  return run.relics.filter(item => item === id).length
}

function rollRarity(random: () => number): Rarity {
  const roll = sample(random)
  if (roll < 0.6) return 'comum'
  if (roll < 0.85) return 'rara'
  if (roll < 0.97) return 'epica'
  return 'lendaria'
}

function rollType(run: Run, random: () => number): LootboxId {
  const favored: Record<string, LootboxId[]> = {
    bosque: ['multiplicadora', 'incubadora', 'oraculo'],
    bazar: ['mercador', 'forja', 'cofre'],
    ruinas: ['mimica', 'maldicao', 'sacrificio'],
  }
  const types = lootboxes.filter(box => box.id !== 'chefe').map(box => box.id)
  return pick([...types, ...(favored[run.biome] ?? [])], random)
}

function makeBox(run: Run, random: () => number, depth: number, type?: LootboxId): Box {
  return {
    id: nextId(run, 'box'),
    type: type ?? rollType(run, random),
    rarity: rollRarity(random),
    depth,
  }
}

function enqueue(run: Run, box: Box, depth = box.depth): void {
  if (depth > 4 || run.queue.length >= 12) {
    run.coins += 2
    log(run, 'Uma caixa excedente virou 2 moedas (limite de camadas ou de fila).')
  } else {
    run.queue.push({ ...box, depth })
  }
}

function addBoxes(run: Run, amount: number, depth: number, random: () => number): void {
  for (let index = 0; index < amount; index++) {
    enqueue(run, makeBox(run, random, Math.min(depth, 4)), depth)
  }
}

function addReward(run: Run, rewardRarity: Rarity): void {
  run.inventory.push({ id: nextId(run, 'reward'), rarity: rewardRarity })
}

function incubatorRarity(incubator: Incubator): Rarity {
  return RARITIES[Math.min(incubator.age, 3)]!
}

export function getRunValue(run: Run): number {
  return run.coins + run.inventory.reduce((total, item) => total + RARITY_VALUES[item.rarity], 0) +
    run.incubators.reduce((total, item) => total + RARITY_VALUES[incubatorRarity(item)], 0)
}

export function getOpeningCost(run: Run): number {
  return 1 + run.curse
}

function breakContract(run: Run): void {
  if (!run.contract) return
  const penalty = Math.min(3, run.coins)
  run.coins -= penalty
  run.contract = null
  log(run, `Contrato interrompido: ${penalty} moedas de penalidade.`)
}

function completeContract(run: Run): void {
  if (run.contract?.remaining !== 0) return
  run.coins += 10
  run.contract = null
  log(run, 'Contrato cumprido: +10 moedas.')
}

function advanceOpening(run: Run, box: Box, profile: Profile): void {
  run.energy -= getOpeningCost(run)
  run.opened++
  for (const incubator of run.incubators) incubator.age = Math.min(3, incubator.age + 1)
  if (run.contract && run.contract.remaining > 0) run.contract.remaining--
  const coins = 2 + profile.upgrades.fortune + relicCount(run, 'ima')
  run.coins += coins
  addReward(run, box.rarity)
  const name = lootboxes.find(item => item.id === box.type)!.name
  log(run, `${name} aberta: +${coins} moedas e uma recompensa ${RARITY_LABELS[box.rarity].toLowerCase()}.`)
}

function damage(run: Run, amount: number): void {
  const protection = Math.min(amount, Math.max(0, relicCount(run, 'casca') - run.shellUsed))
  run.shellUsed += protection
  if (protection) log(run, `Casca protegeu ${protection} ponto(s) de dano.`)
  run.health = Math.max(0, run.health - (amount - protection))
}

function finish(state: GameState, outcome: RunResult['outcome']): void {
  const run = state.run!
  breakContract(run)
  const loot = getRunValue(run)
  const fraction = outcome === 'defeat' ? (run.insured ? 0.75 : 0.25) : 1
  const kept = Math.floor(loot * fraction)
  const total = kept + state.profile.bankRemainder
  const essence = Math.floor(total / 5)
  state.profile.essence += essence
  state.profile.bankRemainder = total % 5
  state.profile.runs++
  if (outcome === 'victory') state.profile.wins++
  const descriptions = { retreat: 'Retirada', defeat: 'Derrota', victory: 'Vitória' }
  log(run, `${descriptions[outcome]}: ${kept} de ${loot} moedas de saque guardadas; +${essence} essência(s).`)
  state.result = { outcome, loot, kept, essence, floor: run.floor, log: [...run.log] }
  state.run = null
}

function settle(state: GameState, random: () => number): void {
  const run = state.run
  if (!run || !run.starterOpened) return
  if (run.health <= 0) {
    finish(state, 'defeat')
  } else if (!run.pending) {
    completeContract(run)
    if (run.energy < getOpeningCost(run)) {
      log(run, 'Sem energia suficiente para outra abertura: retirada automática.')
      finish(state, 'retreat')
    } else if (run.queue.length === 0) {
      addBoxes(run, 3, 1, random)
      log(run, 'Você encontrou três novas caixas.')
    }
  }
}

function finishPending(run: Run): void {
  const pending = run.pending
  if (!pending) return
  const source = pending.origin ?? pending.box
  if (source.type !== 'espelho' && source.type !== 'chefe') run.lastBox = { ...source }
  run.pending = null
  completeContract(run)
}

function relicOffers(state: GameState, random: () => number): RelicId[] {
  const pool: RelicId[] = ['ima', 'bateria', 'coracao', ...state.profile.unlockedRelics]
  const offers: RelicId[] = []
  while (offers.length < 3 && pool.length > 0) {
    const index = Math.floor(sample(random) * pool.length)
    offers.push(pool.splice(index, 1)[0]!)
  }
  return offers
}

function preparePending(state: GameState, box: Box, random: () => number): void {
  const run = state.run!
  const kind = box.type === 'espelho' ? run.lastBox?.type : box.type
  if (!kind) {
    log(run, 'O Espelho não encontrou uma caixa anterior para repetir.')
    return
  }
  if (box.type === 'espelho') {
    log(run, `O Espelho repetiu ${lootboxes.find(item => item.id === kind)!.name}.`)
  }
  const pending: Pending = { kind, box }
  if (kind === 'oraculo') {
    pending.offers = Array.from({ length: 3 }, () => makeBox(run, random, Math.min(4, box.depth + 1)))
  } else if (kind === 'reliquia') {
    pending.relicOffers = relicOffers(state, random)
  } else if (kind === 'paradoxo') {
    pending.prize = 4
    pending.descents = 0
  }
  run.pending = pending
}

function createRun(profile: Profile): Run {
  const maxHealth = 5 + profile.upgrades.vitality
  return {
    floor: 1,
    health: maxHealth,
    maxHealth,
    energy: 10 + profile.upgrades.energy,
    coins: 0,
    keys: 0,
    opened: 0,
    queue: [],
    inventory: [],
    relics: [],
    incubators: [],
    contract: null,
    insured: false,
    curse: 0,
    heat: 0,
    biome: 'neutro',
    pending: null,
    log: ['Expedição iniciada. Abra a caixa de entrada para revelar suas três caixas.'],
    nextId: 1,
    lastBox: null,
    shellUsed: 0,
    starterOpened: false,
  }
}

export const ANIMALS = [
  { id: 'coruja', name: 'Coruja' },
  { id: 'raposa', name: 'Raposa' },
  { id: 'lobo', name: 'Lobo' },
  { id: 'sapo', name: 'Sapo' },
] as const

const RELIC_DESCRIPTIONS: Record<RelicId, string> = {
  ima: '+1 moeda em cada abertura nesta expedição.',
  bateria: '+2 de energia agora e a cada renovação de andar.',
  coracao: '+1 de vida máxima e atual nesta expedição.',
  casca: 'Ignora o primeiro ponto de dano de cada andar; cópias acumulam.',
  ninho: '+1 caixa em cada Multiplicadora; cópias acumulam.',
}

function countRewards(run: Run, rewardRarity: Rarity): number {
  return run.inventory.filter(item => item.rarity === rewardRarity).length
}

/** Describes each pending decision, including its cost and why it may be unavailable. */
export function getChoices(state: GameState): Choice[] {
  if (state.lastRace) return []
  const run = state.run
  const pending = run?.pending
  if (!run || !pending) return []
  let choices: Choice[] = []
  switch (pending.kind) {
    case 'multiplicadora':
      choices = [{ id: 'multiply', label: 'Receber caixas', description: `Receba ${3 + relicCount(run, 'ninho')} caixas na próxima camada. Excedentes dos limites de 4 camadas/12 caixas viram 2 moedas cada.` }]
      break
    case 'apostas':
      choices = ANIMALS.flatMap(animal => [1, 5, 10].map(stake => ({
        id: `bet:${animal.id}:${stake}`,
        label: `${animal.name} · apostar ${stake}`,
        description: `Custa ${stake} moeda(s). Chance: 25%. Acerto paga ${stake * 3} no total (lucro de ${stake * 2}). Erro perde a aposta.${run.contract ? ' Apostar interrompe o contrato e cobra até 3 moedas adicionais.' : ''}`,
        disabled: run.coins < stake,
      })))
      break
    case 'mimica':
      choices = [
        { id: 'fight', label: 'Enfrentar', description: 'Receba 1 de dano e ganhe uma recompensa rara. Pode causar derrota.' },
        { id: 'escape', label: 'Pagar para escapar', description: 'Custa 3 moedas; preserva sua vida.', disabled: run.coins < 3 },
      ]
      break
    case 'mercador':
      choices = [
        { id: 'buy-key', label: 'Comprar chave', description: 'Custa 4 moedas; receba 1 chave.', disabled: run.coins < 4 },
        { id: 'buy-heal', label: 'Recuperar vida', description: 'Custa 5 moedas; recupere 1 de vida, até a vida máxima.', disabled: run.coins < 5 || run.health >= run.maxHealth },
        { id: 'buy-energy', label: 'Comprar energia', description: 'Custa 4 moedas; receba 2 de energia.', disabled: run.coins < 4 },
      ]
      break
    case 'forja':
      choices = RARITIES.slice(0, -1).map((rewardRarity, index) => ({
        id: `forge:${rewardRarity}`,
        label: `Forjar ${RARITY_LABELS[RARITIES[index + 1]!]}`,
        description: `Consome 3 recompensas da raridade ${RARITY_LABELS[rewardRarity]}; cria 1 ${RARITY_LABELS[RARITIES[index + 1]!]}. Você tem ${countRewards(run, rewardRarity)}.`,
        disabled: countRewards(run, rewardRarity) < 3,
      }))
      break
    case 'sacrificio':
      choices = [{ id: 'sacrifice', label: 'Fazer sacrifício', description: 'Pague 1 de vida para receber uma recompensa épica. Exige mais de 1 de vida.', disabled: run.health <= 1 }]
      break
    case 'oraculo':
      choices = (pending.offers ?? []).map(box => ({
        id: `oracle:${box.id}`,
        label: `${lootboxes.find(item => item.id === box.type)!.name} · ${RARITY_LABELS[box.rarity]}`,
        description: pending.box.depth >= 4 ? 'O limite de quatro camadas converte a caixa escolhida em 2 moedas.' : 'Guarde esta caixa na próxima camada; descarte as outras duas. Fila cheia converte a escolhida em 2 moedas.',
      }))
      break
    case 'contrato':
      choices = [{ id: 'contract', label: 'Aceitar contrato', description: 'Abra mais 3 caixas sem apostar e receba 10 moedas. Apostar ou sair antes cobra até 3 moedas.', disabled: run.contract !== null }]
      break
    case 'reliquia':
      choices = (pending.relicOffers ?? []).map(id => ({ id: `relic:${id}`, label: RELIC_LABELS[id], description: RELIC_DESCRIPTIONS[id] }))
      break
    case 'incubadora':
      choices = [{ id: 'incubate', label: 'Guardar incubadora', description: 'Começa comum (2). Após 1/2/3 outras aberturas vale rara (5)/épica (10)/lendária (20). Colete entre caixas ou receba o valor ao sair.' }]
      break
    case 'cofre':
      choices = [
        { id: 'key', label: 'Usar chave', description: 'Consome 1 chave; receba 2 recompensas raras.', disabled: run.keys < 1 },
        { id: 'break', label: 'Arrombar', description: '50% de chance de receber 2 recompensas raras. A falha perde somente esse conteúdo especial.' },
      ]
      break
    case 'seguro':
      choices = [{ id: 'insure', label: 'Ativar seguro', description: 'A proteção na derrota passa de 25% para 75% do saque nesta expedição. Não acumula.', disabled: run.insured }]
      break
    case 'maldicao':
      choices = [{ id: 'curse', label: 'Aceitar maldição', description: `Receba 1 recompensa lendária. Todas as próximas aberturas custarão ${getOpeningCost(run) + 1} de energia; maldições acumulam.` }]
      break
    case 'portal':
      choices = [
        { id: 'biome:bosque', label: 'Bosque', description: 'Dobra o peso de Multiplicadora, Incubadora e Oráculo nos próximos sorteios. Mantém o andar.' },
        { id: 'biome:bazar', label: 'Bazar', description: 'Dobra o peso de Mercador, Forja e Cofre nos próximos sorteios. Mantém o andar.' },
        { id: 'biome:ruinas', label: 'Ruínas', description: 'Dobra o peso de Mímica, Maldição e Sacrifício nos próximos sorteios. Mantém o andar.' },
      ]
      break
    case 'paradoxo': {
      const chance = Math.min(75, ((pending.descents ?? 0) + 1) * 25)
      choices = [
        { id: 'collect', label: `Coletar ${pending.prize ?? 0} moedas`, description: 'Guarde o prêmio atual e encerre o Paradoxo.' },
        { id: 'descend', label: 'Abrir camada interna', description: `Custa ${getOpeningCost(run)} de energia. ${chance}% de risco de perder o prêmio do Paradoxo; se sobreviver, ele dobra para ${(pending.prize ?? 0) * 2}. A abertura rende seu prêmio básico.`, disabled: pending.box.depth >= 4 || run.energy < getOpeningCost(run) },
      ]
      break
    }
    case 'ladrao': {
      const chance = Math.min(75, (run.heat + 1) * 25)
      choices = [{ id: 'steal', label: 'Roubar', description: `Receba 8 moedas. Há ${chance}% de chance de cobrança: devolver até 8 moedas e receber 1 de dano. Pode causar derrota.` }]
      break
    }
    case 'chefe':
      choices = [
        { id: 'boss:health', label: 'Enfrentar com vida', description: 'Receba 2 de dano. Sobreviver vence o chefe, dá 20 moedas e libera o próximo andar (ou a vitória no terceiro). Pode causar derrota.' },
        { id: 'boss:coins', label: 'Pagar tributo', description: 'Pague 10 moedas para vencer o chefe; ganhe 20 moedas e avance (ou vença no terceiro andar).', disabled: run.coins < 10 },
        { id: 'boss:rewards', label: 'Entregar recompensas', description: 'Consome as 3 primeiras recompensas do inventário; vença, ganhe 20 moedas e avance (ou vença no terceiro andar).', disabled: run.inventory.length < 3 },
      ]
      break
  }
  return [...choices, { id: 'pass', label: pending.kind === 'chefe' ? 'Adiar confronto' : 'Recusar e continuar', description: 'Abandone o prêmio especial desta caixa. O custo e o prêmio básico da abertura já foram aplicados.' }]
}

function takeRewards(run: Run, rewardRarity: Rarity): void {
  let remaining = 3
  run.inventory = run.inventory.filter(item => {
    if (item.rarity === rewardRarity && remaining > 0) {
      remaining--
      return false
    }
    return true
  })
}

function winBoss(state: GameState): void {
  const run = state.run!
  if (run.health <= 0) return
  run.coins += 20
  log(run, `Chefe do andar ${run.floor} vencido: +20 moedas.`)
  finishPending(run)
  if (run.floor === 3) {
    finish(state, 'victory')
  } else {
    run.floor++
    run.opened = 0
    run.shellUsed = 0
    run.energy = 10 + state.profile.upgrades.energy + relicCount(run, 'bateria') * 2
    log(run, `Andar ${run.floor}: energia renovada para ${run.energy}.`)
  }
}

function choose(state: GameState, id: string, random: () => number): void {
  const run = state.run!
  const pending = run.pending!
  if (id === 'pass') {
    log(run, 'Você recusou o efeito especial da caixa.')
    finishPending(run)
    return
  }
  switch (pending.kind) {
    case 'multiplicadora':
      addBoxes(run, 3 + relicCount(run, 'ninho'), pending.box.depth + 1, random)
      break
    case 'apostas': {
      const [, animal, stakeText] = id.split(':')
      const stake = Number(stakeText)
      run.coins -= stake
      breakContract(run)
      const winner = pick(ANIMALS, random)
      const won = winner.id === animal
      if (won) run.coins += stake * 3
      state.lastRace = {
        id: `race:${state.profile.runs + 1}:${run.floor}:${pending.box.id}`,
        winner: winner.id,
        selected: animal as AnimalId,
        stake,
        payout: won ? stake * 3 : 0,
      }
      log(run, `Sorteio: ${winner.name}. ${won ? `Acerto! Pagamento de ${stake * 3} moedas (inclui a aposta).` : `Você perdeu a aposta de ${stake} moedas.`}`)
      break
    }
    case 'mimica':
      if (id === 'fight') {
        damage(run, 1)
        addReward(run, 'rara')
        log(run, 'Mímica enfrentada: 1 de dano e uma recompensa rara.')
      } else {
        run.coins -= 3
        log(run, 'Você pagou 3 moedas para escapar da Mímica.')
      }
      break
    case 'mercador':
      if (id === 'buy-key') {
        run.coins -= 4
        run.keys++
        log(run, 'Compra: uma chave por 4 moedas.')
      } else if (id === 'buy-heal') {
        run.coins -= 5
        run.health = Math.min(run.maxHealth, run.health + 1)
        log(run, 'Compra: +1 de vida por 5 moedas.')
      } else {
        run.coins -= 4
        run.energy += 2
        log(run, 'Compra: +2 de energia por 4 moedas.')
      }
      break
    case 'forja': {
      const rewardRarity = id.split(':')[1] as Rarity
      takeRewards(run, rewardRarity)
      const upgraded = RARITIES[RARITIES.indexOf(rewardRarity) + 1]!
      addReward(run, upgraded)
      log(run, `Forja: três recompensas ${RARITY_LABELS[rewardRarity]} viraram uma ${RARITY_LABELS[upgraded]}.`)
      break
    }
    case 'sacrificio':
      run.health--
      addReward(run, 'epica')
      log(run, 'Sacrifício: 1 de vida por uma recompensa épica.')
      break
    case 'oraculo': {
      const selected = pending.offers!.find(box => `oracle:${box.id}` === id)!
      enqueue(run, selected, pending.box.depth + 1)
      log(run, 'O Oráculo guardou a caixa escolhida e descartou as outras duas.')
      break
    }
    case 'contrato':
      run.contract = { remaining: 3 }
      log(run, 'Contrato aceito: abra mais três caixas sem apostar.')
      break
    case 'reliquia': {
      const relicId = id.split(':')[1] as RelicId
      run.relics.push(relicId)
      if (relicId === 'bateria') run.energy += 2
      if (relicId === 'coracao') {
        run.maxHealth++
        run.health++
      }
      log(run, `Relíquia recebida: ${RELIC_LABELS[relicId]}. ${RELIC_DESCRIPTIONS[relicId]}`)
      break
    }
    case 'incubadora':
      run.incubators.push({ id: nextId(run, 'incubator'), age: 0 })
      log(run, 'Incubadora guardada; ela melhora nas próximas três aberturas.')
      break
    case 'cofre': {
      if (id === 'key') run.keys--
      const opened = id === 'key' || sample(random) < 0.5
      if (opened) {
        addReward(run, 'rara')
        addReward(run, 'rara')
      }
      log(run, opened ? 'Cofre aberto: duas recompensas raras.' : 'Arrombamento falhou: conteúdo especial perdido.')
      break
    }
    case 'seguro':
      run.insured = true
      log(run, 'Seguro ativo: uma derrota preserva 75% do saque.')
      break
    case 'maldicao':
      addReward(run, 'lendaria')
      run.curse++
      log(run, `Maldição aceita: recompensa lendária; próximas aberturas custam ${getOpeningCost(run)} de energia.`)
      break
    case 'portal':
      run.biome = id.split(':')[1]!
      log(run, `Portal atravessado: ${run.biome === 'ruinas' ? 'Ruínas' : run.biome === 'bosque' ? 'Bosque' : 'Bazar'}. O andar continua o mesmo.`)
      break
    case 'paradoxo':
      if (id === 'collect') {
        run.coins += pending.prize!
        log(run, `Paradoxo encerrado: +${pending.prize} moedas.`)
      } else {
        const child = makeBox(run, random, pending.box.depth + 1, 'paradoxo')
        const descents = pending.descents! + 1
        advanceOpening(run, child, state.profile)
        if (sample(random) < descents * 0.25) {
          log(run, `Paradoxo rompeu na camada ${child.depth}: prêmio especial perdido.`)
        } else {
          const prize = pending.prize! * 2
          run.pending = { ...pending, origin: pending.origin ?? pending.box, box: child, descents, prize }
          log(run, `Paradoxo resistiu: prêmio agora vale ${prize} moedas.`)
          return
        }
      }
      break
    case 'ladrao': {
      run.heat++
      run.coins += 8
      const chance = Math.min(0.75, run.heat * 0.25)
      if (sample(random) < chance) {
        const charge = Math.min(8, run.coins)
        run.coins -= charge
        damage(run, 1)
        log(run, `Guardião cobrou o roubo: -${charge} moedas e 1 de dano.`)
      } else {
        log(run, 'Roubo bem-sucedido: +8 moedas.')
      }
      break
    }
    case 'chefe':
      if (id === 'boss:health') damage(run, 2)
      else if (id === 'boss:coins') run.coins -= 10
      else run.inventory.splice(0, 3)
      winBoss(state)
      break
  }
  if (state.run?.pending) finishPending(state.run)
}

/** Applies one valid action to a copy. Invalid actions preserve both state and resources. */
export function transition(state: GameState, action: GameAction, random: () => number = Math.random): GameState {
  if (!isGameState(state) || !record(action)) return state
  if (action.type === 'dismiss-race') {
    if (!state.lastRace) return state
    const next = structuredClone(state)
    next.lastRace = null
    return next
  }
  if (state.lastRace) return state
  if (action.type === 'start') {
    if (state.run) return state
    const next = structuredClone(state)
    next.run = createRun(next.profile)
    next.result = null
    next.lastRace = null
    return next
  }
  if (action.type === 'upgrade') {
    if (state.run || !['vitality', 'energy', 'fortune'].includes(action.upgrade)) return state
    const level = state.profile.upgrades[action.upgrade]
    const cost = (level + 1) * 10
    if (level >= 3 || state.profile.essence < cost) return state
    const next = structuredClone(state)
    next.profile.essence -= cost
    next.profile.upgrades[action.upgrade]++
    return next
  }
  if (action.type === 'unlock') {
    if (state.run || !['casca', 'ninho'].includes(action.relic) || state.profile.essence < 15 || state.profile.unlockedRelics.includes(action.relic)) return state
    const next = structuredClone(state)
    next.profile.essence -= 15
    next.profile.unlockedRelics.push(action.relic)
    return next
  }
  const run = state.run
  if (!run) return state
  if (action.type === 'starter') {
    if (run.starterOpened || run.pending) return state
    const next = structuredClone(state)
    const nextRun = next.run!
    nextRun.starterOpened = true
    addBoxes(nextRun, 3, 1, random)
    log(nextRun, 'Caixa de entrada revelada: três caixas aleatórias, sem custo de energia nem contagem de abertura.')
    return next
  }
  if (action.type === 'retreat' && !run.pending) {
    const next = structuredClone(state)
    finish(next, 'retreat')
    return next
  }
  if (!run.starterOpened) return state
  if (action.type === 'choose') {
    if (!run.pending || !getChoices(state).some(choice => choice.id === action.choiceId && !choice.disabled)) return state
    const next = structuredClone(state)
    choose(next, action.choiceId, random)
    settle(next, random)
    return next
  }
  if (run.pending) return state
  if (action.type === 'collect') {
    const incubator = run.incubators.find(item => item.id === action.incubatorId)
    if (!incubator) return state
    const next = structuredClone(state)
    const nextRun = next.run!
    const rewardRarity = incubatorRarity(incubator)
    nextRun.incubators = nextRun.incubators.filter(item => item.id !== incubator.id)
    addReward(nextRun, rewardRarity)
    log(nextRun, `Incubadora coletada: uma recompensa ${RARITY_LABELS[rewardRarity].toLowerCase()}.`)
    return next
  }
  if (action.type === 'open') {
    const box = run.queue.find(item => item.id === action.boxId)
    if (!box || run.energy < getOpeningCost(run)) return state
    const next = structuredClone(state)
    const nextRun = next.run!
    const nextBox = nextRun.queue.find(item => item.id === box.id)!
    nextRun.queue = nextRun.queue.filter(item => item.id !== box.id)
    advanceOpening(nextRun, nextBox, next.profile)
    preparePending(next, nextBox, random)
    settle(next, random)
    return next
  }
  if (action.type === 'boss') {
    if (run.opened < 5 || run.energy < getOpeningCost(run)) return state
    const next = structuredClone(state)
    const nextRun = next.run!
    const box = makeBox(nextRun, random, 1, 'chefe')
    advanceOpening(nextRun, box, next.profile)
    preparePending(next, box, random)
    return next
  }
  return state
}
