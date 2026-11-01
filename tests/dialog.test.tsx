import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { closeMarkRecipe } from "@/lib/ink/recipes/overlay-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo(props: React.ComponentProps<typeof Dialog> & { content?: React.ComponentProps<typeof DialogContent> }) {
  const { content, ...root } = props
  return (
    <Dialog {...root}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>
      <DialogContent {...content}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <input aria-label="Name" defaultValue="Pedro" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog roles and parts", () => {
  it("opens from its trigger as a named, described modal dialog", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(getByRole("button", { name: "Edit profile" }))
    const dlg = await screen.findByRole("dialog", { name: "Edit profile" })
    expect(dlg).toHaveAccessibleDescription("Make changes to your profile here.")
    expect(dlg).toHaveAttribute("data-state", "open")
    expect(dlg).toHaveAttribute("data-slot", "dialog-content")
  })

  it("keeps every upstream data-slot", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    expect(getByRole("button", { name: "Edit profile" })).toHaveAttribute("data-slot", "dialog-trigger")
    await user.click(getByRole("button", { name: "Edit profile" }))
    await screen.findByRole("dialog")
    for (const slot of ["dialog-overlay", "dialog-content", "dialog-header", "dialog-title", "dialog-description", "dialog-footer", "dialog-close"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
  })

  it("the content is a Paper sheet (a CSS sheet: no svg of its own) inside the dim, which is also the scroll container", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    await user.click(getByRole("button", { name: "Edit profile" }))
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveClass("ll-paper", "ll-stock-paper")
    expect(dlg).toHaveAttribute("data-stock", "paper")
    expect(dlg).toHaveAttribute("data-edge", "cut")
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement
    expect(overlay).toContainElement(dlg)
    expect(overlay).toHaveClass("fixed", "inset-0", "overflow-y-auto")
    expect(overlay.className).toContain("[background:var(--ll-overlay-dim)]")
    expect(dlg.querySelectorAll(":scope > svg")).toHaveLength(0)
    expect(dlg.querySelectorAll('[data-part="x"] > svg[data-ink="close"]')).toHaveLength(1)
  })

  it("drops in (ll-sheet-drop), sits above nothing but the toasts (z-overlay), and is a full-width bottom sheet on phones", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    await user.click(getByRole("button", { name: "Edit profile" }))
    const dlg = await screen.findByRole("dialog")
    expect(dlg.className).toContain("data-[state=open]:animate-sheet-drop")
    expect(dlg.className).toContain("max-sm:data-[state=open]:slide-in-from-bottom-16")
    expect(dlg.className).toContain("max-sm:max-w-none")
    expect(dlg.className).toContain("max-sm:[--ll-tilt:0deg]!")
    expect(document.querySelector('[data-slot="dialog-overlay"]')!.className).toContain("z-(--ll-z-overlay)")
  })
})

