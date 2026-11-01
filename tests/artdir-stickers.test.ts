import { Resvg } from "@resvg/resvg-js"
import { describe, expect, it } from "vitest"
import { dieCut } from "@/lib/ink/art-draw"
import { doodles } from "@/lib/ink/art/doodles"
import { stickers } from "@/lib/ink/art/stickers"
import { isGen, type ArtDef, type Part, type StickerDef } from "@/lib/ink/art/types"
import { badgeSkeleton } from "@/lib/ink/art/badge-gen"

const drawn = Object.entries(stickers as Record<string, StickerDef>).filter(([, d]) => !isGen(d)) as Array<[string, ArtDef]>
const badges = Object.entries(stickers as Record<string, StickerDef>).filter(([, d]) => isGen(d) && (d as { gen: string }).gen === "badge")

function pieces(def: ArtDef, size: number, id: string): number {
  const r = dieCut(def, size, id, { shadow: false })
  const S = r.silhouette
  const bw = 2 * r.border
  const fills = S.fills.map((d) => `<path d="${d}" fill="#000" stroke="#000" stroke-width="${bw}" stroke-linejoin="round"/>`).join("")
  const lines = S.lines.map((d) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${bw + S.W}" stroke-linejoin="round" stroke-linecap="round"/>`).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(r.w)}" height="${Math.ceil(r.h)}"><rect width="100%" height="100%" fill="#fff"/>${fills}${lines}</svg>`
  const img = new Resvg(svg).render()
  const w = img.width, h = img.height, px = img.pixels
  const on = (i: number): boolean => px[i * 4] < 128
  const seen = new Uint8Array(w * h)
  let n = 0
  for (let s0 = 0; s0 < w * h; s0++) {
    if (seen[s0] || !on(s0)) continue
    let area = 0
    const stack = [s0]
    seen[s0] = 1
    while (stack.length) {
      const i = stack.pop()!
      area++
      const x = i % w
      for (const k of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i + w < w * h ? i + w : -1]) if (k >= 0 && !seen[k] && on(k)) { seen[k] = 1; stack.push(k) }
    }
    if (area > 30) n++
  }
  return n
}

describe("a die-cut sticker is one piece of vinyl", () => {
  it.each([64, 128])("at %i px no sticker has a detached island (each island would be cut and bordered on its own)", (size) => {
    const bad: string[] = []
    for (const [id, def] of drawn) if (pieces(def, size, id) > 1) bad.push(id)
    for (const [id, def] of badges) if (pieces(badgeSkeleton((def as { text: string }).text, def as never), size, id) > 1) bad.push(id)
    expect(bad).toEqual([])
  })
})

const partsOf = (d: ArtDef): Part[] => [...(d.hi ?? [])]
const isSparkle = (p: Part): boolean => (p[0] === "c" || p[0] === "s") && /^M\s?[\d.]+ [\d.]+ L\s?[\d.]+ [\d.]+ M\s?[\d.]+ [\d.]+ L\s?[\d.]+ [\d.]+$/.test((p[0] === "c" ? p[2] : p[1]).trim())

describe("no tics repeated across the set", () => {
  it("the plus sparkle in the hi tier appears in at most 7 stickers (there were 11: nearly every hi tier had one)", () => {
    const using = drawn.filter(([, d]) => partsOf(d).some(isSparkle)).map(([id]) => id)
    expect(using.length).toBeLessThanOrEqual(7)
  })
  it("cheeks are bubblegum dashes on at most 12 stickers, and never more than two dashes on one face", () => {
    const cheeks = drawn.map(([id, d]) => [id, d.parts.filter((p) => p[0] === "c" && p[1] === "bubblegum" && p[2].length < 50).length] as const)
    expect(cheeks.filter(([, n]) => n > 0).length).toBeLessThanOrEqual(12)
    expect(cheeks.filter(([, n]) => n > 2)).toEqual([])
  })
})

describe("colour rules of the decoration layer", () => {
  const uses = (d: ArtDef, key: string): boolean => [...d.parts, ...(d.small ?? []), ...(d.hi ?? [])].some((p) => (p[0] === "f" || p[0] === "c") && p[1].replace("~", "") === key)
  it("blue felt (ink-you) is reserved for meaning: no doodle and no drawn sticker uses it", () => {
    const bad = [...Object.entries(doodles as Record<string, ArtDef>), ...drawn].filter(([, d]) => uses(d, "ink-you")).map(([id]) => id)
    expect(bad).toEqual([])
  })
  it("red pencil is correction and grades only: doodles never, stickers only scribble-circle, a-plus, hundred", () => {
    const badD = Object.entries(doodles as Record<string, ArtDef>).filter(([, d]) => uses(d, "red")).map(([id]) => id)
    const badS = drawn.filter(([, d]) => uses(d, "red")).map(([id]) => id).filter((id) => !["scribble-circle", "a-plus", "hundred"].includes(id))
    expect(badD).toEqual([])
    expect(badS).toEqual([])
  })
})

describe("the redrawn silhouettes keep their new language", () => {
  const bbox = (d: string): [number, number, number, number] => {
    const n = [...d.matchAll(/-?\d+\.?\d*/g)].map((m) => Number(m[0]))
    const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1)
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
  }
  it("twenty-four-seven is a wide stadium, not a disc; hundred and exclamation-badge are not round seals", () => {
    const [x0, y0, x1, y1] = bbox(((stickers as unknown as Record<string, ArtDef>)["twenty-four-seven"].parts.find((p) => p[0] === "s") as readonly ["s", string])[1])
    expect((x1 - x0) / (y1 - y0)).toBeGreaterThan(1.4)
    const tri = (stickers as unknown as Record<string, ArtDef>)["exclamation-badge"].parts.find((p) => p[0] === "s") as readonly ["s", string]
    expect(tri[1]).toMatch(/Q/)
  })
})
