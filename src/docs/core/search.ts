import type { Catalog } from "./catalog"
import { FOUNDATIONS } from "./foundations"
import { paths } from "./router-core"

export interface Match {
  score: number
  positions: number[]
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i)

function fold(text: string): string {
  return text.toLowerCase().replace(/[-_]/g, " ")
}

const isAlnum = (ch: string) => /[a-z0-9]/i.test(ch)

function isBoundary(original: string, i: number): boolean {
  if (i === 0) return true
  const prev = original[i - 1]!
  const cur = original[i]!
  if (!isAlnum(prev)) return true
  return prev === prev.toLowerCase() && prev !== prev.toUpperCase() && cur !== cur.toLowerCase()
}

const MAX_FUZZY_LENGTH = 64

function subsequence(q: string, t: string, original: string): Match | null {
  const n = q.length
  const m = t.length
  if (n > m || m > MAX_FUZZY_LENGTH) return null
  const NEG = Number.NEGATIVE_INFINITY
  const dp: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(NEG))
  const from: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(-1))
  for (let i = 0; i < n; i++) {
    for (let j = i; j < m; j++) {
      if (q[i] !== t[j]) continue
      const bonus = isBoundary(original, j) ? 8 : 0
      if (i === 0) {
        dp[0]![j] = 10 + bonus - Math.min(j, 10) * 0.6
        continue
      }
      let best = NEG
      let bestK = -1
      for (let k = i - 1; k < j; k++) {
        const prev = dp[i - 1]![k]!
        if (prev === NEG) continue
        const s = prev + 10 + bonus + (k === j - 1 ? 6 : -1.5 * (j - k - 1))
        if (s > best) {
          best = s
          bestK = k
        }
      }
      dp[i]![j] = best
      from[i]![j] = bestK
    }
  }
  let end = -1
  let bestScore = NEG
  for (let j = n - 1; j < m; j++) {
    if (dp[n - 1]![j]! > bestScore) {
      bestScore = dp[n - 1]![j]!
      end = j
    }
  }
  if (end < 0) return null
  const positions: number[] = []
  for (let i = n - 1, j = end; i >= 0; i--) {
    positions.unshift(j)
    j = from[i]![j]!
  }
  return { score: Math.min(250, Math.max(1, bestScore)), positions }
}

export function fuzzyMatch(query: string, text: string): Match | null {
  const q = fold(query.trim())
  if (!q || !text) return null
  const t = fold(text)
  if (t === q) return { score: 1000, positions: range(0, t.length) }
  if (t.startsWith(q)) return { score: 800 + Math.max(0, 99 - (t.length - q.length)), positions: range(0, q.length) }

  for (let i = t.indexOf(q); i >= 0; i = t.indexOf(q, i + 1)) {
    if (isBoundary(text, i)) return { score: 600 + Math.max(0, 60 - i), positions: range(i, i + q.length) }
  }
  const at = t.indexOf(q)
  if (at >= 0) return { score: 400 - Math.min(at, 100), positions: range(at, at + q.length) }
  return subsequence(q, t, text)
}

export type SearchKind = "component" | "part" | "foundation" | "block" | "page"

export interface SearchField {
  text: string
  weight: number
}

export interface SearchEntry {
  id: string
  kind: SearchKind
  title: string
  subtitle: string
  group: string
  to: string
  fields: SearchField[]
}

export interface SearchResult {
  entry: SearchEntry
  score: number
  titlePositions: number[]
}

const KIND_RANK: Record<SearchKind, number> = { component: 0, part: 1, block: 2, foundation: 3, page: 4 }

const PAGES: { title: string; to: string; subtitle: string; keywords: string }[] = [
  { title: "Home", to: paths.home, subtitle: "Looseleaf, shadcn/ui drawn by hand", keywords: "start landing" },
  {
    title: "Getting started",
    to: paths.gettingStarted,
    subtitle: "Install with the shadcn registry, fonts, tokens and the provider",
    keywords: "install installation setup cli registry manual fonts tokens provider init",
  },
  { title: "Components", to: paths.components(), subtitle: "Every component, by category", keywords: "all library ui" },
  { title: "Blocks", to: paths.blocks(), subtitle: "Composed pages: sign in, dashboards and more", keywords: "pages templates login dashboard" },
  { title: "Playground", to: paths.playground, subtitle: "Try things out", keywords: "try sandbox" },
  { title: "Changelog", to: paths.changelog, subtitle: "What changed and when", keywords: "releases versions history" },
]

