import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialGameState,
  isGameState,
  snapshotRunResources,
  transition,
} from '../src/game/engine.ts'
import type { Box, GameState, Run, RunEndReason } from '../src/game/engine.ts'
import type { LootboxId } from '../src/game/lootboxes.ts'
import { loadProgress, saveProgress } from '../src/lib/storage.ts'
import type { StoragePort } from '../src/lib/storage.ts'

const fixedRandom = () => 0

function box(type: LootboxId, id = `result-fixture-${type}`): Box {
  return { id, type, rarity: 'comum', depth: 1 }
}

function active(patch: Partial<Run> = {}): GameState & { run: Run } {
  const started = transition(initialGameState(), { type: 'start' }, fixedRandom)
  const ready = transition(started, { type: 'starter' }, fixedRandom)
  assert.ok(ready.run)
  return { ...ready, run: {
    ...ready.run, ...patch,
    totalOpened: patch.totalOpened ?? (patch.opened ?? 0) + ((patch.floor ?? 1) - 1) * 6,
  } }
}

function open(state: GameState): GameState {
  assert.ok(state.run?.queue[0])
  return transition(state, { type: 'open', boxId: state.run.queue[0].id }, fixedRandom)
}

function choose(state: GameState, choiceId: string, random = fixedRandom): GameState {
  return transition(state, { type: 'choose', choiceId }, random)
}

function memoryStorage(): StoragePort {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value) },
  }
}

test('the free entry counts zero while paid openings and bosses accumulate across all floors', () => {
  let state: GameState = transition(initialGameState(), { type: 'start' }, fixedRandom)
  assert.equal(state.run?.totalOpened, 0)
  state = transition(state, { type: 'starter' }, fixedRandom)
  assert.equal(state.run?.totalOpened, 0)

  for (let floor = 1; floor <= 3; floor++) {
    assert.ok(state.run)
    state.run.coins += 100
    for (let index = 0; index < 5; index++) state = choose(open(state), 'pass')
    assert.equal(state.run?.opened, 5)
    assert.equal(state.run?.totalOpened, (floor - 1) * 6 + 5)
    state = transition(state, { type: 'boss' }, fixedRandom)
    assert.equal(state.run?.totalOpened, floor * 6)
    state = choose(state, 'boss:coins')
    assert.equal(isGameState(state), true)
    if (floor < 3) {
      assert.equal(state.run?.opened, 0)
      assert.equal(state.run?.totalOpened, floor * 6)
    }
  }

  assert.equal(state.result?.totalOpened, 18)
  assert.equal(state.result?.reason, 'final-boss')
  assert.equal(state.result?.outcome, 'victory')
  assert.equal(state.result?.closed, false)
  assert.equal(state.result?.id, 'result:1')
})

test('internal Paradox layers count once each and invalid repeat actions add no openings', () => {
  let state = open(active({ queue: [box('paradoxo')] }))
  assert.equal(state.run?.totalOpened, 1)
  for (let layer = 2; layer <= 4; layer++) {
    state = choose(state, 'descend', () => 0.99)
    assert.equal(state.run?.totalOpened, layer)
    assert.equal(state.run?.opened, layer)
  }
  assert.equal(choose(state, 'descend', () => { assert.fail('invalid actions must not draw') }), state)
  state = choose(state, 'collect')
  state = transition(state, { type: 'retreat' })
  assert.equal(state.result?.totalOpened, 4)
})

