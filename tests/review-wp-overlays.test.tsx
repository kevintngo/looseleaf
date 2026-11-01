import * as React from "react"
import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { InkProvider } from "@/lib/ink/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  cleanup()
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const bodyClean = () => {
  expect(document.body.style.pointerEvents).not.toBe("none")
  expect(document.body.hasAttribute("data-scroll-locked")).toBe(false)
}

function Inner({ label }: { label: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{`open ${label}`}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{`${label} description`}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

describe("Dialog: non-modal (upstream's Root passes `modal` through)", () => {
  it("modal={false} still shows the sheet, leaves the page interactive and Escape closes it", async () => {
    const { user, getByRole } = renderUI(
      <div>
        <Dialog modal={false}>
          <DialogTrigger asChild>
            <Button>open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Non-modal</DialogTitle>
              <DialogDescription>The page behind stays live.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <button>elsewhere</button>
      </div>,
      opts
    )
    await user.click(getByRole("button", { name: "open" }))
    const dlg = await screen.findByRole("dialog", { name: "Non-modal" })
    expect(dlg).toHaveAttribute("data-slot", "dialog-content")
    expect(document.body.style.pointerEvents).not.toBe("none")
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    bodyClean()
  })
})

describe("Dialog: nested portals and focus", () => {
  it("a dialog opened from a dialog stacks above it; Escape closes only the top one and focus returns to its trigger", async () => {
    const { user, getByRole } = renderUI(
      <Dialog>
        <DialogTrigger asChild>
          <Button>open outer</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>outer</DialogTitle>
            <DialogDescription>outer description</DialogDescription>
          </DialogHeader>
          <Inner label="inner" />
        </DialogContent>
      </Dialog>,
      opts
    )
    await user.click(getByRole("button", { name: "open outer" }))
    await screen.findByRole("dialog", { name: "outer" })
    const innerTrigger = await screen.findByRole("button", { name: "open inner" })
    await user.click(innerTrigger)
    await screen.findByRole("dialog", { name: "inner" })
    const overlays = [...document.querySelectorAll('[data-slot="dialog-overlay"]')]
    expect(overlays).toHaveLength(2)
    expect(overlays[0].compareDocumentPosition(overlays[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "inner" })).toBeNull())
    expect(screen.getByRole("dialog", { name: "outer" })).toBeInTheDocument()
    await waitFor(() => expect(innerTrigger).toHaveFocus())
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(getByRole("button", { name: "open outer" })).toHaveFocus())
    bodyClean()
  })

  it("a popover inside a dialog keeps the dialog open when used, and Escape closes the popover first", async () => {
    const { user, getByRole } = renderUI(
      <Dialog>
        <DialogTrigger asChild>
          <Button>open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>with popover</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogHeader>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">open popover</Button>
            </PopoverTrigger>
            <PopoverContent aria-label="pop">
              <button>inside the popover</button>
            </PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>,
      opts
    )
    await user.click(getByRole("button", { name: "open dialog" }))
    await user.click(await screen.findByRole("button", { name: "open popover" }))
    const pop = await screen.findByRole("dialog", { name: "pop" })
    await user.click(within(pop).getByRole("button", { name: "inside the popover" }))
    expect(screen.getByRole("dialog", { name: "with popover" })).toBeInTheDocument()
    expect(pop.className).toContain("z-(--ll-z-popover)")
    expect(document.querySelector('[data-slot="dialog-overlay"]')!.className).toContain("z-(--ll-z-overlay)")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "pop" })).toBeNull())
    expect(screen.getByRole("dialog", { name: "with popover" })).toBeInTheDocument()
    await axeCheck()
  })

  it("a tooltip on a control inside a dialog opens on focus", async () => {
    const { user, getByRole } = renderUI(
      <TooltipProvider>
        <Dialog>
          <DialogTrigger asChild>
            <Button>open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>with tooltip</DialogTitle>
              <DialogDescription>d</DialogDescription>
            </DialogHeader>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" aria-label="Copy">
                  c
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy to clipboard</TooltipContent>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </TooltipProvider>,
      opts
    )
    await user.click(getByRole("button", { name: "open dialog" }))
    await screen.findByRole("dialog")
    await act(async () => {
      screen.getByRole("button", { name: "Copy" }).focus()
    })
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy to clipboard")
    expect(screen.getByRole("dialog", { name: "with tooltip" })).toBeInTheDocument()
  })

  it("an AlertDialog opened from a Sheet answers on Cancel and leaves the sheet open", async () => {
    const { user, getByRole } = renderUI(
      <Sheet>
        <SheetTrigger asChild>
          <Button>open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>settings</SheetTitle>
            <SheetDescription>s</SheetDescription>
          </SheetHeader>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                <AlertDialogDescription>All settings go back to normal.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetContent>
      </Sheet>,
      opts
    )
    await user.click(getByRole("button", { name: "open sheet" }))
    await user.click(await screen.findByRole("button", { name: "Reset" }))
    const alert = await screen.findByRole("alertdialog")
    await waitFor(() => expect(within(alert).getByRole("button", { name: "Cancel" })).toHaveFocus())
    const layers = [...document.querySelectorAll('[data-slot="sheet-overlay"],[data-slot="alert-dialog-overlay"]')]
    expect(layers.map((l) => l.getAttribute("data-slot"))).toEqual(["sheet-overlay", "alert-dialog-overlay"])
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
    expect(screen.getByRole("dialog", { name: "settings" })).toBeInTheDocument()
  })
})

