import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 300)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ content, ...root }: React.ComponentProps<typeof Drawer> & { content?: React.ComponentProps<typeof DrawerContent> }) {
  return (
    <Drawer {...root}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent {...content}>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <input aria-label="Goal" />
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe("Drawer roles and parts", () => {
  it("opens as a named, described dialog with upstream's slots and vaul's direction attribute", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    expect(getByRole("button", { name: "Open drawer" })).toHaveAttribute("data-slot", "drawer-trigger")
    await user.click(getByRole("button", { name: "Open drawer" }))
    const dlg = await screen.findByRole("dialog", { name: "Move goal" })
    expect(dlg).toHaveAccessibleDescription("Set your daily activity goal.")
    expect(dlg).toHaveAttribute("data-slot", "drawer-content")
    expect(dlg).toHaveAttribute("data-vaul-drawer-direction", "bottom")
    for (const slot of ["drawer-overlay", "drawer-header", "drawer-title", "drawer-description", "drawer-footer", "drawer-close"]) {
      expect(document.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
  })

  it("is a slip torn off a pad along its top edge (drawn) with a tape strip as the grab tab", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg).toHaveClass("ll-paper", "fixed", "flex-col")
    expect(dlg).toHaveAttribute("data-stock", "slip")
    expect(dlg).toHaveAttribute("data-edge", "torn")
    expect(dlg.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
    const tab = dlg.querySelector('svg[data-slot="tape"]') as SVGElement
    expect(tab).toBeTruthy()
    expect(tab).toHaveAttribute("data-kind", "kraft")
    expect(tab.getAttribute("class")).toContain("group-data-[vaul-drawer-direction=bottom]/drawer-content:block")
    expect(tab.getAttribute("class")).toContain("hidden")
  })

  it("the tape kind is a prop, and the sheet takes stock and edge", async () => {
    renderUI(<Demo defaultOpen content={{ tapeKind: "washi-stripes", tapeColor: "sky", stock: "paper", edge: "cut" }} />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg.querySelector('svg[data-slot="tape"]')).toHaveAttribute("data-kind", "washi-stripes")
    expect(dlg).toHaveAttribute("data-stock", "paper")
    expect(dlg).toHaveAttribute("data-edge", "cut")
  })

  it("other directions are plain cut slips without a torn edge, sized as upstream", async () => {
    for (const direction of ["top", "left", "right"] as const) {
      const { unmount } = renderUI(<Demo defaultOpen direction={direction} />, opts)
      const dlg = await screen.findByRole("dialog")
      expect(dlg).toHaveAttribute("data-vaul-drawer-direction", direction)
      expect(dlg).toHaveAttribute("data-edge", "cut")
      expect(dlg.className).toContain(`data-[vaul-drawer-direction=${direction}]:`)
      unmount()
    }
  })

  it("sits on the overlay level of the z-scale (like dialogs and sheets: a drawer opened from a dialog stacks by DOM order, not behind it)", async () => {
    renderUI(<Demo defaultOpen />, opts)
    const dlg = await screen.findByRole("dialog")
    expect(dlg.className).toContain("z-(--ll-z-overlay)")
    expect(document.querySelector('[data-slot="drawer-overlay"]')!.className).toContain("z-(--ll-z-overlay)")
    expect(document.querySelector('[data-slot="drawer-overlay"]')!.className).toContain("[background:var(--ll-overlay-dim)]")
  })
})

describe("Drawer keyboard, focus and state", () => {
  it("Escape closes it and returns focus to the trigger; DrawerClose closes it", async () => {
    const { user, getByRole } = renderUI(<Demo />, opts)
    const trigger = getByRole("button", { name: "Open drawer" })
    await user.click(trigger)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
    await user.click(trigger)
    await user.click(await screen.findByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("focus lands on the sheet itself, not on the trigger behind the dim and not on a field (no phone keyboard pops up); Tab then starts inside", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(screen.getByRole("button", { name: "Open drawer" }))
    const dlg = await screen.findByRole("dialog")
    await waitFor(() => expect(dlg).toHaveFocus())
    await user.tab()
    expect(dlg.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).not.toBe(dlg)
  })

  it("autoFocus moves focus to the first field instead, and Tab then stays inside", async () => {
    const { user } = renderUI(<Demo defaultOpen autoFocus />, opts)
    const dlg = await screen.findByRole("dialog")
    await waitFor(() => expect(dlg.contains(document.activeElement)).toBe(true))
    for (let i = 0; i < 5; i++) {
      await user.tab()
      expect(dlg.contains(document.activeElement)).toBe(true)
    }
  })

  it("uncontrolled (defaultOpen) and controlled (open + onOpenChange)", async () => {
    const { unmount } = renderUI(<Demo defaultOpen />, opts)
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    unmount()
    cleanup()
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open={false} onOpenChange={onOpenChange} />, opts)
    await user.click(screen.getByRole("button", { name: "Open drawer" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(<Demo open onOpenChange={onOpenChange} />)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("snap points: the active snap point is controlled through vaul's props", async () => {
    function Snaps() {
      const [snap, setSnap] = React.useState<number | string | null>(0.4)
      return (
        <>
          <Demo defaultOpen snapPoints={[0.4, 0.8]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} />
          <output data-testid="snap">{String(snap)}</output>
        </>
      )
    }
    renderUI(<Snaps />, opts)
    await screen.findByRole("dialog")
    expect(screen.getByTestId("snap")).toHaveTextContent("0.4")
  })

  it("portalled content repeats the provider's density", async () => {
    renderUI(
      <InkProvider density="calm">
        <Demo defaultOpen />
      </InkProvider>,
      opts,
    )
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-density", "calm")
  })
})

describe("Drawer accessibility and server", () => {
  it("has no axe violations, closed and open", async () => {
    const { container, user, getByRole } = renderUI(<Demo />, opts)
    await axeCheck(container)
    await user.click(getByRole("button", { name: "Open drawer" }))
    await screen.findByRole("dialog")
    await axeCheck()
  })

  it("renders only the trigger on the server, deterministically, and hydrates cleanly", () => {
    const tree = () => <Demo />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="drawer-trigger"')
    expect(html).not.toContain("drawer-content")
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
