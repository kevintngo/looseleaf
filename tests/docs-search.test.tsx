import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildSearchIndex, fuzzyMatch, search, suggestions, tokenizeQuery } from "@/docs/core/search"
import { highlight } from "@/docs/shell/CommandPalette"
import { fixtureCatalog } from "./docs-fixtures"

describe("fuzzyMatch tiers", () => {
  const score = (q: string, t: string) => fuzzyMatch(q, t)?.score ?? 0

  it("ranks exact > prefix > word start > substring > subsequence > miss", () => {
    const exact = score("card", "Card")
    const prefix = score("card", "CardHeader")
    const wordStart = score("card", "Date Card")
    const substring = score("ard", "Discard")
    const fuzzy = score("crd", "Card")
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(wordStart)
    expect(wordStart).toBeGreaterThan(substring)
    expect(substring).toBeGreaterThan(fuzzy)
    expect(fuzzy).toBeGreaterThan(0)
    expect(fuzzyMatch("xyz", "Card")).toBeNull()
  })

  it("prefers shorter texts among prefixes and earlier hits among substrings", () => {
    expect(score("but", "Button")).toBeGreaterThan(score("but", "Button group"))
    expect(score("ton", "Button")).toBeGreaterThan(score("ton", "Big long button"))
  })

  it("matches camelCase boundaries and treats - and _ as spaces", () => {
    expect(fuzzyMatch("header", "CardHeader")).toMatchObject({ positions: [4, 5, 6, 7, 8, 9] })
    expect(score("date pick", "date-picker")).toBeGreaterThan(800)
    expect(fuzzyMatch("date-picker", "Date Picker")?.score).toBe(1000)
  })

  it("returns positions for highlighting, including fuzzy ones", () => {
    expect(fuzzyMatch("dpk", "Date Picker")?.positions).toEqual([0, 5, 8])
    expect(fuzzyMatch("", "x")).toBeNull()
  })

  it("splits queries on whitespace and dashes", () => {
    expect(tokenizeQuery("  Date-pick  er ")).toEqual(["date", "pick", "er"])
  })
})

describe("search over the fixture catalog", () => {
  const index = buildSearchIndex(fixtureCatalog())
  const top = (q: string, n = 3) => search(index, q).slice(0, n).map((r) => r.entry.id)

  it("puts the exact title first and its parts after it", () => {
    expect(top("card")[0]).toBe("component:card")
    expect(top("card")[1]).toBe("part:card:CardHeader")
  })

  it("finds a part by name and links to its API anchor", () => {
    const [first] = search(index, "CardHeader")
    expect(first!.entry).toMatchObject({ kind: "part", to: "/components/card#api-cardheader", title: "CardHeader" })
  })

  it("requires every token and finds multi-word titles", () => {
    expect(top("date pick")[0]).toBe("component:date-picker")
    expect(search(index, "date zebra")).toEqual([])
  })

  it("finds by description, category, upstream and slug", () => {
    expect(top("pencilled")).toContain("component:date-picker")
    expect(top("forms")).toEqual(expect.arrayContaining(["component:input", "component:date-picker"]))
    expect(search(index, "button")[0]!.entry.id).toBe("component:button")
  })

  it("finds foundations, pages and blocks", () => {
    expect(top("color")[0]).toBe("foundation:color")
    expect(top("install")[0]).toBe("page:/getting-started")
    expect(top("sign in")).toContain("block:login")
  })

  it("survives typos through the subsequence tier and ranks worse than real hits", () => {
    const typo = search(index, "bttn")
    expect(typo[0]!.entry.id).toBe("component:button")
    const real = search(index, "button")[0]!.score
    expect(typo[0]!.score).toBeLessThan(real)
  })

  it("returns title positions and nothing for an empty query", () => {
    expect(search(index, "")).toEqual([])
    const r = search(index, "picker")[0]!
    expect(r.titlePositions).toEqual([5, 6, 7, 8, 9, 10])
  })

  it("breaks ties by kind, then length, then alphabet, and honours the limit", () => {
    expect(search(index, "a", 2)).toHaveLength(2)
    const again = search(index, "in").map((r) => r.entry.id)
    expect(again).toEqual(search(index, "in").map((r) => r.entry.id))
  })

  it("offers suggestions for the empty state", () => {
    const s = suggestions(index)
    expect(s[0]!.entry.kind).toBe("page")
    expect(s.some((r) => r.entry.kind === "component")).toBe(true)
    expect(s.some((r) => r.entry.to === "/")).toBe(false)
  })

  it("indexes pages and foundations even for an empty catalog", () => {
    const empty = buildSearchIndex(fixtureCatalog({ meta: {}, blocks: {}, blockMeta: {}, content: {} }))
    expect(empty.every((e) => e.kind === "page" || e.kind === "foundation")).toBe(true)
    expect(search(empty, "typography")[0]!.entry.id).toBe("foundation:typography")
  })
})

describe("highlight()", () => {
  it("wraps matched characters in <mark>", () => {
    const { container } = render(<span>{highlight("CardHeader", [0, 1, 4])}</span>)
    expect([...container.querySelectorAll("mark")].map((m) => m.textContent)).toEqual(["Ca", "H"])
    expect(container.textContent).toBe("CardHeader")
  })

  it("returns plain text without positions", () => {
    expect(highlight("Card", [])).toBe("Card")
  })
})