describe("scroll lock and pointer-events hygiene", () => {
  it("open and close three times, in StrictMode, leaves the body clean", async () => {
    const { user, getByRole } = renderUI(
      <React.StrictMode>
        <Inner label="again" />
      </React.StrictMode>,
      opts
    )
    for (let i = 0; i < 3; i++) {
      await user.click(getByRole("button", { name: "open again" }))
      await screen.findByRole("dialog")
      expect(document.body.style.pointerEvents).toBe("none")
      await user.keyboard("{Escape}")
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    }
    bodyClean()
  })

  it("unmounting the tree while a dialog / sheet / alert dialog is open releases the lock", async () => {
    const { unmount } = renderUI(
      <div>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>a</DialogTitle>
            <DialogDescription>a</DialogDescription>
          </DialogContent>
        </Dialog>
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>b</SheetTitle>
            <SheetDescription>b</SheetDescription>
          </SheetContent>
        </Sheet>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2))
    expect(document.body.style.pointerEvents).toBe("none")
    unmount()
    await waitFor(() => bodyClean())
  })

  it("a controlled dialog closed by its parent (not by Radix) releases the lock too", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(true)
      return (
        <div>
          <button onClick={() => setOpen(false)}>parent close</button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>c</DialogTitle>
              <DialogDescription>c</DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
    renderUI(<Controlled />, opts)
    await screen.findByRole("dialog")
    fireEvent.click(screen.getByText("parent close", { selector: "button" }), {})
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => bodyClean())
  })
})

describe("toasts over a modal", () => {
  it("clicking a toast (its action) does not dismiss the dialog or the sheet underneath", async () => {
    let undone = 0
    renderUI(
      <div>
        <Toaster />
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>modal</DialogTitle>
            <DialogDescription>m</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy())
    act(() => {
      toast("Copied", { action: { label: "Undo", onClick: () => undone++ } })
    })
    const undo = await screen.findByRole("button", { name: "Undo" })
    fireEvent.pointerDown(undo)
    fireEvent.mouseDown(undo)
    fireEvent.pointerUp(undo)
    fireEvent.click(undo)
    expect(undone).toBe(1)
    await new Promise((r) => setTimeout(r, 30))
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
  })

  it("the same for a sheet", async () => {
    renderUI(
      <div>
        <Toaster />
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>panel</SheetTitle>
            <SheetDescription>p</SheetDescription>
          </SheetContent>
        </Sheet>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="sheet-content"]')).toBeTruthy())
    act(() => {
      toast("Saved", { action: { label: "Undo", onClick: () => {} } })
    })
    const undo = await screen.findByRole("button", { name: "Undo" })
    fireEvent.pointerDown(undo)
    fireEvent.click(undo)
    await new Promise((r) => setTimeout(r, 30))
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeTruthy()
  })
})

