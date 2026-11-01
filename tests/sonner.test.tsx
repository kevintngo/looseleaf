import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Toaster, toast as reexported } from "@/components/ui/sonner"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, renderUI } from "./helpers"

beforeEach(() => {
  toast.dismiss()
})
afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const slip = (text: string | RegExp) => screen.getByText(text).closest("[data-sonner-toast]") as HTMLElement

describe("Toaster", () => {
  it("is sonner's live region: a labelled polite section around the ordered list of toasts", () => {
    const { container } = renderUI(<Toaster />)
    const section = container.querySelector("section")
    expect(section).toHaveAttribute("aria-live", "polite")
    expect(section).toHaveAttribute("aria-label", expect.stringContaining("Notifications"))
  })

  it("shows a toast as a slip of paper: unstyled sonner, ll-paper on its own li, a tossed entrance, the type on data-type", async () => {
    renderUI(<Toaster />)
    act(() => {
      toast("Event created", { description: "Saturday, 10:00 am" })
    })
    await screen.findByText("Event created")
    const li = slip("Event created")
    expect(li.tagName).toBe("LI")
    expect(li).toHaveAttribute("data-styled", "false")
    expect(li).toHaveClass("ll-paper", "ll-stock-slip", "ll-sheet-slip", "pointer-events-auto")
    expect(li.className).toContain("data-[x-position=right]:animate-[ll-toss_var(--ll-dur-toss)_var(--ll-ease-settle)_backwards]")
    expect(li.className).toContain("data-[x-position=left]:animate-[ll-drop_var(--ll-dur-drop)_var(--ll-ease-settle)_backwards]")
    expect(li).toHaveAttribute("data-x-position", "right")
    expect(li).toHaveAttribute("data-y-position", "bottom")
    expect(screen.getByText("Saturday, 10:00 am")).toHaveAttribute("data-description")
    expect(screen.getByText("Event created")).toHaveAttribute("data-title")
    expect(li.querySelectorAll(":scope > svg")).toHaveLength(0)
  })

  it("every type is its own stock and tilt, and has its own drawn icon (hue is never the only signal)", async () => {
    renderUI(<Toaster />)
    act(() => {
      toast.success("Saved")
      toast.error("Failed")
      toast.warning("Careful")
      toast.info("FYI")
    })
    const want: Array<[string, string, string]> = [
      ["Saved", "ll-stock-check", "circle-check"],
      ["Failed", "ll-stock-sticky-pink", "octagon-x"],
      ["Careful", "ll-stock-sticky-yellow", "triangle-alert"],
      ["FYI", "ll-stock-sticky-blue", "info"],
    ]
    for (const [text, , icon] of want) {
      await screen.findByText(text)
      const li = slip(text)
      const glyph = li.querySelector("[data-icon] svg[data-ink='icon']")
      expect(glyph, text).toHaveAttribute("data-icon", icon)
      expect(glyph).toHaveAttribute("aria-hidden", "true")
    }
    const cls = slip("Saved").className
    for (const [, stock] of want) expect(cls).toContain(stock)
    expect(slip("Failed")).toHaveAttribute("data-type", "error")
    expect(slip("Failed").className).toContain("data-[type=error]:[--ll-tilt:0.9deg]")
  })

  it("promise toasts go from loading (a spinning drawn loader) to success, in the same slip", async () => {
    renderUI(<Toaster />)
    let resolve!: (v: string) => void
    const p = new Promise<string>((r) => (resolve = r))
    act(() => {
      toast.promise(p, { loading: "Saving notebook…", success: (v) => `Saved ${v}`, error: "Could not save" })
    })
    await screen.findByText("Saving notebook…")
    const li = slip("Saving notebook…")
    expect(li).toHaveAttribute("data-type", "loading")
    expect(li.querySelector("svg[data-icon='loader-circle']")).toHaveClass("animate-spin")
    await act(async () => resolve("Field notes"))
    await screen.findByText("Saved Field notes")
    expect(slip("Saved Field notes")).toHaveAttribute("data-type", "success")
    expect(screen.queryByText("Saving notebook…")).toBeNull()
  })

  it("a failed promise becomes an error slip", async () => {
    renderUI(<Toaster />)
    act(() => {
      toast.promise(Promise.reject(new Error("offline")), { loading: "Sending…", success: "Sent", error: "Could not send" })
    })
    await screen.findByText("Could not send")
    expect(slip("Could not send")).toHaveAttribute("data-type", "error")
  })

  it("an action is a highlighter-marked button that runs and dismisses; a cancel too", async () => {
    const onUndo = vi.fn()
    const onCancel = vi.fn()
    const { user } = renderUI(<Toaster />)
    act(() => {
      toast("File deleted", { action: { label: "Undo", onClick: onUndo }, cancel: { label: "Keep", onClick: onCancel } })
    })
    const undo = await screen.findByRole("button", { name: "Undo" })
    expect(undo).toHaveClass("ll-swipe", "font-bold", "min-h-6")
    expect(screen.getByRole("button", { name: "Keep" })).toHaveClass("underline")
    await user.click(undo)
    expect(onUndo).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText("File deleted")).toBeNull())
  })

  it("closeButton adds a doodled x that dismisses, named for screen readers", async () => {
    const { user } = renderUI(<Toaster closeButton />)
    act(() => {
      toast("Draft saved")
    })
    const close = await screen.findByRole("button", { name: "Close toast" })
    expect(close.querySelector("svg[data-icon='x']")).toBeTruthy()
    expect(close).toHaveClass("size-6", "hover:ll-swipe")
    await user.click(close)
    await waitFor(() => expect(screen.queryByText("Draft saved")).toBeNull())
  })

  it("toast.dismiss removes a slip; a custom id can be updated in place", async () => {
    renderUI(<Toaster />)
    let id: string | number = 0
    act(() => {
      id = toast.loading("Working…")
    })
    await screen.findByText("Working…")
    act(() => {
      toast.success("Done", { id })
    })
    await screen.findByText("Done")
    expect(screen.queryByText("Working…")).toBeNull()
    act(() => {
      toast.dismiss(id)
    })
    await waitFor(() => expect(screen.queryByText("Done")).toBeNull())
  })

  it("position variants tell sonner where to stack, and non-right stacks are dropped from above instead of tossed", async () => {
    renderUI(<Toaster position="top-center" />)
    act(() => {
      toast("Top centre")
    })
    await screen.findByText("Top centre")
    const li = slip("Top centre")
    expect(li).toHaveAttribute("data-y-position", "top")
    expect(li).toHaveAttribute("data-x-position", "center")
    expect(li.className).toContain("data-[x-position=center]:animate-[ll-drop_")
  })

  it("decoration=\"tape\" and \"pin\" hold each slip down with a pseudo-element on its content box (sonner owns the li's own)", async () => {
    const { rerender } = renderUI(<Toaster decoration="tape" />)
    act(() => {
      toast("Taped")
    })
    await screen.findByText("Taped")
    const content = slip("Taped").querySelector("[data-content]") as HTMLElement
    expect(content.className).toContain("after:bg-[color-mix(in_srgb,var(--ll-kraft)_70%,transparent)]")
    expect(content.className).toContain("after:[clip-path:polygon(")
    rerender(<Toaster decoration="pin" />)
    act(() => {
      toast("Pinned")
    })
    await screen.findByText("Pinned")
    expect((slip("Pinned").querySelector("[data-content]") as HTMLElement).className).toContain("after:bg-tomato")
    rerender(<Toaster />)
    act(() => {
      toast("Plain")
    })
    await screen.findByText("Plain")
    expect((slip("Plain").querySelector("[data-content]") as HTMLElement).className).not.toContain("after:")
  })

  it("sits above dialogs and popovers (z-toast) and is clickable while a modal is open", async () => {
    const { container } = renderUI(<Toaster />)
    act(() => {
      toast("Above it all")
    })
    await screen.findByText("Above it all")
    const ol = container.querySelector("ol[data-sonner-toaster]") as HTMLElement
    expect(ol.style.zIndex).toBe("var(--ll-z-toast)")
    expect(ol).toHaveClass("toaster", "group", "pointer-events-auto")
  })

  it("takes theme, className, style, icons and toastOptions.classNames from the caller without losing ours", async () => {
    const { container } = renderUI(
      <Toaster
        theme="dark"
        className="mine"
        style={{ top: 3 }}
        icons={{ success: <b data-testid="ok">ok</b> }}
        toastOptions={{ classNames: { toast: "extra-toast", title: "extra-title" } }}
      />,
    )
    act(() => {
      toast.success("Custom")
    })
    await screen.findByText("Custom")
    const ol = container.querySelector("ol[data-sonner-toaster]") as HTMLElement
    expect(ol).toHaveAttribute("data-sonner-theme", "dark")
    expect(ol).toHaveClass("mine", "toaster")
    expect(ol.style.zIndex).toBe("var(--ll-z-toast)")
    expect(ol.style.top).toBe("3px")
    expect(screen.getByTestId("ok")).toBeInTheDocument()
    const li = slip("Custom")
    expect(li).toHaveClass("extra-toast", "ll-paper")
    expect(screen.getByText("Custom")).toHaveClass("extra-title", "font-bold")
  })

  it("portal renders the stack under <body>, out of any transformed or container ancestor, with the provider's density repeated on it", async () => {
    const { container } = renderUI(
      <InkProvider density="calm">
        <div data-testid="wrap" className="@container [transform:translateZ(0)]">
          <Toaster portal />
        </div>
      </InkProvider>,
    )
    const box = await waitFor(() => {
      const el = document.body.querySelector<HTMLElement>(":scope > [data-slot=toaster-portal]")
      expect(el).not.toBeNull()
      return el!
    })
    expect(box).toHaveClass("contents")
    expect(box).toHaveAttribute("data-density", "calm")
    expect(box.querySelector("section[aria-label]")).toBeTruthy()
    expect(container.querySelector("[data-testid=wrap] section")).toBeNull()
    act(() => {
      toast("Under the body")
    })
    await screen.findByText("Under the body")
    expect(screen.getByText("Under the body").closest("[data-slot=toaster-portal]")).toBe(box)
  })

  it("portal renders nothing on the server (toasts are client-only), and without it the stack stays where it is mounted", () => {
    expect(renderToString(<Toaster portal />)).toBe("")
    expect(renderToString(<Toaster />)).toContain("Notifications")
    const { container } = renderUI(<Toaster />)
    expect(container.querySelector("section")).toBeTruthy()
    expect(document.body.querySelector(":scope > [data-slot=toaster-portal]")).toBeNull()
  })

  it("has no axe violations with toasts in the region", async () => {
    const { container } = renderUI(<Toaster closeButton />)
    act(() => {
      toast.success("Saved", { description: "All pages are safe.", action: { label: "Undo", onClick: () => {} } })
      toast.error("Failed")
    })
    await screen.findByText("Failed")
    await axeCheck(container)
  })
})

describe("exports", () => {
  it("re-exports sonner's toast so one import serves both", () => {
    expect(reexported).toBe(toast)
  })
})

describe("Toaster on the server", () => {
  it("renders its region deterministically, and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Toaster />
    const html = renderToString(tree())
    expect(renderToString(tree())).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider density="calm">{n}</InkProvider>]) {
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
