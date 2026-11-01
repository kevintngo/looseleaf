import * as React from "react"
import { renderToString } from "react-dom/server"
import { render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { cardRuleRecipe, type CardRuleStyle } from "@/lib/ink/recipes/card-ink"
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

function Full(props: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what lands in your inbox.</CardDescription>
        <CardAction>
          <Button size="sm">Reset</Button>
        </CardAction>
      </CardHeader>
      <CardContent>content</CardContent>
      <CardFooter>footer</CardFooter>
    </Card>
  )
}

describe("Card", () => {
  it("has every upstream part with its data-slot", () => {
    const { container } = render(<Full />)
    for (const slot of ["card", "card-header", "card-title", "card-description", "card-action", "card-content", "card-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(container.firstElementChild).toHaveAttribute("data-slot", "card")
    expect(container.firstElementChild!.tagName).toBe("DIV")
  })

  it("keeps shadcn's spacing semantics: a flex column with gap and py 6, header container grid, px-6 content, action on the right", () => {
    const { container } = render(<Full />)
    const q = (s: string) => container.querySelector(`[data-slot="${s}"]`) as HTMLElement
    expect(q("card")).toHaveClass("flex", "flex-col", "gap-6", "py-6", "text-card-foreground")
    expect(q("card-header").className).toContain("@container/card-header")
    expect(q("card-header")).toHaveClass("grid", "auto-rows-min", "grid-rows-[auto_auto]", "items-start", "gap-2", "px-6")
    expect(q("card-header").className).toContain("has-data-[slot=card-action]:grid-cols-[1fr_auto]")
    expect(q("card-header").className).toContain("[.border-b]:pb-6")
    expect(q("card-content")).toHaveClass("px-6")
    expect(q("card-footer")).toHaveClass("flex", "items-center", "px-6")
    expect(q("card-footer").className).toContain("[.border-t]:pt-6")
    expect(q("card-action")).toHaveClass("col-start-2", "row-span-2", "row-start-1", "self-start", "justify-self-end")
    expect(q("card-description")).toHaveClass("text-sm", "text-muted-foreground")
  })

  it("titles are set in the script font", () => {
    const { getByText } = render(<CardTitle>Hi</CardTitle>)
    expect(getByText("Hi")).toHaveClass("font-script", "leading-none", "font-semibold")
  })

  it("is a Paper: card stock by default, any stock, edge, tape and fastener", () => {
    const { container } = render(<Full />)
    const c = container.firstElementChild as HTMLElement
    expect(c).toHaveAttribute("data-stock", "card")
    expect(c).toHaveAttribute("data-edge", "cut")
    expect(c).toHaveClass("ll-paper", "ll-stock-paper", "ll-sheet-card")
    expect(container.querySelector("svg")).toBeNull()
    const { container: c2 } = render(<Full stock="index-card" tape="both" fastener="pin" seed="x" />)
    expect((c2.firstElementChild as HTMLElement)).toHaveAttribute("data-stock", "index-card")
    expect(c2.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(2)
    expect(c2.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
  })

  it("draws a torn edge once it is measured", () => {
    mockBox(360, 220)
    const { container } = render(<Full edge="torn" />)
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
    expect(container.firstElementChild).toHaveAttribute("data-edge", "torn")
  })

  it("passes className, ref and props through every part", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(
      <Card ref={ref} className="w-80" data-testid="c" aria-label="notes" id="c1">
        <CardHeader className="bg-red" data-testid="h" />
        <CardFooter className="justify-end" data-testid="f" />
      </Card>,
    )
    expect(getByTestId("c")).toHaveClass("w-80", "flex", "ll-paper")
    expect(ref.current).toBe(getByTestId("c"))
    expect(getByTestId("c")).toHaveAttribute("aria-label", "notes")
    expect(getByTestId("h")).toHaveClass("bg-red", "px-6")
    expect(getByTestId("f")).toHaveClass("justify-end", "px-6")
  })
})

describe("Card dividers", () => {
  it("border-b and border-t ask for a drawn pencil rule; without them nothing is drawn", () => {
    mockBox(360, 80)
    const { container, rerender } = render(
      <Card>
        <CardHeader className="border-b" />
        <CardFooter className="border-t" />
      </Card>,
    )
    const rules = container.querySelectorAll('svg[data-ink="rule"]')
    expect(rules).toHaveLength(2)
    for (const r of rules) {
      expect(r).toHaveAttribute("aria-hidden", "true")
      expect(r.parentElement).toHaveAttribute("data-ink-host")
      expect(r.querySelectorAll(":scope > g[data-layer]")).toHaveLength(1)
    }
    expect((container.querySelector('[data-slot="card-header"]') as HTMLElement).className).toContain("[.border-b]:border-transparent")
    rerender(
      <Card>
        <CardHeader />
        <CardFooter />
      </Card>,
    )
    expect(container.querySelectorAll('svg[data-ink="rule"]')).toHaveLength(0)
    expectInkLayers(container, { min: 0 })
  })

  it.each<CardRuleStyle>(["pencil", "dashed", "wavy"])("rule style %s is a recipe with one rest layer, deterministic", (style) => {
    const req = { box: { w: 320, h: 60 }, params: { edge: "bottom" as const, style }, seed: "d", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    const a = runRecipe(cardRuleRecipe, req)
    expect(a.layers).toEqual(["rest"])
    expect(a.parts.rest).toBe(runRecipe(cardRuleRecipe, req).parts.rest)
    expect(a.parts.rest).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/i)
    expect(a.parts.rest!.length).toBeLessThan(9000)
    const calm = runRecipe(cardRuleRecipe, { ...req, density: "calm" })
    expect(calm.parts.rest!.length).toBeLessThan(a.parts.rest!.length + 1)
  })

  it("the divider style is a prop of the part", () => {
    mockBox(360, 80)
    const a = render(<CardHeader className="border-b" rule="dashed" />).container.innerHTML
    const b = render(<CardHeader className="border-b" rule="pencil" />).container.innerHTML
    expect(a).not.toBe(b)
  })
})

describe("Card server markup", () => {
  it("is deterministic and free of NaN", () => {
    const ui = (
      <Card seed="ssr" stock="index-card" tape="corner" rules="ruled">
        <CardHeader className="border-b">
          <CardTitle>t</CardTitle>
        </CardHeader>
      </Card>
    )
    const html = renderToString(ui)
    expect(renderToString(ui)).toBe(html)
    expect(html).not.toMatch(/NaN|undefined/)
  })
})

describe("Card accessibility", () => {
  it("has no violations, with every part, tape, a fastener and a torn edge", async () => {
    mockBox(360, 220)
    const { container } = renderUI(
      <Full as="section" aria-label="Notifications" edge="torn" tape="top" fastener="clip" />,
    )
    await axeCheck(container)
  })
})
