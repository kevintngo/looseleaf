import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DocsApp } from "@/docs/App"
import { Pager, TileGrid } from "@/docs/kit"
import { Stage } from "@/docs/kit/Stage"
import { PreviewFrame } from "@/docs/widgets/PreviewFrame"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs } from "@/docs/kit"
import { fixtureCatalog, fixtureSources } from "./docs-fixtures"
import { renderUI } from "./helpers"

function renderDocs(hash = "", catalog = fixtureCatalog()) {
  window.location.hash = hash
  return renderUI(<DocsApp catalog={catalog} />)
}

class SeenIO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) {
    queueMicrotask(() => this.cb([{ isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver))
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  window.localStorage.clear()
  window.location.hash = ""
  document.documentElement.removeAttribute("data-density")
  document.documentElement.removeAttribute("data-motion")
  window.scrollTo = vi.fn()
  vi.stubGlobal("IntersectionObserver", SeenIO)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("search palette", () => {
  it("opened with the mouse, a chosen result leaves focus on the new page heading, not back on the Search button", async () => {
    const { user } = renderDocs("#/")
    await user.click(screen.getByRole("button", { name: /^Search/ }))
    await user.type(await screen.findByRole("combobox"), "date")
    await user.click(await screen.findByRole("option", { name: /Date Picker/ }))
    await waitFor(() => expect(window.location.hash).toBe("#/components/date-picker"))
    const heading = await screen.findByRole("heading", { level: 1, name: "Date Picker" })
    await act(() => new Promise((resolve) => setTimeout(resolve, 150)))
    expect(heading).toHaveFocus()
  })
})

describe("search palette placement and focus", () => {
  it("choosing the page you are already on gives focus back to the Search button", async () => {
    const { user } = renderDocs("#/components/card")
    const trigger = screen.getByRole("button", { name: /^Search/ })
    await user.click(trigger)
    await user.type(await screen.findByRole("combobox"), "card")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Search documentation" })).toBeNull())
    await act(() => new Promise((resolve) => setTimeout(resolve, 150)))
    expect(document.body).not.toHaveFocus()
    expect(window.location.hash).toBe("#/components/card")
    expect(trigger).toHaveFocus()
  })

  it("Escape still gives focus back to whoever opened it", async () => {
    const { user } = renderDocs("#/")
    const trigger = screen.getByRole("button", { name: /^Search/ })
    await user.click(trigger)
    await user.keyboard("{Escape}")
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("is pinned near the top edge, so the input does not move as the list shrinks and the phone keyboard leaves it in view", async () => {
    const { user } = renderDocs("#/")
    await user.keyboard("{Control>}k{/Control}")
    const dialog = await screen.findByRole("dialog", { name: "Search documentation" })
    expect(dialog.className).toContain("mb-auto")
    expect(dialog.className).toContain("max-sm:mb-auto")
    expect(dialog.className).not.toContain("max-sm:mb-0")
  })
})

describe("shortcuts", () => {
  it("the slash key leaves typeahead widgets (a Select trigger is a combobox button) and handled keys alone", async () => {
    renderDocs("#/")
    const trigger = document.createElement("button")
    trigger.setAttribute("role", "combobox")
    document.body.appendChild(trigger)
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "/" })
    expect(screen.queryByRole("dialog", { name: "Search documentation" })).toBeNull()

    const handled = document.createElement("button")
    document.body.appendChild(handled)
    handled.addEventListener("keydown", (event) => event.preventDefault())
    fireEvent.keyDown(handled, { key: "/" })
    expect(screen.queryByRole("dialog", { name: "Search documentation" })).toBeNull()

    fireEvent.keyDown(document.body, { key: "/" })
    expect(await screen.findByRole("dialog", { name: "Search documentation" })).toBeInTheDocument()
    trigger.remove()
    handled.remove()
  })
})

describe("component page state", () => {
  it("does not carry the open Code tab of the first example over to the next component", async () => {
    const { user } = renderDocs("#/components/button")
    const preview = await screen.findByRole("group", { name: "Basic button preview" })
    expect(preview).toBeInTheDocument()
    await user.click(screen.getAllByRole("tab", { name: "Code" })[0]!)
    expect(screen.getAllByRole("tab", { name: "Code" })[0]).toHaveAttribute("aria-selected", "true")

    window.location.hash = "#/components/card"
    await screen.findByRole("heading", { level: 1, name: "Card" })
    expect(screen.getAllByRole("tab", { name: "Preview" })[0]).toHaveAttribute("aria-selected", "true")
  })
})

describe("block page state", () => {
  it("does not carry the open file tab of one block over to the next (whose files have other names)", async () => {
    const sources = fixtureSources()
    const catalog = fixtureCatalog({ blocks: { ...sources.blocks, "/x/blocks/other/only.tsx": () => Promise.resolve("export const only = 1") } })
    const { user } = renderDocs("#/blocks/login", catalog)
    const tabs = await screen.findAllByRole("tab", { name: /login-form/ })
    await user.click(tabs[0]!)
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")

    window.location.hash = "#/blocks/other"
    await screen.findByRole("heading", { level: 1, name: "Other" })
    const only = await screen.findByRole("tab", { name: /only\.tsx/ })
    expect(only).toHaveAttribute("aria-selected", "true")
    expect(await screen.findByRole("group", { name: "Code: blocks/other/only.tsx" })).toBeVisible()
  })
})

describe("Tabs", () => {
  it("shows the first panel when the chosen tab has left the list", () => {
    const items = (ids: string[]) => ids.map((id) => ({ id, label: id, content: <p>{id} panel</p> }))
    const { rerender } = renderUI(<Tabs label="t" items={items(["a", "b"])} defaultValue="b" />)
    expect(screen.getByRole("tab", { name: "b" })).toHaveAttribute("aria-selected", "true")
    rerender(<Tabs label="t" items={items(["c", "d"])} defaultValue="b" />)
    expect(screen.getByRole("tab", { name: "c" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("c panel")).toBeVisible()
  })
})

describe("pager keys", () => {
  it("leave an open alert dialog alone", async () => {
    function Host() {
      return (
        <>
          <Pager label="pager" prev={{ to: "/components/a", title: "A" }} next={{ to: "/components/b", title: "B" }} />
          <AlertDialog open>
            <AlertDialogContent>
              <AlertDialogTitle>Sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <button>ok</button>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    }
    window.location.hash = "#/start"
    const { user } = renderUI(<Host />)
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
    await user.keyboard("]")
    expect(window.location.hash).toBe("#/start")
  })
})

describe("Stage", () => {
  it("scrolls in a wrapper inside the sheet, so the sheet's own shadow and rules are not clipped by its overflow", () => {
    renderUI(
      <Stage label="Dots" contain>
        <p>a</p>
      </Stage>,
    )
    const sheet = screen.getByRole("group", { name: "Dots" })
    expect(sheet).not.toHaveClass("overflow-auto")
    const scroller = sheet.querySelector('[data-slot="stage-scroll"]')!
    expect(scroller).toHaveClass("overflow-auto")
    expect(scroller.className).toContain("[transform:translateZ(0)]")
    expect(within(scroller as HTMLElement).getByText("a")).toBeInTheDocument()
  })
})

describe("PreviewFrame", () => {
  it("has a resize grip at least 24 px wide (WCAG 2.5.8)", () => {
    renderUI(
      <PreviewFrame>
        <p>x</p>
      </PreviewFrame>,
    )
    const grip = screen.getByRole("separator", { name: "Resize preview" })
    expect(grip).toHaveClass("w-6")
    fireEvent.keyDown(grip, { key: "Home" })
    expect(grip).toHaveAttribute("aria-valuenow", "240")
  })
})

describe("nav pad", () => {
  it("scrolls the pad to the current page even when its category started folded", () => {
    window.localStorage.setItem("looseleaf-docs:nav-collapsed", JSON.stringify(["Forms", "Data display", "Layout", "Feedback", "Overlays", "Navigation", "Actions", "Display"]))
    const sets: number[] = []
    const rect = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 0, width: 10, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute("aria-current") === "page") return rect(900, 930)
      if (this.getAttribute("data-slot") === "sidebar-content") return rect(0, 400)
      return rect(0, 0)
    })
    Object.defineProperty(HTMLElement.prototype, "scrollTop", {
      configurable: true,
      get: () => 0,
      set: (value: number) => void sets.push(value),
    })
    try {
      renderDocs("#/components/button")
      expect(sets.length).toBeGreaterThan(0)
      expect(sets.at(-1)).toBeGreaterThan(400)
    } finally {
      // @ts-expect-error restoring the jsdom accessor
      delete HTMLElement.prototype.scrollTop
    }
  })
})

describe("phone menu", () => {
  const width = window.innerWidth
  afterEach(() => Object.defineProperty(window, "innerWidth", { configurable: true, value: width }))

  it("has a visible way to close it, for people who cannot tap the page beside it", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 })
    const { user } = renderDocs("#/components/button")
    await user.click(screen.getByRole("button", { name: "Menu" }))
    const sheet = screen.getByRole("dialog", { name: "Menu" })
    await user.click(within(sheet).getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull())
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus()
  })
})

