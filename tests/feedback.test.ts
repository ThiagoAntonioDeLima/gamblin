import assert from 'node:assert/strict'
import test from 'node:test'
import { initialGameState, transition } from '../src/game/engine.ts'
import type { GameState, Run } from '../src/game/engine.ts'
import { getActionChanges } from '../src/game/feedback.ts'
import type { LootboxId } from '../src/game/lootboxes.ts'

const fixedRandom = () => 0

function active(type: LootboxId, patch: Partial<Run> = {}): GameState & { run: Run } {
  const started = transition(initialGameState(), { type: 'start' }, fixedRandom)
  const ready = transition(started, { type: 'starter' }, fixedRandom)
  assert.ok(ready.run)
  return {
    ...ready,
    run: { ...ready.run, queue: [{ id: 'fixture-box', type, rarity: 'comum', depth: 1 }], nextId: 40, ...patch },
  }
}

function open(state: GameState): GameState {
  assert.ok(state.run)
  return transition(state, { type: 'open', boxId: state.run.queue[0]!.id }, fixedRandom)
}

test('opening feedback reports the applied resource cost and reward without reporting the consumed box', () => {
  const before = active('multiplicadora')
  const action = { type: 'open', boxId: 'fixture-box' } as const
  const after = transition(before, action, fixedRandom)
  assert.deepEqual(getActionChanges(before, after, action), [
    { key: 'coins', amount: 2, label: 'moedas', tone: 'gain' },
    { key: 'energy', amount: -1, label: 'energia', tone: 'loss' },
    { key: 'reward:comum', amount: 1, label: 'recompensa comum', tone: 'gain' },
  ])
})

test('free presentation shows only its three granted boxes', () => {
  const before = transition(initialGameState(), { type: 'start' }, fixedRandom)
  const action = { type: 'starter' } as const
  const after = transition(before, action, fixedRandom)
  assert.deepEqual(getActionChanges(before, after, action), [
    { key: 'boxes', amount: 3, label: 'caixas', tone: 'gain' },
  ])
})

test('generated boxes are counted by new IDs even when an opening consumed a queued box', () => {
  const before = active('espelho')
  const action = { type: 'open', boxId: 'fixture-box' } as const
  const after = transition(before, action, fixedRandom)
  assert.equal(after.run!.queue.length - before.run.queue.length, 2)
  assert.deepEqual(getActionChanges(before, after, action).find(change => change.key === 'boxes'),
    { key: 'boxes', amount: 3, label: 'caixas', tone: 'gain' })
})

test('forge feedback includes consumed rewards as well as the upgraded reward', () => {
  const before = open(active('forja', {
    inventory: Array.from({ length: 3 }, (_, index) => ({ id: `fixture-reward-${index}`, rarity: 'comum' })),
  }))
  const action = { type: 'choose', choiceId: 'forge:comum' } as const
  const after = transition(before, action, fixedRandom)
  const rewards = getActionChanges(before, after, action).filter(change => change.key.startsWith('reward:'))
  assert.deepEqual(rewards, [
    { key: 'reward:comum', amount: -3, label: 'recompensas comuns', tone: 'loss' },
    { key: 'reward:rara', amount: 1, label: 'recompensa rara', tone: 'gain' },
  ])
})

test('feedback uses net changes for an intercepted theft and for a paid winning wager', () => {
  const thief = open(active('ladrao', { coins: 10 }))
  const steal = { type: 'choose', choiceId: 'steal' } as const
  const caught = transition(thief, steal, fixedRandom)
  assert.equal(getActionChanges(thief, caught, steal).some(change => change.key === 'coins'), false)
  assert.equal(getActionChanges(thief, caught, steal).find(change => change.key === 'health')?.amount, -1)

  const betting = open(active('apostas', { coins: 10 }))
  const bet = { type: 'choose', choiceId: 'bet:coruja:1' } as const
  const won = transition(betting, bet, fixedRandom)
  assert.equal(won.lastRace?.payout, 3)
  assert.deepEqual(getActionChanges(betting, won, bet).find(change => change.key === 'coins'),
    { key: 'coins', amount: 2, label: 'moedas', tone: 'gain' })
})

test('defeat feedback uses final resources rather than treating the missing run as zero resources', () => {
  const before = open(active('mimica', { health: 1, coins: 21 }))
  const action = { type: 'choose', choiceId: 'fight' } as const
  const after = transition(before, action, fixedRandom)
  assert.equal(after.run, null)
  assert.equal(after.result?.outcome, 'defeat')
  const changes = getActionChanges(before, after, action)
  assert.equal(changes.some(change => change.key === 'coins' || change.key === 'energy'), false)
  assert.deepEqual(changes.find(change => change.key === 'health'),
    { key: 'health', amount: -1, label: 'vida', tone: 'loss' })
  assert.equal(changes.find(change => change.key === 'reward:rara')?.amount, 1)
})

test('insurance, curses and relic effects preserve the meaning of their real deltas', () => {
  const uninsured = open(active('seguro'))
  const insure = { type: 'choose', choiceId: 'insure' } as const
  const insured = transition(uninsured, insure, fixedRandom)
  assert.deepEqual(getActionChanges(uninsured, insured, insure).find(change => change.key === 'protection'),
    { key: 'protection', amount: 50, label: 'proteção', tone: 'gain', suffix: '%' })

  const clean = open(active('maldicao'))
  const curse = { type: 'choose', choiceId: 'curse' } as const
  const cursed = transition(clean, curse, fixedRandom)
  assert.deepEqual(getActionChanges(clean, cursed, curse).find(change => change.key === 'curse'),
    { key: 'curse', amount: 1, label: 'maldição', tone: 'loss' })

  const relic = open(active('reliquia'))
  const takeHeart = { type: 'choose', choiceId: 'relic:coracao' } as const
  const heart = transition(relic, takeHeart, fixedRandom)
  const changes = getActionChanges(relic, heart, takeHeart)
  assert.equal(changes.find(change => change.key === 'maxHealth')?.amount, 1)
  assert.equal(changes.find(change => change.key === 'relic:coracao')?.label, 'relíquia Coração')
})

test('invalid actions, unchanged resources and unrelated actions produce no feedback', () => {
  const source = active('portal', {
    queue: [
      { id: 'fixture-box', type: 'portal', rarity: 'comum', depth: 1 },
      { id: 'fixture-other', type: 'multiplicadora', rarity: 'comum', depth: 1 },
    ],
  })
  const invalid = { type: 'open', boxId: 'missing' } as const
  assert.deepEqual(getActionChanges(source, transition(source, invalid), invalid), [])
  const before = open(source)
  const pass = { type: 'choose', choiceId: 'pass' } as const
  const after = transition(before, pass, fixedRandom)
  assert.notEqual(before, after)
  assert.deepEqual(getActionChanges(before, after, pass), [])
  assert.deepEqual(getActionChanges(after, transition(after, { type: 'retreat' }), { type: 'retreat' }), [])
})
