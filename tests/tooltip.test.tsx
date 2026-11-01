import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 32)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Demo({ content, provider, ...root }: React.ComponentProps<typeof Tooltip> & { content?: React.ComponentProps<typeof TooltipContent>; provider?: Partial<React.ComponentProps<typeof TooltipProvider>> }) {
  return (
    <TooltipProvider {...provider}>
      <Tooltip {...root}>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent {...content}>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const note = () => document.querySelector('[data-slot="tooltip-content"]') as HTMLElement | null

describe("Tooltip roles and parts", () => {
  it("shows on hover as a tooltip that describes the trigger; keeps upstream's slots", async () => {
    const { user, getByRole } = renderUI(<Demo />)
    const trigger = getByRole("button", { name: "Hover me" })
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger")
    expect(note()).toBeNull()
    await user.hover(trigger)
    const tip = await screen.findByRole("tooltip")
    expect(tip).toHaveTextContent("Add to library")
    expect(trigger.getAttribute("data-state")).toMatch(/open/)
    expect(trigger.getAttribute("aria-describedby")).toBe(tip.id)
    expect(note()).toBeTruthy()
    expect(document.querySelector('[data-slot="tooltip-provider"]')).toBeNull()
  })

  it("is a sticky note: a CSS sheet with a hand-drawn arrow as its only svg, above everything", async () => {
    renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(note()).toBeTruthy())
    const n = note() as HTMLElement
    expect(n).toHaveClass("ll-paper", "ll-stock-sticky-yellow", "z-(--ll-z-popover)", "w-fit", "text-balance")
    expect(n).toHaveAttribute("data-stock", "sticky-yellow")
    expect(n.className).toContain("origin-(--radix-tooltip-content-transform-origin)")
    const arrow = n.querySelector('svg[data-slot="tooltip-arrow"]') as SVGElement
    expect(arrow).toHaveAttribute("data-ink", "prop")
    expect(arrow).toHaveAttribute("aria-hidden", "true")
    expect(arrow.getAttribute("viewBox")).toBe("0 0 18 16")
    expect(n.querySelectorAll("svg")).toHaveLength(1)
  })

  it("arrow={false} draws none; stock, tilt, seed and className pass through", async () => {
    renderUI(<Demo defaultOpen content={{ arrow: false, stock: "sticky-pink", tilt: 0, seed: "s", className: "font-bold" }} />)
    await waitFor(() => expect(note()).toBeTruthy())
    const n = note() as HTMLElement
    expect(n.querySelector("svg")).toBeNull()
    expect(n).toHaveAttribute("data-stock", "sticky-pink")
    expect(n).toHaveClass("font-bold")
    expect(n.style.getPropertyValue("--ll-tilt")).toBe("")
  })

  it("Radix side data reaches the note", async () => {
    renderUI(<Demo defaultOpen content={{ side: "right" }} />)
    await waitFor(() => expect(note()).toHaveAttribute("data-side", "right"))
  })
})

describe("Tooltip keyboard, delay and touch", () => {
  it("opens on keyboard focus and Escape closes it", async () => {
    const { user } = renderUI(<Demo />)
    await user.tab()
    await screen.findByRole("tooltip")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
  })

  it("the provider's delayDuration holds it back, and 0 is instant (upstream's default)", async () => {
    const { user, getByRole, unmount } = renderUI(<Demo provider={{ delayDuration: 250 }} />)
    await user.hover(getByRole("button"))
    expect(screen.queryByRole("tooltip")).toBeNull()
    await screen.findByRole("tooltip", undefined, { timeout: 1500 })
    unmount()
    cleanup()
    const r = renderUI(<Demo />)
    await r.user.hover(r.getByRole("button"))
    expect(screen.queryByRole("tooltip")).not.toBeNull()
  })

  it("never opens on a touch pointer (Radix ignores it): tooltips are hints, not the only copy of anything", async () => {
    const { getByRole } = renderUI(<Demo />)
    const trigger = getByRole("button")
    fireEvent.pointerMove(trigger, { pointerType: "touch" })
    fireEvent.pointerEnter(trigger, { pointerType: "touch" })
    await new Promise((r) => setTimeout(r, 60))
    expect(screen.queryByRole("tooltip")).toBeNull()
  })
})

describe("Tooltip state and provider", () => {
  it("uncontrolled (defaultOpen) and controlled (open + onOpenChange)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(note()).toBeTruthy())
    unmount()
    cleanup()
    const onOpenChange = vi.fn()
    const { user, getByRole, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />)
    await user.hover(getByRole("button"))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))
    expect(note()).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await waitFor(() => expect(note()).toBeTruthy())
  })

  it("portalled content repeats the provider's density", async () => {
    renderUI(
      <InkProvider density="calm">
        <Demo defaultOpen />
      </InkProvider>,
    )
    await waitFor(() => expect(note()).toHaveAttribute("data-density", "calm"))
  })
})

describe("Tooltip accessibility and server", () => {
  it("has no axe violations closed and open", async () => {
    const { container } = renderUI(<Demo />)
    await axeCheck(container)
    cleanup()
    renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(note()).toBeTruthy())
    await axeCheck()
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="tooltip-trigger"')
    expect(html).not.toContain("tooltip-content")
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
