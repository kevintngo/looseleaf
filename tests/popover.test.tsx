import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { InkProvider } from "@/lib/ink/react"
import { pointerMark } from "@/lib/ink/recipes/overlay-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(288, 200)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ content, ...root }: React.ComponentProps<typeof Popover> & { content?: React.ComponentProps<typeof PopoverContent> }) {
  return (
    <Popover {...root}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Dimensions" {...content}>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <input aria-label="Width" defaultValue="100%" />
      </PopoverContent>
    </Popover>
  )
}

describe("Popover roles and parts", () => {
  it("opens from its trigger as a dialog and keeps upstream's slots", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Open popover" })
    expect(trigger).toHaveAttribute("data-slot", "popover-trigger")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await user.click(trigger)
    const pop = await screen.findByRole("dialog", { name: "Dimensions" })
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(pop).toHaveAttribute("data-slot", "popover-content")
    for (const slot of ["popover-header", "popover-title", "popover-description"]) expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
  })

  it("is a slip of paper (a CSS sheet, no svg by default) that sits above dialogs", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const pop = await screen.findByRole("dialog")
    expect(pop).toHaveClass("ll-paper", "ll-stock-slip", "z-(--ll-z-popover)", "w-72")
    expect(pop).toHaveAttribute("data-stock", "slip")
    expect(pop).toHaveAttribute("data-edge", "cut")
    expect(pop.querySelector("svg")).toBeNull()
    expect(pop.style.getPropertyValue("--ll-tilt")).not.toBe("")
  })

  it("Radix positioning, side and alignment data reach the sheet", async () => {
    renderUI(<Demo defaultOpen content={{ side: "top", align: "start" }} />, opts)
    const pop = await screen.findByRole("dialog")
    expect(pop).toHaveAttribute("data-side", "top")
    expect(pop).toHaveAttribute("data-align", "start")
    expect(pop.className).toContain("origin-(--radix-popover-content-transform-origin)")
  })

  it("keeps 8 px between the slip and the window edge by default (collisionPadding), and lets you change it", async () => {
    const rect = (x: number, y: number, w: number, h: number) => ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      if (this.matches("[data-radix-popper-content-wrapper], [data-slot=popover-content]")) return rect(0, 0, 288, 200)
      if (this.matches("[aria-haspopup=dialog]")) return rect(0, 100, 40, 36)
      return rect(0, 0, 0, 0)
    })
    const size = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1024)
    const high = vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(768)
    const left = async (content?: React.ComponentProps<typeof PopoverContent>) => {
      const { unmount } = renderUI(<Demo defaultOpen content={content} />, opts)
      const wrapper = (await screen.findByRole("dialog")).closest<HTMLElement>("[data-radix-popper-content-wrapper]")!
      await waitFor(() => expect(wrapper.style.transform).toMatch(/^translate\(/))
      const x = parseFloat(wrapper.style.transform.slice("translate(".length))
      unmount()
      cleanup()
      return x
    }
    try {
      expect(await left({ collisionPadding: 0 })).toBe(0)
      expect(await left()).toBe(8)
      expect(await left({ collisionPadding: 20 })).toBe(20)
    } finally {
      spy.mockRestore()
      size.mockRestore()
      high.mockRestore()
    }
  })

  it("lets a component built on the popover rename the slot of the slip (a data-slot you pass wins over the default)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen content={{ "data-slot": "combobox-content" }} />, opts)
    const slip = await screen.findByRole("dialog")
    expect(slip).toHaveAttribute("data-slot", "combobox-content")
    expect(slip).toHaveClass("ll-paper")
    unmount()
    cleanup()
    renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-slot", "popover-content")
  })

  it("pin sticks a push-pin through the top edge (any colour); tape holds it with a strip", async () => {
    const { unmount } = renderUI(<Demo defaultOpen content={{ pin: true }} />, opts)
    const pop = await screen.findByRole("dialog")
    expect(pop.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
    unmount()
    const r2 = renderUI(<Demo defaultOpen content={{ pin: "sky", tape: "top" }} />, opts)
    const pop2 = await screen.findByRole("dialog")
    expect(pop2.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
    expect(pop2.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
    r2.unmount()
  })

  it("arrow draws a felt-tip pointer that Radix places on the anchor side; decorative, intrinsic art", async () => {
    renderUI(<Demo defaultOpen content={{ arrow: true }} />, opts)
    const pop = await screen.findByRole("dialog")
    const arrow = pop.querySelector('svg[data-slot="popover-arrow"]') as SVGElement
    expect(arrow).toBeTruthy()
    expect(arrow).toHaveAttribute("data-ink", "prop")
    expect(arrow).toHaveAttribute("aria-hidden", "true")
    expect(arrow).toHaveAttribute("focusable", "false")
    expect(arrow.getAttribute("viewBox")).toBe("0 0 22 20")
    expect(arrow.innerHTML).toContain("var(--ll-ink)")
  })

  it("a stock, an edge and a seed pass through; a torn edge is drawn when it opens", async () => {
    renderUI(<Demo defaultOpen content={{ stock: "sticky-yellow", edge: "torn", seed: "s", tilt: 1 }} />, opts)
    const pop = await screen.findByRole("dialog")
    expect(pop).toHaveAttribute("data-stock", "sticky-yellow")
    expect(pop).toHaveAttribute("data-edge", "torn")
    expect(pop.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
  })
})

describe("Popover keyboard and state", () => {
  it("Enter opens it, Escape closes it and returns focus to the trigger", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Open popover" })
    trigger.focus()
    await user.keyboard("{Enter}")
    const pop = await screen.findByRole("dialog")
    await waitFor(() => expect(pop.contains(document.activeElement)).toBe(true))
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("clicking outside closes it; the trigger toggles it", async () => {
    const { user, getByRole } = renderUI(
      <div>
        <Demo />
        <button>elsewhere</button>
      </div>,
      opts,
    )
    await user.click(getByRole("button", { name: "Open popover" }))
    await screen.findByRole("dialog")
    await user.click(getByRole("button", { name: "Open popover" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await user.click(getByRole("button", { name: "Open popover" }))
    await screen.findByRole("dialog")
    await user.click(getByRole("button", { name: "elsewhere" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("uncontrolled (defaultOpen) and controlled (open + onOpenChange)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    unmount()
    cleanup()
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Open popover" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("PopoverAnchor positions it from another element", async () => {
    renderUI(
      <Popover defaultOpen>
        <PopoverAnchor asChild>
          <div data-testid="anchor">anchor</div>
        </PopoverAnchor>
        <PopoverTrigger>t</PopoverTrigger>
        <PopoverContent aria-label="x">hi</PopoverContent>
      </Popover>,
      opts,
    )
    expect(screen.getByTestId("anchor")).toHaveAttribute("data-slot", "popover-anchor")
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
  })

  it("portalled content repeats the provider's density and motion", async () => {
    renderUI(
      <InkProvider density="calm" motion="reduced">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    const pop = await screen.findByRole("dialog")
    expect(pop).toHaveAttribute("data-density", "calm")
    expect(pop).toHaveAttribute("data-motion", "reduced")
  })
})

describe("Popover accessibility and server", () => {
  it("has no axe violations, closed and open (with pin and arrow too)", async () => {
    const { container, user, getByRole } = renderUI(<Demo content={{ pin: true, arrow: true }} />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Open popover" }))
    await screen.findByRole("dialog")
    await axeCheck()
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="popover-trigger"')
    expect(html).not.toContain("popover-content")
    expect(renderToString(tree())).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree()) as React.ReactElement
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

describe("pointerMark", () => {
  it("is deterministic per seed, sized as asked, in tokens only, and tiny", () => {
    const a = pointerMark("p")
    expect(pointerMark("p").svg).toBe(a.svg)
    expect(pointerMark("q").svg).not.toBe(a.svg)
    expect([a.w, a.h]).toEqual([22, 20])
    expect(pointerMark("p", { w: 14, h: 11 })).toMatchObject({ w: 14, h: 11 })
    for (const tier of ["lo", "hi"] as const) for (const calm of [false, true]) {
      const r = pointerMark("z", { tier, calm })
      expect(r.svg).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
      if (tier === "lo") expect(r.svg.length).toBeLessThan(3500)
    }
  })
})
