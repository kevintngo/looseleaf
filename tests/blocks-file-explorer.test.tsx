import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import FileExplorer from "@/blocks/file-explorer/page"
import { sortNodes } from "@/blocks/file-explorer/components/file-explorer-browser"
import { formatDay, formatSize, KIND_ICON, nodes, withDescendants } from "@/blocks/file-explorer/components/file-explorer-data"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/file-explorer/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const namedIcons = () => {
  const found = new Set<string>()
  for (const src of Object.values(sources)) {
    for (const m of src.matchAll(/<Icon[^>]*?name="([a-z0-9-]+)"/g)) found.add(m[1])
    for (const m of src.matchAll(/<Icon[^>]*?name=\{([^}]*)\}/g)) for (const q of m[1].matchAll(/"([a-z0-9-]+)"/g)) found.add(q[1])
    for (const m of src.matchAll(/icon: "([a-z0-9-]+)"/g)) found.add(m[1])
  }
  return found
}

let restore = () => {}
beforeEach(() => {
  restore = mockBox(480, 260)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const listing = (where: string) => screen.getByRole("table", { name: `Everything in ${where}` })
const names = (where: string) =>
  within(listing(where))
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("button")[0].textContent?.replace(/,.*$/, ""))
const status = () => screen.getByRole("status", { name: "File updates" })
const open = (name: RegExp) => screen.getByRole("button", { name })

describe("file-explorer data", () => {
  it("sizes and days are written by hand", () => {
    expect(formatSize(512)).toBe("512 B")
    expect(formatSize(48 * 1024)).toBe("48 KB")
    expect(formatSize(3.4 * 1024 * 1024)).toBe("3.4 MB")
    expect(formatSize(212 * 1024 * 1024)).toBe("212 MB")
    expect(formatDay("2026-09-05")).toBe("Sep 5")
    expect(formatDay("2025-12-31")).toBe("Dec 31, 2025")
  })

  it("finds a folder and everything inside it", () => {
    const gone = withDescendants(nodes, "f3")
    expect([...gone].sort()).toEqual(["f3", "n11", "n12", "n13"])
  })

  it("puts folders first, then sorts by name, date or size", () => {
    const here = nodes.filter((n) => n.parent === "f1")
    expect(sortNodes(here, "name").map((n) => n.name)).toEqual(["launch-plan.xlsx", "newsletter-draft.doc", "price-tags.pdf", "sticker-sheet-v3.png"])
    expect(sortNodes(here, "size").map((n) => n.name)[0]).toBe("sticker-sheet-v3.png")
    const top = nodes.filter((n) => n.parent === "projects")
    expect(sortNodes(top, "size").map((n) => n.kind).slice(0, 2)).toEqual(["folder", "folder"])
  })
})

describe("file-explorer block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names, ...Object.values(KIND_ICON)].filter((n) => !(n in icons))).toEqual([])
  })
  it("is one main with a title, four places as tabs and the first place open", () => {
    const { container } = renderUI(<FileExplorer />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "Filing cabinet" })).toBeInTheDocument()
    expect(within(screen.getByRole("tablist", { name: "Places" })).getAllByRole("tab").map((t) => t.textContent)).toEqual(["Projects", "Receipts", "Photos", "Music"])
    expect(screen.getByRole("tab", { name: "Projects" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("navigation", { name: "Where you are in Projects" })).toBeInTheDocument()
    expect(names("Projects")).toEqual(["Autumn drop", "Journal", "brand-guide.pdf", "notes-2026.txt"])
    expectInkLayers(container, { min: 1 })
  })

  it("names each file with its kind, size and date for a screen reader", () => {
    renderUI(<FileExplorer />, opts)
    expect(open(/^brand-guide\.pdf/)).toHaveAccessibleName("brand-guide.pdf, PDF, 5.8 MB, changed Sep 2")
    expect(open(/^Autumn drop/)).toHaveAccessibleName("Autumn drop, folder, 4 items")
  })

  it("opens a folder, shows the trail, and goes back up from it", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(open(/^Autumn drop/))
    expect(status()).toHaveTextContent("Opened Autumn drop.")
    expect(names("Autumn drop")).toEqual(["launch-plan.xlsx", "newsletter-draft.doc", "price-tags.pdf", "sticker-sheet-v3.png"])
    const trail = screen.getByRole("navigation", { name: "Where you are in Projects" })
    expect(within(trail).getByText("Autumn drop")).toHaveAttribute("aria-current", "page")
    await user.click(within(trail).getByRole("button", { name: "Projects" }))
    expect(names("Projects")).toHaveLength(4)
  })

  it("remembers where you were in each place", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("tab", { name: "Photos" }))
    await user.click(open(/^Notebooks/))
    expect(names("Notebooks")).toEqual(["notebook-01.jpg", "notebook-02.jpg", "notebook-03.jpg"])
    await user.click(screen.getByRole("tab", { name: "Music" }))
    expect(names("Music")).toHaveLength(4)
    await user.click(screen.getByRole("tab", { name: "Photos" }))
    expect(names("Notebooks")).toHaveLength(3)
  })

  it("switches to a grid of tiles and back", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("radio", { name: "Grid view" }))
    const grid = screen.getByRole("list", { name: "Everything in Projects" })
    expect(within(grid).getAllByRole("listitem")).toHaveLength(4)
    expect(within(grid).getByRole("checkbox", { name: "Select brand-guide.pdf" })).toBeInTheDocument()
    await axeCheck()
    await user.click(screen.getByRole("radio", { name: "List view" }))
    expect(listing("Projects")).toBeInTheDocument()
  })

  it("sorts by size and by search word", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(open(/^Autumn drop/))
    await user.click(screen.getByRole("combobox", { name: "Sort by" }))
    await user.click(await screen.findByRole("option", { name: "Size" }))
    expect(names("Autumn drop")).toEqual(["sticker-sheet-v3.png", "price-tags.pdf", "launch-plan.xlsx", "newsletter-draft.doc"])
    await user.type(screen.getByRole("searchbox", { name: "Search in Autumn drop" }), "plan")
    expect(names("Autumn drop")).toEqual(["launch-plan.xlsx"])
    await user.clear(screen.getByRole("searchbox", { name: "Search in Autumn drop" }))
    await user.type(screen.getByRole("searchbox", { name: "Search in Autumn drop" }), "zzz")
    expect(screen.getByText("Nothing matches")).toBeInTheDocument()
  })

  it("picks files, counts them, and deletes them with an undo", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("checkbox", { name: "Select brand-guide.pdf" }))
    await user.click(screen.getByRole("checkbox", { name: "Select notes-2026.txt" }))
    const bar = screen.getByRole("group", { name: "Selected items" })
    expect(within(bar).getByText("2 picked")).toBeInTheDocument()
    await user.click(within(bar).getByRole("button", { name: "Delete" }))
    expect(names("Projects")).toEqual(["Autumn drop", "Journal"])
    expect(status()).toHaveTextContent("Deleted 2 items.")
    expect(screen.getByText("Deleted 2 items.", { selector: "span" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(names("Projects")).toHaveLength(4)
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument()
  })

  it("picks everything with the header box", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("checkbox", { name: "Select everything in this folder" }))
    expect(screen.getByText("4 picked")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.queryByText("4 picked")).not.toBeInTheDocument()
  })

  it("deleting a folder takes its files with it, and undo brings them all back", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("button", { name: "Actions for Autumn drop" }))
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }))
    expect(names("Projects")).toEqual(["Journal", "brand-guide.pdf", "notes-2026.txt"])
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await user.click(open(/^Autumn drop/))
    expect(names("Autumn drop")).toHaveLength(4)
  })

  it("makes new folders with names that never repeat, and an empty one says so", async () => {
    const { user } = renderUI(<FileExplorer />, opts)
    await user.click(screen.getByRole("button", { name: "New folder" }))
    await user.click(screen.getByRole("button", { name: "New folder" }))
    expect(names("Projects")).toEqual(["Autumn drop", "Journal", "Untitled folder", "Untitled folder 2", "brand-guide.pdf", "notes-2026.txt"])
    expect(status()).toHaveTextContent("Made a folder called Untitled folder 2.")
    await user.click(open(/^Untitled folder 2/))
    expect(screen.getByText("This folder is empty")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderUI(<FileExplorer />, opts)
    await axeCheck(container)
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <FileExplorer />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <FileExplorer />
    const html = renderToString(tree)
    expect(renderToString(tree)).toBe(html)
    expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\bNaN\b|\bundefined\b/)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree) as React.ReactElement
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