describe("Dialog keyboard and focus", () => {
  it("moves focus into the dialog, traps Tab, and Escape closes it and returns focus to the trigger", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Edit profile" })
    await user.click(trigger)
    const dlg = await screen.findByRole("dialog")
    await waitFor(() => expect(dlg.contains(document.activeElement)).toBe(true))
    for (let i = 0; i < 8; i++) {
      await user.tab()
      expect(dlg.contains(document.activeElement)).toBe(true)
    }
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("the close mark closes it; a DialogClose child closes it; the outside does too", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    await user.click(getByRole("button", { name: "Edit profile" }))
    await user.click(await screen.findByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())

    await user.click(getByRole("button", { name: "Edit profile" }))
    await user.click(await screen.findByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())

    await user.click(getByRole("button", { name: "Edit profile" }))
    await screen.findByRole("dialog")
    await user.click(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("locks body scroll while open and releases it", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    await user.click(getByRole("button", { name: "Edit profile" }))
    await screen.findByRole("dialog")
    expect(document.body.style.pointerEvents).toBe("none")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(document.body.style.pointerEvents).not.toBe("none"))
  })
})

describe("Dialog controlled and uncontrolled", () => {
  it("uncontrolled: defaultOpen shows it at once", async () => {
    renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("dialog", { name: "Edit profile" })).toBeInTheDocument()
  })

  it("controlled: open decides, onOpenChange is told", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Edit profile" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("Dialog extras", () => {
  it("showCloseButton={false} leaves no close mark; the header keeps its text", async () => {
    renderUI(<Demo defaultOpen content={{ showCloseButton: false }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg.querySelector('[data-part="x"]')).toBeNull()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })

  it("DialogFooter showCloseButton adds a Close button", async () => {
    renderUI(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>,
      opts,
    )
    expect(await screen.findByRole("button", { name: "Close" })).toHaveAttribute("data-slot", "button")
  })

  it("tape and fasteners are drawn props of the sheet; tape hides in calm density", async () => {
    renderUI(<Demo defaultOpen content={{ tape: "both", tapeKind: "washi-dots", fastener: "clip" }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(2)
    expect(dlg.querySelector('svg[data-slot="fastener"]')).toBeTruthy()
    expect(dlg.querySelector('svg[data-slot="tape"]')).toHaveClass("calm:hidden")
  })

  it("a torn edge draws the sheet once it is measured (on open)", async () => {
    renderUI(<Demo defaultOpen content={{ edge: "torn" }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveAttribute("data-edge", "torn")
    expect(dlg.querySelector(":scope > svg[data-ink=\"sheet\"]")).toBeTruthy()
    expectInkLayers(dlg.querySelector('[data-part="x"]') as HTMLElement, { min: 1, kinds: ["close"], absolute: true })
  })

  it("DialogBody is the scrolling middle (the sheet itself never scrolls, so its shadow and tape are not clipped)", async () => {
    renderUI(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
          <DialogBody>long text</DialogBody>
        </DialogContent>
      </Dialog>,
      opts,
    )
    const dlg = await screen.findByRole("dialog")
    expect(dlg).not.toHaveClass("overflow-y-auto")
    expect(screen.getByText("long text")).toHaveClass("overflow-y-auto")
  })

  it("passes className, seed and ref-able Radix props through; a pinned seed draws the same close mark", async () => {
    const onOpenAutoFocus = vi.fn()
    renderUI(<Demo defaultOpen content={{ className: "sm:max-w-[425px]", seed: "fixed", onOpenAutoFocus }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveClass("sm:max-w-[425px]")
    expect(onOpenAutoFocus).toHaveBeenCalled()
    const a = (dlg.querySelector('[data-ink="close"]') as SVGElement).innerHTML
    cleanup()
    renderUI(<Demo defaultOpen content={{ seed: "fixed" }} />, opts)
    const dlg2 = await screen.findByRole("dialog")
    expect((dlg2.querySelector('[data-ink="close"]') as SVGElement).innerHTML).toBe(a)
  })
})

describe("Dialog right-to-left", () => {
  it("places the close mark and the header padding with logical properties, so a rtl page mirrors them", async () => {
    document.documentElement.setAttribute("dir", "rtl")
    try {
      renderUI(<Demo defaultOpen />, opts)
      const x = await screen.findByRole("button", { name: "Close" })
      expect(x).toHaveClass("end-3", "top-3")
      expect(x.className).not.toMatch(/\b(left|right)-/)
      expect(document.querySelector('[data-slot="dialog-header"]')!.className).toContain("sm:text-start")
    } finally {
      document.documentElement.removeAttribute("dir")
    }
  })
})

describe("Dialog ink and provider", () => {
  it("the close mark is decorative overlay ink on a host: rest, hover, lazy focus", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const x = (await screen.findByRole("button", { name: "Close" })) as HTMLElement
    expect(x).toHaveAttribute("data-ink-host")
    expect(x).toHaveAttribute("data-ink-ready")
    expectInkLayers(x, { min: 1, kinds: ["close"], absolute: true, layers: ["rest", "hover"] })
    expect(x.querySelector('[data-layer="focus"]')).toBeNull()
    act(() => x.focus())
  })

  it("portalled content repeats the provider's density (the portal leaves its wrapper)", async () => {
    renderUI(
      <InkProvider density="calm">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveAttribute("data-density", "calm")
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toHaveAttribute("data-density", "calm")
  })

  it("reduced motion follows the provider too", async () => {
    renderUI(
      <InkProvider motion="reduced">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-motion", "reduced")
  })
})

describe("Dialog accessibility", () => {
  it("has no axe violations, closed and open", async () => {
    const { container, user, getByRole } = renderUI(<Demo />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Edit profile" }))
    await screen.findByRole("dialog")
    await axeCheck()
  })
})

describe("Dialog on the server and hydration", () => {
  const tree = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>t</DialogTitle>
        <DialogDescription>d</DialogDescription>
      </DialogContent>
    </Dialog>
  )

  it("renders only the trigger, deterministically", () => {
    const html = renderToString(tree())
    expect(html).toContain('data-slot="dialog-trigger"')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).not.toContain("dialog-content")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings, bare and inside the provider", () => {
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

  it("renders the open dialog client-side without React warnings (StrictMode)", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <React.StrictMode>
        <Demo defaultOpen content={{ tape: "top" }} />
      </React.StrictMode>,
    )
    await screen.findByRole("dialog")
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })
})

describe("closeMarkRecipe", () => {
  const req = { params: {}, seed: "x", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS, box: { w: 32, h: 32 } }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("draws sane markup at every density and tier, in tokens only", () => {
    for (const density of ["comfortable", "compact", "calm"] as const) {
      for (const tier of ["lo", "hi"] as const) {
        for (const params of [{}, { tone: "red" as const }]) {
          const f = runRecipe(closeMarkRecipe, { ...req, density, tier, params, lazy: ["focus"] })
          expect(Object.values(f.parts).join(""), `${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })

  it("stays inside the lo-tier budget (a visible state is at most 12 nodes and 8 KB) and keeps focus lazy", () => {
    const f = runRecipe(closeMarkRecipe, req)
    expect(f.layers).toEqual(["rest", "hover"])
    expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
    expect(nodes(f.parts.hover ?? "")).toBeLessThanOrEqual(12)
    expect((f.parts.rest ?? "").length + (f.parts.hover ?? "").length).toBeLessThanOrEqual(8000)
    const g = runRecipe(closeMarkRecipe, { ...req, lazy: ["focus"] })
    expect(g.layers).toEqual(["rest", "hover", "focus"])
    expect(g.parts.rest).toBe(f.parts.rest)
  })
})
