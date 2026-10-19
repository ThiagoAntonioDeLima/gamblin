const progressKey = 'gamblin.progress'
const schemaVersion = 1

export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>

function browserStorage(): StoragePort | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function loadProgress<T>(
  validator: (data: unknown) => data is T,
  storage: StoragePort | undefined = browserStorage(),
): T | null {
  try {
    const raw = storage?.getItem(progressKey)
    if (!raw) return null

    const envelope: unknown = JSON.parse(raw)
    if (
      typeof envelope !== 'object' || envelope === null ||
      !('version' in envelope) || envelope.version !== schemaVersion ||
      !('data' in envelope) || !validator(envelope.data)
    ) return null

    return envelope.data
  } catch {
    return null
  }
}

export function saveProgress<T>(
  progress: T,
  storage: StoragePort | undefined = browserStorage(),
): boolean {
  if (!storage) return false

  try {
    storage.setItem(progressKey, JSON.stringify({ version: schemaVersion, data: progress }))
    return true
  } catch {
    return false
  }
}
