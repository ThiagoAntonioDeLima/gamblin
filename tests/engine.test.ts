import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getChoices,
  getOpeningCost,
  initialGameState,
  isGameState,
  transition,
} from '../src/game/engine.ts'
import type { Box, GameState, Run } from '../src/game/engine.ts'
import { lootboxes } from '../src/game/lootboxes.ts'
import type { LootboxId } from '../src/game/lootboxes.ts'
import { loadProgress, saveProgress } from '../src/lib/storage.ts'
import type { StoragePort } from '../src/lib/storage.ts'

const fixedRandom = () => 0

function box(type: LootboxId, depth = 1, id = `fixture-${type}`): Box {
  return { id, type, depth, rarity: 'comum' }
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

function runOf(state: GameState): Run {
  assert.ok(state.run, 'expected an active expedition')
  return state.run
}

function open(state: GameState, random = fixedRandom): GameState {
  const next = runOf(state).queue[0]
  assert.ok(next, 'expected a queued box')
  return transition(state, { type: 'open', boxId: next.id }, random)
}

function choose(state: GameState, choiceId: string, random = fixedRandom): GameState {
  return transition(state, { type: 'choose', choiceId }, random)
}

function assertHealthy(state: GameState): void {
  assert.equal(isGameState(state), true, 'transition must produce a persistable game state')
  if (state.run) {
    assert.ok(state.run.health >= 0 && state.run.health <= state.run.maxHealth)
    assert.ok(state.run.energy >= 0)
    assert.ok(state.run.coins >= 0)
    assert.ok(state.run.queue.length <= 12)
    assert.ok(state.run.queue.every(item => item.depth >= 1 && item.depth <= 4))
  }
}

function freeze(value: unknown): void {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return
  for (const child of Object.values(value)) freeze(child)
  Object.freeze(value)
}

test('starting an expedition preserves the previous state', () => {
  const original = initialGameState()
  const snapshot = structuredClone(original)
  freeze(original)

  const next = transition(original, { type: 'start' }, fixedRandom)

  assert.deepEqual(original, snapshot)
  assert.ok(next.run)
  assert.equal(next.result, null)
  assertHealthy(next)
})

test('the decorated entry box reveals three first-layer boxes without changing resources or opening count', () => {
  const started = transition(initialGameState(), { type: 'start' }, fixedRandom)
  const before = runOf(started)
  assert.equal(before.starterOpened, false)
  assert.deepEqual(before.queue, [])

  const revealed = transition(started, { type: 'starter' }, fixedRandom)
  const after = runOf(revealed)
  assert.equal(after.starterOpened, true)
  assert.equal(after.queue.length, 3)
  assert.ok(after.queue.every(item => item.depth === 1 && item.type !== 'chefe'))
  assert.equal(after.energy, before.energy)
  assert.equal(after.health, before.health)
  assert.equal(after.coins, before.coins)
  assert.equal(after.opened, before.opened)
  assert.deepEqual(after.inventory, before.inventory)
  assert.deepEqual(transition(revealed, { type: 'starter' }, fixedRandom), revealed)
  assertHealthy(revealed)
})

test('opening and resolving a choice do not mutate their source states', () => {
  const source = active({ queue: [box('apostas')], coins: 10 })
  const original = structuredClone(source)
  freeze(source)
  const opened = open(source)

  assert.deepEqual(source, original)
  const openedSnapshot = structuredClone(opened)
  freeze(opened)
  const resolved = choose(opened, 'bet:coruja:1')

  assert.deepEqual(opened, openedSnapshot)
  assertHealthy(resolved)
})

test('the boss is blocked before five openings and available after the fifth', () => {
  const source = active({ opened: 4 })
  const denied = transition(source, { type: 'boss' }, fixedRandom)

  assert.equal(runOf(denied).pending, null)
  assert.equal(runOf(denied).energy, source.run.energy)
  assert.equal(runOf(denied).opened, 4)

  const eligible = active({ opened: 5 })
  const boss = transition(eligible, { type: 'boss' }, fixedRandom)
  assert.equal(runOf(boss).pending?.kind, 'chefe')
  assert.equal(runOf(boss).energy, eligible.run.energy - getOpeningCost(eligible.run))
  assertHealthy(boss)
})

test('defeating three bosses ends in victory instead of creating a fourth floor', () => {
  let state: GameState = active({ coins: 100 })

  for (let floor = 1; floor <= 3; floor += 1) {
    const run = runOf(state)
    state = { ...state, run: { ...run, opened: 5, totalOpened: (run.totalOpened ?? 0) + 5 - run.opened } }
    state = transition(state, { type: 'boss' }, fixedRandom)
    assert.equal(runOf(state).pending?.kind, 'chefe')
    state = choose(state, 'boss:coins')
    assertHealthy(state)

    if (floor < 3) {
      assert.equal(runOf(state).floor, floor + 1)
      assert.equal(runOf(state).opened, 0)
    }
  }

  assert.equal(state.run, null)
  assert.equal(state.result?.outcome, 'victory')
  assert.equal(state.result?.floor, 3)
  assert.equal(state.result?.kept, state.result?.loot)
  assert.equal(state.profile.wins, 1)
})

test('fatal damage takes priority over automatic retreat when the same action exhausts energy', () => {
  const source = active({ opened: 5, energy: 1, health: 1, relics: [] })
  const boss = transition(source, { type: 'boss' }, fixedRandom)

  assert.equal(runOf(boss).energy, 0)
  assert.equal(boss.result, null, 'the player must resolve the pending choice first')

  const defeated = choose(boss, 'boss:health')
  assert.equal(defeated.run, null)
  assert.equal(defeated.result?.outcome, 'defeat')
  assert.equal(defeated.result?.kept, Math.floor(defeated.result!.loot * 0.25))
  assertHealthy(defeated)
})

test('the final energy point still allows resolving a box before automatic retreat', () => {
  const opened = open(active({ queue: [box('apostas')], energy: 1, coins: 10 }))
  assert.equal(runOf(opened).energy, 0)
  assert.equal(runOf(opened).pending?.kind, 'apostas')
  assert.equal(opened.result, null)

  const finished = choose(opened, 'pass')
  assert.equal(finished.run, null)
  assert.equal(finished.result?.outcome, 'retreat')
  assert.equal(finished.result?.kept, finished.result?.loot)
  assertHealthy(finished)
})

test('each animal occupies one quarter of the draw and wins a total payout of three stakes', () => {
  const animals = ['coruja', 'raposa', 'lobo', 'sapo']

  animals.forEach((animal, index) => {
    const opened = open(active({ queue: [box('apostas')], coins: 30 }))
    const before = runOf(opened).coins
    const won = choose(opened, `bet:${animal}:5`, () => (index + 0.5) / 4)

    assert.equal(runOf(won).coins, before - 5 + 15)
    assert.equal(runOf(won).pending, null)
    assertHealthy(won)
  })
})

test('a losing wager loses only the stake and an unaffordable wager cannot be forced', () => {
  const opened = open(active({ queue: [box('apostas')], coins: 10 }))
  const lost = choose(opened, 'bet:coruja:5', () => 0.4)
  assert.equal(runOf(lost).coins, runOf(opened).coins - 5)

  const poor = open(active({ queue: [box('apostas')], coins: 0 }))
  assert.equal(getChoices(poor).find(choice => choice.id === 'bet:coruja:5')?.disabled, true)
  const denied = choose(poor, 'bet:coruja:5')
  assert.equal(runOf(denied).coins, runOf(poor).coins)
  assert.deepEqual(runOf(denied).pending, runOf(poor).pending)
  assertHealthy(denied)
})

test('a wager on the third contract box breaks the contract before paying its prize', () => {
  for (const initialCoins of [0, 10]) {
    const source = active({
      queue: [box('apostas')],
      opened: 2,
      coins: initialCoins,
      contract: { remaining: 1 },
    })
    const opened = open(source)
    const beforeWager = runOf(opened)

    assert.equal(beforeWager.opened, 3)
    assert.deepEqual(beforeWager.contract, { remaining: 0 })
    assert.equal(beforeWager.coins, initialCoins + 2, 'opening must not pay the contract before the decision')
    assertHealthy(opened)

    const resolved = choose(opened, 'bet:coruja:1')
    const penalty = Math.min(3, beforeWager.coins - 1)
    assert.equal(runOf(resolved).coins, beforeWager.coins - 1 - penalty + 3)
    assert.equal(runOf(resolved).contract, null)
    assertHealthy(resolved)
  }
})

test('passing on the third contract box pays the contract only after the choice is resolved', () => {
  const opened = open(active({
    queue: [box('apostas')],
    opened: 2,
    coins: 0,
    contract: { remaining: 1 },
  }))

  assert.equal(runOf(opened).coins, 2)
  assert.equal(runOf(opened).pending?.kind, 'apostas')
  assert.deepEqual(runOf(opened).contract, { remaining: 0 })

  const resolved = choose(opened, 'pass')
  assert.equal(runOf(resolved).coins, 12)
  assert.equal(runOf(resolved).pending, null)
  assert.equal(runOf(resolved).contract, null)
  assertHealthy(resolved)
})

test('the sacrifice life payment bypasses Casca and leaves its damage protection available', () => {
  const opened = open(active({
    queue: [box('sacrificio')],
    health: 5,
    relics: ['casca'],
    shellUsed: 0,
  }))
  const paid = choose(opened, 'sacrifice')

  assert.equal(runOf(paid).health, 4)
  assert.equal(runOf(paid).shellUsed, 0)
  assert.ok(runOf(paid).inventory.some(reward => reward.rarity === 'epica'))
  assertHealthy(paid)

  const withMimic = { ...paid, run: { ...runOf(paid), queue: [box('mimica')] } }
  const protectedState = choose(open(withMimic), 'fight')
  assert.equal(runOf(protectedState).health, 4)
  assert.equal(runOf(protectedState).shellUsed, 1)
  assertHealthy(protectedState)
})

test('nested boxes stop at the fourth layer and convert deeper boxes into coins', () => {
  const source = active({ queue: [box('multiplicadora', 4)], coins: 0 })
  const opened = choose(open(source), 'multiply')

  assert.equal(runOf(opened).coins, 2 + 3 * 2)
  assertHealthy(opened)
})

test('multiplication respects the twelve-box queue and pays for overflow', () => {
  const queue = [
    box('multiplicadora'),
    ...Array.from({ length: 11 }, (_, index) => box('seguro', 1, `existing-${index}`)),
  ]
  const opened = choose(open(active({ queue, coins: 0 })), 'multiply')

  assert.equal(runOf(opened).queue.length, 12)
  assert.equal(runOf(opened).coins, 2 + 2 * 2)
  assertHealthy(opened)
})

test('consecutive mirrors repeat a normal target without recursively copying a mirror', () => {
  let state: GameState = active({
    lastBox: box('multiplicadora', 1, 'previous-normal'),
    queue: [box('espelho', 1, 'mirror-one'), box('espelho', 1, 'mirror-two')],
  })

  state = transition(state, { type: 'open', boxId: 'mirror-one' }, fixedRandom)
  state = choose(state, 'multiply')
  assert.equal(runOf(state).lastBox?.type, 'multiplicadora')
  assertHealthy(state)
  state = transition(state, { type: 'open', boxId: 'mirror-two' }, fixedRandom)
  state = choose(state, 'multiply')
  assert.equal(runOf(state).lastBox?.type, 'multiplicadora')
  assertHealthy(state)

  const withoutTarget = open(active({ queue: [box('espelho')], lastBox: null }))
  assert.equal(runOf(withoutTarget).pending, null)
  assertHealthy(withoutTarget)
})

test('a forged unaffordable opening preserves resources instead of producing negative energy', () => {
  const source = active({ queue: [box('apostas')], energy: 2, curse: 2, coins: 0 })
  assert.equal(getOpeningCost(source.run), 3)

  const denied = open(source)
  assert.deepEqual(denied, source)
  assertHealthy(denied)
})

test('accepting a curse causes automatic retreat if the next opening is now unaffordable', () => {
  const opened = open(active({ queue: [box('maldicao')], energy: 2 }))
  assert.equal(runOf(opened).energy, 1)

  const finished = choose(opened, 'curse')
  assert.equal(finished.run, null)
  assert.equal(finished.result?.outcome, 'retreat')
  assertHealthy(finished)
})

test('the paradox cannot descend beyond layer four and can collect after consuming the final energy', () => {
  let state = open(active({ queue: [box('paradoxo')], energy: 4 }))

  for (let depth = 2; depth <= 4; depth += 1) {
    state = choose(state, 'descend', () => 0.99)
    assert.equal(runOf(state).pending?.box.depth, depth)
    assertHealthy(state)
  }

  assert.equal(runOf(state).energy, 0)
  assert.equal(getChoices(state).find(choice => choice.id === 'descend')?.disabled, true)
  assert.deepEqual(choose(state, 'descend', () => 0.99), state)

  const finished = choose(state, 'collect')
  assert.equal(finished.run, null)
  assert.equal(finished.result?.outcome, 'retreat')
  assertHealthy(finished)
})

test('pending choices survive a save and can be resolved after reloading', () => {
  const source = open(active({ queue: [box('apostas')], coins: 10 }))
  const entries = new Map<string, string>()
  const storage: StoragePort = {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value) },
  }

  assert.equal(saveProgress(source, storage), true)
  const restored = loadProgress(isGameState, storage)
  assert.ok(restored)
  assert.deepEqual(restored, source)
  const resolved = choose(restored, 'bet:coruja:1')
  assert.equal(runOf(resolved).pending, null)
  assertHealthy(resolved)
})

