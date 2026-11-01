import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { InkProvider } from "@/lib/ink/react"
import { spinnerMark, spinnerVariantList } from "@/lib/ink/recipes/spinner-ink"
import { axeCheck } from "./helpers"

afterEach(() => {
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

describe("Spinner", () => {
  it("is a status with an accessible name, like upstream's, and a drawing inside", () => {
    const { getByRole } = render(<Spinner />)
    const s = getByRole("status", { name: "Loading" })
    expect(s).toHaveAttribute("data-slot", "spinner")
    expect(s).toHaveAttribute("data-variant", "scribble")
    expect(s).toHaveClass("size-4", "inline-flex", "shrink-0")
    const svg = s.querySelector("svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg).toHaveAttribute("data-ink", "doodle")
    expect(svg.querySelector("[data-part=reveal]")).toBeTruthy()
  })

  it("aria-label can be replaced, and className resizes it", () => {
    const { getByRole } = render(<Spinner aria-label="Saving your page" className="size-8" />)
    const s = getByRole("status", { name: "Saving your page" })
    expect(s).toHaveClass("size-8")
    expect(s).not.toHaveClass("size-4")
  })

  it("draws for the size the class says: the viewBox follows the pixel size", () => {
    const sizes = [12, 16, 24, 32].map((px) => {
      const { container, unmount } = render(<Spinner className={`size-[${px}px]`} />)
      const vb = container.querySelector("svg")?.getAttribute("viewBox")
      unmount()
      return vb
    })
    expect(new Set(sizes).size).toBe(4)
    const { container } = render(<Spinner size={40} />)
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("-3 -3 46 46")
  })

  it("the scribble animates by a class on the status and holds still for reduced motion", () => {
    const { getByRole } = render(<Spinner />)
    const s = getByRole("status")
    expect(s.className).toContain("[&_[data-part=reveal]]:animate-[ll-draw_calc(var(--ll-dur-draw)*2)_linear_infinite]")
    expect(s.className).toContain("[&_[data-part=reveal]]:[stroke-dasharray:.42_.58]")
    expect(s.className).toContain("motion-reduce:[&_[data-part=reveal]]:animate-none")
    expect(s.className).toContain("motion-reduce:[&_[data-part=reveal]]:[stroke-dasharray:none]")
    expect(s.className).toContain("[[data-motion=reduced]_&]:[&_[data-part=reveal]]:[stroke-dasharray:none]")
  })

  it("the drawing is in currentColor, so a spinner in a button takes the button's ink", () => {
    const { getByRole } = render(<Spinner />)
    const html = getByRole("status").querySelector("svg")?.innerHTML ?? ""
    expect(html).toContain('fill="currentColor"')
    expect(html).not.toContain("var(--ll-ink)")
  })

  it("sits in a button next to its label without breaking it", () => {
    const { getByRole } = render(
      <Button disabled>
        <Spinner />
        Please wait
      </Button>
    )
    const b = getByRole("button", { name: /Please wait/ })
    expect(b.querySelector("[role=status]")).toBeTruthy()
    expect(b.textContent).toContain("Please wait")
  })

  it("the write variant is Stubby's three writing frames, stacked like a flip book, only the last showing at rest", () => {
    const { getByRole } = render(<Spinner variant="write" size={80} />)
    const s = getByRole("status")
    expect(s).toHaveAttribute("data-variant", "write")
    const frames = Array.from(s.querySelectorAll("svg[data-ink=mascot][data-frame]"))
    expect(frames.map((f) => f.getAttribute("data-frame"))).toEqual(["1", "2", "3"])
    for (const f of frames) {
      expect(f).toHaveAttribute("aria-hidden", "true")
      expect(f).toHaveClass("absolute", "inset-0")
    }
    expect(new Set(frames.map((f) => f.innerHTML)).size).toBe(3)
    const css = document.head.querySelector('style[data-href="ll-spinner"]')?.textContent ?? ""
    expect(css).toContain("@keyframes ll-write-1")
    expect(css).toContain("[data-slot=spinner][data-variant=write] [data-frame='3']{opacity:1}")
    expect(css).toContain("@media (prefers-reduced-motion:reduce)")
    expect(css).toContain("[data-motion=reduced] [data-slot=spinner][data-variant=write] [data-frame]{animation:none!important}")
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it("the loops variant is a line of cursive loops, four times as wide as it is tall, drawn on the same way", () => {
    const { getByRole } = render(<Spinner variant="loops" size={20} />)
    const s = getByRole("status")
    expect(s).toHaveAttribute("data-variant", "loops")
    expect(s).not.toHaveClass("size-4")
    const svg = s.querySelector("svg[data-ink=doodle]") as SVGElement
    expect(svg.querySelector("[data-part=reveal]")).toBeTruthy()
    expect(Number(svg.getAttribute("width"))).toBe(4 * 20 + 6)
    expect(Number(svg.getAttribute("height"))).toBe(20 + 6)
  })

  it("forwards ref-less props: id, data attributes, style", () => {
    const { getByRole } = render(<Spinner id="sp" data-testid="t" style={{ color: "red" }} />)
    const s = getByRole("status")
    expect(s).toHaveAttribute("id", "sp")
    expect(s).toHaveAttribute("data-testid", "t")
    expect(s.style.color).toBe("red")
  })

  it("has no axe violations: default, sized, labelled, write, in a button", async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner className="size-6" aria-label="Fetching" />
        <Spinner variant="write" />
        <Spinner variant="loops" />
        <Button disabled>
          <Spinner /> Saving
        </Button>
      </div>
    )
    await axeCheck(container)
  })
})

describe("Spinner on the server and hydration", () => {
  it("renders the whole drawing on the server (it needs no measuring), byte for byte the same twice", () => {
    const tree = () => (
      <>
        <Spinner />
        <Spinner size={32} seed="s" />
        <Spinner variant="write" seed="w" />
        <Spinner variant="loops" seed="l" />
      </>
    )
    const html = renderToString(tree())
    expect(html).toContain('role="status"')
    expect(html).toContain('data-part="reveal"')
    expect(html).not.toMatch(/NaN|undefined/)
    expect(renderToString(tree())).toBe(html)
  })

  it("two spinners never share mask ids", () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner />
      </div>
    )
    const ids = Array.from(container.querySelectorAll("mask[id]")).map((m) => m.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it("hydrates without warnings (bare and inside the provider)", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <div>
          <Spinner />
          <Spinner variant="write" />
        </div>
      ) as React.ReactElement
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
      expect(container.querySelectorAll("[role=status]").length).toBe(2)
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("spinnerMark", () => {
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("is deterministic per seed and different across seeds", () => {
    expect(spinnerMark("a", 16).svg).toBe(spinnerMark("a", 16).svg)
    expect(spinnerMark("a", 16).svg).not.toBe(spinnerMark("b", 16).svg)
  })

  it("draws sane markup at many sizes, both shapes, both tiers, calm or not (no NaN, only currentColor and tokens)", () => {
    for (const px of [8, 12, 16, 20, 24, 32, 48, 64, 96]) {
      for (const tier of ["lo", "hi"] as const) {
        for (const calm of [false, true]) {
          const shapes = [spinnerMark("s", px, { tier, calm }), spinnerMark("s", px, { shape: "loops", w: px * 1.1, h: Math.max(10, px * 0.26), tier, calm })]
          for (const m of shapes) {
            expect(m.svg, `${px}/${tier}/${calm}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            expect(m.svg).toContain("currentColor")
          }
        }
      }
    }
  })

  it("the mask stroke is the centre line with pathLength 1, so the dash trick works", () => {
    const m = spinnerMark("s", 24)
    expect(m.svg).toMatch(/<mask id="ll-rv-[a-z0-9]+sp"[^>]*><path data-part="reveal" d="M[^"]+" pathLength="1"/)
    expect(m.svg).toMatch(/mask="url\(#ll-rv-[a-z0-9]+sp\)"/)
  })

  it("stays within the lo budget: a 16 px spinner is at most 12 nodes and 8 KB", () => {
    const m = spinnerMark("s", 16)
    expect(nodes(m.svg)).toBeLessThanOrEqual(14)
    expect(m.svg.length).toBeLessThanOrEqual(8000)
  })

  it("lists both variants", () => {
    expect(spinnerVariantList).toEqual(["scribble", "loops", "write"])
  })
})
