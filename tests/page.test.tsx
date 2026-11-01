import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Page, PageContent, PageDescription, PageFooter, PageHeader, PageTitle } from "@/components/ui/page"
import { PAGE_HOLE, pageHoles, pageRecipe } from "@/lib/ink/recipes/page-ink"
import { titleMarkRecipe } from "@/lib/ink/recipes/paper-set-ink"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(560, 720)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Full(props: React.ComponentProps<typeof Page>) {
  return (
    <Page {...props}>
      <PageHeader>
        <PageTitle>Field notes</PageTitle>
        <PageDescription>A week of small observations.</PageDescription>
      </PageHeader>
      <PageContent>
        <p>Tuesday. Rain on the window.</p>
      </PageContent>
      <PageFooter>
        <span>- 3 -</span>
      </PageFooter>
    </Page>
  )
}

describe("Page", () => {
  it("renders every part with its data-slot, the title as an h1", () => {
    const { container, getByRole } = render(<Full />)
    for (const slot of ["page", "page-header", "page-title", "page-description", "page-content", "page-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(getByRole("heading", { level: 1, name: "Field notes" })).toHaveAttribute("data-slot", "page-title")
    expect(container.firstElementChild).toHaveAttribute("data-slot", "page")
    expect(container.firstElementChild!.tagName).toBe("DIV")
  })

  it("is a Paper: paper stock by default, any stock, rules, tape and fastener; the element is yours to choose", () => {
    const { container } = render(<Full as="main" stock="graph" tape="both" fastener="pin" seed="x" />)
    const page = container.firstElementChild as HTMLElement
    expect(page.tagName).toBe("MAIN")
    expect(page).toHaveClass("ll-paper")
    expect(page).toHaveAttribute("data-stock", "graph")
    expect(container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(2)
    expect(container.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
  })

  it("is a centered column whose width is a prop", () => {
    const { container, rerender } = render(<Full />)
    const page = container.firstElementChild as HTMLElement
    expect(page).toHaveClass("mx-auto", "w-full", "max-w-2xl", "flex", "flex-col", "gap-6")
    rerender(<Full width="sm" />)
    expect(page).toHaveClass("max-w-lg")
    rerender(<Full width="full" />)
    expect(page).toHaveClass("max-w-none")
  })

  it("passes className, ref, style and props through every part", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByTestId } = render(
      <Page ref={ref} className="w-96" style={{ minHeight: 100 }} data-testid="p" aria-label="notes" id="p1">
        <PageHeader className="pb-0" data-testid="h" />
        <PageTitle className="text-red" data-testid="t" />
        <PageContent className="gap-8" data-testid="c" />
        <PageFooter className="justify-end" data-testid="f" />
      </Page>,
    )
    expect(getByTestId("p")).toHaveClass("w-96", "ll-paper")
    expect(getByTestId("p").style.minHeight).toBe("100px")
    expect(ref.current).toBe(getByTestId("p"))
    expect(getByTestId("p")).toHaveAttribute("aria-label", "notes")
    expect(getByTestId("h")).toHaveClass("pb-0")
    expect(getByTestId("t")).toHaveClass("text-red", "font-script")
    expect(getByTestId("c")).toHaveClass("gap-8", "flex-1")
    expect(getByTestId("f")).toHaveClass("justify-end", "mt-auto")
  })

  it("a plain page draws nothing but its title mark; holes and a stain add a second layer of ink on the root", () => {
    const { container, rerender } = render(<Full />)
    expect(container.querySelectorAll('svg[data-ink="page"]')).toHaveLength(0)
    expect(container.querySelectorAll('svg[data-ink="mark"]')).toHaveLength(1)
    rerender(<Full holes />)
    const page = container.firstElementChild as HTMLElement
    const decor = container.querySelector('svg[data-ink="page"]')
    expect(decor).not.toBeNull()
    expect(decor!.parentElement).toBe(page)
    expect(page).toHaveAttribute("data-holes", "start")
    expect(page).toHaveAttribute("data-ink-host")
    expect(page).toHaveAttribute("data-ink-ready")
    expectInkLayers(container, { min: 2, kinds: ["page", "mark"], absolute: true, layers: ["rest"] })
  })

  it("the holes' svg is exactly the page's box (no bleed): a page as wide as the window used to scroll the window sideways by the svg's 24 px pad", () => {
    const { container } = render(<Full holes stain reinforced seed="flush" />)
    const decor = container.querySelector<SVGElement>('svg[data-ink="page"]')!
    expect(pageRecipe.pad).toBe(0)
    expect(decor.getAttribute("viewBox")).toMatch(/^-?0 -?0 560 720$/)
    expect(decor.style.width).toMatch(/^calc\(100% \+ -?0px\)$/)
    expect(decor.style.overflow).toBe("visible")
  })

  it("holes turn with the sheet: the decoration reads the same seeded tilt as the sheet, and tilt={false} lays both square", () => {
    const { container, rerender } = render(<Full holes seed="tilted" />)
    const page = container.firstElementChild as HTMLElement
    const tilt = page.style.getPropertyValue("--ll-tilt")
    expect(tilt).toMatch(/^-?\d*\.?\d+deg$/)
    expect(page.style.getPropertyValue("--ll-tilt-decor")).toBe(tilt)
    expect(page.className).toContain("--ll-tilt-decor")
    rerender(<Full holes seed="tilted" tilt={false} />)
    expect(page.style.getPropertyValue("--ll-tilt-decor")).toBe("0deg")
    rerender(<Full holes seed="tilted" tilt={0.4} />)
    expect(page.style.getPropertyValue("--ll-tilt-decor")).toBe("0.4deg")
  })

  it("mirrors the ruled-paper rules for right-to-left pages", () => {
    const { container } = render(<Full stock="paper" rules="ruled" />)
    expect((container.firstElementChild as HTMLElement).className).toContain("rtl:[&>[data-slot=paper-rules]]:-scale-x-100")
  })

  it("torn is a shorthand for the edge; edge wins", () => {
    const { container, rerender } = render(<Full torn />)
    const page = container.firstElementChild as HTMLElement
    expect(page).toHaveAttribute("data-edge", "torn")
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
    rerender(<Full torn="both" edge="deckle" />)
    expect(page).toHaveAttribute("data-edge", "deckle")
    rerender(<Full />)
    expect(page).toHaveAttribute("data-edge", "cut")
  })

  it("the title mark can be any of four kinds, or none", () => {
    const html = (u: React.ComponentProps<typeof PageTitle>["underline"]) => {
      const { container, unmount } = render(<PageTitle underline={u} seed="t">Hello</PageTitle>)
      const svg = container.querySelector('svg[data-ink="mark"]')
      const out = svg ? svg.innerHTML : null
      unmount()
      return out
    }
    const single = html("single")
    expect(single).toBeTruthy()
    expect(html("double")).not.toBe(single)
    expect(html("wavy")).not.toBe(single)
    expect(html("highlight")).not.toBe(single)
    expect(html("none")).toBeNull()
  })

  it("the title is an element of your choice and stays an accessible heading with a decorative mark", async () => {
    const { container, getByRole } = renderUI(
      <main>
        <PageTitle as="h2">Chapter two</PageTitle>
      </main>,
    )
    expect(getByRole("heading", { level: 2, name: "Chapter two" })).toBeInTheDocument()
    const svg = container.querySelector('svg[data-ink="mark"]')!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    await axeCheck(container)
  })

  it("has no axe violations (plain, punched, torn, in a main landmark)", async () => {
    const { container } = renderUI(
      <main>
        <Full holes reinforced stain torn seed="a11y" />
      </main>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    const ui = <Full holes stain size={[560, 720]} seed="ssr" />
    const html = expectSsrStable(ui)
    expect(html).toContain('data-ink="page"')
    expectHydrates(<Full holes reinforced seed="h" />, 'svg[data-ink="page"]', [560, 720])
    expectHydrates(<Full seed="h2" />, 'svg[data-ink="mark"]')
  })

  it("inside a calm provider the sheet and the holes are flat", () => {
    const { container } = render(
      <InkProvider density="calm">
        <Full holes />
      </InkProvider>,
    )
    expect(container.querySelector('svg[data-ink="page"]')).not.toBeNull()
  })
})

describe("pageRecipe", () => {
  const p = { holes: "start" as const, reinforce: false, stain: false }

  it("punches three holes on a tall page, two on a medium one, one on a short one", () => {
    expect(pageHoles(560, 720, "start")).toHaveLength(3)
    expect(pageHoles(560, 300, "start")).toHaveLength(2)
    expect(pageHoles(560, 120, "start")).toHaveLength(1)
    expect(pageHoles(560, 720, "top")).toHaveLength(2)
    expect(pageHoles(560, 720, "none")).toHaveLength(0)
    const [a, b, c] = pageHoles(560, 1100, "start")
    expect(b[1]).toBe(550)
    expect(b[1] - a[1]).toBeCloseTo(c[1] - b[1], 0)
    expect(a[0]).toBe(PAGE_HOLE.inset)
  })

  it("is deterministic per seed, differs across seeds, and stays clean at every size, density and tier", () => {
    const a = run(pageRecipe, p, 560, 720).parts.rest!
    expect(a).toBe(run(pageRecipe, p, 560, 720).parts.rest)
    expect(a).not.toBe(run(pageRecipe, p, 560, 720, { seed: "other" }).parts.rest)
    for (const [w, h] of [[80, 60], [320, 200], [560, 720], [1200, 1600]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [p, { holes: "top" as const, reinforce: true, stain: true }, { holes: "none" as const, reinforce: false, stain: true }]) {
            const f = run(pageRecipe, params, w, h, { density, tier })
            expect(f.layers).toEqual(["rest"])
            expectClean(f.parts.rest!)
          }
        }
      }
    }
  })

  it("stays inside the budget: a punched page is a few small shapes", () => {
    const f = run(pageRecipe, { holes: "start", reinforce: true, stain: false }, 560, 720).parts.rest!
    expect(nodes(f)).toBeLessThan(60)
    expect(f.length).toBeLessThan(6000)
  })

  it("the punch and its gummed rings lie inside the sheet, which is why the drawing needs no pad", () => {
    const ring = PAGE_HOLE.r + 5.4 + 1
    for (const [w, h] of [[320, 200], [360, 480], [560, 720], [1000, 1400]]) {
      for (const holes of ["start", "top"] as const) {
        for (const [x, y] of pageHoles(w, h, holes)) {
          expect(x - ring, `${holes} ${w}x${h} left`).toBeGreaterThanOrEqual(0)
          expect(y - ring, `${holes} ${w}x${h} top`).toBeGreaterThanOrEqual(0)
          expect(x + ring, `${holes} ${w}x${h} right`).toBeLessThanOrEqual(w)
          expect(y + ring, `${holes} ${w}x${h} bottom`).toBeLessThanOrEqual(h)
        }
      }
    }
  })

  it("mirrors the holes for right-to-left pages", () => {
    const ltr = run(pageRecipe, p, 560, 720).parts.rest!
    const rtl = run(pageRecipe, p, 560, 720, { dir: "rtl" }).parts.rest!
    expect(rtl).toContain("scale(-1 1)")
    expect(ltr).not.toContain("scale(-1 1)")
  })
})

describe("titleMarkRecipe", () => {
  it("draws a mark for each kind, hairline in calm density", () => {
    for (const kind of ["single", "double", "wavy", "highlight"] as const) {
      const f = run(titleMarkRecipe, { kind }, 240, 52)
      expect(f.layers).toEqual(["rest"])
      expectClean(f.parts.rest!)
    }
    const calm = run(titleMarkRecipe, { kind: "double" }, 240, 52, { density: "calm" }).parts.rest!
    expect(calm.length).toBeLessThan(run(titleMarkRecipe, { kind: "double" }, 240, 52).parts.rest!.length)
  })
})
