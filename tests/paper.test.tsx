import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { Paper } from "@/components/ui/paper"
import { PaperDefs } from "@/lib/ink/paper/defs"
import { faceLook, splitFaces, tilesOf, type FaceSpec } from "@/lib/ink/paper/faces"
import { Ink, makeRng, PAINT_KEYS } from "@/lib/ink"
import { EDGE_KINDS, edgeInset, edgeName, edgeSides, isCutEdge, outlinePath, sheetOutline, type EdgeSpec } from "@/lib/ink/paper/edges"
import {
  TAPE_KINDS, binderClip, clip, coffeeRing, curlMarkup, pin, rubberBand, ruler, staple, stickyCurl, stitches, tape,
} from "@/lib/ink/paper/props"
import { SHADOW_LAYERS, dropShadow, sheetShadow, tiltFor, tiltLimit, tileOffsets } from "@/lib/ink/paper/shadows"
import { KALAM_BASELINE, RULE_OFFSET_VAR, STOCKS, STOCK_NAMES, TOOTH_TILES, ruleGeometry, ruleOffsetFor, rulesLayer, stockOf, type RuleName, type StockName } from "@/lib/ink/paper/stocks"
import { paperSheet, sheetRecipe } from "@/lib/ink/recipes/paper-ink"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { InkProvider } from "@/lib/ink/react"
import { PAPER_TILES } from "@/lib/ink/textures"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

const proto = HTMLElement.prototype
const descW = Object.getOwnPropertyDescriptor(proto, "offsetWidth")
const descH = Object.getOwnPropertyDescriptor(proto, "offsetHeight")
function mockBox(w: number, h: number) {
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => w })
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => h })
}
afterEach(() => {
  if (descW) Object.defineProperty(proto, "offsetWidth", descW)
  if (descH) Object.defineProperty(proto, "offsetHeight", descH)
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function splitTop(list: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ""
  for (const ch of list) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      out.push(cur.trim())
      cur = ""
    } else cur += ch
  }
  out.push(cur.trim())
  return out
}

const clean = (svg: string) => {
  expect(svg).not.toMatch(/NaN|undefined|Infinity|\[object/)
  expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  expect(svg).not.toMatch(/<filter|feTurbulence|feGaussianBlur|feDisplacementMap/)
  for (const m of svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/g)) {
    const v = m[1]
    expect(v === "none" || v.startsWith("url(#") || /^var\(--ll-[a-z-]+\)$/.test(v) || v === "currentColor").toBe(true)
  }
}

describe("edges", () => {
  it("knows which edges are plain cuts", () => {
    expect(isCutEdge("cut")).toBe(true)
    expect(isCutEdge(undefined)).toBe(true)
    expect(isCutEdge({ bottom: "cut" })).toBe(true)
    expect(isCutEdge("torn")).toBe(false)
    expect(isCutEdge({ top: "zig" })).toBe(false)
    expect(edgeSides({ top: "zig", left: "torn" })).toEqual(["zig", "cut", "cut", "torn"])
    expect(edgeName({ bottom: "deckle" })).toBe("deckle")
    expect(edgeName("cut")).toBe("cut")
  })

  it.each(EDGE_KINDS)("%s: a closed polygon inside the box, deterministic, finite", (kind) => {
    const a = sheetOutline(makeRng("e"), 320, 200, kind)
    const b = sheetOutline(makeRng("e"), 320, 200, kind)
    const c = sheetOutline(makeRng("other"), 320, 200, kind)
    expect(a.pts).toEqual(b.pts)
    if (kind !== "zig" && kind !== "perf" && kind !== "scallop") expect(a.pts).not.toEqual(c.pts)
    expect(a.pts.length).toBeGreaterThan(20)
    for (const [x, y] of a.pts) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      expect(x).toBeGreaterThanOrEqual(-0.01)
      expect(x).toBeLessThanOrEqual(320.01)
      expect(y).toBeGreaterThanOrEqual(-0.01)
      expect(y).toBeLessThanOrEqual(200.01)
    }
    const d = outlinePath(a, "body")
    expect(d.startsWith("M")).toBe(true)
    expect(d).not.toMatch(/NaN|undefined/)
  })

  it("edge bytes stay small (a 400 x 300 torn sheet path is a few KB)", () => {
    const o = sheetOutline(makeRng("size"), 400, 300, "torn")
    expect(outlinePath(o, "body").length).toBeLessThan(6500)
    expect(edgeInset("torn")).toBeGreaterThan(edgeInset("cut"))
  })

  it("a chamfer takes the bottom-right corner off", () => {
    const o = sheetOutline(makeRng("c"), 100, 100, "cut", { chamfer: 30 })
    expect(o.pts.some(([x, y]) => x > 90 && y > 90)).toBe(false)
    expect(o.pts.some(([x, y]) => x > 99 && Math.abs(y - 70) < 1)).toBe(true)
  })

  it("changing one side's kind leaves the others' wander alone", () => {
    const a = sheetOutline(makeRng("k"), 300, 200, { top: "torn", bottom: "cut" })
    const b = sheetOutline(makeRng("k"), 300, 200, { top: "torn", bottom: "deckle" })
    const topA = a.pts.slice(0, a.sides[0].to)
    const topB = b.pts.slice(0, b.sides[0].to)
    expect(topA).toEqual(topB)
  })
})

