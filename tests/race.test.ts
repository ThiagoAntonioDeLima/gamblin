import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ANIMALS,
  getChoices,
  initialGameState,
  isGameState,
  transition,
} from '../src/game/engine.ts'
import type { GameAction, GameState, RaceResult } from '../src/game/engine.ts'
import { loadProgress, saveProgress } from '../src/lib/storage.ts'
import type { StoragePort } from '../src/lib/storage.ts'

function openedRace(energy = 10): GameState {
  let state = transition(initialGameState(), { type: 'start' }, () => 0)
  state = transition(state, { type: 'starter' }, () => 0)
  assert.ok(state.run)
  state.run.energy = energy
  state.run.coins = 20
  state.run.queue = [
    { id: 'race-fixture', type: 'apostas', rarity: 'comum', depth: 1 },
    { id: 'next-race-fixture', type: 'apostas', rarity: 'comum', depth: 1 },
  ]
  return transition(state, { type: 'open', boxId: 'race-fixture' }, () => 0)
}

function memoryStorage(): StoragePort {
  const data = new Map<string, string>()
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value) },
  }
}

test('the persisted race uses the same single draw and payout as the wager', () => {
  for (const [index, animal] of ANIMALS.entries()) {
    for (const position of [0, 0.999999]) {
      const opened = openedRace()
      assert.ok(opened.run)
      const before = opened.run.coins
      let draws = 0
      const resolved = transition(opened, { type: 'choose', choiceId: 'bet:coruja:5' }, () => {
        draws++
        return (index + position) / ANIMALS.length
      })
      const payout = animal.id === 'coruja' ? 15 : 0

      assert.equal(draws, 1, 'visual metadata must not add another random draw')
      assert.deepEqual(resolved.lastRace, {
        id: 'race:1:1:race-fixture',
        winner: animal.id,
        selected: 'coruja',
        stake: 5,
        payout,
      })
      assert.equal(resolved.run?.coins, before - 5 + payout)
      assert.equal(resolved.run?.pending, null)
      assert.equal(isGameState(resolved), true)
      assert.equal(opened.lastRace, null, 'the source state must remain unchanged')
    }
  }
})

test('a race survives automatic retreat after the final energy point', () => {
  const opened = openedRace(1)
  assert.equal(opened.run?.energy, 0)

  const resolved = transition(opened, { type: 'choose', choiceId: 'bet:raposa:5' }, () => 0.3)

  assert.equal(resolved.run, null)
  assert.equal(resolved.result?.outcome, 'retreat')
  assert.equal(resolved.result?.kept, 34, 'the one payout is included in the banked loot')
  assert.equal(resolved.lastRace?.winner, 'raposa')
  assert.equal(resolved.lastRace?.payout, 15)
  assert.equal(isGameState(resolved), true)
})

test('duplicate actions and reloads cannot reroll a race or pay it twice', () => {
  const resolved = transition(openedRace(), { type: 'choose', choiceId: 'bet:coruja:5' }, () => 0)
  assert.ok(resolved.lastRace)
  assert.deepEqual(getChoices(resolved), [])
  const storage = memoryStorage()
  assert.equal(saveProgress(resolved, storage), true)
  const restored = loadProgress(isGameState, storage)
  assert.ok(restored)
  assert.deepEqual(restored, resolved)

  const forbidden: GameAction[] = [
    { type: 'choose', choiceId: 'bet:coruja:5' },
    { type: 'open', boxId: 'next-race-fixture' },
    { type: 'start' },
    { type: 'retreat' },
    { type: 'starter' },
    { type: 'boss' },
    { type: 'collect', incubatorId: 'fixture' },
    { type: 'upgrade', upgrade: 'vitality' },
    { type: 'unlock', relic: 'casca' },
  ]
  for (const action of forbidden) {
    assert.equal(transition(restored, action, () => {
      assert.fail('a resolved race must never be drawn again')
    }), restored)
  }

  const acknowledged = transition(restored, { type: 'dismiss-race' })
  assert.equal(acknowledged.lastRace, null)
  assert.equal(acknowledged.run?.coins, resolved.run?.coins)
  assert.deepEqual(acknowledged.profile, resolved.profile)
  assert.equal(transition(acknowledged, { type: 'choose', choiceId: 'bet:coruja:5' }), acknowledged)
})

test('dismissing a race after the run ends only clears the event, including after reload', () => {
  const resolved = transition(openedRace(1), { type: 'choose', choiceId: 'bet:sapo:10' }, () => 0.9)
  const storage = memoryStorage()
  assert.equal(saveProgress(resolved, storage), true)
  const restored = loadProgress(isGameState, storage)
  assert.ok(restored)
  assert.equal(restored.run, null)

  const acknowledged = transition(restored, { type: 'dismiss-race' })

  assert.equal(acknowledged.lastRace, null)
  assert.equal(acknowledged.run, null)
  assert.deepEqual(acknowledged.profile, restored.profile)
  assert.deepEqual(acknowledged.result, restored.result)
  assert.equal(transition(acknowledged, { type: 'dismiss-race' }), acknowledged)
  const restarted = transition(acknowledged, { type: 'start' })
  assert.equal(restarted.lastRace, null)
  assert.ok(restarted.run)
})

test('successive wager events have distinct IDs without consuming randomness for their IDs', () => {
  let state = transition(openedRace(), { type: 'choose', choiceId: 'bet:coruja:1' }, () => 0)
  const firstId = state.lastRace?.id
  state = transition(state, { type: 'dismiss-race' })
  state = transition(state, { type: 'open', boxId: 'next-race-fixture' })
  state = transition(state, { type: 'choose', choiceId: 'bet:coruja:1' }, () => 0)
  assert.notEqual(state.lastRace?.id, firstId)
  assert.equal(state.lastRace?.id, 'race:1:1:next-race-fixture')
})

test('legacy saves remain valid while malformed race results are rejected', () => {
  const legacy = initialGameState()
  delete legacy.lastRace
  assert.equal(isGameState(legacy), true)
  const storage = memoryStorage()
  assert.equal(saveProgress(legacy, storage), true)
  assert.deepEqual(loadProgress(isGameState, storage), legacy)

  const race: RaceResult = {
    id: 'race:1:1:fixture', winner: 'coruja', selected: 'coruja', stake: 5, payout: 15,
  }
  const source = initialGameState()
  assert.equal(isGameState({ ...source, lastRace: race }), true)
  const invalid: unknown[] = [
    false, 'race', [], {},
    { ...race, id: '' },
    { ...race, winner: 'tigre' },
    { ...race, selected: 'tigre' },
    { ...race, stake: 2, payout: 6 },
    { ...race, stake: '5' },
    { ...race, stake: -1, payout: -3 },
    { ...race, payout: 10 },
    { ...race, winner: 'raposa', payout: 15 },
    { ...race, selected: 'sapo', payout: 15 },
  ]
  for (const lastRace of invalid) {
    assert.equal(isGameState({ ...source, lastRace }), false)
  }
})