export function buildSearchIndex(catalog: Catalog): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const page of PAGES) {
    entries.push({
      id: `page:${page.to}`,
      kind: "page",
      title: page.title,
      subtitle: page.subtitle,
      group: "Pages",
      to: page.to,
      fields: [
        { text: page.title, weight: 1 },
        { text: page.keywords, weight: 0.4 },
        { text: page.subtitle, weight: 0.3 },
      ],
    })
  }

  for (const topic of FOUNDATIONS) {
    entries.push({
      id: `foundation:${topic.slug}`,
      kind: "foundation",
      title: topic.title,
      subtitle: topic.summary,
      group: "Foundations",
      to: paths.foundations(topic.slug),
      fields: [
        { text: topic.title, weight: 1 },
        { text: topic.slug, weight: 0.9 },
        { text: topic.summary, weight: 0.3 },
      ],
    })
  }

  for (const { doc, slug } of catalog.components) {
    const partNames = doc.parts.map((p) => p.name)
    const propNames = doc.parts.flatMap((p) => (p.props ?? []).map((prop) => prop.name))
    entries.push({
      id: `component:${slug}`,
      kind: "component",
      title: doc.title,
      subtitle: doc.description,
      group: doc.category,
      to: paths.components(slug),
      fields: [
        { text: doc.title, weight: 1 },
        { text: slug, weight: 0.9 },
        ...(doc.upstream ? [{ text: doc.upstream, weight: 0.6 }] : []),
        { text: partNames.join(" "), weight: 0.55 },
        { text: doc.category, weight: 0.3 },
        { text: doc.description, weight: 0.3 },
        { text: [...new Set(propNames)].join(" "), weight: 0.2 },
      ],
    })
    for (const part of doc.parts) {
      if (part.name.toLowerCase() === doc.title.replace(/\s+/g, "").toLowerCase()) continue
      entries.push({
        id: `part:${slug}:${part.name}`,
        kind: "part",
        title: part.name,
        subtitle: `Part of ${doc.title}${part.description ? `. ${part.description}` : ""}`,
        group: "Parts",
        to: `${paths.components(slug)}#api-${part.name.toLowerCase()}`,
        fields: [
          { text: part.name, weight: 1 },
          { text: part.description ?? "", weight: 0.25 },
        ],
      })
    }
  }

  for (const block of catalog.blocks) {
    entries.push({
      id: `block:${block.slug}`,
      kind: "block",
      title: block.title,
      subtitle: block.description || "Block",
      group: "Blocks",
      to: paths.blocks(block.slug),
      fields: [
        { text: block.title, weight: 1 },
        { text: block.slug, weight: 0.9 },
        { text: block.tags.join(" "), weight: 0.5 },
        { text: block.description, weight: 0.3 },
      ],
    })
  }

  return entries
}

export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean)
}

export function search(index: readonly SearchEntry[], query: string, limit = 30): SearchResult[] {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return []
  const whole = tokens.join(" ")
  const results: SearchResult[] = []

  for (const entry of index) {
    let total = 0
    const titlePositions = new Set<number>()
    let matchedAll = true
    for (const token of tokens) {
      let best = 0
      for (const field of entry.fields) {
        const match = fuzzyMatch(token, field.text)
        if (!match) continue
        const weighted = match.score * field.weight
        if (weighted > best) best = weighted
      }
      if (best === 0) {
        matchedAll = false
        break
      }
      total += best
      const inTitle = fuzzyMatch(token, entry.title)
      if (inTitle) inTitle.positions.forEach((p) => titlePositions.add(p))
    }
    if (!matchedAll) continue
    if (fold(entry.title) === whole) total += 500
    results.push({ entry, score: total, titlePositions: [...titlePositions].sort((a, b) => a - b) })
  }

  results.sort(
    (a, b) =>
      b.score - a.score ||
      KIND_RANK[a.entry.kind] - KIND_RANK[b.entry.kind] ||
      a.entry.title.length - b.entry.title.length ||
      a.entry.title.localeCompare(b.entry.title),
  )
  return results.slice(0, limit)
}

export function suggestions(index: readonly SearchEntry[], componentLimit = 6): SearchResult[] {
  const pick = (kind: SearchKind, limit: number) =>
    index.filter((e) => e.kind === kind).slice(0, limit)
  const pages = index.filter((e) => e.kind === "page" && e.to !== paths.home)
  return [...pages, ...pick("component", componentLimit), ...pick("foundation", 3)].map((entry) => ({
    entry,
    score: 0,
    titlePositions: [],
  }))
}
