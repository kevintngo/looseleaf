import * as React from "react"
import { render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Quote, QuoteAttribution, QuoteText } from "@/components/ui/quote"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { quoteRecipe } from "@/lib/ink/recipes/quote-ink"
import { describeBlockMark } from "./_block-suite"
import { inkSvgs } from "./_marks-lib"
import { axeCheck, mockBox } from "./helpers"

describeBlockMark({
  name: "Quote",
  slot: "quote-text",
  kind: "quote",
  size: [420, 120],
  drawOn: "reveal",
  make: (props) => <QuoteText {...props}>The best time to write it down was when it happened.</QuoteText>,
  variants: [{ tone: "blue" }, { size: "lg" }, { rule: true }, { weight: "brush" }],
})

describe("Quote parts", () => {
  it("is a figure with a real blockquote and a figcaption, with upstream-style slots", () => {
    const restore = mockBox(420, 120)
    const { container } = render(
      <Quote>
        <QuoteText cite="https://example.com/x">Write it down.</QuoteText>
        <QuoteAttribution>Ada</QuoteAttribution>
      </Quote>,
    )
    const fig = container.querySelector("figure")!
    expect(fig).toHaveAttribute("data-slot", "quote")
    const bq = fig.querySelector("blockquote")!
    expect(bq).toHaveAttribute("data-slot", "quote-text")
    expect(bq).toHaveAttribute("cite", "https://example.com/x")
    expect(fig.querySelector("figcaption")).toHaveAttribute("data-slot", "quote-attribution")
    expect(fig.querySelector("figcaption")).toHaveTextContent("Ada")
    expect(bq.textContent).toBe("Write it down.")
    restore()
  })

  it("the figure hugs its words and keeps to the top of its cell, so a grid cannot pull the closing marks away from the text", () => {
    const { container } = render(
      <Quote>
        <QuoteText>Short.</QuoteText>
      </Quote>,
    )
    expect(container.querySelector("figure")).toHaveClass("w-fit", "max-w-full", "self-start", "justify-self-start", "content-start")
  })

  it("size sets the room for the marks; the browser's own opening mark stands in until the drawing exists (server markup)", () => {
    const { getByTestId } = render(<QuoteText data-testid="q" size="lg">x</QuoteText>)
    expect(getByTestId("q")).toHaveClass("ps-[4.75rem]")
    const html = renderToString(<QuoteText size="lg">x</QuoteText>)
    expect(html).toContain("before:content-[&#x27;\\201C&#x27;]")
  })

  it("draws no fallback glyph once drawn, and none when hidden or animating", () => {
    const restore = mockBox(420, 120)
    const a = render(<QuoteText data-testid="a">x</QuoteText>)
    expect(a.getByTestId("a").className).not.toMatch(/(^| )before:content/)
    a.unmount()
    const b = render(<QuoteText data-testid="b" show={false}>x</QuoteText>)
    expect(b.getByTestId("b").className).not.toMatch(/(^| )before:content/)
    restore()
  })

  it("the marks are decoration and the text is not inside an svg; axe is clean", async () => {
    const restore = mockBox(420, 120)
    const { container } = render(
      <Quote>
        <QuoteText>Words.</QuoteText>
        <QuoteAttribution>Ada</QuoteAttribution>
      </Quote>,
    )
    expect(inkSvgs(container.querySelector("blockquote")!)).toHaveLength(1)
    expect(container.querySelector("svg text")).toBeNull()
    await axeCheck(container)
    restore()
  })

  it("the recipe: budgets with and without the rule, and mirrored in rtl", () => {
    const base = { tone: "marker" as const, weight: "regular" as const, size: 32, rule: false }
    const run = (p: object, dir: "ltr" | "rtl" = "ltr", h = 140) => runRecipe(quoteRecipe, { box: { w: 420, h }, params: { ...base, ...p }, seed: "s", tier: "lo", density: "comfortable", dir, knobs: DEFAULT_KNOBS })
    for (const rule of [false, true]) {
      for (const animate of [false, true]) {
        const f = run({ rule, animate })
        expect((f.parts.rest?.match(/<(path|g|use|clipPath|mask)\b/g) ?? []).length).toBeLessThanOrEqual(16)
        expect(f.parts.rest?.length ?? 0).toBeLessThan(9000)
        expect(f.parts.rest).not.toMatch(/NaN|undefined|Infinity/)
      }
    }
    expect(run({}, "rtl").parts.rest).not.toBe(run({}).parts.rest)
    expect(run({}, "ltr", 30).parts.rest).not.toMatch(/NaN/)
  })
})