test('save validation rejects impossible resources, depths, IDs and outcomes', () => {
  const state = active({ queue: [box('seguro')] })
  const badStates: unknown[] = [
    null,
    {},
    { ...state, run: { ...state.run, health: -1 } },
    { ...state, run: { ...state.run, health: state.run.maxHealth + 1 } },
    { ...state, run: { ...state.run, energy: -1 } },
    { ...state, run: { ...state.run, coins: NaN } },
    { ...state, run: { ...state.run, floor: 4 } },
    { ...state, run: { ...state.run, queue: [box('seguro', 5)] } },
    { ...state, run: { ...state.run, queue: Array.from({ length: 13 }, (_, i) => box('seguro', 1, `overflow-${i}`)) } },
    { ...state, run: { ...state.run, inventory: [{ id: state.run.queue[0]!.id, rarity: 'comum' }] } },
    { ...state, run: { ...state.run, pending: { kind: 'oraculo', box: box('oraculo') } } },
    { ...state, profile: { ...state.profile, upgrades: { ...state.profile.upgrades, energy: 4 } } },
    { ...state, result: { outcome: 'retreat', loot: 1, kept: 1, essence: 0, floor: 1, log: [] } },
  ]

  assert.equal(isGameState(state), true)
  for (const bad of badStates) assert.equal(isGameState(bad), false)
})

