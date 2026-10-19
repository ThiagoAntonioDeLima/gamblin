import { RARITY_LABELS, RELIC_LABELS, snapshotRunResources } from './engine.ts'
import type { GameAction, GameState, Rarity, RelicId } from './engine.ts'

export interface ResourceChange {
  key: string
  amount: number
  label: string
  tone: 'gain' | 'loss'
  suffix?: string
}

export interface FeedbackEvent {
  id: string
  changes: ResourceChange[]
}

const FEEDBACK_ACTIONS = new Set<GameAction['type']>(['starter', 'open', 'boss', 'choose', 'collect'])
const RARITIES: Rarity[] = ['comum', 'rara', 'epica', 'lendaria']
const RELICS: RelicId[] = ['ima', 'bateria', 'coracao', 'casca', 'ninho']

/** Describes already applied effects. Never samples randomness or changes game state. */
export function getActionChanges(before: GameState, after: GameState, action: GameAction): ResourceChange[] {
  if (before === after || !before.run || !FEEDBACK_ACTIONS.has(action.type)) return []
  const previous = snapshotRunResources(before.run)
  const next = after.run ? snapshotRunResources(after.run) :
    after.result !== before.result ? after.result?.finalResources : undefined
  // Older results have no final snapshot; an absent run must not look like losing every resource.
  if (!next) return []

  const changes: ResourceChange[] = []
  const add = (key: string, amount: number, singular: string, plural = singular, tone?: ResourceChange['tone'], suffix?: string) => {
    if (!amount) return
    changes.push({
      key, amount, label: Math.abs(amount) === 1 ? singular : plural,
      tone: tone ?? (amount > 0 ? 'gain' : 'loss'),
      ...(suffix ? { suffix } : {}),
    })
  }

  add('coins', next.coins - previous.coins, 'moeda', 'moedas')
  add('energy', next.energy - previous.energy, 'energia')
  add('health', next.health - previous.health, 'vida')
  add('maxHealth', next.maxHealth - previous.maxHealth, 'vida máxima')
  add('keys', next.keys - previous.keys, 'chave', 'chaves')

  for (const rarity of RARITIES) {
    const label = RARITY_LABELS[rarity].toLocaleLowerCase('pt-BR')
    const plural = rarity === 'comum' ? 'comuns' : `${label}s`
    add(`reward:${rarity}`, next.inventory[rarity] - previous.inventory[rarity], `recompensa ${label}`, `recompensas ${plural}`)
  }
  for (const relic of RELICS) {
    add(`relic:${relic}`, (next.relics[relic] ?? 0) - (previous.relics[relic] ?? 0),
      `relíquia ${RELIC_LABELS[relic]}`, `relíquias ${RELIC_LABELS[relic]}`)
  }

  // Opening consumes its source box. Show newly granted boxes, rather than the queue's net size.
  const previousBoxes = new Set(previous.boxes)
  add('boxes', next.boxes.filter(id => !previousBoxes.has(id)).length, 'caixa', 'caixas')
  add('incubators', next.incubators - previous.incubators, 'incubadora', 'incubadoras')
  add('protection', (Number(next.insured) - Number(previous.insured)) * 50, 'proteção', 'proteção', undefined, '%')
  add('curse', next.curse - previous.curse, 'maldição', 'maldições', next.curse > previous.curse ? 'loss' : 'gain')

  return changes
}
