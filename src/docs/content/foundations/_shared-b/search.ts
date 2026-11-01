import { kebabIconName } from "@/lib/ink/art/icons"

export interface Searchable {
  id: string
  aliases?: readonly string[]
  tags?: readonly string[]
  text?: string
  family?: string
}

export function tokens(query: string): string[] {
  return query.toLowerCase().split(/[\s,]+/).filter(Boolean)
}

const words = (s: string): string[] => s.toLowerCase().split(/[\s\-_/]+/).filter(Boolean)

function subsequence(needle: string, hay: string): boolean {
  let i = 0
  for (const ch of hay) if (ch === needle[i] && ++i === needle.length) return true
  return needle.length === 0
}

function scoreText(token: string, text: string, weights: readonly [exact: number, prefix: number, word: number, inside: number]): number {
  const t = text.toLowerCase()
  if (t === token) return weights[0]
  if (t.startsWith(token)) return weights[1]
  if (words(t).some((w) => w.startsWith(token))) return weights[2]
  if (t.includes(token)) return weights[3]
  return 0
}

function scoreToken(token: string, e: Searchable): number {
  const kebab = token.includes("-") ? token : kebabIconName(token)
  let best = Math.max(scoreText(token, e.id, [100, 80, 70, 55]), kebab !== token ? scoreText(kebab, e.id, [100, 80, 70, 55]) : 0)
  for (const a of e.aliases ?? []) best = Math.max(best, scoreText(token, a, [60, 45, 40, 30]), kebab !== token ? scoreText(kebab, a, [60, 45, 40, 30]) : 0)
  for (const t of e.tags ?? []) best = Math.max(best, scoreText(token, t, [40, 32, 30, 20]))
  if (e.text) best = Math.max(best, scoreText(token, e.text, [50, 40, 36, 24]))
  if (e.family) best = Math.max(best, scoreText(token, e.family, [12, 10, 10, 8]))
  if (best === 0 && token.length >= 3 && subsequence(token, e.id)) best = 6
  return best
}

export function score(query: string, e: Searchable): number {
  const parts = tokens(query)
  if (parts.length === 0) return 1
  let total = 0
  for (const token of parts) {
    const s = scoreToken(token, e)
    if (s === 0) return 0
    total += s
  }
  return total
}

export function search<T extends Searchable>(entries: readonly T[], query: string, resolve?: (name: string) => string): T[] {
  const q = query.trim()
  if (!q) return [...entries]
  const pinned = resolve && !/\s/.test(q) ? resolve(q) : undefined
  const scored: { e: T; s: number; i: number }[] = []
  entries.forEach((e, i) => {
    const s = score(q, e) + (pinned && e.id === pinned ? 200 : 0)
    if (s > 0) scored.push({ e, s, i })
  })
  scored.sort((a, b) => b.s - a.s || a.i - b.i)
  return scored.map((x) => x.e)
}