test('save validation rejects a nextId that would reuse an existing entity ID', () => {
  const state = active()
  assertHealthy(state)

  const rewound = { ...state, run: { ...state.run, nextId: 1 } }
  assert.equal(isGameState(rewound), false)
})

test('save validation rejects a pending decision before the entry box has been opened', () => {
  const state = active({
    queue: [],
    inventory: [],
    pending: { kind: 'apostas', box: box('apostas') },
  })
  assertHealthy(state)

  const unopened = { ...state, run: { ...state.run, starterOpened: false } }
  assert.equal(isGameState(unopened), false)
})

test('save validation rejects an oracle offer containing a boss', () => {
  const state = open(active({ queue: [box('oraculo')] }))
  assertHealthy(state)
  const corrupted = structuredClone(state)
  const offers = runOf(corrupted).pending?.offers
  assert.ok(offers?.[0])
  offers[0].type = 'chefe'

  assert.equal(isGameState(corrupted), false)
})

test('save validation accepts a remainder of four and rejects unconverted bank balances', () => {
  const state = initialGameState()
  assert.equal(isGameState({ ...state, profile: { ...state.profile, bankRemainder: 4 } }), true)

  for (const bankRemainder of [5, 42]) {
    assert.equal(isGameState({ ...state, profile: { ...state.profile, bankRemainder } }), false)
  }
})

test('all normal box types can be resolved while preserving resource and persistence invariants', () => {
  for (const { id } of lootboxes) {
    if (id === 'chefe') continue
    let state = open(active({
      queue: [box(id)],
      coins: 100,
      keys: 1,
      energy: 20,
      health: 5,
      maxHealth: 5,
      inventory: Array.from({ length: 3 }, (_, index) => ({ id: `reward-${index}`, rarity: 'comum' })),
      lastBox: box('mimica', 1, 'mirror-target'),
    }))
    assertHealthy(state)

    const available = getChoices(state).find(choice => !choice.disabled && choice.id !== 'pass')
    if (available) {
      state = choose(state, available.id)
      assertHealthy(state)
    }
    if (state.run?.pending) {
      state = choose(state, 'pass')
      assertHealthy(state)
    }
  }
})
