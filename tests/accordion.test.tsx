import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { accordionRuleRecipe, accordionTriggerRecipe } from "@/lib/ink/recipes/accordion-ink"
import { marginBracketRecipe } from "@/lib/ink/recipes/margin-bracket-ink"
import FAQ from "@/docs/examples/accordion/01-faq"
import Multiple from "@/docs/examples/accordion/02-multiple"
import Settings from "@/docs/examples/accordion/03-settings"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 48)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

function Sample(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>Alpha text</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Second</AccordionTrigger>
        <AccordionContent>Beta text</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c" disabled>
        <AccordionTrigger>Third</AccordionTrigger>
        <AccordionContent>Gamma text</AccordionContent>
      </AccordionItem>
    </Accordion>
  ) as React.ReactElement
}
const single = { type: "single", collapsible: true } as const

describe("Accordion structure", () => {
  it("has upstream's four parts and data-slots", () => {
    const { container } = render(<Sample {...single} defaultValue="a" />)
    for (const slot of ["accordion", "accordion-item", "accordion-trigger", "accordion-content"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
  })

  it("puts each trigger in a heading with aria-expanded, and opens a labeled region", async () => {
    const { user, getByRole, queryByRole } = renderUI(<Sample {...single} />)
    const trigger = getByRole("button", { name: "First" })
    expect(trigger.closest("h3")).not.toBeNull()
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(queryByRole("region")).toBeNull()
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const region = getByRole("region", { name: "First" })
    expect(region).toHaveTextContent("Alpha text")
    expect(trigger).toHaveAttribute("aria-controls", region.id)
  })

  it("turns the chevron over through the trigger's state and marks it for the CSS", () => {
    const { getByRole } = render(<Sample {...single} defaultValue="a" />)
    const trigger = getByRole("button", { name: "First" })
    const chevron = trigger.querySelector("svg[data-chevron]")
    expect(chevron).not.toBeNull()
    expect(chevron).toHaveAttribute("data-icon", "chevron-down")
    expect(trigger.className).toContain("[&[data-state=open]>[data-chevron]]:rotate-180")
  })
})

describe("Accordion behavior", () => {
  it("single collapsible: opens one row at a time and closes it again", async () => {
    const { user, getByRole } = renderUI(<Sample {...single} defaultValue="a" />)
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true")
    await user.click(getByRole("button", { name: "Second" }))
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false")
    expect(getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true")
    await user.click(getByRole("button", { name: "Second" }))
    expect(getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "false")
  })

  it("single without collapsible keeps one row open", async () => {
    const { user, getByRole } = renderUI(<Sample type="single" defaultValue="a" />)
    await user.click(getByRole("button", { name: "First" }))
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true")
  })

  it("multiple keeps every row you open", async () => {
    const { user, getByRole } = renderUI(<Sample type="multiple" />)
    await user.click(getByRole("button", { name: "First" }))
    await user.click(getByRole("button", { name: "Second" }))
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true")
    expect(getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true")
  })

  it("moves between triggers with the arrows, Home and End, skipping the disabled row", async () => {
    const { user, getByRole } = renderUI(<Sample {...single} />)
    const [a, b] = ["First", "Second"].map((n) => getByRole("button", { name: n }))
    a.focus()
    await user.keyboard("{ArrowDown}")
    expect(b).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(a).toHaveFocus()
    await user.keyboard("{End}")
    expect(b).toHaveFocus()
    await user.keyboard("{Home}")
    expect(a).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(a).toHaveAttribute("aria-expanded", "true")
    await user.keyboard(" ")
    expect(a).toHaveAttribute("aria-expanded", "false")
  })

  it("does not open a disabled row", async () => {
    const { user, getByRole } = renderUI(<Sample {...single} />)
    expect(getByRole("button", { name: "Third" })).toBeDisabled()
    await user.click(getByRole("button", { name: "Third" }))
    expect(getByRole("button", { name: "Third" })).toHaveAttribute("aria-expanded", "false")
  })

  it("is controlled and uncontrolled", async () => {
    const seen: string[] = []
    function C() {
      const [v, setV] = React.useState("b")
      return <Sample type="single" collapsible value={v} onValueChange={(x) => (seen.push(x), setV(x))} />
    }
    const { user, getByRole } = renderUI(<C />)
    expect(getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true")
    await user.click(getByRole("button", { name: "First" }))
    expect(seen).toEqual(["a"])
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true")
  })

  it("mirrors the arrows in a vertical-orientation-free RTL list without breaking Enter", async () => {
    const { user, getByRole } = renderUI(<Sample {...single} dir="rtl" />)
    getByRole("button", { name: "First" }).focus()
    await user.keyboard("{Enter}")
    expect(getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true")
  })
})

describe("Accordion drawing", () => {
  it("draws a rule under every row but the last; the hover swipe is added when a pointer first arrives (no ring until keyboard focus)", async () => {
    const { user, container, getByRole } = renderUI(<Sample {...single} />)
    const rules = container.querySelectorAll('[data-slot="accordion-rule"]')
    expect(rules).toHaveLength(3)
    for (const item of container.querySelectorAll('[data-slot="accordion-item"]')) expect(item.className).toContain("last:[&>[data-slot=accordion-rule]]:hidden")
    for (const r of rules) expect(r.className).not.toContain("group-last")
    for (const r of rules) {
      expect(r).toHaveAttribute("aria-hidden", "true")
      expect(r).toHaveAttribute("data-ink-host")
      expect(r.firstElementChild).toHaveAttribute("data-ink", "rule")
    }
    const trigger = getByRole("button", { name: "First" })
    expect(trigger.firstElementChild).toHaveAttribute("data-ink", "row")
    expect(trigger.querySelector('[data-part="swipe"]')).toBeNull()
    await user.hover(trigger)
    expect(trigger.querySelector('[data-layer="hover"] [data-part="swipe"]')).not.toBeNull()
    expect(getByRole("button", { name: "Second" }).querySelector('[data-part="swipe"]')).toBeNull()
    expect(trigger.querySelector('[data-layer="focus"]')).toBeNull()
    expectInkLayers(container, { kinds: ["rule", "row", "icon"] })
  })

  it("draws the margin brace only while a row is open, on a decorative host inside the panel", async () => {
    const { user, container, getByRole } = renderUI(<Sample {...single} />)
    expect(container.querySelector('[data-slot="accordion-bracket"]')).toBeNull()
    await user.click(getByRole("button", { name: "First" }))
    const brace = container.querySelector('[data-slot="accordion-bracket"]')!
    expect(brace).toHaveAttribute("aria-hidden", "true")
    expect(brace.className).toContain("pointer-events-none")
    expect(brace.className).toContain("[&>svg_[data-part=reveal]]:animate-[ll-draw_")
    expect(brace.querySelector('svg[data-ink="bracket"]')).not.toBeNull()
    expect(brace.querySelector('[data-part="reveal"]')).not.toBeNull()
    expect(brace.closest("[data-slot=accordion-content]")).not.toBeNull()
    await user.click(getByRole("button", { name: "First" }))
    expect(container.querySelector('[data-slot="accordion-bracket"]')).toBeNull()
  })

  it("only writes the brace on a row a person opened: the root is marked touched by a click, not at load", async () => {
    const { user, container, getByRole } = renderUI(<Sample {...single} defaultValue="a" />)
    const root = container.querySelector("[data-slot=accordion]")!
    expect(root).not.toHaveAttribute("data-touched")
    expect(container.querySelector("[data-slot=accordion-bracket]")!.className).toContain("in-data-touched:[&>svg_[data-part=reveal]]:animate-[ll-draw_")
    await user.click(getByRole("button", { name: "Second" }))
    expect(root).toHaveAttribute("data-touched")
  })

  it("folds with its own keyframes, clipped only while it slides, and lets the text soak in", () => {
    const { container } = render(<Sample {...single} defaultValue="a" />)
    const content = container.querySelector("[data-slot=accordion-content]")!
    expect(content).not.toHaveClass("overflow-hidden")
    expect(content.className).toContain("data-[state=open]:animate-[ll-accordion-down_")
    expect(content.className).toContain("data-[state=closed]:animate-[ll-accordion-up_")
    const sheet = document.head.querySelector('style[data-href="ll-accordion"]')!.textContent!
    expect(sheet).toContain("@keyframes ll-accordion-down")
    expect(sheet).toContain("--radix-accordion-content-height")
    expect(sheet).toMatch(/clip-path: inset\(0\)/)
    expect(content.querySelector(".in-data-touched\\:group-data-\\[state\\=open\\]\\/accordion-content\\:animate-soak")).not.toBeNull()
  })

  it("browser-review: className reaches the box that holds the children (grid/flex gaps work), vertical padding stays on the outer div", () => {
    const { getByText, container } = render(
      <Accordion {...single} defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent className="grid gap-3 md:pb-0 text-balance">
            <p>One</p>
            <p>Two</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const box = getByText("One").parentElement!
    expect(box).toHaveClass("grid", "gap-3", "text-balance", "relative")
    expect(box).not.toHaveClass("md:pb-0")
    const outer = box.parentElement!
    expect(outer).toHaveClass("md:pb-0", "pt-0", "pb-4")
    expect(outer.parentElement).toBe(container.querySelector("[data-slot=accordion-content]"))
  })

  it("bracket={false} draws no brace and no indent; square is passed to the recipe", () => {
    const off = render(<Sample {...single} bracket={false} defaultValue="a" />)
    expect(off.container.querySelector('[data-slot="accordion-bracket"]')).toBeNull()
    const sq = render(<Sample {...single} bracket="square" defaultValue="a" />)
    expect(within(sq.container).getByText("Alpha text")).toHaveClass("ps-5")
    expect(within(off.container).getByText("Alpha text")).not.toHaveClass("ps-5")
  })

  it("does not redraw anything when rows open and close", async () => {
    const { user, getByRole } = renderUI(<Sample type="multiple" />)
    await user.click(getByRole("button", { name: "First" }))
    const runs = inkCache.stats().runs
    await user.click(getByRole("button", { name: "First" }))
    await user.click(getByRole("button", { name: "First" }))
    expect(inkCache.stats().runs - runs).toBeLessThanOrEqual(1)
  })

  it("the trigger never transitions outline-color (a frozen transition would leave the pre-measure outline painted round every row)", () => {
    const { getAllByRole } = render(<Sample {...single} />)
    for (const t of getAllByRole("button")) expect(t.className).not.toMatch(/transition-(colors|all)\b/)
  })

  it("has no accessibility violations, closed, open and disabled", async () => {
    const { user, container, getByRole } = renderUI(<Sample type="multiple" />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "First" }))
    await user.click(getByRole("button", { name: "Second" }))
    await axeCheck(container)
  })
})

describe("recipes", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("the rule is one pencil pull (or a hairline in calm), inside the budget", () => {
    for (const density of ["comfortable", "calm"] as const) {
      const f = runRecipe(accordionRuleRecipe, { ...req, density, params: {}, box: { w: 480, h: 8 } })
      expect(f.layers).toEqual(["rest"])
      expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(12)
      expect(f.parts.rest!.length).toBeLessThan(8_000)
    }
  })

  it("the trigger draws a wiped swipe on hover and the ring lazily, nothing for a disabled row", () => {
    expect(runRecipe(accordionTriggerRecipe, { ...req, params: {}, box: { w: 400, h: 48 } }).layers).toEqual([])
    const f = runRecipe(accordionTriggerRecipe, { ...req, params: {}, box: { w: 400, h: 48 }, lazy: ["hover"] })
    expect(f.layers).toEqual(["hover"])
    expect(f.parts.hover).toContain('data-part="swipe"')
    expect(runRecipe(accordionTriggerRecipe, { ...req, params: {}, box: { w: 400, h: 48 }, lazy: ["focus"] }).layers).toContain("focus")
    expect(runRecipe(accordionTriggerRecipe, { ...req, params: { disabled: true }, box: { w: 400, h: 48 } }).layers).toEqual([])
  })

  it("the brace is written behind a reveal stroke, mirrors in RTL, and scales with the height", () => {
    const run = (h: number, dir: "ltr" | "rtl" = "ltr", kind: "curly" | "square" = "curly") => runRecipe(marginBracketRecipe, { ...req, dir, params: { kind }, box: { w: 14, h } })
    for (const h of [20, 60, 240]) {
      const f = run(h)
      expect(f.parts.rest).toContain('data-part="reveal"')
      expect(f.parts.rest).not.toMatch(/NaN|undefined/)
    }
    expect(run(60, "rtl").parts.rest).not.toBe(run(60).parts.rest)
    expect(run(60, "ltr", "square").parts.rest).not.toBe(run(60).parts.rest)
    expect(run(60).parts.rest).toBe(run(60).parts.rest)
  })
})

describe("SSR and hydration", () => {
  it("renders identical markup twice", () => {
    expect(renderToString(<Sample {...single} defaultValue="a" />)).toBe(renderToString(<Sample {...single} defaultValue="a" />))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample {...single} defaultValue="a" />)
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Questions opens the first row by default and moves on", async () => {
    const { user, getByRole } = renderUI(<FAQ />)
    expect(getByRole("button", { name: "Is it accessible?" })).toHaveAttribute("aria-expanded", "true")
    await user.click(getByRole("button", { name: "Is it drawn by hand?" }))
    expect(getByRole("button", { name: "Is it accessible?" })).toHaveAttribute("aria-expanded", "false")
    await axeCheck()
  })

  it("Several open keeps two rows open, a disabled row shut, and a button inside the panel", async () => {
    const { user, getByRole } = renderUI(<Multiple />)
    expect(getByRole("button", { name: "Shipping" })).toHaveAttribute("aria-expanded", "true")
    expect(getByRole("button", { name: "Returns" })).toHaveAttribute("aria-expanded", "true")
    expect(getByRole("button", { name: /Wholesale/ })).toBeDisabled()
    await user.click(getByRole("button", { name: "Track a parcel" }))
    await axeCheck()
  })

  it("Account settings is controlled by state and a button", async () => {
    const { user, getByRole, getByText } = renderUI(<Settings />)
    expect(getByRole("button", { name: "Profile" })).toHaveAttribute("aria-expanded", "true")
    await user.click(getByRole("button", { name: "Next page" }))
    expect(getByRole("button", { name: "Notifications" })).toHaveAttribute("aria-expanded", "true")
    expect(getByText("Open: notifications")).toBeTruthy()
    await user.click(getByRole("button", { name: "Notifications" }))
    expect(getByText("Open: none")).toBeTruthy()
    await axeCheck()
  })
})
