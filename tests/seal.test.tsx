import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Seal, sealMarkList, sealVariantList } from "@/components/ui/seal"
import { InkProvider } from "@/lib/ink/react"
import { sealArt } from "@/lib/ink/recipes/seal-ink"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Seal", () => {
  it("is an image named by its words", () => {
    const { getByRole } = renderUI(<Seal text="Best" sub="seller" />)
    const seal = getByRole("img", { name: "Best, seller" })
    expect(seal).toHaveAttribute("data-slot", "seal")
    expect(seal).toHaveAttribute("data-ink", "badge")
    expect(seal).toHaveAttribute("focusable", "false")
  })

  it("a drawn mark has a name too, and a label wins over both", () => {
    const a = renderUI(<Seal mark="check" size={24} />)
    expect(a.getByRole("img", { name: "Verified" })).toBeInTheDocument()
    const b = renderUI(<Seal mark="star" />)
    expect(b.getByRole("img", { name: "Award" })).toBeInTheDocument()
    const c = renderUI(<Seal mark="check" label="Identity checked" />)
    expect(c.getByRole("img", { name: "Identity checked" })).toBeInTheDocument()
    const d = renderUI(<Seal variant="wax" />)
    expect(d.getByRole("img", { name: "wax seal" })).toBeInTheDocument()
  })

  it("decorative hides it from readers", () => {
    const { container, queryByRole } = renderUI(<Seal text="Top" decorative />)
    expect(queryByRole("img")).toBeNull()
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("draws every variant, as big as asked, with no NaN and no hex", () => {
    for (const variant of sealVariantList) {
      const { container, unmount } = renderUI(<Seal variant={variant} text="Best" ring="Official seal" tone="sky" size={80} />)
      const svg = container.querySelector("svg")!
      expect(svg.innerHTML.length).toBeGreaterThan(500)
      expect(svg.innerHTML).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
      expect(svg.getAttribute("width")).toBe("80")
      unmount()
    }
    expect(sealMarkList).toEqual(["check", "star"])
  })

  it("is accessible with several kinds side by side", async () => {
    const { container } = renderUI(
      <div>
        <Seal mark="check" size={20} />
        <Seal variant="rosette" text="1st" ribbon="sky" />
        <Seal variant="ring" text="OK" ring="Checked by hand" size={128} />
        <Seal variant="wax" text="L" tone="red" decorative />
      </div>
    )
    await axeCheck(container)
    expectInkLayers(container, { kinds: ["badge"], intrinsic: true })
  })

  it("the same props draw the same seal; another seed draws another", () => {
    const a = renderToString(<Seal text="Top" seed="a" />)
    expect(renderToString(<Seal text="Top" seed="a" />)).toBe(a)
    expect(renderToString(<Seal text="Top" seed="b" />)).not.toBe(a)
  })

  it("small sizes use the small redraw (fewer marks than the master)", () => {
    const small = sealArt({ variant: "scallop", text: "Best", sub: "seller", deco: "star", tone: "grass" }, 48, "s")
    const master = sealArt({ variant: "scallop", text: "Best", sub: "seller", deco: "star", tone: "grass" }, 96, "s")
    expect(small.svg.length).toBeLessThan(master.svg.length)
  })

  it("ring lettering appears from 72 px up and not below", () => {
    const params = { variant: "ring" as const, text: "OK", ring: "Official seal", tone: "sky" as const }
    const big = sealArt(params, 96, "s")
    const small = sealArt(params, 48, "s")
    expect(big.svg.length).toBeGreaterThan(small.svg.length * 1.5)
  })

  it("the ribbon color is the ribbon's, and only a rosette or a medal has one", () => {
    const tomato = sealArt({ variant: "rosette", text: "1", tone: "lemon" }, 96, "s")
    const sky = sealArt({ variant: "rosette", text: "1", tone: "lemon", ribbon: "sky" }, 96, "s")
    expect(tomato.svg).toContain("var(--ll-tomato)")
    expect(sky.svg).toContain("var(--ll-sky)")
    const scallop = sealArt({ variant: "scallop", text: "1", tone: "lemon", ribbon: "sky" }, 96, "s")
    expect(scallop.svg).not.toContain("var(--ll-sky)")
  })

  it("wax is a blob with an impression; the color is the wax's", () => {
    const grape = sealArt({ variant: "wax", text: "L", tone: "grape" }, 96, "s")
    expect(grape.svg).toContain("var(--ll-grape)")
    expect(grape.svg).not.toContain("NaN")
    expect(sealArt({ variant: "wax", mark: "check" }, 64, "s").svg).toContain("var(--ll-red)")
  })

  it("tilt turns it: a number, or a small steady one from the seed", () => {
    const a = renderUI(<Seal text="A" tilt={-8} />)
    expect(a.container.querySelector("svg")!.style.rotate).toBe("-8deg")
    const b = renderUI(<Seal text="A" tilt="auto" seed="x" />)
    const rotate = b.container.querySelector("svg")!.style.rotate
    expect(rotate).toMatch(/^clamp\(calc\(var\(--ll-tilt-max\) \* -1\.6\), -?[\d.]+deg, calc\(var\(--ll-tilt-max\) \* 1\.6\)\)$/)
    expect(Math.abs(parseFloat(/, (-?[\d.]+)deg,/.exec(rotate)![1]))).toBeLessThanOrEqual(3.2)
    const c = renderUI(<Seal text="A" />)
    expect(c.container.querySelector("svg")!.style.rotate).toBe("")
  })

  it("hero tier is drawn richer than the default", () => {
    const lo = renderToString(<Seal text="Top" seed="t" />)
    const hi = renderToString(<Seal text="Top" seed="t" tier="hi" />)
    expect(hi.length).toBeGreaterThan(lo.length)
  })

  it("renders identically on the server and hydrates cleanly, bare and in a provider", async () => {
    const tree = (
      <div>
        <Seal mark="check" size={24} />
        <Seal variant="ring" text="OK" ring="Official seal" />
      </div>
    )
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(tree) as React.ReactElement)
      expect(renderToString(wrap(tree) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(tree))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })
})
