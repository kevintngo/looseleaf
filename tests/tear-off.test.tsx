import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TearOff, TearOffBody, TearOffStub } from "@/components/ui/tear-off"
import { InkProvider } from "@/lib/ink/react"
import { runRecipe } from "@/lib/ink/recipes"
import { tearHintRecipe, tearSeamRecipe } from "@/lib/ink/recipes/tear-off-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 120)
})
afterEach(() => {
  restore()
  document.documentElement.removeAttribute("data-motion")
})

const Ticket = (p: Partial<React.ComponentProps<typeof TearOff>> = {}) => (
  <TearOff {...p}>
    <TearOffBody>Studio night</TearOffBody>
    <TearOffStub>10% off</TearOffStub>
  </TearOff>
)
const stub = (c: HTMLElement) => c.querySelector('[data-slot="tear-off-stub"]') as HTMLElement
const body = (c: HTMLElement) => c.querySelector('[data-slot="tear-off-body"]') as HTMLElement
const root = (c: HTMLElement) => c.querySelector('[data-slot="tear-off"]') as HTMLElement

describe("TearOff", () => {
  it("is a ticket with a stub that is a described button", () => {
    const { getByRole, container } = renderUI(<Ticket />)
    const b = getByRole("button", { name: "10% off" })
    expect(b).toHaveAttribute("tabindex", "0")
    expect(b).toHaveAccessibleDescription(/Press Enter or Space to tear it off/)
    expect(root(container)).toHaveAttribute("data-state", "attached")
    expect(body(container)).toHaveAttribute("data-edge", "perf")
    expect(container.querySelector('[data-slot="tear-off-sheet"]')).toHaveAttribute("data-edge", "perf")
  })

  it("is accessible before and after", async () => {
    const { container, user } = renderUI(<Ticket />)
    await axeCheck(container)
    stub(container).focus()
    await user.keyboard("{Enter}")
    await axeCheck(container)
  })

  it("the seam and hint are drawn on hosts, the stub keeps a lazy focus ring", () => {
    const { container } = renderUI(<Ticket />)
    expectInkLayers(container, { min: 3, absolute: true, kinds: ["tear-off-seam", "tear-off-hint", "tear-off-stub", "sheet"] })
    const seam = container.querySelector('[data-slot="tear-off-stub"] > span svg[data-ink="tear-off-seam"]') as SVGElement
    expect(seam.innerHTML.length).toBeGreaterThan(500)
  })

  it("Enter and Space tear it off: once, announced, the body's edge turns torn, the stub leaves the layout", async () => {
    vi.useFakeTimers()
    try {
      const onTear = vi.fn()
      const onTornChange = vi.fn()
      const { container, getByRole } = renderUI(<Ticket onTear={onTear} onTornChange={onTornChange} />, { user: { advanceTimers: vi.advanceTimersByTime } })
      stub(container).focus()
      fireEvent.keyDown(stub(container), { key: " " })
      fireEvent.keyDown(stub(container), { key: "Enter" })
      expect(onTear).toHaveBeenCalledTimes(1)
      expect(onTornChange).toHaveBeenCalledWith(true)
      expect(root(container)).toHaveAttribute("data-state", "torn")
      expect(body(container)).toHaveAttribute("data-edge", "torn")
      expect(getByRole("status")).toHaveTextContent("Torn off.")
      expect(stub(container)).toHaveAttribute("aria-hidden", "true")
      expect(stub(container)).not.toHaveAttribute("hidden")
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(stub(container)).toHaveAttribute("hidden")
    } finally {
      vi.useRealTimers()
    }
  })

  it("a click with no pointer behind it (a screen reader activating the button) tears too", () => {
    const onTear = vi.fn()
    const { container } = renderUI(<Ticket onTear={onTear} />)
    fireEvent.click(stub(container))
    expect(onTear).toHaveBeenCalledTimes(1)
  })

  it("with reduced motion the stub is gone at once", () => {
    vi.useFakeTimers()
    try {
      document.documentElement.setAttribute("data-motion", "reduced")
      const { container } = renderUI(<Ticket />)
      fireEvent.keyDown(stub(container), { key: "Enter" })
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(stub(container)).toHaveAttribute("hidden")
    } finally {
      vi.useRealTimers()
    }
  })

  it("a tap tears; pulling far enough tears; a short pull springs back; cancel springs back", () => {
    const onTear = vi.fn()
    const { container } = renderUI(<Ticket onTear={onTear} />)
    const s = stub(container)
    const p = (type: "pointerDown" | "pointerMove" | "pointerUp" | "pointerCancel", x: number, y = 0) => fireEvent[type](s, { pointerId: 1, button: 0, clientX: x, clientY: y })
    p("pointerDown", 100)
    p("pointerMove", 110)
    expect(s.style.getPropertyValue("--tear")).not.toBe("")
    expect(s).toHaveAttribute("data-dragging")
    p("pointerUp", 110)
    expect(s.style.getPropertyValue("--tear")).toBe("")
    expect(onTear).not.toHaveBeenCalled()
    p("pointerDown", 100)
    p("pointerMove", 140)
    p("pointerCancel", 140)
    expect(onTear).not.toHaveBeenCalled()
    p("pointerDown", 100)
    p("pointerUp", 100)
    expect(onTear).toHaveBeenCalledTimes(1)
  })

  it("pulling most of the way tears on release; pulling all the way tears without releasing", () => {
    const first = vi.fn()
    const a = renderUI(<Ticket onTear={first} />)
    const sa = stub(a.container)
    fireEvent.pointerDown(sa, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(sa, { pointerId: 1, clientX: 90, clientY: 0 })
    expect(first).not.toHaveBeenCalled()
    fireEvent.pointerUp(sa, { pointerId: 1, clientX: 90, clientY: 0 })
    expect(first).toHaveBeenCalledTimes(1)
    a.unmount()
    const second = vi.fn()
    const b = renderUI(<Ticket onTear={second} />)
    fireEvent.pointerDown(stub(b.container), { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(stub(b.container), { pointerId: 1, clientX: 400, clientY: 0 })
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("vertical: pulled down", () => {
    const onTear = vi.fn()
    const { container } = renderUI(<Ticket orientation="vertical" onTear={onTear} />)
    expect(root(container)).toHaveAttribute("data-orientation", "vertical")
    expect(body(container)).toHaveAttribute("data-edge", "perf")
    const s = stub(container)
    fireEvent.pointerDown(s, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(s, { pointerId: 1, clientX: 300, clientY: 0 })
    expect(onTear).not.toHaveBeenCalled()
    fireEvent.pointerMove(s, { pointerId: 1, clientX: 0, clientY: 200 })
    expect(onTear).toHaveBeenCalledTimes(1)
  })

  it("controlled: the parent decides, and setting it back puts a fresh stub on", () => {
    const onTornChange = vi.fn()
    const { container, rerender } = renderUI(<Ticket torn={false} onTornChange={onTornChange} />)
    fireEvent.keyDown(stub(container), { key: "Enter" })
    expect(onTornChange).toHaveBeenCalledWith(true)
    expect(root(container)).toHaveAttribute("data-state", "attached")
    rerender(<Ticket torn onTornChange={onTornChange} />)
    expect(root(container)).toHaveAttribute("data-state", "torn")
    rerender(<Ticket torn={false} onTornChange={onTornChange} />)
    expect(root(container)).toHaveAttribute("data-state", "attached")
    expect(stub(container)).not.toHaveAttribute("hidden")
    expect(stub(container).className).toContain("animate-drop")
  })

  it("defaultTorn starts without the stub", () => {
    const { container } = renderUI(<Ticket defaultTorn />)
    expect(root(container)).toHaveAttribute("data-state", "torn")
    expect(stub(container)).toHaveAttribute("hidden")
  })

  it("disabled cannot be torn", async () => {
    const onTear = vi.fn()
    const { container, user } = renderUI(<Ticket disabled onTear={onTear} />)
    fireEvent.keyDown(stub(container), { key: "Enter" })
    fireEvent.pointerDown(stub(container), { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(stub(container), { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    await user.click(stub(container))
    expect(onTear).not.toHaveBeenCalled()
    expect(stub(container)).toHaveAttribute("aria-disabled", "true")
    await axeCheck(container)
  })

  it("in a right-to-left provider the stub is on the left", () => {
    const { container } = renderUI(
      <InkProvider dir="rtl">
        <Ticket />
      </InkProvider>,
    )
    expect(body(container)).toHaveAttribute("data-edge", "perf")
    expect(stub(container).className).toContain("origin-bottom-right")
  })

  it("renders identically on the server and hydrates cleanly", async () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const a = renderToString(wrap(<Ticket />) as React.ReactElement)
      expect(renderToString(wrap(<Ticket />) as React.ReactElement)).toBe(a)
      const host = document.createElement("div")
      host.innerHTML = a
      document.body.appendChild(host)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(<Ticket />))
      })
      expect(errors.mock.calls.map((c) => String(c[0]).slice(0, 120))).toEqual([])
      errors.mockRestore()
      host.remove()
    }
  })

  it("parts outside a ticket say so", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<TearOffStub>x</TearOffStub>)).toThrow(/inside <TearOff>/)
    spy.mockRestore()
  })
})

describe("tear-off drawing", () => {
  const run = (recipe: unknown, params: object, box: { w: number; h: number }) =>
    runRecipe(recipe as Parameters<typeof runRecipe>[0], { box, params, seed: "t", tier: "lo", density: "comfortable", dir: "ltr", knobs: { wobble: 1, misreg: 1, bleed: 1, width: 1 } })

  it("the seam runs along its long side, vertical or horizontal, and the scissors are optional", () => {
    const v = run(tearSeamRecipe, { scissors: true }, { w: 16, h: 150 }).parts.rest ?? ""
    const h = run(tearSeamRecipe, { scissors: true }, { w: 240, h: 16 }).parts.rest ?? ""
    expect(v.length).toBeGreaterThan(800)
    expect(h.length).toBeGreaterThan(800)
    expect(v).not.toMatch(/NaN|undefined/)
    const plain = run(tearSeamRecipe, { scissors: false }, { w: 16, h: 150 }).parts.rest ?? ""
    expect(plain.length).toBeLessThan(v.length)
    expect(v.length).toBeLessThan(6000)
  })

  it("the hint points where the stub goes", () => {
    const right = run(tearHintRecipe, { toward: "right" }, { w: 36, h: 28 }).parts.rest ?? ""
    const down = run(tearHintRecipe, { toward: "down" }, { w: 36, h: 28 }).parts.rest ?? ""
    expect(right).not.toBe(down)
    expect(right.length).toBeLessThan(3000)
  })
})