test('fatal Mímica, Guardião and boss damage record their actual source, including the Espelho', () => {
  const scenarios: { type: LootboxId; choice: string; reason: RunEndReason; patch?: Partial<Run> }[] = [
    { type: 'mimica', choice: 'fight', reason: 'mimic' },
    { type: 'ladrao', choice: 'steal', reason: 'thief' },
    { type: 'espelho', choice: 'fight', reason: 'mimic', patch: { lastBox: box('mimica', 'previous-mimic') } },
  ]
  for (const scenario of scenarios) {
    const state = choose(open(active({ health: 1, queue: [box(scenario.type)], ...scenario.patch })), scenario.choice)
    assert.equal(state.result?.outcome, 'defeat')
    assert.equal(state.result?.reason, scenario.reason)
    assert.equal(state.result?.finalResources?.health, 0)
    assert.equal(isGameState(state), true)
  }

  const boss = transition(active({ health: 1, energy: 1, opened: 5 }), { type: 'boss' }, fixedRandom)
  const defeated = choose(boss, 'boss:health')
  assert.equal(defeated.result?.outcome, 'defeat')
  assert.equal(defeated.result?.reason, 'boss')
  assert.equal(defeated.result?.finalResources?.energy, 0)
})

test('voluntary and energy withdrawals have distinct reasons and an accepted curse is not a defeat', () => {
  const voluntary = transition(active(), { type: 'retreat' })
  assert.equal(voluntary.result?.reason, 'manual-retreat')
  assert.equal(voluntary.result?.totalOpened, 0)

  const exhausted = choose(open(active({ energy: 1, queue: [box('mimica')] })), 'pass')
  assert.equal(exhausted.result?.outcome, 'retreat')
  assert.equal(exhausted.result?.reason, 'insufficient-energy')
  assert.equal(exhausted.result?.finalResources?.energy, 0)

  const cursed = choose(open(active({ energy: 2, queue: [box('maldicao')] })), 'curse')
  assert.equal(cursed.result?.outcome, 'retreat')
  assert.equal(cursed.result?.reason, 'insufficient-energy')
  assert.equal(cursed.result?.finalResources?.energy, 1)
  assert.equal(cursed.result?.finalResources?.curse, 1)
})

test('final resource snapshots include the terminal contract penalty and do not share mutable collections', () => {
  const source = active({
    coins: 10,
    keys: 2,
    contract: { remaining: 2 },
    relics: ['ima', 'ima', 'bateria'],
    inventory: [{ id: 'snapshot-common', rarity: 'comum' }, { id: 'snapshot-rare', rarity: 'rara' }],
    incubators: [{ id: 'snapshot-incubator', age: 2 }],
  })
  const resources = snapshotRunResources(source.run)
  assert.deepEqual(resources.inventory, { comum: 1, rara: 1, epica: 0, lendaria: 0 })
  assert.deepEqual(resources.relics, { ima: 2, bateria: 1 })
  const completed = transition(source, { type: 'retreat' })
  assert.equal(completed.result?.finalResources?.coins, 7)
  assert.equal(source.run.coins, 10)
  assert.deepEqual(completed.result?.finalResources?.boxes, source.run.queue.map(item => item.id))
  resources.boxes.push('detached')
  resources.inventory.comum = 200
  assert.equal(source.run.queue.some(item => item.id === 'detached'), false)
  assert.equal(source.run.inventory.length, 2)
  assert.equal(isGameState(completed), true)
})

test('acknowledging a result is persisted, guarded by its ID and never banks the loot a second time', () => {
  const completed = transition(active({ coins: 40 }), { type: 'retreat' })
  assert.ok(completed.result?.id)
  assert.equal(transition(completed, { type: 'dismiss-result', resultId: 'result:other' }), completed)
  const storage = memoryStorage()
  assert.equal(saveProgress(completed, storage), true)
  const restored = loadProgress(isGameState, storage)
  assert.ok(restored?.result?.id)
  assert.equal(restored.result.closed, false)
  const acknowledged = transition(restored, { type: 'dismiss-result', resultId: restored.result.id }, () => {
    assert.fail('acknowledging a result never consumes randomness')
  })
  assert.equal(acknowledged.result?.closed, true)
  assert.deepEqual(acknowledged.profile, completed.profile)
  assert.deepEqual(acknowledged.result, { ...completed.result, closed: true })
  assert.equal(transition(acknowledged, { type: 'dismiss-result', resultId: restored.result.id }), acknowledged)
  assert.equal(saveProgress(acknowledged, storage), true)
  assert.deepEqual(loadProgress(isGameState, storage), acknowledged)

  const nextRun = transition(acknowledged, { type: 'start' }, fixedRandom)
  assert.equal(nextRun.result, null)
  const nextResult = transition(nextRun, { type: 'retreat' })
  assert.equal(nextResult.result?.id, 'result:2')
})

