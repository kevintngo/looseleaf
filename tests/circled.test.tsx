import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Circled } from "@/components/ui/circled"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { bleedOf, BLEED_DEFAULT, BLEED_MAX, circledReach, circledRecipe, loopRadii, ONE_LINE_POWER, squareUp, type CircledShape } from "@/lib/ink/recipes/circled-ink"
import { lineMetrics } from "@/lib/ink/recipes/text-marks-ink"
import { THREE_LINES, inkSvgs, mockLines } from "./_marks-lib"
import { describeTextMark } from "./_marks-suite"

describeTextMark({
  name: "Circled",
  slot: "circled",
  kind: "circled",
  tag: "span",
  mode: "box",
  over: true,
  drawOn: "reveal",
  make: (props, children) => <Circled {...props}>{children}</Circled>,
  variants: [{ shape: "box" }, { shape: "brackets" }, { tone: "red" }, { weight: "brush" }],
})

describe("Circled specifics", () => {
  it("exposes the shape and keeps a thin outline as its fallback", () => {
    const { getByText } = render(<Circled shape="box">boxed</Circled>)
    expect(getByText("boxed")).toHaveAttribute("data-shape", "box")
    expect(getByText("boxed")).toHaveClass("outline-1", "data-[ink-ready]:not-focus-visible:outline-none")
  })

  it("draws ONE mark for a phrase that wraps onto three lines, sized to the union", () => {
    const restore = mockLines("circled", THREE_LINES)
    const { getByText } = render(<Circled>a phrase that wraps</Circled>)
    const svgs = inkSvgs(getByText("a phrase that wraps"))
    expect(svgs).toHaveLength(1)
    const pad = circledReach(300, 84, { fs: 17 })
    expect(parseFloat(svgs[0].style.width)).toBeCloseTo(300 + 2 * pad, 0)
    restore()
  })

  it("animate writes the loop on through a mask; plain marks have none", () => {
    const restore = mockLines("circled", THREE_LINES)
    const anim = render(<Circled animate>loop</Circled>)
    expect(inkSvgs(anim.getByText("loop"))[0].innerHTML).toContain('data-part="reveal"')
    anim.unmount()
    const plain = render(<Circled>loop</Circled>)
    expect(inkSvgs(plain.getByText("loop"))[0].innerHTML).not.toContain('data-part="reveal"')
    restore()
  })

  it("the recipe: every shape stays in budget (draw-on too) and is finite", () => {
    const base = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "ink" as const, weight: "regular" as const }
    for (const shape of ["circle", "box", "brackets"] as CircledShape[]) {
      for (const animate of [false, true]) {
        const f = runRecipe(circledRecipe, { box: { w: 120, h: 27 }, params: { ...base, shape, animate }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
        const nodes = (f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length
        expect(nodes, `${shape} ${animate}`).toBeLessThanOrEqual(14)
        expect(f.parts.rest?.length ?? 0, `${shape} ${animate}`).toBeLessThan(9000)
        expect(f.parts.rest, shape).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
  })
})

describe("Circled loop size and bleed", () => {
  const title = { ...lineMetrics(44, 32), tone: "ink" as const, weight: "regular" as const, first: true, last: true, n: 1 }
  const tw = 18.5, th = 15.5

  it("hugs one line of writing: a short word in a title is no taller than the title's line and wider than it is tall", () => {
    const [rx, ry] = loopRadii(tw, th, title, 44)
    expect(2 * ry).toBeLessThanOrEqual(48)
    expect(2 * ry).toBeLessThan(title.ch + 6)
    expect(rx).toBeGreaterThan(ry * 0.9)
    expect(rx - tw).toBeLessThan(title.fs * 0.3)
    expect(rx - tw).toBeGreaterThan(5)
    expect(ry - th).toBeGreaterThan(2)
  })

  it("a one-line loop is squared up so that it clears the corners of the writing (a plain ellipse this close cut the first and last letters)", () => {
    for (const [tw2, th2, fs] of [[18.5, 15.5, 32], [27.5, 8.5, 17], [55, 12, 22], [12, 8, 14]] as const) {
      const p = { ...title, fs, ch: Math.round(fs * 1.4) }
      const [rx, ry] = loopRadii(tw2, th2, p, p.ch)
      const plain = (tw2 / rx) ** 2 + (th2 / ry) ** 2
      const squared = (tw2 / rx) ** ONE_LINE_POWER + (th2 / ry) ** ONE_LINE_POWER
      expect(plain).toBeLessThan(1.4)
      expect(squared).toBeLessThan(plain)
      expect(squared).toBeLessThan(1.1)
    }
    const ring = { pts: Array.from({ length: 73 }, (_, i) => [50 + 30 * Math.cos((i / 72) * 2 * Math.PI), 20 + 12 * Math.sin((i / 72) * 2 * Math.PI)] as [number, number]) }
    for (const [x, y] of squareUp([ring], 50, 20, 30, 12, ONE_LINE_POWER)[0].pts) {
      expect(Math.abs((x - 50) / 30) ** ONE_LINE_POWER + Math.abs((y - 20) / 12) ** ONE_LINE_POWER).toBeCloseTo(1, 5)
    }
  })

  it("a loop round a phrase that wraps keeps the roomy ellipse that clears its corners", () => {
    const [rx, ry] = loopRadii(150, 42, { ...title, fs: 17, ch: 27 }, 84)
    expect(rx).toBeGreaterThan(150 * 1.08)
    expect(ry).toBeGreaterThan(42 * 1.3)
  })

  it("bleed widens the loop in both directions, by whole and half pixels, and is bounded", () => {
    const at = (bleed: number) => loopRadii(tw, th, { ...title, bleed }, 44)
    expect(at(6)[0] - at(0)[0]).toBeCloseTo(6, 5)
    expect(at(6)[1] - at(0)[1]).toBeCloseTo(6, 5)
    expect(bleedOf({})).toBe(BLEED_DEFAULT)
    expect(bleedOf({ bleed: 99 })).toBe(BLEED_MAX)
    expect(bleedOf({ bleed: -5 })).toBe(0)
    expect(bleedOf({ bleed: Number.NaN })).toBe(BLEED_DEFAULT)
    expect(bleedOf({ bleed: 3.3 })).toBe(3.5)
  })

  it("the padding always covers the loop, the wobble of its pen included", () => {
    for (const [w, h, fs] of [[37, 31, 32], [55, 17, 17], [300, 30, 20], [12, 17, 17]] as const) {
      for (const bleed of [0, 2, 8, 16]) {
        const p = { ...title, fs, ch: Math.round(fs * 1.6), bleed }
        const [rx, ry] = loopRadii(w / 2, h / 2, p, h)
        const reach = circledReach(w, h, p)
        expect(rx * 1.1 - w / 2, `${w}x${h} bleed ${bleed} across`).toBeLessThanOrEqual(reach)
        expect(ry * 1.1 - h / 2, `${w}x${h} bleed ${bleed} down`).toBeLessThanOrEqual(reach)
      }
    }
  })

  it("the recipe draws every shape at both ends of the bleed range, finite, in budget", () => {
    const base = { ...lineMetrics(27, 17), first: true, last: true, n: 1, tone: "ink" as const, weight: "regular" as const }
    for (const shape of ["circle", "box", "brackets"] as CircledShape[]) {
      const drawn = [0, 2, 16, 99, Number.NaN].map((bleed) => runRecipe(circledRecipe, { box: { w: 120, h: 27 }, params: { ...base, shape, bleed }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS }).parts.rest ?? "")
      for (const d of drawn) expect(d, shape).not.toMatch(/NaN|undefined|Infinity/)
      expect(drawn[0], shape).not.toBe(drawn[1])
      expect(drawn[1], shape).not.toBe(drawn[2])
      expect(drawn[3], `${shape}: past the maximum is the maximum`).toBe(drawn[2])
      expect(drawn[4], `${shape}: a NaN is the default`).toBe(drawn[1])
    }
  })

  it("the component passes bleed on and makes room for it", () => {
    const restore = mockLines("circled", THREE_LINES)
    const plain = render(<Circled>phrase</Circled>)
    const wPlain = parseFloat(inkSvgs(plain.getByText("phrase"))[0].style.width)
    plain.unmount()
    const roomy = render(<Circled bleed={10}>phrase</Circled>)
    const wRoomy = parseFloat(inkSvgs(roomy.getByText("phrase"))[0].style.width)
    expect(wRoomy).toBeGreaterThan(wPlain)
    expect(wRoomy - wPlain).toBeLessThanOrEqual(2 * 8 + 1)
    restore()
  })
})
