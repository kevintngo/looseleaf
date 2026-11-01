import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Desk, DeskObjects } from "@/components/ui/desk"
import { DESK_OBJECTS, pencil } from "@/lib/ink/recipes/desk-ink"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable } from "./_paper-set"

afterEach(() => {
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

describe("Desk", () => {
  it("is the desk surface: ll-desk on a relative, isolated root, children inside", () => {
    const { container, getByText } = render(
      <Desk data-testid="d" className="min-h-40 p-6">
        <p>on the desk</p>
      </Desk>,
    )
    const desk = container.querySelector('[data-slot="desk"]') as HTMLElement
    expect(desk).toHaveClass("ll-desk", "relative", "isolate", "min-h-40", "p-6")
    expect(desk.tagName).toBe("DIV")
    expect(desk).toContainElement(getByText("on the desk"))
    expect(container.querySelector('[data-slot="desk-objects"]')).toBeNull()
  })

  it("brings its own textures, once, as deduplicated style tags in <head> (no provider needed)", () => {
    render(
      <>
        <Desk />
        <Desk />
      </>,
    )
    expect(document.head.querySelectorAll('style[data-href="ll-tex-linen"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('style[data-href="ll-tex-linen"]')).toHaveLength(1)
    expect(document.head.querySelector('style[data-href="ll-tex-linen"]')!.textContent).toContain("--ll-tex-linen:url(data:image/png;base64,")
  })

  it("can be a landmark: as main / section / article", () => {
    for (const as of ["main", "section", "article"] as const) {
      const { container, unmount } = render(<Desk as={as} aria-label="workspace" />)
      expect(container.querySelector('[data-slot="desk"]')!.tagName).toBe(as.toUpperCase())
      unmount()
    }
  })

  it("passes className, ref, style and props through", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByTestId } = render(<Desk ref={ref} data-testid="d" id="desk-1" style={{ minHeight: 120 }} className="bg-desk" />)
    expect(ref.current).toBe(getByTestId("d"))
    expect(getByTestId("d")).toHaveAttribute("id", "desk-1")
    expect(getByTestId("d").style.minHeight).toBe("120px")
    expect(getByTestId("d")).toHaveClass("bg-desk", "ll-desk")
  })

  it("the lamp is the theme's vignette by default and a prop otherwise", () => {
    const vignette = (lamp?: number | boolean) => {
      const { container, unmount } = render(<Desk lamp={lamp} />)
      const v = (container.querySelector('[data-slot="desk"]') as HTMLElement).style.getPropertyValue("--ll-desk-vignette")
      unmount()
      return v
    }
    expect(vignette()).toBe("")
    expect(vignette(1)).toBe("")
    expect(vignette(true)).toBe("")
    expect(vignette(0)).toContain("linear-gradient")
    expect(vignette(false)).toContain("linear-gradient")
    expect(vignette(0.5)).toContain("calc(0.013 * var(--ll-shadow-k))")
    expect(vignette(1.5)).toContain("calc(0.113 * var(--ll-shadow-k))")
    expect(vignette(2.5)).toContain("calc(0.313 * var(--ll-shadow-k))")
  })
})

describe("Desk objects", () => {
  it("objects lie behind the content: aria-hidden, no pointer events, clipped to the desk, hidden small and calm", () => {
    const { container } = render(
      <Desk objects>
        <button>on top</button>
      </Desk>,
    )
    const layer = container.querySelector('[data-slot="desk-objects"]') as HTMLElement
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer).toHaveClass("pointer-events-none", "absolute", "inset-0", "overflow-hidden", "max-sm:hidden", "calm:hidden")
    expect(layer.className).toContain("z-(--ll-z-sheet)")
    const names = Array.from(layer.querySelectorAll("[data-object]")).map((n) => n.getAttribute("data-object"))
    expect(names).toEqual([...DESK_OBJECTS])
    expect(layer.querySelectorAll('svg[data-slot="desk-object"]')).toHaveLength(7)
    expectInkLayers(container, { min: 7, kinds: ["prop"], host: false })
  })

  it("a list picks the objects", () => {
    const { container } = render(<Desk objects={["coffee", "pencil"]} />)
    expect(Array.from(container.querySelectorAll("[data-object]")).map((n) => n.getAttribute("data-object"))).toEqual(["coffee", "pencil"])
    expect(container.querySelectorAll('svg[data-slot="desk-object"]')).toHaveLength(2)
  })

  it("the coffee ring casts no shadow, the rest do", () => {
    const { container } = render(<Desk objects />)
    const svg = (name: string) => container.querySelector(`[data-object="${name}"] svg`) as SVGElement
    expect(svg("coffee").style.filter).toBe("")
    expect(svg("pencil").style.filter).toContain("drop-shadow")
  })

  it("is the same desk for the same seed and another for another", () => {
    const html = (seed: string) => {
      const { container, unmount } = render(<Desk objects seed={seed} />)
      const out = container.innerHTML
      unmount()
      return out
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })

  it("DeskObjects works alone, in any relative container", () => {
    const { container } = render(
      <div className="relative">
        <DeskObjects objects={["clips"]} className="rounded-none" data-testid="o" />
      </div>,
    )
    expect(container.querySelectorAll('svg[data-slot="desk-object"]')).toHaveLength(2)
  })

  it("calm density draws flatter props", () => {
    const html = (density?: "calm") =>
      render(
        <InkProvider density={density}>
          <Desk objects={["pencil"]} seed="p" />
        </InkProvider>,
      ).container.querySelector("svg[data-slot=desk-object]")!.innerHTML
    expect(html("calm")).toBeTruthy()
  })

  it("has no axe violations, with objects and a labeled landmark", async () => {
    const { container } = renderUI(
      <Desk as="main" objects aria-label="workspace">
        <h1>Monday</h1>
        <button>Go</button>
      </Desk>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    const ui = (
      <Desk objects seed="ssr" className="p-4">
        <p>hi</p>
      </Desk>
    )
    const html = expectSsrStable(ui)
    expect(html).toContain('data-slot="desk-objects"')
    expectHydrates(ui, '[data-slot="desk-objects"] svg')
  })
})

describe("pencil", () => {
  it("is deterministic, clean, with a length and a color of its own", () => {
    const a = pencil("p", { length: 190 })
    expect(a.svg).toBe(pencil("p", { length: 190 }).svg)
    expect(a.svg).not.toBe(pencil("q", { length: 190 }).svg)
    expect(pencil("p", { length: 120 }).w).toBe(120)
    expect(pencil("p", { color: "sky" }).svg).toContain("var(--ll-sky)")
    for (const tier of ["lo", "hi"] as const) expectClean(pencil("p", { tier }).svg)
    expect(a.svg.length).toBeLessThan(5000)
  })
})
