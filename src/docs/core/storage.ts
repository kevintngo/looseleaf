const PREFIX = "looseleaf-docs:"

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value)
  } catch {
  }
}

export function readStoredChoice<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const value = readStored(key)
  return allowed.includes(value as T) ? (value as T) : fallback
}
