import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { sheetBindingRecipe } from "@/lib/ink/recipes/sheet-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 300)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ content, ...root }: React.ComponentProps<typeof Sheet> & { content?: React.ComponentProps<typeof SheetContent> }) {
  return (
    <Sheet {...root}>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent {...content}>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here.</SheetDescription>
        </SheetHeader>
        <input aria-label="Name" />
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close sheet</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

describe("Sheet roles and parts", () => {
  it("opens as a named, described dialog and keeps upstream's slots", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    expect(getByRole("button", { name: "Open" })).toHaveAttribute("data-slot", "sheet-trigger")
    await user.click(getByRole("button", { name: "Open" }))
    const dlg = await screen.findByRole("dialog", { name: "Edit profile" })
    expect(dlg).toHaveAccessibleDescription("Make changes to your profile here.")
    expect(dlg).toHaveAttribute("data-slot", "sheet-content")
    for (const slot of ["sheet-overlay", "sheet-header", "sheet-title", "sheet-description", "sheet-footer", "sheet-close"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
  })

  it("slides in from each side and sits flush to it", async () => {
    const want: Record<string, string[]> = {
      right: ["inset-y-0", "right-0", "data-[state=open]:slide-in-from-right", "sm:max-w-sm"],
      left: ["inset-y-0", "left-0", "data-[state=open]:slide-in-from-left", "sm:max-w-sm"],
      top: ["inset-x-0", "top-0", "data-[state=open]:slide-in-from-top"],
      bottom: ["inset-x-0", "bottom-0", "data-[state=open]:slide-in-from-bottom"],
    }
    for (const [side, classes] of Object.entries(want)) {
      const { unmount } = renderUI(<Demo defaultOpen content={{ side: side as "top" }} />, opts)
      const dlg = await screen.findByRole("dialog")
      expect(dlg).toHaveAttribute("data-side", side)
      expect(dlg).toHaveClass(...classes)
      unmount()
    }
  })

  it("is a Paper page that does not tilt and does not scroll itself (its shadow would be clipped)", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveClass("ll-paper", "fixed", "flex-col")
    expect(dlg).not.toHaveClass("overflow-y-auto")
    expect(dlg.style.getPropertyValue("--ll-tilt")).toBe("")
    expect(dlg.className).toContain("data-[side=right]:[--ll-sheet-shadow:")
  })

  it("draws a spiral on the inner edge by default, and the gutter keeps text clear of it", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const dlg = await screen.findByRole("dialog")
    const strip = dlg.querySelector('[data-slot="sheet-binding"]') as HTMLElement
    expect(strip).toHaveAttribute("aria-hidden", "true")
    expect(strip).toHaveClass("left-0", "pointer-events-none", "absolute")
    expectInkLayers(strip, { min: 1, kinds: ["binding"], absolute: true, layers: ["rest"] })
    expect(dlg).toHaveClass("pl-6")
    expect(dlg).toHaveAttribute("data-binding", "spiral")
  })

  it("binds along the edge that faces the middle of the screen, for every side", async () => {
    const edge: Record<string, string> = { right: "left-0", left: "right-0", top: "bottom-0", bottom: "top-0" }
    for (const [side, cls] of Object.entries(edge)) {
      const { unmount } = renderUI(<Demo defaultOpen content={{ side: side as "top" }} />, opts)
      const dlg = await screen.findByRole("dialog")
      expect(dlg.querySelector('[data-slot="sheet-binding"]'), side).toHaveClass(cls)
      unmount()
    }
  })

  it("holes bind with three rings; perf and torn draw the page's own edge; none draws nothing", async () => {
    let r = renderUI(<Demo defaultOpen content={{ binding: "holes" }} />, opts)
    expect(await screen.findByRole("dialog")).toContainElement(document.querySelector('[data-slot="sheet-binding"]'))
    r.unmount()
    for (const b of ["perf", "torn"] as const) {
      r = renderUI(<Demo defaultOpen content={{ binding: b }} />, opts)
      const dlg = await screen.findByRole("dialog")
      expect(dlg.querySelector('[data-slot="sheet-binding"]')).toBeNull()
      expect(dlg).toHaveAttribute("data-edge", b)
      expect(dlg.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
      r.unmount()
    }
    r = renderUI(<Demo defaultOpen content={{ binding: "none" }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg.querySelector('[data-slot="sheet-binding"]')).toBeNull()
    expect(dlg.querySelector(':scope > svg')).toBeNull()
    expect(dlg).toHaveAttribute("data-edge", "cut")
  })

  it("the close mark steps aside for the coils when they run along its corner", async () => {
    let r = renderUI(<Demo defaultOpen content={{ side: "left" }} />, opts)
    expect((await screen.findByRole("button", { name: "Close" })).className).toContain("end-9")
    r.unmount()
    r = renderUI(<Demo defaultOpen content={{ side: "bottom" }} />, opts)
    expect((await screen.findByRole("button", { name: "Close" })).className).toContain("top-9")
    r.unmount()
    r = renderUI(<Demo defaultOpen content={{ side: "right", showCloseButton: false }} />, opts)
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })

  it("passes stock, rules, className and Radix props through", async () => {
    const onEscapeKeyDown = vi.fn()
    renderUI(<Demo defaultOpen content={{ stock: "pad", rules: "ruled", className: "w-96", onEscapeKeyDown, seed: "s" }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveAttribute("data-stock", "pad")
    expect(dlg).toHaveClass("w-96")
    expect(dlg.querySelector('[data-slot="paper-rules"]')).toBeTruthy()
    const { user } = renderUI(<div />)
    await user.keyboard("{Escape}")
    expect(onEscapeKeyDown).toHaveBeenCalled()
  })
})

describe("Sheet keyboard, focus and state", () => {
  it("traps focus, closes on Escape and returns focus to the trigger", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Open" })
    await user.click(trigger)
    const dlg = await screen.findByRole("dialog")
    await waitFor(() => expect(dlg.contains(document.activeElement)).toBe(true))
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dlg.contains(document.activeElement)).toBe(true)
    }
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("SheetClose and the close mark close it; the dim closes it too", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    for (const how of ["Close sheet", "Close", "overlay"]) {
      await user.click(getByRole("button", { name: "Open" }))
      await screen.findByRole("dialog")
      if (how === "overlay") await user.click(document.querySelector('[data-slot="sheet-overlay"]') as HTMLElement)
      else await user.click(screen.getByRole("button", { name: how }))
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    }
  })

  it("uncontrolled (defaultOpen) and controlled (open + onOpenChange)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    unmount()
    cleanup()
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("portalled content repeats the provider's density and motion", async () => {
    renderUI(
      <InkProvider density="calm" motion="reduced">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveAttribute("data-density", "calm")
    expect(dlg).toHaveAttribute("data-motion", "reduced")
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toHaveAttribute("data-density", "calm")
  })
})

describe("Sheet accessibility and server", () => {
  it("has no axe violations, closed and open, for every binding", async () => {
    const { container, user, getByRole } = renderUI(<Demo />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Open" }))
    await screen.findByRole("dialog")
    await axeCheck()
    cleanup()
    for (const binding of ["holes", "perf", "none"] as const) {
      renderUI(<Demo defaultOpen content={{ binding }} />, opts)
      await screen.findByRole("dialog")
      await axeCheck()
      cleanup()
    }
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="sheet-trigger"')
    expect(html).not.toContain("sheet-content")
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

describe("sheetBindingRecipe", () => {
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (edge: "left" | "right" | "top" | "bottom", kind: "spiral" | "holes", w: number, h: number, extra: object = {}) =>
    runRecipe(sheetBindingRecipe, { params: { edge, kind }, box: { w, h }, seed: "b", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS, ...extra })

  it("draws every edge and kind, at page sizes and absurd ones, in tokens only", () => {
    for (const edge of ["left", "right", "top", "bottom"] as const) {
      for (const kind of ["spiral", "holes"] as const) {
        for (const [w, h] of [[28, 900], [28, 60], [900, 28], [60, 28], [28, 8], [4, 4]]) {
          for (const density of ["comfortable", "calm"] as const) {
            const f = run(edge, kind, w, h, { density })
            expect(f.parts.rest ?? "", `${edge}/${kind}/${w}x${h}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("a long page costs a handful of nodes and about 7 bytes a pixel of length, not a ribbon per coil", () => {
    for (const [edge, w, h] of [["left", 28, 1200], ["top", 1200, 28]] as const) {
      const f = run(edge, "spiral", w, h)
      expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(1200 * 7.5)
    }
    expect((run("left", "holes", 28, 900).parts.rest ?? "").length).toBeLessThan(1500)
  })

  it("puts the coils on the requested edge and keeps the same hand for the same seed", () => {
    const a = run("left", "spiral", 28, 400).parts.rest
    expect(a).toBe(run("left", "spiral", 28, 400).parts.rest)
    expect(a).not.toBe(run("right", "spiral", 28, 400).parts.rest)
    expect(a).not.toBe(run("left", "spiral", 28, 400, { seed: "other" }).parts.rest)
  })
})
