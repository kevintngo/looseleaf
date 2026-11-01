export type Notebook = { id: string; name: string }

export type Note = {
  id: string
  notebook: string
  title: string
  body: string
  updated: string
  reads: number
}

export const ALL = "all"

export const FEATURED = "owning-books"

export const NOTEBOOKS: Notebook[] = [
  { id: ALL, name: "Everything" },
  { id: "recipes", name: "Recipes" },
  { id: "garden", name: "Garden" },
  { id: "reading", name: "Reading" },
  { id: "trips", name: "Trips" },
  { id: "scraps", name: "Scraps" },
]

export const NOTES: Note[] = [
  {
    id: "owning-books",
    notebook: "reading",
    title: "On owning books",
    body: `Most of what I remember from a book is in the ((margins)): an arrow, a question mark, a small argument with a dead author.

The good bits get ==a swipe of yellow== so I can find them on the next read, and the parts I do not believe get __a red pencil__.

By the third reading the book is more mine than the ~~writer's~~, which is the whole point of owning one.`,
    updated: "10 minutes ago",
    reads: 7,
  },
  {
    id: "porridge",
    notebook: "recipes",
    title: "Porridge, the slow way",
    body: `Oats, water, a pinch of salt. Nothing else until the end.

Bring the water to a ==small boil==, then turn it down until it just shivers. Stir with the wooden spoon, ((always the same direction)). My gran was firm about it.

Twelve minutes. Honey, a splash of cold milk, and __eat it standing at the window__.`,
    updated: "2 hours ago",
    reads: 7,
  },
  {
    id: "soup",
    notebook: "recipes",
    title: "Soup that forgives",
    body: `Any sad vegetables, one onion, plenty of butter.

Cook the onion until it gives up, ==then add everything else==. Water to cover. Salt, a bay leaf, patience.

~~Cream~~ Not needed. A spoon of yoghurt and black pepper on top.`,
    updated: "Yesterday",
    reads: 3,
  },
  {
    id: "toast",
    notebook: "recipes",
    title: "Toast, honestly",
    body: `Good bread, ((thick)) slices, a toaster you trust.

Butter goes on while it is __still too hot to hold__. Jam only if you mean it.`,
    updated: "Last week",
    reads: 12,
  },
  {
    id: "beds",
    notebook: "garden",
    title: "What went in this week",
    body: `Sunday: sweet peas along the fence, ==nine of them==, in the wet corner.
Monday: rain. Nothing.
Wednesday: the first radishes are up. ((Already.))

Still to do: move the rosemary before it sulks.`,
    updated: "Tuesday",
    reads: 4,
  },
  {
    id: "slugs",
    notebook: "garden",
    title: "Slugs: a truce",
    body: `They get the outer lettuce. I get the inner ones. __Everyone eats.__

~~Beer traps~~ Did not work, and smelled.`,
    updated: "Last month",
    reads: 2,
  },
  {
    id: "lisbon",
    notebook: "trips",
    title: "Lisbon, three days",
    body: `Day one: tram 28 before the crowds, then ==pastel de nata==. Two, not one.
Day two: walk uphill on purpose. ((Bring the good shoes.))
Day three: a bookshop with a cat, and __no plan at all__.

Ask Jo about the tiles.`,
    updated: "3 days ago",
    reads: 5,
  },
  {
    id: "scrap-1",
    notebook: "scraps",
    title: "Things to ask the printer",
    body: `Is the blue ==actually== that blue?
Deckle edge: extra, or included?
Proofs by Thursday, ((please)).`,
    updated: "Monday",
    reads: 1,
  },
]

export type MarkKind = "highlight" | "underline" | "circle" | "strike"

export const MARKS: Record<MarkKind, { open: string; close: string; label: string }> = {
  highlight: { open: "==", close: "==", label: "Highlight" },
  underline: { open: "__", close: "__", label: "Underline" },
  circle: { open: "((", close: "))", label: "Circle" },
  strike: { open: "~~", close: "~~", label: "Cross out" },
}

export type Piece = { text: string; mark?: MarkKind }

const MARK_RE = /==(.+?)==|__(.+?)__|\(\((.+?)\)\)|~~(.+?)~~/g
const ORDER: MarkKind[] = ["highlight", "underline", "circle", "strike"]

export function parseLine(line: string): Piece[] {
  const out: Piece[] = []
  let at = 0
  for (const m of line.matchAll(MARK_RE)) {
    const i = m.index ?? 0
    if (i > at) out.push({ text: line.slice(at, i) })
    const k = m.findIndex((g, n) => n > 0 && g !== undefined) - 1
    out.push({ text: m[k + 1] ?? "", mark: ORDER[k] })
    at = i + m[0].length
  }
  if (at < line.length) out.push({ text: line.slice(at) })
  return out
}

export function stripMarks(body: string): string {
  return body
    .split("\n")
    .map((l) =>
      parseLine(l)
        .map((p) => p.text)
        .join("")
    )
    .join("\n")
}

export const wordCount = (body: string): number => stripMarks(body).split(/\s+/).filter(Boolean).length

export type Selection = { text: string; start: number; end: number }

export function toggleMark(text: string, start: number, end: number, kind: MarkKind): Selection | null {
  const { open, close } = MARKS[kind]
  if (end <= start) return null
  const selected = text.slice(start, end)
  if (text.slice(start - open.length, start) === open && text.slice(end, end + close.length) === close) {
    const next = text.slice(0, start - open.length) + selected + text.slice(end + close.length)
    return { text: next, start: start - open.length, end: end - open.length }
  }
  if (selected.length > open.length + close.length && selected.startsWith(open) && selected.endsWith(close)) {
    const inner = selected.slice(open.length, selected.length - close.length)
    return { text: text.slice(0, start) + inner + text.slice(end), start, end: start + inner.length }
  }
  const parts: { from: number; to: number }[] = []
  let cursor = start
  for (const line of selected.split("\n")) {
    const lead = line.length - line.trimStart().length
    const body = line.trim()
    if (body) parts.push({ from: cursor + lead, to: cursor + lead + body.length })
    cursor += line.length + 1
  }
  if (!parts.length) return null
  let next = text
  for (const p of [...parts].reverse()) next = next.slice(0, p.from) + open + next.slice(p.from, p.to) + close + next.slice(p.to)
  const added = parts.length * (open.length + close.length)
  return { text: next, start: parts[0].from + open.length, end: parts[parts.length - 1].to + added - close.length }
}