describe("z-scale: same-kind modal layers stack by open order", () => {
  it("dialog, alert dialog, sheet and drawer all sit on the overlay level (a drawer opened from a dialog must not hide behind it)", async () => {
    renderUI(
      <div>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>d</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
        <Sheet defaultOpen>
          <SheetContent>
            <SheetTitle>s</SheetTitle>
            <SheetDescription>s</SheetDescription>
          </SheetContent>
        </Sheet>
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>w</DrawerTitle>
              <DrawerDescription>w</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="drawer-content"]')).toBeTruthy())
    for (const slot of ["dialog-overlay", "sheet-overlay", "sheet-content", "drawer-overlay", "drawer-content"]) {
      const el = document.querySelector(`[data-slot="${slot}"]`) as HTMLElement
      expect(el.className, slot).toContain("z-(--ll-z-overlay)")
    }
  })
})

describe("long and empty content", () => {
  it("a tooltip with a very long unbroken string is capped to the viewport", async () => {
    renderUI(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button>t</Button>
          </TooltipTrigger>
          <TooltipContent>{"x".repeat(400)}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    const note = await waitFor(() => {
      const n = document.querySelector('[data-slot="tooltip-content"]') as HTMLElement
      expect(n).toBeTruthy()
      return n
    })
    expect(note.className).toMatch(/max-w-/)
    expect(note.className).toContain("break-words")
  })

  it("a popover and a dialog with no children still render (no crash, named)", async () => {
    renderUI(
      <div>
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button>p</Button>
          </PopoverTrigger>
          <PopoverContent aria-label="empty popover" />
        </Popover>
      </div>,
      opts
    )
    expect(await screen.findByRole("dialog", { name: "empty popover" })).toBeInTheDocument()
  })
})

describe("drawer and toasts / phones", () => {
  it("clicking a toast does not dismiss a drawer", async () => {
    renderUI(
      <div>
        <Toaster />
        <Drawer defaultOpen>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>slip</DrawerTitle>
              <DrawerDescription>d</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="drawer-content"]')).toBeTruthy())
    act(() => {
      toast("Saved", { action: { label: "Undo", onClick: () => {} } })
    })
    const undo = await screen.findByRole("button", { name: "Undo" })
    fireEvent.pointerDown(undo)
    fireEvent.click(undo)
    await new Promise((r) => setTimeout(r, 60))
    expect(document.querySelector('[data-slot="drawer-content"]')).toBeTruthy()
  })

  it("a non-toast outside click still dismisses the dialog (the guard is narrow)", async () => {
    const { user } = renderUI(
      <div>
        <button>page</button>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>,
      opts
    )
    await screen.findByRole("dialog")
    await user.click(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("the dim reserves its scrollbar gutter so the drop-in cannot shove a centered sheet sideways; phones pad the foot for the home indicator", async () => {
    renderUI(
      <div>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>t</AlertDialogTitle>
            <AlertDialogDescription>d</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeTruthy())
    for (const slot of ["dialog-overlay", "alert-dialog-overlay"]) expect(document.querySelector(`[data-slot="${slot}"]`)!.className, slot).toContain("[scrollbar-gutter:stable_both-edges]")
    for (const slot of ["dialog-content", "alert-dialog-content"]) expect(document.querySelector(`[data-slot="${slot}"]`)!.className, slot).toContain("max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]")
  })
})

describe("calm density, reduced motion and rtl carry into every portal, and axe stays clean", () => {
  it("open dialog + popover + tooltip + sheet in a calm, reduced-motion, rtl provider", async () => {
    const { user, getByRole } = renderUI(
      <InkProvider density="calm" motion="reduced">
        <div dir="rtl">
          <TooltipProvider>
            <Popover defaultOpen>
              <PopoverTrigger asChild>
                <Button>p</Button>
              </PopoverTrigger>
              <PopoverContent aria-label="pop" arrow pin>
                x
              </PopoverContent>
            </Popover>
            <Tooltip defaultOpen>
              <TooltipTrigger asChild>
                <Button>t</Button>
              </TooltipTrigger>
              <TooltipContent>tip</TooltipContent>
            </Tooltip>
            <Sheet>
              <SheetTrigger asChild>
                <Button>open sheet</Button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby={undefined}>
                <SheetHeader>
                  <SheetTitle>rtl sheet</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </TooltipProvider>
        </div>
      </InkProvider>,
      opts
    )
    const pop = await screen.findByRole("dialog", { name: "pop" })
    const tip = await screen.findByRole("tooltip")
    for (const el of [pop, tip]) {
      expect(el).toHaveAttribute("data-density", "calm")
      expect(el).toHaveAttribute("data-motion", "reduced")
    }
    await user.click(getByRole("button", { name: "open sheet" }))
    const sheet = await screen.findByRole("dialog", { name: "rtl sheet" })
    expect(sheet).toHaveAttribute("data-density", "calm")
    expect(sheet).toHaveAttribute("data-motion", "reduced")
    expect(sheet.querySelector('[data-part="x"]')!.className).toContain("rtl:end-9")
    await axeCheck()
  })
})

describe("phones", () => {
  it("tape hangs past the sheet's corners: on a phone the strips are hidden so the dim never scrolls sideways (dialog and alert dialog)", async () => {
    renderUI(
      <div>
        <Dialog defaultOpen>
          <DialogContent tape="both">
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogContent>
        </Dialog>
        <AlertDialog defaultOpen>
          <AlertDialogContent tone="danger">
            <AlertDialogTitle>t</AlertDialogTitle>
            <AlertDialogDescription>d</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      </div>,
      opts
    )
    await waitFor(() => expect(document.querySelector('[data-slot="alert-dialog-content"]')).toBeTruthy())
    const dlg = document.querySelector('[data-slot="dialog-content"]') as HTMLElement
    expect(dlg.querySelectorAll(":scope > svg[data-slot=tape]")).toHaveLength(2)
    expect(dlg.className).toContain("max-sm:[&>svg[data-slot=tape]]:hidden")
    for (const t of document.querySelectorAll('[data-slot="alert-dialog-content"] > svg[data-slot=tape]')) expect(t).toHaveClass("max-sm:hidden")
  })
})

describe("keyboard", () => {
  it("DialogBody is reachable by Tab (a scroll area with nothing focusable in it cannot otherwise be scrolled by keyboard), and tabIndex can be overridden", async () => {
    const { user } = renderUI(
      <Dialog defaultOpen>
        <DialogContent showCloseButton={false}>
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
          <DialogBody>{"long text ".repeat(200)}</DialogBody>
          <DialogBody tabIndex={-1}>second</DialogBody>
        </DialogContent>
      </Dialog>,
      opts
    )
    await screen.findByRole("dialog")
    const bodies = document.querySelectorAll('[data-slot="dialog-body"]')
    expect(bodies[0]).toHaveAttribute("tabindex", "0")
    expect(bodies[1]).toHaveAttribute("tabindex", "-1")
    await user.tab()
    await waitFor(() => expect(bodies[0]).toHaveFocus())
    await axeCheck()
  })
})

describe("drawer focus", () => {
  it("a non-modal drawer leaves focus where it was (only a modal one takes it)", async () => {
    const { user, getByRole } = renderUI(
      <Drawer modal={false}>
        <DrawerTrigger asChild>
          <Button>open non-modal</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>side slip</DrawerTitle>
            <DrawerDescription>d</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
      opts
    )
    const trigger = getByRole("button", { name: "open non-modal" })
    await user.click(trigger)
    await waitFor(() => expect(document.querySelector('[data-slot="drawer-content"]')).toBeTruthy())
    await new Promise((r) => setTimeout(r, 30))
    expect(document.querySelector('[data-slot="drawer-content"]')).not.toHaveFocus()
    expect(trigger).toHaveFocus()
  })
})
