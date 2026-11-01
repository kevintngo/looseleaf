import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PeelCorner, PeelCornerPage, PeelCornerUnder } from "@/components/ui/peel-corner"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { peelFlapRecipe } from "@/lib/ink/recipes/peel-corner-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(300, 200)
  document.documentElement.setAttribute("data-motion", "reduced")
})
afterEach(() => {
  restore()
  document.documentElement.removeAttribute("data-motion")
})

const Page = (p: Partial<React.ComponentProps<typeof PeelCorner>> = {}) => (
  <PeelCorner {...p}>
    <PeelCornerPage>Spring sale</PeelCornerPage>
    <PeelCornerUnder>SAVE10</PeelCornerUnder>
  </PeelCorner>
)
const root = (c: HTMLElement) => c.querySelector('[data-slot="peel-corner"]') as HTMLElement
const under = (c: HTMLElement) => c.querySelector('[data-slot="peel-corner-under"]') as HTMLElement
const k = (c: HTMLElement) => root(c).style.getPropertyValue("--peel-k")

describe("PeelCorner", () => {
  it("is a page with a corner button; what is underneath is out of reach until it is open", () => {
    const { getByRole, container } = renderUI(<Page />)
    const b = getByRole("button", { name: "Peel back the corner" })
    expect(b).toHaveAttribute("aria-expanded", "false")
    expect(b).toHaveAttribute("aria-controls", under(container).id)
    expect(under(container)).toHaveAttribute("inert")
    expect(under(container)).toHaveAttribute("aria-hidden", "true")
    expect(root(container)).toHaveAttribute("data-state", "closed")
    expect(k(container)).toBe("0.2")
  })

  it("is accessible closed and open", async () => {
    const { container, getByRole, user } = renderUI(<Page />)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Peel back the corner" }))
    await axeCheck(container)
  })

  it("click, Enter and Space open and close it", async () => {
    const onPeeledChange = vi.fn()
    const { container, getByRole, user } = renderUI(<Page onPeeledChange={onPeeledChange} />)
    const b = getByRole("button", { name: "Peel back the corner" })
    await user.click(b)
    expect(b).toHaveAttribute("aria-expanded", "true")
    expect(k(container)).toBe("1.000")
    expect(under(container)).not.toHaveAttribute("inert")
    expect(under(container)).not.toHaveAttribute("aria-hidden")
    expect(onPeeledChange).toHaveBeenLastCalledWith(true)
    b.focus()
    await user.keyboard("{Enter}")
    expect(b).toHaveAttribute("aria-expanded", "false")
    expect(k(container)).toBe("0.200")
    await user.keyboard(" ")
    expect(b).toHaveAttribute("aria-expanded", "true")
    expect(onPeeledChange).toHaveBeenCalledTimes(3)
  })

  it("hover lifts the corner and leaving puts it down", () => {
    const { container, getByRole } = renderUI(<Page />)
    const b = getByRole("button", { name: "Peel back the corner" })
    fireEvent.pointerEnter(b)
    expect(k(container)).toBe("0.420")
    fireEvent.pointerLeave(b)
    expect(k(container)).toBe("0.200")
  })

  it("dragging peels along the diagonal; a long pull opens, a short one springs back", () => {
    const onPeeledChange = vi.fn()
    const { container, getByRole } = renderUI(<Page onPeeledChange={onPeeledChange} />)
    root(container).getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, x: 0, y: 0, toJSON() {} }) as DOMRect
    const b = getByRole("button", { name: "Peel back the corner" })
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 295, clientY: 195 })
    expect(root(container)).toHaveAttribute("data-dragging")
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 200, clientY: 100 })
    expect(Number(k(container))).toBeCloseTo(0.833, 2)
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 200, clientY: 100 })
    expect(root(container)).not.toHaveAttribute("data-dragging")
    expect(onPeeledChange).toHaveBeenLastCalledWith(true)
    expect(k(container)).toBe("1.000")

    fireEvent.pointerDown(b, { pointerId: 2, button: 0, clientX: 250, clientY: 150 })
    fireEvent.pointerMove(b, { pointerId: 2, clientX: 280, clientY: 180 })
    fireEvent.pointerUp(b, { pointerId: 2, clientX: 280, clientY: 180 })
    expect(onPeeledChange).toHaveBeenLastCalledWith(false)
    expect(k(container)).toBe("0.200")
  })

  it("a short pull on a closed corner returns it; cancelling returns it", () => {
    const onPeeledChange = vi.fn()
    const { container, getByRole } = renderUI(<Page onPeeledChange={onPeeledChange} />)
    root(container).getBoundingClientRect = () => ({ left: 0, top: 0, right: 300, bottom: 200, width: 300, height: 200, x: 0, y: 0, toJSON() {} }) as DOMRect
    const b = getByRole("button", { name: "Peel back the corner" })
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 295, clientY: 195 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 260, clientY: 160 })
    fireEvent.pointerUp(b, { pointerId: 1, clientX: 260, clientY: 160 })
    expect(onPeeledChange).not.toHaveBeenCalled()
    expect(k(container)).toBe("0.200")
    fireEvent.pointerDown(b, { pointerId: 3, button: 0, clientX: 295, clientY: 195 })
    fireEvent.pointerMove(b, { pointerId: 3, clientX: 100, clientY: 20 })
    fireEvent.pointerCancel(b, { pointerId: 3 })
    expect(onPeeledChange).not.toHaveBeenCalled()
    expect(k(container)).toBe("0.200")
  })

  it("the drag measures from the left edge for a bottom-left corner", () => {
    const { container, getByRole } = renderUI(<Page corner="bottom-left" />)
    root(container).getBoundingClientRect = () => ({ left: 100, top: 0, right: 400, bottom: 200, width: 300, height: 200, x: 100, y: 0, toJSON() {} }) as DOMRect
    const b = getByRole("button", { name: "Peel back the corner" })
    fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 105, clientY: 195 })
    fireEvent.pointerMove(b, { pointerId: 1, clientX: 200, clientY: 100 })
    expect(Number(k(container))).toBeCloseTo(0.833, 2)
    expect(root(container)).toHaveAttribute("data-corner", "bottom-left")
  })

  it("controlled and uncontrolled", async () => {
    const onPeeledChange = vi.fn()
    const { container, getByRole, user, rerender } = renderUI(<Page peeled={false} onPeeledChange={onPeeledChange} />)
    await user.click(getByRole("button", { name: "Peel back the corner" }))
    expect(onPeeledChange).toHaveBeenCalledWith(true)
    expect(getByRole("button", { name: "Peel back the corner" })).toHaveAttribute("aria-expanded", "false")
    rerender(<Page peeled onPeeledChange={onPeeledChange} />)
    expect(getByRole("button", { name: "Peel back the corner" })).toHaveAttribute("aria-expanded", "true")
    expect(k(container)).toBe("1.000")
  })

  it("defaultPeeled starts open", () => {
    const { container, getByRole } = renderUI(<Page defaultPeeled />)
    expect(getByRole("button", { name: "Peel back the corner" })).toHaveAttribute("aria-expanded", "true")
    expect(k(container)).toBe("1")
  })

  it("eases when motion is allowed", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "clearTimeout"] })
    try {
      document.documentElement.removeAttribute("data-motion")
      const { container, getByRole } = renderUI(<Page />)
      const b = getByRole("button", { name: "Peel back the corner" })
      fireEvent.pointerDown(b, { pointerId: 1, button: 0, clientX: 5, clientY: 5 })
      fireEvent.pointerUp(b, { pointerId: 1, clientX: 5, clientY: 5 })
      await act(async () => {
        await vi.advanceTimersByTimeAsync(80)
      })
      const mid = Number(k(container))
      expect(mid).toBeGreaterThan(0.25)
      expect(mid).toBeLessThan(1)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400)
      })
      expect(Number(k(container))).toBeCloseTo(1, 2)
    } finally {
      vi.useRealTimers()
    }
  })

  it("draws the flap and a lazy focus ring on hosts", () => {
    const { container } = renderUI(<Page />)
    expectInkLayers(container, { min: 2, absolute: true, kinds: ["peel-corner-flap", "peel-corner-trigger", "sheet"] })
    const flap = container.querySelector('[data-slot="peel-corner-flap"] > svg') as SVGElement
    expect(flap.innerHTML.length).toBeGreaterThan(500)
  })

  it("renders identically on the server and hydrates cleanly", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Page />) as React.ReactElement)
      expect(renderToString(wrap(<Page />) as React.ReactElement)).toBe(a)
      expect(a).toContain("--peel-k:0.2")
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Page />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("parts outside a page say so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<PeelCornerPage>x</PeelCornerPage>)).toThrow(/inside <PeelCorner>/)
    spy.mockRestore()
  })
})

describe("peel-corner drawing", () => {
  const run = (params: object) => runRecipe(peelFlapRecipe as never, { box: { w: 120, h: 120 }, params, seed: "p", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } }).parts.rest ?? ""

  it("the flap is small, in the colour of the paper's back, and mirrors for the left corner", () => {
    const a = run({ back: "paper" })
    expect(a.length).toBeLessThan(5000)
    expect(a).toContain("var(--ll-paper)")
    expect(run({ back: "kraft" })).toContain("var(--ll-kraft)")
    expect(run({ mirror: true })).not.toBe(a)
    expect(a).not.toMatch(/NaN|undefined/)
  })
})
