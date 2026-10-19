import assert from 'node:assert/strict'
import test from 'node:test'
import { loadProgress, saveProgress } from '../src/lib/storage.ts'
import type { StoragePort } from '../src/lib/storage.ts'

type ExampleProgress = { value: number }

function isProgress(data: unknown): data is ExampleProgress {
  return typeof data === 'object' && data !== null &&
    'value' in data && typeof data.value === 'number' && Number.isFinite(data.value)
}

function memoryStorage(data: Map<string, string>): StoragePort {
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value) },
  }
}

test('progress survives a new session using the same stored data', () => {
  const data = new Map<string, string>()
  const progress = { value: 7 }

  assert.equal(loadProgress(isProgress, memoryStorage(data)), null)
  assert.equal(saveProgress(progress, memoryStorage(data)), true)
  assert.deepEqual(JSON.parse(data.get('gamblin.progress')!), { version: 1, data: progress })
  assert.deepEqual(loadProgress(isProgress, memoryStorage(data)), progress)
})

test('corrupt, incompatible and invalid data are rejected without overwriting the save', () => {
  const invalidSaves = [
    '{broken json',
    'null',
    '[]',
    JSON.stringify({ version: 2, data: { value: 7 } }),
    JSON.stringify({ version: 1 }),
    JSON.stringify({ version: 1, data: { value: 'invalid' } }),
  ]

  for (const raw of invalidSaves) {
    let writes = 0
    const storage: StoragePort = {
      getItem: () => raw,
      setItem: () => { writes += 1 },
    }

    assert.equal(loadProgress(isProgress, storage), null)
    assert.equal(writes, 0)
    assert.equal(storage.getItem('gamblin.progress'), raw)
  }
})

test('blocked storage access and exhausted quota do not crash', () => {
  const blockedStorage: StoragePort = {
    getItem: () => { throw new Error('Access denied') },
    setItem: () => { throw new Error('Quota exceeded') },
  }

  assert.equal(loadProgress(isProgress, blockedStorage), null)
  assert.equal(saveProgress({ value: 7 }, blockedStorage), false)

  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => { throw new Error('Storage unavailable') },
  })

  try {
    assert.equal(loadProgress(isProgress), null)
    assert.equal(saveProgress({ value: 7 }), false)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