describe("shadows and tilt", () => {
  it("lift 1 is the published token; other lifts stay in the umber family", () => {
    for (const k of Object.keys(SHADOW_LAYERS) as Array<keyof typeof SHADOW_LAYERS>) {
      expect(sheetShadow(k)).toBe(`var(--ll-shadow-${k})`)
      const lifted = sheetShadow(k, 1.6)
      expect(lifted).toContain("rgb(var(--ll-shade) / calc(")
      expect(lifted).toContain("var(--ll-shadow-k)")
      expect(lifted).not.toMatch(/#|rgba\(0|black|gray|grey/)
    }
    expect(dropShadow("sheet")).toBe("var(--ll-drop-sheet)")
    expect(dropShadow("tape")).toContain("drop-shadow(")
  })

  it("tiltFor is deterministic, signed, never under a quarter of max and never over max", () => {
    expect(tiltFor("a", 0.6)).toBe(tiltFor("a", 0.6))
    const seen = new Set<number>()
    for (let i = 0; i < 200; i++) {
      const t = tiltFor(`s${i}`, 0.6)
      expect(Math.abs(t)).toBeGreaterThanOrEqual(0.6 * 0.25 - 0.006)
      expect(Math.abs(t)).toBeLessThanOrEqual(0.6 + 0.006)
      seen.add(Math.sign(t))
    }
    expect(seen.size).toBe(2)
  })

  it("tiltLimit: a corner never moves more than 5 px; big sheets turn less", () => {
    expect(tiltLimit(300, 200)).toBeGreaterThan(tiltLimit(800, 600))
    expect(tiltLimit(300, 200)).toBeLessThanOrEqual(2)
    expect(tiltLimit(20, 20)).toBe(2)
    expect(tiltLimit(4000, 4000)).toBeGreaterThanOrEqual(0.05)
    expect(Math.sin((tiltLimit(300, 200) * Math.PI) / 180) * 150).toBeLessThan(5.5)
  })

  it("tile offsets: one per layer, seeded, inside the tile", () => {
    const o = tileOffsets("x", [[240, 240], [192, 192], [720, 720]])
    expect(o.split(", ")).toHaveLength(3)
    expect(tileOffsets("x", [[240, 240]])).toBe(tileOffsets("x", [[240, 240]]))
    expect(tileOffsets("y", [[240, 240]])).not.toBe(tileOffsets("x", [[240, 240]]))
  })
})

describe("stocks", () => {

  it.each(["ruled", "index", "graph", "dots", "ledger", "pad"] as RuleName[])("rules %s: CSS gradients only, the geometry is published", (kind) => {
    const L = rulesLayer(kind)!
    expect(L.style.backgroundImage).toMatch(/gradient\(/)
    expect(L.style.backgroundImage).not.toMatch(/#[0-9a-f]{3,8}\b|url\(/i)
    const layers = splitTop(L.style.backgroundImage)
    for (const key of ["backgroundSize", "backgroundPosition", "backgroundRepeat", "backgroundOrigin", "backgroundClip"] as const) {
      expect(splitTop(L.style[key])).toHaveLength(layers.length)
    }
    expect(ruleGeometry(kind).pitch).toBe(L.geo.pitch)
    expect(L.pitch).toBeGreaterThan(0)
  })

  it("a photo stock prints its recessed window", () => {
    const L = rulesLayer("window")!
    expect(L.style.inset).toBe("10px 10px 26%")
    expect(L.style.boxShadow).toContain("inset")
    expect(stockOf("photo").rules).toBe("window")
    const { container } = render(<Paper stock="photo">x</Paper>)
    expect((container.querySelector('[data-slot="paper-rules"]') as HTMLElement).style.inset).toBe("10px 10px 26%")
  })

  it("each rule is printed above the foot of its line box by --ll-rule-offset, so the words above it stand on it", () => {
    const usual: Array<[RuleName, number, boolean, number]> = [
      ["ruled", 17, false, 8], ["ruled", 17, true, 6], ["pad", 17, false, 9], ["index", 17, false, 9], ["ledger", 15, false, 6], ["ledger", 15, true, 5],
    ]
    for (const [kind, fs, calm, offset] of usual) {
      const g = ruleGeometry(kind, { calm })
      expect(g.offset, `${kind} calm=${calm}`).toBe(offset)
      const baselineAboveFoot = g.pitch / 2 - KALAM_BASELINE * fs
      const ruleCentreAboveFoot = g.offset - 0.55
      const gap = baselineAboveFoot - ruleCentreAboveFoot
      expect(gap, `${kind} calm=${calm}`).toBeGreaterThan(1.5)
      expect(gap, `${kind} calm=${calm}`).toBeLessThan(3.2)
    }
    expect(ruleGeometry("ruled").first).toBe(44)
    expect(ruleGeometry("ruled", { first: 60 }).first).toBe(60)
    for (const kind of ["graph", "dots", "window", "none"] as RuleName[]) expect(ruleGeometry(kind).offset).toBe(0)
    expect(ruleOffsetFor(28)).toBe(8)
  })

  it("the gradients raise every rule by the variable, defaulting to the kind's offset; a padding never goes negative", () => {
    for (const kind of ["ruled", "pad", "index", "ledger"] as RuleName[]) {
      const L = rulesLayer(kind)!
      const d = L.geo.offset
      expect(L.style.backgroundPosition, kind).toContain(`var(${RULE_OFFSET_VAR}, ${d}px)`)
      expect(L.style.paddingTop, kind).toBe(`max(0px, calc(${kind === "index" ? L.geo.first + 2 : kind === "ledger" ? 40 : L.geo.first - 1}px - var(${RULE_OFFSET_VAR}, ${d}px)))`)
    }
    expect(rulesLayer("index")!.style.backgroundSize).toContain("calc(50px - var(--ll-rule-offset, 9px))")
    expect(rulesLayer("graph")!.style.backgroundPosition).not.toContain(RULE_OFFSET_VAR)
    expect(rulesLayer("dots")!.style.backgroundPosition).not.toContain(RULE_OFFSET_VAR)
  })

  it("the same variable moves the hand-drawn rules (translated by the difference from the default)", () => {
    mockBox(300, 180)
    const { container } = render(<Paper rules="ruled-hand" seed="hand" style={{ "--ll-rule-offset": "5px" } as React.CSSProperties}>words</Paper>)
    const r = container.querySelector('[data-slot="paper-rules"]') as HTMLElement
    expect(r.style.translate).toContain("--ll-rule-offset")
    expect(r.style.translate).toContain("8px")
  })

  it("calm density tightens ruled paper and drops the margin", () => {
    expect(ruleGeometry("ruled").pitch).toBe(28)
    expect(ruleGeometry("ruled", { calm: true }).pitch).toBe(24)
    expect(ruleGeometry("ruled", { calm: true }).margin).toBeUndefined()
    expect(rulesLayer("ruled", { calm: true })!.style.maskImage).toBeUndefined()
    expect(rulesLayer("none")).toBeNull()
  })
})

describe("props", () => {
  const makers: Array<[string, (seed: string) => ReturnType<typeof tape>]> = [
    ...TAPE_KINDS.map((k) => [`tape ${k}`, (s: string) => tape(s, { kind: k })] as [string, (seed: string) => ReturnType<typeof tape>]),
    ["clip", (s) => clip(s)],
    ["clip coated", (s) => clip(s, { tone: "sky" })],
    ["pin", (s) => pin(s)],
    ["staple", (s) => staple(s, { double: true })],
    ["binder clip", (s) => binderClip(s)],
    ["stitches", (s) => stitches(s, 240, 140)],
    ["rubber band", (s) => rubberBand(s, 40, 120)],
    ["coffee ring", (s) => coffeeRing(s)],
    ["sticky curl", (s) => stickyCurl(s, 34)],
    ["ruler", (s) => ruler(s, 200)],
  ]

  it.each(makers)("%s: deterministic, seed-sensitive, tokens only", (_name, make) => {
    const a = make("seed-a")
    expect(make("seed-a").svg).toBe(a.svg)
    expect(make("seed-b").svg).not.toBe(a.svg)
    expect(a.svg.length).toBeGreaterThan(50)
    expect(a.w).toBeGreaterThan(0)
    expect(a.h).toBeGreaterThan(0)
    clean(a.svg)
  })

  it("the same tape at lo tier is lighter than a hi tier one is allowed to be, and never huge", () => {
    for (const k of TAPE_KINDS) expect(tape("size", { kind: k, length: 120, height: 26 }).svg.length).toBeLessThan(7000)
  })

  it("tape is intrinsic: its box is its length and height, with the ends inside", () => {
    const t = tape("box", { kind: "washi-dots", length: 90, height: 24 })
    expect([t.w, t.h]).toEqual([90, 24])
    expect(tape("box2", { ends: "torn" }).svg).not.toBe(tape("box2", { ends: "saw" }).svg)
  })

  it("the flap markup gives its gradients the ids it is asked for", () => {
    const m = curlMarkup(makeRng("f"), "flap9", 30, "sticky-pink")
    expect(m).toContain('id="flap9"')
    expect(m).toContain("var(--ll-sticky-pink)")
  })
})

const REQ = { box: { w: 300, h: 180 }, seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
const drawn = (stock: StockName, edge: EdgeSpec, extra: Record<string, unknown> = {}) => runRecipe(sheetRecipe, { ...REQ, params: { stock, edge, ...extra } as never }).parts.rest ?? ""
const faceOf = (markup: string) => splitFaces(markup).find((p): p is FaceSpec => typeof p !== "string")!
const NO_TEXTURE = /<pattern|<image|<mask|<filter|<foreignObject|url\(#ll-tex|href="data:|feTurbulence|feGaussianBlur/

describe("sheet recipe", () => {
  const edges: EdgeSpec[] = ["torn", "deckle", "crimp", "zig", "perf", "scallop", { bottom: "torn" }]

  it.each(edges.map((e) => [JSON.stringify(e), e] as const))("edge %s draws plain paths from theme tokens and marks where the paper goes", (_n, edge) => {
    const markup = drawn("paper", edge)
    const parts = splitFaces(markup)
    expect(parts.map((p) => typeof p)).toEqual(["string", "object", "string"])
    const face = faceOf(markup)
    expect(face.d).toMatch(/^M[-\d.]/)
    expect(face.stock).toBe("paper")
    clean(parts.filter((p): p is string => typeof p === "string").join(""))
    expect(markup).not.toMatch(NO_TEXTURE)
    expect(markup.length).toBeLessThan(24000)
    expect(markup.split(`d="${face.d}"`)).toHaveLength(2)
  })

  it("the paper's tile-free svg resolves to a flat, clipped sheet for tools and static art; look-dev may ask for the tiles", () => {
    for (const edge of edges) {
      const res = paperSheet("s", 300, 180, { stock: "paper", edge })
      clean(res.svg)
      expect(res.svg).toContain("clip-path")
      expect(res.svg).not.toMatch(NO_TEXTURE)
      expect(res.svg.length).toBeLessThan(16000)
      expect(res.pad).toBeGreaterThan(2)
    }
    const tiled = paperSheet("s", 300, 180, { stock: "paper", edge: "torn" }, { faces: { tiles: true } }).svg
    expect(tiled).toMatch(/<pattern[^>]*><use href="#ll-tex-relief-img"/)
  })

  it("stocks pick their tiles; a sticky note with a curl carries its flap", () => {
    expect(tilesOf([faceOf(drawn("kraft", "torn")).stock])).toContain("kraft")
    expect(faceLook("kraft", 1).className).toContain("ll-tooth-kraft")
    expect(paperSheet("y", 200, 120, { stock: "sticky-yellow", edge: "cut", chamfer: 34 }).svg).toContain("var(--ll-sticky-yellow)")
    expect(paperSheet("p", 200, 120, { stock: "parchment", edge: "deckle" }).svg).toContain("var(--ll-kraft)")
    expect(drawn("napkin", "crimp")).toContain("stroke-dasharray")
    expect(drawn("sticky-yellow", "cut", { chamfer: 34 })).toContain("var(--ll-sticky-yellow)")
    expect(drawn("paper", "cut", { chamfer: 34 })).not.toContain("var(--ll-sticky-yellow)")
  })

  it("all 19 stocks x 8 edges: one paper each, no texture in the svg, finite numbers, bounded size", () => {
    for (const stock of STOCK_NAMES) {
      for (const edge of ["cut", ...EDGE_KINDS] as EdgeSpec[]) {
        const markup = drawn(stock, edge, edge === "cut" ? { chamfer: 30 } : {})
        const parts = splitFaces(markup)
        expect(parts.filter((p) => typeof p !== "string"), `${stock} ${edge}`).toHaveLength(1)
        expect(markup, `${stock} ${edge}`).not.toMatch(NO_TEXTURE)
        expect(markup, `${stock} ${edge}`).not.toMatch(/NaN|undefined|Infinity/)
        expect(markup.length, `${stock} ${edge}`).toBeLessThan(24000)
      }
    }
  })

  it("the soft shadow is a rectangle inset to the mean of the edge; the tight layer is a hairline on the outline", () => {
    const torn = faceOf(drawn("paper", "torn"))
    expect(torn.cast?.kind).toBe("paper")
    const [t, r, b, l] = torn.cast!.inset
    for (const v of [t, r, b, l]) expect(v).toBeGreaterThan(0.5)
    expect(Math.max(t, r, b, l)).toBeLessThan(6)
    expect(drawn("paper", "torn")).toContain("translate(0 1)")
    const half = faceOf(drawn("paper", { bottom: "torn" }))
    expect(half.cast!.inset[2]).toBeGreaterThan(half.cast!.inset[0])
    expect(faceOf(drawn("paper", "torn", { shadow: "none" })).cast).toBeUndefined()
    expect(drawn("paper", "torn", { shadow: "none" })).not.toContain("translate(0 1)")
    expect(faceOf(drawn("paper", "torn", { shadow: "hair" })).cast).toBeUndefined()
    expect(drawn("paper", "torn", { shadow: "hair" })).toContain("translate(0 1)")
  })

  it("runs through defineRecipe: one rest layer, fixed pad, byte-identical for identical requests", () => {
    const req = { box: { w: 240, h: 160 }, params: { stock: "paper" as const, edge: "torn" as const }, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    const a = runRecipe(sheetRecipe, req)
    const b = runRecipe(sheetRecipe, req)
    expect(a.layers).toEqual(["rest"])
    expect(a.parts.rest).toBe(b.parts.rest)
    expect(a.pad).toBe(runRecipe(sheetRecipe, { ...req, box: { w: 400, h: 300 } }).pad)
  })

  it("tier lo cuts fewer points than hi", () => {
    const lo = faceOf(drawn("paper", "torn")).d.length
    const hi = faceOf(runRecipe(sheetRecipe, { ...REQ, tier: "hi", params: { stock: "paper", edge: "torn" } }).parts.rest ?? "").d.length
    expect(lo).toBeLessThan(hi)
  })

  it("only paints with known keys", () => {
    const keys = new Set<string>(PAINT_KEYS)
    expect(keys.has("photo")).toBe(true)
    void Ink
  })
})

describe("Paper", () => {
  it("a cut sheet is pure CSS: one host, no svg, the stock's classes", () => {
    const { container } = render(<Paper stock="index-card">hello</Paper>)
    const p = container.firstElementChild as HTMLElement
    expect(p).toHaveAttribute("data-slot", "paper")
    expect(p).toHaveAttribute("data-stock", "index-card")
    expect(p).toHaveAttribute("data-edge", "cut")
    expect(p).toHaveClass("ll-paper", "ll-stock-index-card", "ll-tooth-fine", "ll-sheet-card")
    expect(p).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
    expect(p.style.getPropertyValue("--ll-tilt")).toMatch(/^-?\d+(\.\d+)?deg$/)
    expect(p.style.getPropertyValue("--ll-tex-paper-pos").split(",")).toHaveLength(3)
  })

  it("the tilt is seeded, within the stock's limit, and can be pinned or switched off", () => {
    const tilt = (ui: React.ReactElement) => {
      const { container, unmount } = render(ui)
      const v = (container.firstElementChild as HTMLElement).style.getPropertyValue("--ll-tilt")
      unmount()
      return v
    }
    expect(tilt(<Paper seed="a" />)).toBe(tilt(<Paper seed="a" />))
    expect(Math.abs(parseFloat(tilt(<Paper seed="a" />)))).toBeLessThanOrEqual(0.6)
    expect(tilt(<Paper tilt={1.25} />)).toBe("1.25deg")
    expect(tilt(<Paper tilt={false} />)).toBe("")
    expect(Math.abs(parseFloat(tilt(<Paper seed="a" rules="ruled" />)))).toBeLessThan(0.3)
  })

  it("printed rules are one decorative element under the content", () => {
    const { container, getByText } = render(<Paper rules="ruled">words</Paper>)
    const r = container.querySelector('[data-slot="paper-rules"]') as HTMLElement
    expect(r).toHaveAttribute("aria-hidden", "true")
    expect(r).toHaveClass("pointer-events-none", "absolute")
    expect(r.style.backgroundImage).toContain("gradient")
    expect(getByText("words")).toBeVisible()
    expect(render(<Paper>plain</Paper>).container.querySelector('[data-slot="paper-rules"]')).toBeNull()
    expect(render(<Paper stock="graph">g</Paper>).container.querySelector('[data-slot="paper-rules"]')).not.toBeNull()
  })

  it("ruled-hand draws the rules as a small pencil drawing on their own host", () => {
    mockBox(300, 180)
    const { container } = render(<Paper rules="ruled-hand" seed="hand">words</Paper>)
    const r = container.querySelector('[data-slot="paper-rules"]') as HTMLElement
    expect(r).toHaveAttribute("aria-hidden", "true")
    expect(r).toHaveAttribute("data-ink-host")
    expect(r.querySelector('svg[data-ink="rules"]')).not.toBeNull()
    expect(r.querySelector("svg")!.innerHTML.length).toBeLessThan(14000)
    expect(render(<Paper rules="ruled">x</Paper>).container.querySelector("svg")).toBeNull()
  })

  it("a torn sheet shows the CSS sheet until it has a size, then draws its outline", () => {
    mockBox(300, 180)
    const { container } = render(<Paper edge="torn">x</Paper>)
    const p = container.firstElementChild as HTMLElement
    const svg = p.querySelector('svg[data-ink="sheet"]') as SVGElement
    expect(svg).not.toBeNull()
    expect(p).toHaveAttribute("data-edge", "torn")
    expect(p).toHaveAttribute("data-ink-host")
    expect(p).toHaveAttribute("data-ink-ready")
    expect(svg.querySelectorAll(":scope > g[data-layer]")).toHaveLength(1)
    expectInkLayers(container, { min: 1, kinds: ["sheet"], absolute: true })
  })

  it("without a size and without layout there is no drawing and the fallback stays a cut sheet", () => {
    const { container } = render(<Paper edge="deckle">x</Paper>)
    const p = container.firstElementChild as HTMLElement
    expect(p).toHaveAttribute("data-edge", "cut")
    expect(container.querySelector('svg[data-ink="sheet"]')).toBeNull()
    expect(p).not.toHaveAttribute("data-ink-host")
  })

  it("`size` makes a drawn edge part of the server markup: svg pieces round a CSS paper, no texture in any svg", () => {
    const html = renderToString(<Paper edge="torn" size={[300, 180]} seed="ssr">x</Paper>)
    expect(html).toContain('data-slot="paper-face"')
    expect(html).toContain('data-slot="paper-shadow"')
    expect(html).toContain('data-edge="torn"')
    expect(html).toMatch(/--ll-face-path:path\(/)
    expect(renderToString(<Paper edge="torn" size={[300, 180]} seed="ssr">x</Paper>)).toBe(html)
    const body = html.replace(/<style[\s\S]*?<\/style>/g, "")
    expect(body).not.toMatch(/NaN|undefined/)
    expect(body).not.toMatch(NO_TEXTURE)
    expect(body).not.toContain("data:image")
    expect(body.match(/<svg/g)).toHaveLength(2)
    const page = renderToString(
      <>
        <Paper edge="torn" size={[300, 180]} seed="a" />
        <Paper edge="deckle" size={[300, 180]} seed="b" />
        <Paper edge="zig" size={[300, 180]} seed="c" />
      </>,
    )
    expect(page.match(/--ll-tex-relief:/g)).toHaveLength(1)
    expect(page.match(/data-slot="paper-face"/g)).toHaveLength(3)
  })

  it("hydrates the server markup of a drawn sheet without a warning, and the tiles are in the head, once", () => {
    const ui = (
      <Paper edge="torn" size={[300, 180]} seed="h">
        hi
      </Paper>
    )
    const html = renderToString(ui)
    const root = document.createElement("div")
    root.innerHTML = html
    document.body.appendChild(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    act(() => {
      hydrateRoot(root, ui)
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    expect(root.querySelector('[data-slot="paper-face"]')).not.toBeNull()
    expect(document.querySelectorAll("[data-ll-paper-defs]")).toHaveLength(0)
    root.remove()
  })

  it("puts nothing into the body: the tiles are CSS, one style per tile, and there are no patterns to inject", () => {
    mockBox(300, 180)
    render(
      <>
        <Paper edge="torn">a</Paper>
        <Paper edge="deckle">b</Paper>
      </>,
    )
    expect(document.querySelectorAll("[data-ll-paper-defs]")).toHaveLength(0)
    expect(document.querySelectorAll('pattern[id^="ll-tex"], image[id^="ll-tex"]')).toHaveLength(0)
    expect(document.head.querySelectorAll('style[data-href="ll-tex-relief"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('style[data-href="ll-tex-cloud"]')).toHaveLength(1)
  })

  it("a drawn sheet is a shadow rectangle, the svg under the paper, the paper, the svg over it: all behind the content, none with a texture", () => {
    mockBox(300, 180)
    const { container } = render(
      <Paper edge="torn" tape="top" fastener="pin" seed="parts">
        <p>words</p>
      </Paper>,
    )
    const p = container.firstElementChild as HTMLElement
    const kids = Array.from(p.children)
    const slots = kids.map((k) => k.getAttribute("data-slot") ?? k.tagName.toLowerCase())
    expect(slots.slice(0, 4)).toEqual(["paper-shadow", "svg", "paper-face", "svg"])
    const face = p.querySelector('[data-slot="paper-face"]') as HTMLElement
    expect(face).toHaveClass("ll-face", "ll-stock-paper", "ll-tooth-cold")
    expect(face).toHaveAttribute("aria-hidden", "true")
    expect(face.style.getPropertyValue("--ll-face-path")).toMatch(/^path\('M[-\d.]+/)
    expect(face.style.getPropertyValue("--ll-tex-paper-pos").split(",")).toHaveLength(3)
    for (const svg of p.querySelectorAll(':scope > svg[data-ink="sheet"]')) {
      expect(svg).toHaveAttribute("aria-hidden", "true")
      expect(svg).toHaveAttribute("focusable", "false")
      expect(svg.getAttribute("class")).toContain("absolute")
      expect(svg.querySelectorAll("pattern, image, mask, filter, foreignObject, [fill^='url(#ll-tex']")).toHaveLength(0)
      expect(svg.innerHTML).not.toContain("data:")
    }
    expect(p.querySelectorAll('svg[data-ink="sheet"]')).toHaveLength(2)
    const nodes = Array.from(p.querySelectorAll('svg[data-ink="sheet"] *')).length
    expect(nodes).toBeLessThan(24)
    expectInkLayers(container, { min: 2, kinds: ["sheet", "tape", "sticker"] })
    expect(p.querySelector("p")).not.toBeNull()
    expect(face.querySelector("p")).toBeNull()
  })

  it("a cut sheet has neither pieces nor svg; shadow=none casts nothing; calm density cuts every edge", () => {
    mockBox(300, 180)
    expect(render(<Paper>plain</Paper>).container.querySelector('[data-slot="paper-face"], [data-slot="paper-shadow"], svg')).toBeNull()
    const none = render(<Paper edge="torn" shadow="none">x</Paper>).container
    expect(none.querySelector('[data-slot="paper-face"]')).not.toBeNull()
    expect(none.querySelector('[data-slot="paper-shadow"]')).toBeNull()
    expect(none.innerHTML).not.toContain("translate(0 1)")
    const calm = render(<InkProvider density="calm"><Paper edge="torn">x</Paper></InkProvider>).container
    expect(calm.querySelector('[data-slot="paper-face"]')).toBeNull()
  })

  it("the same sheet in a right-to-left page is cut the same way", () => {
    mockBox(300, 180)
    const ltr = render(<Paper edge="torn" seed="dir">x</Paper>).container.querySelector('[data-slot="paper-face"]') as HTMLElement
    const rtl = render(<div dir="rtl"><Paper edge="torn" seed="dir">x</Paper></div>).container.querySelector('[data-slot="paper-face"]') as HTMLElement
    expect(rtl.style.getPropertyValue("--ll-face-path")).toBe(ltr.style.getPropertyValue("--ll-face-path"))
  })

  it("each shape of the outline reaches the face as a path() the browser can clip with", () => {
    mockBox(300, 180)
    for (const edge of ["torn", "deckle", "crimp", "zig", "perf", "scallop", { top: "torn" }, { bottom: "zig", left: "perf" }] as EdgeSpec[]) {
      const face = render(<Paper edge={edge}>x</Paper>).container.querySelector('[data-slot="paper-face"]') as HTMLElement
      const v = face.style.getPropertyValue("--ll-face-path")
      expect(v, JSON.stringify(edge)).toMatch(/^path\('M[^']+z'\)$/i)
      expect(v).not.toMatch(/NaN|undefined/)
    }
  })

  it("curl draws the sticky's chamfered sheet and its flap", () => {
    const html = renderToString(<Paper stock="sticky-yellow" curl size={[150, 150]} seed="c">x</Paper>)
    expect(html).toContain('data-edge="curl"')
    expect(html).toContain("var(--ll-sticky-yellow)")
  })

  it("PaperDefs still defines the tiles as svg patterns, for static art; no Paper asks for it", () => {
    const html = renderToString(<PaperDefs tiles={["relief", "fibre"]} />)
    expect(html).toContain('id="ll-tex-relief"')
    expect(html).toContain('id="ll-tex-fibre-2"')
    expect(html).not.toContain('id="ll-tex-cloud"')
  })

  it("tape and fasteners are aria-hidden props that go away in calm density", () => {
    const { container } = render(
      <Paper tape="both" fastener="clip" seed="t">
        note
      </Paper>,
    )
    const tapes = container.querySelectorAll('svg[data-slot="tape"]')
    expect(tapes).toHaveLength(2)
    for (const t of tapes) {
      expect(t).toHaveAttribute("aria-hidden", "true")
      expect(t.getAttribute("class")).toContain("calm:hidden")
      expect(t.getAttribute("class")).toContain("absolute")
    }
    const f = container.querySelector('svg[data-slot="fastener"]')!
    expect(f).toHaveAttribute("data-kind", "clip")
    expect(f.getAttribute("class")).toContain("calm:hidden")
    expect(render(<Paper tape="top" />).container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
    expect(render(<Paper tape="corner" />).container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
  })

  it("fastenerClassName moves the fastener: merged after its default place, so it replaces a clashing offset and keeps the rest", () => {
    const { container } = render(
      <>
        <Paper fastener="clip" seed="a" />
        <Paper fastener="clip" fastenerClassName="right-[3.125rem]" seed="b" />
        <Paper fastener="pin" fastenerClassName="-top-8 opacity-90" seed="c" />
      </>,
    )
    const [plain, moved, pin] = Array.from(container.querySelectorAll('svg[data-slot="fastener"]'))
    expect(plain).toHaveClass("-top-5", "right-8")
    expect(moved).toHaveClass("right-[3.125rem]", "-top-5", "absolute", "calm:hidden")
    expect(moved).not.toHaveClass("right-8")
    expect(pin).toHaveClass("-top-8", "opacity-90", "left-1/2")
    expect(pin).not.toHaveClass("-top-2")
  })

  it("calm density (provider) cuts every edge, drops the curl and tightens the rules", () => {
    mockBox(300, 180)
    const { container } = render(
      <InkProvider density="calm">
        <Paper edge="torn" rules="ruled" curl>
          calm
        </Paper>
      </InkProvider>,
    )
    const p = container.querySelector('[data-slot="paper"]') as HTMLElement
    expect(p).toHaveAttribute("data-edge", "cut")
    expect(p.querySelector('svg[data-ink="sheet"]')).toBeNull()
    expect((p.querySelector('[data-slot="paper-rules"]') as HTMLElement).style.maskImage).toBe("")
  })

  it("renders any container element, forwards refs and props, and merges classes", () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <Paper as="article" ref={ref} id="a1" className="p-4" shadow="lift" aria-label="note">
        x
      </Paper>,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe("ARTICLE")
    expect(ref.current).toBe(el)
    expect(el).toHaveAttribute("id", "a1")
    expect(el).toHaveClass("ll-paper", "p-4")
    expect(el.style.getPropertyValue("--ll-sheet-shadow")).toBe("var(--ll-shadow-lift)")
    expect(render(<Paper shadow="none" />).container.firstElementChild).toHaveStyle("--ll-sheet-shadow: none")
  })

  it("has no accessibility violations, with props and with a drawn edge", async () => {
    mockBox(300, 180)
    const { container } = renderUI(
      <div>
        <Paper edge="torn" tape="both" fastener="pin" rules="ruled" aria-label="sheet">
          <h2>Notes</h2>
          <p>text</p>
        </Paper>
        <Paper as="section" aria-label="another" stock="sticky-pink" curl>
          <p>hi</p>
        </Paper>
      </div>,
    )
    await axeCheck(container)
  })
})

describe("foundation polish (audit 4.2, 4.9)", () => {
  const tilesIn = (html: string) => (/data-href="([^"]*)"/.exec(html)?.[1] ?? "").split(" ").filter(Boolean)

  it("a Paper brings the tiles of its own stock, once, without any provider", () => {
    const paperHtml = renderToString(<Paper>hello</Paper>)
    expect(tilesIn(paperHtml).sort()).toEqual(["ll-tex-cloud", "ll-tex-fibre", "ll-tex-relief"])
    expect(paperHtml).toContain("--ll-tex-relief:url(data:image/png;base64,")
    expect(paperHtml).not.toContain("--ll-tex-linen")
    expect(tilesIn(renderToString(<Paper stock="slip">x</Paper>)).sort()).toEqual(["ll-tex-cloud", "ll-tex-fibre", "ll-tex-slip"])
    expect(tilesIn(renderToString(<Paper stock="kraft">x</Paper>)).sort()).toEqual(["ll-tex-cloud", "ll-tex-fibre", "ll-tex-kraft"])
    expect(tilesIn(renderToString(<Paper stock="receipt">x</Paper>))).toEqual(["ll-tex-cloud"])
  })

  it("three sheets on one page share their tiles: the HTML carries each tile once", () => {
    const html = renderToString(
      <>
        <Paper>a</Paper>
        <Paper>b</Paper>
        <Paper stock="card">c</Paper>
        <Paper stock="slip">d</Paper>
      </>,
    )
    expect(html.match(/--ll-tex-relief:/g)).toHaveLength(1)
    expect(html.match(/--ll-tex-cloud:/g)).toHaveLength(1)
    expect(html.match(/--ll-tex-slip:/g)).toHaveLength(1)
  })

  it("the provider adds no tiles by default (about 100 KB of HTML: the grain masks), and `textures` opts in", () => {
    const bare = renderToString(<InkProvider><span>x</span></InkProvider>)
    expect(bare).not.toContain("--ll-tex-")
    expect(bare.length).toBeLessThan(120_000)
    const desk = renderToString(<InkProvider textures={["linen", "mottle"]}><span>x</span></InkProvider>)
    expect(tilesIn(desk).sort()).toEqual(["ll-tex-linen", "ll-tex-mottle"])
    expect(desk).not.toContain("--ll-tex-relief")
  })

  it("a drawn sheet brings the CSS tiles of its stock too, measured or not, once per page", () => {
    expect(tilesIn(renderToString(<Paper edge="torn" size={[300, 200]}>x</Paper>)).sort()).toEqual(["ll-tex-cloud", "ll-tex-fibre", "ll-tex-relief"])
    expect(tilesIn(renderToString(<Paper edge="torn">x</Paper>)).sort()).toEqual(["ll-tex-cloud", "ll-tex-fibre", "ll-tex-relief"])
    expect(tilesIn(renderToString(<Paper edge="zig" stock="receipt" size={[300, 200]}>x</Paper>))).toEqual(["ll-tex-cloud"])
  })

  it("saturated sticky notes are veiled with their own color, ordinary paper is not", () => {
    for (const stock of ["sticky-orange", "sticky-pink", "sticky-yellow"] as const) {
      const { container, unmount } = render(<Paper stock={stock}>x</Paper>)
      expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--ll-veil"), stock).toBe("45%")
      unmount()
    }
    const { container } = render(<Paper stock="slip">x</Paper>)
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--ll-veil")).toBe("")
    const css = readFileSync(resolve(__dirname, "../src/styles/looseleaf.css"), "utf8")
    expect(css).toMatch(/color-mix\(in srgb, var\(--ll-stock, var\(--ll-paper\)\) var\(--ll-veil, 0%\), transparent\)/)
    expect(css).toMatch(/--ll-veil: initial;/)
  })

  it("a drawn sticky sheet lays the same veil over its tiles", () => {
    const sticky = paperSheet("v", 200, 120, { stock: "sticky-pink", edge: "torn" }).svg
    const plain = paperSheet("v", 200, 120, { stock: "paper", edge: "torn" }).svg
    expect(sticky).toMatch(/fill="var\(--ll-sticky-pink\)" fill-opacity="0\.45"/)
    expect(plain).not.toMatch(/fill-opacity="0\.45"/)
  })
})

describe("the CSS of a drawn sheet (read from looseleaf.css)", () => {
  const css = readFileSync(resolve(__dirname, "../src/styles/looseleaf.css"), "utf8")
  const rule = (sel: RegExp) => sel.exec(css)?.[0] ?? ""

  it("a face wears the cut sheet's paper (one shared declaration block) and is cut by --ll-face-path", () => {
    const shared = rule(/\.ll-paper::before,\s*\.ll-face\s*\{[^}]*\}/)
    expect(shared).toContain("background-color: var(--ll-stock, var(--ll-paper))")
    expect(shared).toContain("var(--ll-tex-paper, var(--ll-tex-fibre), var(--ll-tex-relief), var(--ll-tex-cloud))")
    expect(shared).toContain("rotate: clamp(")
    expect(css).toMatch(/\.ll-face\s*\{[^}]*position: absolute;[^}]*clip-path: var\(--ll-face-path\)/)
  })

  it("the shadow is a plain rectangle: no filter anywhere on a sheet", () => {
    expect(rule(/\.ll-face-shadow\s*\{[^}]*\}/)).not.toMatch(/filter/)
    expect(rule(/svg\[data-ink="sheet"\]\s*\{[^}]*\}/)).not.toMatch(/filter/)
    expect(rule(/svg\[data-ink="sheet"\]\s*\{[^}]*\}/)).toContain("rotate:")
  })

  it("the pieces see their host's tilt, and the hosts' custom properties do not leak into other children", () => {
    expect(css).toContain(':where(.ll-paper) > :where(:not(svg[data-ink="sheet"], [data-slot="paper-face"], [data-slot="paper-shadow"]))')
  })

  it("the faces of a state layer show on the states the layer's svg group shows on", () => {
    expect(css).toMatch(/\[data-slot="paper-face"\]\[data-layer\]\s*\{[^}]*visibility: hidden/)
    expect(css).toMatch(/> \[data-slot="paper-face"\]\[data-layer="checked"\]/)
    expect(css).toMatch(/> \[data-slot="paper-face"\]\[data-layer="open"\]/)
    expect(css).toMatch(/> \[data-slot="paper-face"\]\[data-layer="hover"\]/)
  })
})
