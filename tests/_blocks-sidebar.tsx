import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

export const opts = { user: { pointerEventsCheck: 0 } }

const withoutStyles = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, "")

export function expectSsrStable(ui: React.ReactElement) {
  const a = renderToString(ui)
  const b = renderToString(ui)
  expect(a.length).toBeGreaterThan(0)
  expect(a).toBe(b)
  expect(withoutStyles(a)).not.toMatch(/\bNaN\b|\bundefined\b|\[object/)
  return a
}

export function expectHydrates(ui: React.ReactElement) {
  for (const wrap of [(n: React.ReactElement) => n, (n: React.ReactElement) => <InkProvider>{n}</InkProvider>]) {
    const el = wrap(ui)
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = renderToString(el)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, el)
    })
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
    act(() => root?.unmount())
    container.remove()
  }
}

function setWidth(px: number) {
  Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true })
}

export function useBlockHarness() {
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(240, 32)
  })
  afterEach(() => {
    restore()
    document.cookie = "sidebar_state=; max-age=0; path=/"
    document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
  })
}

export interface SidebarBlockSpec {
  name: string
  Page: React.ComponentType<{ contained?: boolean }>
  title: string
  landmarks?: string[]
  current?: string
  collapsible?: "offcanvas" | "icon"
  containedPad?: string
}

export function describeSidebarBlock({ name, Page, title, landmarks = [], current, collapsible = "offcanvas", containedPad = "h-full" }: SidebarBlockSpec) {
  describe(`${name} (shared sidebar page checks)`, () => {
    useBlockHarness()

    it("is a page: one main landmark, one level-one heading, a breadcrumb and named navigation", () => {
      renderUI(<Page />, opts)
      expect(screen.getAllByRole("main")).toHaveLength(1)
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument()
      expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
      for (const label of landmarks) expect(screen.getByRole("navigation", { name: label })).toBeInTheDocument()
      if (current) {
        const links = screen.getAllByText(current).map((el) => el.closest("[aria-current]"))
        expect(links.some((el) => el?.getAttribute("aria-current") === "page")).toBe(true)
      }
    })

    it("folds and unfolds the pad with its button and with Ctrl/Cmd+B", async () => {
      const { user, container } = renderUI(<Page />, opts)
      const pad = container.querySelector<HTMLElement>('[data-slot="sidebar"][data-state]')!
      expect(pad).toHaveAttribute("data-state", "expanded")
      await user.click(container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!)
      expect(pad).toHaveAttribute("data-state", "collapsed")
      expect(pad).toHaveAttribute("data-collapsible", collapsible)
      await user.click(container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!)
      expect(pad).toHaveAttribute("data-state", "expanded")
      fireEvent.keyDown(window, { key: "b", ctrlKey: true })
      expect(pad).toHaveAttribute("data-state", "collapsed")
      fireEvent.keyDown(window, { key: "b", metaKey: true })
      expect(pad).toHaveAttribute("data-state", "expanded")
    })

    it("draws only decorative ink, and only the current page carries a mark", () => {
      const { container } = renderUI(<Page />, opts)
      expectInkLayers(container)
      const marks = container.querySelectorAll('[data-slot="sidebar-menu-button-mark"]')
      marks.forEach((m) => expect(m).toHaveAttribute("aria-hidden", "true"))
    })

    it("has no axe violations", async () => {
      const { container } = renderUI(<Page />, opts)
      await axeCheck(container)
    })

    it("on a phone the pad is a sheet: the button opens it, Escape closes it and focus goes back", async () => {
      setWidth(500)
      try {
        const { user, container } = renderUI(<Page />, opts)
        const trigger = container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')!
        await user.click(trigger)
        const sheet = await screen.findByRole("dialog")
        expect(sheet).toHaveAttribute("data-mobile", "true")
        await axeCheck()
        await user.keyboard("{Escape}")
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
        expect(trigger).toHaveFocus()
      } finally {
        setWidth(1024)
      }
    })

    it("`contained` keeps the pad inside its parent", () => {
      const { container } = renderUI(<Page contained />, opts)
      expect(container.querySelector("[data-slot=sidebar-wrapper]")).toHaveClass("h-full", "min-h-0")
      expect(container.querySelector("[data-slot=sidebar-container]")?.className).toContain(containedPad)
      expect(container.querySelector("[data-slot=sidebar-inset]")).toHaveClass("overflow-y-auto")
    })

    it("renders the same on the server twice and hydrates without a warning", () => {
      expectSsrStable(<Page />)
      expectHydrates(<Page />)
    })
  })
}

export { act, fireEvent, screen, waitFor, within }
