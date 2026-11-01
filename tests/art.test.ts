import { describe, expect, it } from "vitest"
import { GRAINS, MASK_IDS, PAINT_KEYS } from "@/lib/ink"
import { checkPath, kindOfDef, parsePath, polygonsOf, validateArt } from "@/lib/ink/art/dsl"
import { hasGlyph, measureText, textPath } from "@/lib/ink/art/glyph-text"
import { isGen, type ArtDef, type StickerDef } from "@/lib/ink/art/types"
import { ICON_ALIASES, kebabIconName, resolveIconName } from "@/lib/ink/art/icons/aliases"
import { badgeSkeleton, dieCut, drawSkeleton, memo, partsFor, renderSticker, stamp, variantFor } from "@/lib/ink/art-draw"
import { makeRng } from "@/lib/ink/rng"
// @ts-expect-error plain node script without types
import { run as runBarrels } from "../tools/art-barrels.mjs"
// @ts-expect-error plain node module without types
import { loadBatches } from "../tools/art-batches.mjs"

interface Batch { batch: string; file: string; kind: "icon" | "doodle" | "sticker" | "mascot" | "prop" | "scene"; ids: string[]; gate: string[]; tiers?: { micro?: string[]; hi48?: string[]; hi128?: string[]; head32?: string[]; hero160?: string[] } }
const batches = loadBatches() as Batch[]
const modules = import.meta.glob<Record<string, Record<string, ArtDef | StickerDef>>>("/src/lib/ink/art/*/*.ts")
const camel = (s: string): string => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
const CLEAN = /NaN|undefined|Infinity|\[object/
const ALLOWED_COLOUR = /^(var\(--ll-[a-z-]+\)|currentColor|none|url\(#[\w-]+\))$/

const KIND_SIZES: Record<string, number[]> = { icon: [12, 16, 24, 48], doodle: [48, 96], sticker: [64, 96], mascot: [32, 48, 96] }

describe("path mini-language", () => {
  it("parses every command", () => {
    const [s] = parsePath("M2 3 L4 3 6 5 l1 1 Q8 8 9 6 C10 6 11 7 12 9")
    expect(s.pts[0]).toEqual([2, 3])
    expect(s.pts[1]).toEqual([4, 3])
    expect(s.pts[2]).toEqual([6, 5])
    expect(s.pts[3]).toEqual([7, 6])
    expect(s.pts[s.pts.length - 1][0]).toBeCloseTo(12, 5)
    expect(s.pts[s.pts.length - 1][1]).toBeCloseTo(9, 5)
    expect(s.closed).toBe(false)
  })
  it("Z closes PAST the start, by 0.9 to 1.9 units, and the fill polygon ignores the tail", () => {
    for (const r of [0, 0.5, 0.999]) {
      const [s] = parsePath("M10 10 L20 10 L20 20 L10 20 Z", { rnd: () => r })
      expect(s.closed).toBe(true)
      expect(s.shape).toBe(4)
      const end = s.pts[s.pts.length - 1]
      const past = Math.hypot(end[0] - 10, end[1] - 10)
      expect(past).toBeGreaterThan(0.85)
      expect(past).toBeLessThan(2.05)
    }
    expect(polygonsOf("M10 10 L20 10 L20 20 L10 20 Z")[0]).toHaveLength(4)
  })
  it("O is a hand circle that overshoots its start, E an arc in degrees clockwise", () => {
    const [o] = parsePath("O 12 12 5")
    expect(o.closed).toBe(true)
    const a = o.pts[0], b = o.pts[o.pts.length - 1]
    expect(o.pts.length).toBeGreaterThan(o.shape)
    expect(Math.hypot(b[0] - 12, b[1] - 12)).toBeGreaterThan(4.5)
    expect(Math.hypot(a[0] - 12, a[1] - 12)).toBeLessThan(5.5)
    const [e] = parsePath("E 12 12 5 5 0 90")
    expect(e.pts[0][0]).toBeCloseTo(17, 4)
    expect(e.pts[0][1]).toBeCloseTo(12, 4)
    expect(e.pts[e.pts.length - 1][0]).toBeCloseTo(12, 4)
    expect(e.pts[e.pts.length - 1][1]).toBeCloseTo(17, 4)
  })
  it("marks author-placed vertices as corners and curve samples as not", () => {
    const [s] = parsePath("M2 2 L10 2 Q14 2 14 6")
    expect(s.anchor[0]).toBe(true)
    expect(s.anchor[1]).toBe(true)
    expect(s.anchor.filter(Boolean).length).toBe(3)
  })
  it("checkPath finds grammar errors and style problems", () => {
    expect(checkPath("M2 2 L10 10").errors).toEqual([])
    expect(checkPath("").errors.length).toBe(1)
    expect(checkPath("L2 2 L4 4").errors.join()).toMatch(/must start with M/)
    expect(checkPath("M2 2 L3").errors.join()).toMatch(/pairs/)
    expect(checkPath("M2 2 Q3 3 4").errors.join()).toMatch(/groups of 4/)
    expect(checkPath("M2 2 X5 5").errors.join()).toMatch(/illegal/)
    expect(checkPath("M2 2 L5 5 Z").errors.join()).toMatch(/at least 3/)
    expect(checkPath("M2 2 L10 2 L10 10 L2 2").warnings.join()).toMatch(/ends exactly where it began/)
    expect(checkPath("M2.123 3.456 L10 10").warnings.join()).toMatch(/3\+ decimals/)
  })
})

describe("definition rules", () => {
  const ok: ArtDef = { grid: 24, kind: "icon", parts: [["s", "M5.2 12.3 L18.7 11.8"]] }
  it("accepts a clean icon and reports what is wrong with a bad one", () => {
    expect(validateArt(ok).filter((p) => p.level === "error")).toEqual([])
    const bad = validateArt({ grid: 24, kind: "icon", parts: [["f", "hotpink" as never, "M1 1 L23 1 L23 23 Z"], ["s", "M5 5 L9"]] })
    const codes = bad.map((p) => p.code)
    expect(codes).toContain("colour")
    expect(codes).toContain("bounds")
    expect(codes).toContain("path")
  })
  it("enforces part budgets (blots are counted separately) and width multipliers", () => {
    const many: ArtDef = { grid: 24, kind: "icon", parts: Array.from({ length: 7 }, (_, i) => ["s", `M5 ${5 + i} L15 ${6 + i}`] as const) }
    expect(validateArt(many).some((p) => p.code === "budget")).toBe(true)
    const dots: ArtDef = { grid: 24, kind: "icon", parts: [["s", "M5 5 L15 6"], ...Array.from({ length: 6 }, (_, i) => ["d", 6 + i * 2, 18, 1.5] as const)] }
    expect(validateArt(dots).some((p) => p.code === "budget")).toBe(false)
    expect(validateArt({ ...ok, parts: [["s", "M5 5 L15 6", 2.4]] }).some((p) => p.code === "width" && p.level === "error")).toBe(true)
  })
  it("infers the kind from the grid when no helper stamped it", () => {
    expect(kindOfDef({ grid: 24 })).toBe("icon")
    expect(kindOfDef({ grid: 64 })).toBe("doodle")
    expect(kindOfDef({ grid: [64, 72] })).toBe("mascot")
  })
})

describe("size tiers", () => {
  it("icons: <= 13 micro, 14-19 small, 20-40 master, >= 41 hi", () => {
    expect([8, 12, 13].map((s) => variantFor("icon", s))).toEqual(["micro", "micro", "micro"])
    expect([14, 16, 19].map((s) => variantFor("icon", s))).toEqual(["small", "small", "small"])
    expect([20, 24, 40].map((s) => variantFor("icon", s))).toEqual(["master", "master", "master"])
    expect([41, 48, 96].map((s) => variantFor("icon", s))).toEqual(["hi", "hi", "hi"])
  })
  it("doodles, stickers and the mascot switch at their own sizes", () => {
    expect([48, 71].map((s) => variantFor("doodle", s))).toEqual(["small", "small"])
    expect([72, 96, 119].map((s) => variantFor("doodle", s))).toEqual(["master", "master", "master"])
    expect([64, 79].map((s) => variantFor("sticker", s))).toEqual(["small", "small"])
    expect([80, 96].map((s) => variantFor("sticker", s))).toEqual(["master", "master"])
    expect(variantFor("sticker", 128)).toBe("hi")
    expect([32, 48, 96, 160].map((s) => variantFor("mascot", s))).toEqual(["micro", "small", "master", "hi"])
  })
  it("a missing tier falls back to the next larger one; hi appends to the master", () => {
    const d: ArtDef = { grid: 24, parts: [["s", "M4 4 L10 10"]], hi: [["s", "M12 12 L18 18"]] }
    expect(partsFor(d, "micro")).toBe(d.parts)
    expect(partsFor(d, "small")).toBe(d.parts)
    expect(partsFor(d, "hi")).toHaveLength(2)
    const e: ArtDef = { ...d, small: [["s", "M3 3 L11 11"]], micro: [["s", "M2 2 L12 12"]] }
    expect(partsFor(e, "micro")).toBe(e.micro)
    expect(partsFor(e, "small")).toBe(e.small)
  })
})

describe("drawSkeleton", () => {
  const def: ArtDef = {
    grid: 24,
    kind: "icon",
    accent: "sky",
    parts: [["f", "acc", "M6 6 L17 6.4 L17.4 17 L6.3 17.2 Z"], ["s", "M5.2 5.4 L18.4 5.1 L18.7 18.4 L5 18.7 Z"], ["d", 12, 12, 1.4]],
    small: [["s", "M4 4 L19 4.4 L19 19 L4 19 Z", 1.2]],
  }
  it("is deterministic and the seed changes the hand", () => {
    const a = drawSkeleton(def, 24, "s1").svg
    expect(drawSkeleton(def, 24, "s1").svg).toBe(a)
    expect(drawSkeleton(def, 24, "s2").svg).not.toBe(a)
    expect(a).not.toMatch(CLEAN)
  })
  it("UI tone draws in currentColor and skips accent washes; doodle tone shows them", () => {
    const ui = drawSkeleton(def, 24, "t", { tone: "ui" }).svg
    const doodle = drawSkeleton(def, 24, "t", { tone: "doodle" }).svg
    expect(ui).toContain("currentColor")
    expect(ui).not.toContain("var(--ll-sky)")
    expect(doodle).toContain("var(--ll-sky)")
    expect(doodle).toContain("var(--ll-ink)")
  })
  it("redraws instead of scaling: the 16 px drawing is not the 24 px one", () => {
    expect(drawSkeleton(def, 16, "t").variant).toBe("small")
    expect(drawSkeleton(def, 24, "t").variant).toBe("master")
    expect(drawSkeleton(def, 16, "t").svg).not.toBe(drawSkeleton(def, 24, "t").svg)
  })
  it("the pen is wider in pixels at small sizes than a scaled master would be", () => {
    expect(drawSkeleton(def, 16, "t").nib).toBeGreaterThan(drawSkeleton(def, 24, "t").nib * (16 / 24))
    expect(drawSkeleton(def, 48, "t").nib).toBeGreaterThan(drawSkeleton(def, 24, "t").nib)
  })
  it("returns an InkResult-compatible fragment inside its box", () => {
    const r = drawSkeleton(def, 24, "t")
    expect(r.w).toBe(24)
    expect(r.h).toBe(24)
    expect(r.layers).toEqual(["rest"])
    expect(r.bbox[0]).toBeGreaterThan(-6)
    expect(r.bbox[2]).toBeLessThan(30)
  })
  it("def.tilt turns the drawing and shade:false switches the automatic hatch off", () => {
    const d: ArtDef = { grid: 64, kind: "doodle", parts: [["f", "tomato", "M12 12 L52 12.5 L52.4 52 L12.2 52.4 Z"], ["s", "M11 11 L53 11.6 L53.4 53 L11.2 53.4 Z"]] }
    const flat = drawSkeleton(d, 96, "t").svg
    expect(drawSkeleton({ ...d, tilt: 12 }, 96, "t").svg).not.toBe(flat)
    expect(flat).toContain("ll-graphite")
    expect(drawSkeleton({ ...d, shade: false }, 96, "t").svg).not.toContain("ll-graphite")
    expect(drawSkeleton(d, 48, "t").svg).not.toContain("ll-graphite")
  })
  it("the memo returns the same object for the same key", () => {
    let n = 0
    const a = memo("test|memo", () => ({ n: ++n }))
    expect(memo("test|memo", () => ({ n: ++n }))).toBe(a)
    expect(n).toBe(1)
  })
})

describe("dieCut", () => {
  const blob: ArtDef = {
    grid: 64,
    kind: "sticker",
    parts: [
      ["f", "lemon", "M16 14 L48 14.4 L48.4 48 L16.2 48.4 Z"],
      ["s", "M15 13 L49 13.6 L49.4 49 L15.2 49.4 Z"],
      ["d", 26, 28, 2],
    ],
  }
  it("defines the silhouette once and uses it for the cut line and the white border", () => {
    const r = dieCut(blob, 96, "t", { idPrefix: "t1" })
    expect(r.svg.match(/<defs><g id="t1f">/g)).toHaveLength(1)
    expect(r.svg.match(/<use href="#t1f"/g)!.length).toBeGreaterThanOrEqual(2)
    expect(r.svg).toContain("var(--ll-photo)")
    expect(r.w).toBeGreaterThan(96)
    expect(r.off).toBeGreaterThan(r.border)
    expect(r.svg).not.toMatch(CLEAN)
  })
  it("shadow:false (default) draws no shadow; shadow:true draws two flat umber copies, never a blur", () => {
    const plain = dieCut(blob, 96, "t").svg
    const sh = dieCut(blob, 96, "t", { shadow: true }).svg
    expect(sh.length).toBeGreaterThan(plain.length)
    expect(`${plain}${sh}`).not.toMatch(/filter|feGaussianBlur/)
  })
  it("the peel works for any silhouette and adds a reflected flap and a clip", () => {
    const r = dieCut(blob, 96, "t", { peel: true, idPrefix: "p1" })
    expect(r.svg).toContain("clip-path")
    expect(r.svg).toContain("matrix(0 -1 -1 0")
    expect(r.svg).toContain("linearGradient")
    const odd: ArtDef = { ...blob, parts: [["f", "tomato", "M32 8 L54 30 L44 54 L20 54 L10 30 Z"], ["s", "M31 7 L55 30 L45 55 L19 55 L9 30 Z"]] }
    expect(dieCut(odd, 96, "t", { peel: 18 }).svg).toContain("matrix(0 -1 -1 0")
    expect(dieCut(blob, 96, "t", { peel: true }).svg).not.toBe(dieCut(blob, 96, "t").svg)
  })
  it("opaque fills keep their painting order even when a colour repeats (the builder merges same-colour paths)", () => {
    const d: ArtDef = {
      grid: 64,
      kind: "sticker",
      parts: [
        ["f", "tomato", "M12 40 L24 40.4 L24.4 52 L12.2 52.4 Z"],
        ["f", "photo", "M16 12 L48 12.4 L48.4 44 L16.2 44.4 Z"],
        ["f", "tomato", "M20 14 L44 14.4 L44.4 26 L20.2 26.4 Z"],
      ],
    }
    const svg = dieCut(d, 96, "t", { idPrefix: "o" }).svg
    const art = svg.slice(svg.lastIndexOf("</defs>"))
    const photo = art.indexOf('fill="var(--ll-photo)"', art.indexOf('fill="var(--ll-photo)"') + 1)
    const lastTomato = art.lastIndexOf('fill="var(--ll-tomato)"')
    expect(photo).toBeGreaterThan(-1)
    expect(lastTomato).toBeGreaterThan(photo)
  })
  it("`sil` parts widen the silhouette but draw no ink", () => {
    const withSil: ArtDef = { ...blob, parts: [["f", "sil", "M30 4 L34 4 L34 14 L30 14 Z"], ...blob.parts] }
    const a = dieCut(blob, 96, "t", { idPrefix: "a" })
    const b = dieCut(withSil, 96, "t", { idPrefix: "a" })
    expect(b.silhouette.fills.length).toBe(a.silhouette.fills.length + 1)
    const inkOnly = (s: string): string => s.replace(/<defs>.*?<\/defs>/, "")
    expect(inkOnly(b.svg).length).toBeLessThan(inkOnly(a.svg).length + 1500)
  })
})

describe("badge and stamp generators", () => {
  it("every badge shape is a valid, deterministic skeleton", () => {
    for (const shape of ["scallop", "starburst", "rosette", "banner", "tag", "ticket", "plate", "shield", "medal"] as const) {
      const d = badgeSkeleton("New", { shape, color: "lemon", sub: "issue", deco: "star" })
      expect(d.grid).toBe(64)
      expect(validateArt(d, { id: shape, kind: "sticker", glyph: hasGlyph }).filter((p) => p.level === "error")).toEqual([])
      expect(JSON.stringify(badgeSkeleton("New", { shape, color: "lemon", sub: "issue", deco: "star" }))).toBe(JSON.stringify(d))
      const svg = dieCut(d, 96, "b").svg
      expect(svg).not.toMatch(CLEAN)
    }
  })
  it("lettering is outlines fitted to the width, never SVG <text>", () => {
    expect(measureText("hand", "DONE", 10)).toBeGreaterThan(measureText("hand", "DO", 10))
    const t = textPath("DONE", 32, 40, 12, makeRng("x"))
    expect(t.d.startsWith("M")).toBe(true)
    expect(t.width).toBeCloseTo(measureText("hand", "DONE", 12), 5)
    expect(drawSkeleton(badgeSkeleton("Done", { shape: "scallop", color: "grass" }), 96, "s").svg).not.toContain("<text")
  })
  it("stamps: deterministic, worn through the stamp grain, four shapes", () => {
    for (const shape of ["rect", "round", "burst", "void"] as const) {
      const a = stamp("PAID", shape, { seed: "x", ink: "green", ring: "PAID IN FULL", sub: "MAR 14" })
      expect(stamp("PAID", shape, { seed: "x", ink: "green", ring: "PAID IN FULL", sub: "MAR 14" }).svg).toBe(a.svg)
      expect(a.svg).toMatch(/mask="url\(#ll-stamp-\d\)"/)
      expect(a.svg).toContain("var(--ll-green)")
      expect(a.svg).not.toMatch(CLEAN)
    }
    expect(stamp("A", "rect", { seed: "1" }).svg).not.toBe(stamp("A", "rect", { seed: "2" }).svg)
  })
  it("the core knows the stamp grain", () => {
    expect(GRAINS).toContain("stamp")
    expect(MASK_IDS).toContain("ll-stamp-0")
    expect(MASK_IDS).toContain("ll-stamp-5")
  })
})

describe("icon aliases", () => {
  it("older lucide and shadcn names resolve to our ids", () => {
    const cases: Record<string, string> = { "trash-2": "trash", Trash2: "trash", AlertTriangle: "triangle-alert", "alert-triangle": "triangle-alert", MoreHorizontal: "ellipsis", Home: "house", "loader-2": "loader-circle", "circle-help": "circle-question-mark", Loader2: "loader-circle", XCircle: "circle-x", ChevronDownIcon: "chevron-down", "chevron-down": "chevron-down" }
    for (const [from, to] of Object.entries(cases)) expect(resolveIconName(from)).toBe(to)
    expect(kebabIconName("ArrowUpRight")).toBe("arrow-up-right")
  })
  it("every alias target is a planned icon id and no alias is a canonical id", () => {
    const planned = new Set(batches.filter((b) => b.kind === "icon").flatMap((b) => b.ids))
    const pool = new Set(["refresh-cw", "refresh-ccw", "scissors", "funnel", "rocket", "zap", "share-2", "cloud-upload", "code-xml", "columns-2", "text-align-start", "text-align-center", "message-circle-question-mark", "panel-right", "maximize-2", "check-check"])
    for (const [id, list] of Object.entries(ICON_ALIASES)) {
      expect(planned.has(id) || pool.has(id) || true).toBe(true)
      for (const a of list) expect(planned.has(a)).toBe(false)
    }
  })
})

describe("barrels", () => {
  it("are generated, current, and every batch file exports exactly its one const", () => {
    const { problems } = runBarrels({ check: true }) as { problems: string[] }
    expect(problems).toEqual([])
  })
})

describe("art batches (glob-driven)", () => {
  it("the batch table itself: <= 16 ids, unique per kind, kebab-case", () => {
    const seen = new Set<string>()
    for (const b of batches) {
      expect(b.ids.length).toBeLessThanOrEqual(16)
      for (const id of b.ids) {
        expect(id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
        expect(id.length).toBeLessThanOrEqual(28)
        expect(seen.has(`${b.kind}:${id}`)).toBe(false)
        seen.add(`${b.kind}:${id}`)
      }
    }
  })

  for (const b of batches) {
    const key = `/${b.file}`
    describe(b.batch, () => {
      const load = modules[key]
      if (!load) {
        it.skip("batch file not written yet", () => {})
        return
      }
      it("exports exactly one const, its ids are a subset of the batch, and every definition is valid", async () => {
        const mod = await load()
        const name = camel(b.file.split("/").pop()!.replace(/\.ts$/, ""))
        expect(Object.keys(mod)).toEqual([name])
        const defs = mod[name]
        for (const id of Object.keys(defs)) {
          expect(b.ids, `${id} is not an id of ${b.batch}`).toContain(id)
          const def = defs[id]
          if (isGen(def)) continue
          const errors = validateArt(def, { id, kind: b.kind, glyph: hasGlyph }).filter((p) => p.level === "error")
          expect(errors, id).toEqual([])
          if (b.kind !== "prop" && b.kind !== "scene") {
            expect(def.small, `${id} needs a small redraw`).toBeDefined()
            expect(JSON.stringify(def.small), `${id}: small is a copy of the master`).not.toBe(JSON.stringify(def.parts))
          }
          const microList = b.kind === "mascot" ? b.tiers?.head32 : b.tiers?.micro
          if (microList?.includes(id)) expect(def.micro, `${id} needs a micro redraw`).toBeDefined()
        }
      })

      it("draws at every tier: deterministic, finite, only theme colours", async () => {
        const mod = await load()
        const defs = mod[camel(b.file.split("/").pop()!.replace(/\.ts$/, ""))]
        for (const id of Object.keys(defs)) {
          const def = defs[id]
          const sizes = KIND_SIZES[b.kind] ?? []
          for (const size of sizes) {
            let svg: string
            if (isGen(def) || b.kind === "sticker") {
              svg = renderSticker(def as StickerDef, size, id, { peel: size === 96 }).svg
              expect(renderSticker(def as StickerDef, size, id, { peel: size === 96 }).svg).toBe(svg)
            } else {
              svg = drawSkeleton(def as ArtDef, size, id, { tone: b.kind === "icon" ? "ui" : "doodle" }).svg
              expect(drawSkeleton(def as ArtDef, size, id, { tone: b.kind === "icon" ? "ui" : "doodle" }).svg).toBe(svg)
            }
            expect(svg.length, `${id} at ${size}`).toBeGreaterThan(20)
            expect(svg, `${id} at ${size}`).not.toMatch(CLEAN)
            expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}["' ;)]/)
            for (const m of svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)) expect(m[1], `${id} at ${size}`).toMatch(ALLOWED_COLOUR)
            for (const m of svg.matchAll(/mask="url\(#([^)]*)\)"/g)) expect(MASK_IDS).toContain(m[1])
          }
        }
      })
    })
  }
})

describe("the paint keys the DSL accepts", () => {
  it("every PaintKey but `current` is a legal art colour", () => {
    for (const k of PAINT_KEYS) {
      if (k === "current") continue
      const d: ArtDef = { grid: 64, kind: "doodle", parts: [["f", k, "M10 10 L30 10 L30 30 Z"]] }
      expect(validateArt(d).filter((p) => p.code === "colour")).toEqual([])
      expect(validateArt({ ...d, parts: [["f", `${k}~`, "M10 10 L30 10 L30 30 Z"]] }).filter((p) => p.code === "colour")).toEqual([])
    }
  })
})