describe("tile grid", () => {
  it("never asks for a column wider than its own box (a 320 px phone has less than 15rem inside the sheet)", () => {
    renderUI(<TileGrid data-testid="grid" />)
    expect(screen.getByTestId("grid").className).toContain("minmax(min(15rem,100%),1fr)")
  })
})

describe("On this page", () => {
  it("is read from the page: the fallback body's sections, or the sections of a written body that loads a moment later", async () => {
    const plain = renderDocs("#/getting-started")
    const toc = await screen.findByRole("navigation", { name: "On this page" })
    expect(within(toc).getAllByRole("link").map((a) => a.textContent)).toEqual([
      "Requirements",
      "Install with the registry",
      "Manual installation",
      "Fonts",
      "Tokens",
      "Provider",
      "Server rendering",
      "Next steps",
    ])
    plain.unmount()

    const Written = () => (
      <>
        <h2 id="one">First</h2>
        <h3 id="deep">Not listed</h3>
        <h2 id="two">Second</h2>
        <div data-slot="stage">
          <h2 id="inside-an-example">Inside an example</h2>
        </div>
      </>
    )
    const written = fixtureCatalog({ content: { "/tests/x/content/getting-started.tsx": () => Promise.resolve({ default: Written }) } })
    renderDocs("#/getting-started", written)
    await screen.findByRole("heading", { level: 2, name: "First" })
    const nav = await screen.findByRole("navigation", { name: "On this page" })
    await waitFor(() => expect(within(nav).getAllByRole("link").map((a) => a.textContent)).toEqual(["First", "Second"]))
  })

  it("scrolls inside the slip when the list is long, and leaves room for the focus ring", async () => {
    renderDocs("#/getting-started")
    const nav = await screen.findByRole("navigation", { name: "On this page" })
    const list = within(nav).getByRole("list")
    expect(list.className).toContain("overflow-y-auto")
    expect(list.className).toContain("max-h-")
  })

  it("Foundations pages get one too", async () => {
    renderDocs("#/foundations/typography")
    const toc = await screen.findByRole("navigation", { name: "On this page" })
    expect(within(toc).getByRole("link", { name: "In brief" })).toHaveAttribute("href", "#/foundations/typography#in-brief")
    expect(within(toc).getAllByRole("link").length).toBeGreaterThan(1)
  })
})

describe("shell resilience", () => {
  it("a nav pad that crashes leaves the page standing", () => {
    const catalog = fixtureCatalog()
    for (const group of catalog.groups) {
      Object.defineProperty(group.items, "some", {
        value: () => {
          throw new Error("nav broke")
        },
      })
    }
    vi.spyOn(console, "error").mockImplementation(() => {})
    renderDocs("#/", catalog)
    expect(screen.getByRole("heading", { level: 1, name: "Looseleaf" })).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Documentation" })).toBeNull()
    expect(screen.getByRole("button", { name: /^Search/ })).toBeInTheDocument()
  })
})