test('a final-energy wager must finish its persisted race before its result can be acknowledged', () => {
  const opened = open(active({ energy: 1, coins: 20, queue: [box('apostas')] }))
  const completed = choose(opened, 'bet:coruja:5')
  assert.ok(completed.result?.id)
  assert.ok(completed.lastRace)
  assert.equal(completed.result.closed, false)
  const closeResult = { type: 'dismiss-result' as const, resultId: completed.result.id }
  assert.equal(transition(completed, closeResult), completed)
  const raceClosed = transition(completed, { type: 'dismiss-race' })
  assert.deepEqual(raceClosed.profile, completed.profile)
  assert.deepEqual(raceClosed.result, completed.result)
  const resultClosed = transition(raceClosed, closeResult)
  assert.equal(resultClosed.result?.closed, true)
  assert.deepEqual(resultClosed.profile, completed.profile)
})

test('older runs remain usable without inventing a total from their per-floor opening count', () => {
  const legacy = active({ floor: 2, opened: 7 })
  delete legacy.run.totalOpened
  assert.equal(isGameState(legacy), true)
  const updated = choose(open(legacy), 'pass')
  assert.equal(updated.run?.opened, 8)
  assert.equal(updated.run?.totalOpened, undefined)
  const completed = transition(updated, { type: 'retreat' })
  assert.equal(completed.result?.totalOpened, undefined)
  assert.equal(isGameState(completed), true)

  const oldResult = structuredClone(completed)
  assert.ok(oldResult.result)
  delete oldResult.result.id
  delete oldResult.result.closed
  delete oldResult.result.reason
  delete oldResult.result.finalResources
  assert.equal(isGameState(oldResult), true)
  const storage = memoryStorage()
  saveProgress(oldResult, storage)
  assert.deepEqual(loadProgress(isGameState, storage), oldResult)
})

test('malformed new statistics are rejected without invalidating results that omit them', () => {
  const completed = transition(active(), { type: 'retreat' })
  assert.ok(completed.result?.finalResources)
  const result = completed.result
  const resources = result.finalResources!
  for (const patch of [
    { totalOpened: -1 }, { totalOpened: 1.5 }, { closed: 'false' }, { id: '' }, { reason: 'unknown' },
    { reason: 'mimic' }, { reason: 'final-boss' },
    { finalResources: { ...resources, health: resources.maxHealth + 1 } },
    { finalResources: { ...resources, energy: -1 } },
    { finalResources: { ...resources, boxes: ['repeated', 'repeated'] } },
    { finalResources: { ...resources, inventory: { ...resources.inventory, rara: -1 } } },
    { finalResources: { ...resources, relics: { unknown: 1 } } },
  ]) assert.equal(isGameState({ ...completed, result: { ...result, ...patch } }), false)
  const source = active()
  assert.equal(isGameState({ ...source, run: { ...source.run, totalOpened: -1 } }), false)
  assert.equal(isGameState({ ...source, run: { ...source.run, totalOpened: 0.5 } }), false)
  assert.equal(isGameState({ ...source, run: { ...source.run, opened: 5, totalOpened: 4 } }), false)
  assert.equal(isGameState({ ...source, run: { ...source.run, floor: 2, totalOpened: 5 } }), false)
  assert.equal(isGameState({ ...completed, result: { ...result, floor: 2, totalOpened: 5 } }), false)
})
