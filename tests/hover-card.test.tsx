import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { HoverCard, HoverCardCaption, HoverCardContent, HoverCardMedia, HoverCardTrigger } from "@/components/ui/hover-card"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { hoverCardMediaRecipe } from "@/lib/ink/recipes/hover-card-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(236, 96)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Demo({ content, ...root }: React.ComponentProps<typeof HoverCard> & { content?: React.ComponentProps<typeof HoverCardContent> }) {
  return (
    <HoverCard openDelay={0} closeDelay={0} {...root}>
      <HoverCardTrigger asChild>
        <a href="#looseleaf">@looseleaf</a>
      </HoverCardTrigger>
      <HoverCardContent {...content}>
        <HoverCardMedia>photo</HoverCardMedia>
        <HoverCardCaption>@looseleaf</HoverCardCaption>
        <p>shadcn/ui, drawn by hand.</p>
      </HoverCardContent>
    </HoverCard>
  )
}

describe("HoverCard parts", () => {
  it("opens on hover and closes when the pointer leaves; keeps upstream's slots", async () => {
    const { user, getByRole } = renderUI(<Demo />)
    const trigger = getByRole("link", { name: "@looseleaf" })
    expect(trigger).toHaveAttribute("data-slot", "hover-card-trigger")
    expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull()
    await user.hover(trigger)
    const card = await waitFor(() => {
      const c = document.querySelector('[data-slot="hover-card-content"]')
      expect(c).not.toBeNull()
      return c as HTMLElement
    })
    expect(card).toHaveAttribute("data-state", "open")
    expect(document.querySelector('[data-slot="hover-card-media"]')).toBeTruthy()
    expect(document.querySelector('[data-slot="hover-card-caption"]')).toHaveTextContent("@looseleaf")
    await user.unhover(trigger)
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull())
  })

  it("is a small polaroid: photo stock with a thick lower margin, tilted, above dialogs", async () => {
    renderUI(<Demo defaultOpen />)
    const card = (await waitFor(() => {
      const c = document.querySelector('[data-slot="hover-card-content"]')
      expect(c).not.toBeNull()
      return c
    })) as HTMLElement
    expect(card).toHaveClass("ll-paper", "ll-stock-photo", "w-64", "p-2.5", "pb-4", "z-(--ll-z-popover)")
    expect(card).toHaveAttribute("data-stock", "photo")
    expect(card).toHaveAttribute("data-edge", "cut")
    expect(card.style.getPropertyValue("--ll-tilt")).not.toBe("")
    expect(card.className).toContain("origin-(--radix-hover-card-content-transform-origin)")
    expect(card.querySelectorAll(":scope > svg")).toHaveLength(0)
  })

  it("the media window is a drawn recess (a host with an exact frame) and the caption is script handwriting", async () => {
    renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-media"]')).toBeTruthy())
    const media = document.querySelector('[data-slot="hover-card-media"]') as HTMLElement
    expect(media).toHaveAttribute("data-ink-host")
    expect(media).toHaveAttribute("data-ink-ready")
    expectInkLayers(media, { min: 1, kinds: ["frame"], absolute: true, layers: ["rest"] })
    expect(document.querySelector('[data-slot="hover-card-caption"]')).toHaveClass("font-script")
  })

  it("tape, edge, stock, tilt and seed pass through", async () => {
    renderUI(<Demo defaultOpen content={{ tape: "top", stock: "paper", tilt: 0, seed: "s", className: "w-72" }} />)
    const card = (await waitFor(() => {
      const c = document.querySelector('[data-slot="hover-card-content"]')
      expect(c).not.toBeNull()
      return c
    })) as HTMLElement
    expect(card.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
    expect(card).toHaveAttribute("data-stock", "paper")
    expect(card).toHaveClass("w-72")
    expect(card.style.getPropertyValue("--ll-tilt")).toBe("")
  })
})

describe("HoverCard keyboard and state", () => {
  it("opens on keyboard focus of the trigger and Escape dismisses it", async () => {
    const { user } = renderUI(<Demo />)
    await user.tab()
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).not.toBeNull())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull())
  })

  it("uncontrolled (defaultOpen) and controlled (open + onOpenChange)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).not.toBeNull())
    unmount()
    cleanup()
    const onOpenChange = vi.fn()
    const { user, getByRole, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />)
    await user.hover(getByRole("link"))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true))
    expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).not.toBeNull())
  })

  it("portalled content repeats the provider's density", async () => {
    renderUI(
      <InkProvider density="calm">
        <Demo defaultOpen />
      </InkProvider>,
    )
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).toHaveAttribute("data-density", "calm"))
  })
})

describe("HoverCard accessibility and server", () => {
  it("has no axe violations open or closed", async () => {
    const { container } = renderUI(<Demo />)
    await axeCheck(container)
    cleanup()
    renderUI(<Demo defaultOpen />)
    await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).not.toBeNull())
    await axeCheck()
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="hover-card-trigger"')
    expect(html).not.toContain("hover-card-content")
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

describe("hoverCardMediaRecipe", () => {
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  it("frames any window size in tokens only, inside the lo budget; calm drops the shading", () => {
    for (const [w, h] of [[236, 96], [236, 180], [40, 20], [8, 8]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const f = runRecipe(hoverCardMediaRecipe, { params: {}, box: { w, h }, seed: "m", tier, density, dir: "ltr", knobs: DEFAULT_KNOBS })
          const rest = f.parts.rest ?? ""
          expect(rest, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          if (tier === "lo") {
            expect(nodes(rest)).toBeLessThanOrEqual(12)
            expect(rest.length).toBeLessThanOrEqual(8000)
          }
        }
      }
    }
    const calm = runRecipe(hoverCardMediaRecipe, { params: {}, box: { w: 236, h: 96 }, seed: "m", tier: "lo", density: "calm", dir: "ltr", knobs: DEFAULT_KNOBS })
    const full = runRecipe(hoverCardMediaRecipe, { params: {}, box: { w: 236, h: 96 }, seed: "m", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
    expect((calm.parts.rest ?? "").length).toBeLessThan((full.parts.rest ?? "").length)
  })
})
