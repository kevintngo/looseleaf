import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { alertMediaRecipe } from "@/lib/ink/recipes/alert-dialog-ink"
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

function Demo({ content, onAction, ...root }: React.ComponentProps<typeof AlertDialog> & { content?: React.ComponentProps<typeof AlertDialogContent>; onAction?: () => void }) {
  return (
    <AlertDialog {...root}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete notebook</Button>
      </AlertDialogTrigger>
      <AlertDialogContent {...content}>
        <AlertDialogHeader>
          <AlertDialogMedia tone="danger">!</AlertDialogMedia>
          <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onAction}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe("AlertDialog roles and parts", () => {
  it("opens as an alertdialog with a name and a description, and keeps upstream's slots", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    expect(getByRole("button", { name: "Delete notebook" })).toHaveAttribute("data-slot", "alert-dialog-trigger")
    await user.click(getByRole("button", { name: "Delete notebook" }))
    const dlg = await screen.findByRole("alertdialog", { name: "Delete this notebook?" })
    expect(dlg).toHaveAccessibleDescription("This cannot be undone.")
    expect(dlg).toHaveAttribute("data-slot", "alert-dialog-content")
    expect(dlg).toHaveAttribute("data-size", "default")
    for (const slot of ["alert-dialog-overlay", "alert-dialog-header", "alert-dialog-title", "alert-dialog-description", "alert-dialog-media", "alert-dialog-footer", "alert-dialog-action", "alert-dialog-cancel"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
  })

  it("action and cancel are Looseleaf Buttons (drawn hosts), cancel outline by default, action the primary", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    const action = screen.getByRole("button", { name: "Delete" })
    expect(cancel).toHaveAttribute("data-variant", "outline")
    expect(action).toHaveAttribute("data-variant", "destructive")
    expect(cancel).toHaveAttribute("data-ink-host")
    expectInkLayers(action, { min: 1, kinds: ["button"], absolute: true })
  })

  it("has no close button: the person must answer", async () => {
    renderUI(<Demo defaultOpen />, opts)
    await screen.findByRole("alertdialog")
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })

  it("is a Paper sheet inside the dim; size=\"sm\" is narrow", async () => {
    renderUI(<Demo defaultOpen content={{ size: "sm" }} />, opts)
    const dlg = await screen.findByRole("alertdialog")
    expect(dlg).toHaveClass("ll-paper", "data-[size=sm]:max-w-xs")
    expect(dlg).toHaveAttribute("data-size", "sm")
    expect(document.querySelector('[data-slot="alert-dialog-overlay"]')).toContainElement(dlg)
    expect(dlg.className).toContain("data-[state=open]:animate-sheet-drop")
  })

  it("tone=\"danger\" tapes hazard strips across the top corners; the default has none", async () => {
    const { unmount } = renderUI(<Demo defaultOpen content={{ tone: "danger" }} />, opts)
    const dlg = await screen.findByRole("alertdialog")
    expect(dlg).toHaveAttribute("data-tone", "danger")
    const strips = dlg.querySelectorAll('svg[data-slot="tape"]')
    expect(strips).toHaveLength(2)
    expect(strips[0]).toHaveAttribute("data-kind", "washi-stripes")
    unmount()
    renderUI(<Demo defaultOpen />, opts)
    expect((await screen.findByRole("alertdialog")).querySelectorAll('svg[data-slot="tape"]')).toHaveLength(0)
  })

  it("the media is a drawn round patch behind the icon, with an exact server size", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const media = (await screen.findByRole("alertdialog")).querySelector('[data-slot="alert-dialog-media"]') as HTMLElement
    expect(media).toHaveAttribute("data-ink-host")
    expect(media).toHaveAttribute("data-ink-ready")
    expectInkLayers(media, { min: 1, kinds: ["plate"], absolute: true, layers: ["rest"] })
    expect(media.className).toContain("*:[svg:not(.absolute):not([class*='size-'])]:size-8")
    expect(renderToString(<AlertDialogMedia tone="info">i</AlertDialogMedia>)).toContain('data-ink="plate"')
  })
})

describe("AlertDialog keyboard and focus", () => {
  it("focuses Cancel first (the safe answer), Escape closes it and returns focus to the trigger", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Delete notebook" })
    await user.click(trigger)
    const cancel = await screen.findByRole("button", { name: "Cancel" })
    await waitFor(() => expect(cancel).toHaveFocus())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("does not close when the outside is clicked; Cancel closes; Action runs and closes", async () => {
    const onAction = vi.fn()
    const { user, getByRole } = renderUI(<Demo onAction={onAction} />, opts)
    await user.click(getByRole("button", { name: "Delete notebook" }))
    await screen.findByRole("alertdialog")
    await user.click(document.querySelector('[data-slot="alert-dialog-overlay"]') as HTMLElement)
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    await user.click(getByRole("button", { name: "Delete notebook" }))
    await user.click(await screen.findByRole("button", { name: "Delete" }))
    expect(onAction).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  })

  it("traps Tab inside", async () => {
    const { user } = renderUI(<Demo defaultOpen />, opts)
    const dlg = await screen.findByRole("alertdialog")
    for (let i = 0; i < 6; i++) {
      await user.tab()
      expect(dlg.contains(document.activeElement)).toBe(true)
    }
  })
})

describe("AlertDialog controlled and uncontrolled", () => {
  it("defaultOpen opens it", async () => {
    renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
  })

  it("controlled: open wins, onOpenChange is told", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Delete notebook" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("alertdialog")).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await screen.findByRole("alertdialog")
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})

describe("AlertDialog provider, accessibility, server", () => {
  it("portalled content repeats the provider's density", async () => {
    renderUI(
      <InkProvider density="compact">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    expect(await screen.findByRole("alertdialog")).toHaveAttribute("data-density", "compact")
  })

  it("has no axe violations, closed and open (danger tone too)", async () => {
    const { container, user, getByRole } = renderUI(<Demo content={{ tone: "danger" }} />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Delete notebook" }))
    await screen.findByRole("alertdialog")
    await axeCheck()
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="alert-dialog-trigger"')
    expect(html).not.toContain("alert-dialog-content")
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

describe("alertMediaRecipe", () => {
  const req = { seed: "m", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS, box: { w: 64, h: 64 } }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("draws each tone at every density and tier in tokens only, within the lo budget", () => {
    for (const tone of ["default", "danger", "info"] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const f = runRecipe(alertMediaRecipe, { ...req, params: { tone }, density, tier })
          const all = f.parts.rest ?? ""
          expect(all, `${tone}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          if (tier === "lo") {
            expect(nodes(all)).toBeLessThanOrEqual(12)
            expect(all.length).toBeLessThanOrEqual(8000)
          }
        }
      }
    }
  })
})
