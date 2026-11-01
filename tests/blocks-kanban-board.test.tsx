import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import KanbanBoard from "@/blocks/kanban-board/page"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/kanban-board/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
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
  restore = mockBox(320, 120)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const column = (name: string) => screen.getByRole("region", { name })
const titles = (name: string) => within(column(name)).queryAllByRole("heading", { level: 3 }).map((h) => h.textContent)
const move = (title: string, to: string) => screen.getByRole("button", { name: `Move “${title}” to ${to}` })
const note = (title: string) => screen.getByRole("heading", { level: 3, name: title }).closest("[data-note-id]") as HTMLElement
const status = () => screen.getByRole("status", { name: "Board updates" })

function dataTransfer() {
  const store: Record<string, string> = {}
  return { setData: (k: string, v: string) => void (store[k] = v), getData: (k: string) => store[k] ?? "", effectAllowed: "", dropEffect: "" }
}

describe("kanban-board block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names].filter((n) => !(n in icons))).toEqual([])
  })
  it("is one main with a title, three named columns and a heading on every note", () => {
    renderUI(<KanbanBoard />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "Launch week" })).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["To do", "Doing", "Done"])
    expect(titles("To do")).toHaveLength(4)
    expect(titles("Doing")).toHaveLength(3)
    expect(titles("Done")).toHaveLength(3)
    expect(within(column("To do")).getByRole("img", { name: "4 notes" })).toBeInTheDocument()
  })

  it("prints the label on each note and writes the done ones as done", () => {
    renderUI(<KanbanBoard />, opts)
    expect(within(note("Draw the sticker sheet")).getByText("Design")).toBeInTheDocument()
    expect(column("Done").querySelectorAll("[data-slot=sticky-note][data-state=checked]")).toHaveLength(3)
    expect(column("Doing").querySelectorAll("[data-slot=sticky-note][data-state]")).toHaveLength(0)
  })

  it("moves a note with its arrow button, says where it went, and keeps focus on the note", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    await user.click(move("Order washi tape for the box", "Doing"))
    expect(titles("To do")).not.toContain("Order washi tape for the box")
    expect(titles("Doing")).toEqual(["Print the price tags", "Draw the sticker sheet", "Fix the postcode field at checkout", "Order washi tape for the box"])
    expect(status()).toHaveTextContent("Moved “Order washi tape for the box” to Doing. Doing has 4 notes.")
    expect(move("Order washi tape for the box", "Done")).toHaveFocus()
  })

  it("has no move that leads nowhere: the first column has no back, the last no forward", () => {
    renderUI(<KanbanBoard />, opts)
    const first = note("Write the newsletter")
    expect(within(first).queryByRole("button", { name: /to Done|to To do/ })).toBeNull()
    expect(within(first).getByRole("button", { name: /to Doing/ })).toBeInTheDocument()
    const last = note("Name the new notebook")
    expect(within(last).getAllByRole("button")).toHaveLength(1)
    expect(within(last).getByRole("button", { name: /to Doing/ })).toBeInTheDocument()
  })

  it("moves back too, and a middle note offers both ways", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    const mid = note("Print the price tags")
    expect(within(mid).getAllByRole("button")).toHaveLength(2)
    await user.click(move("Print the price tags", "To do"))
    expect(titles("To do").at(-1)).toBe("Print the price tags")
    expect(status()).toHaveTextContent("To do has 5 notes")
  })

  it("moves a note by keyboard alone", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    move("Book the courier", "Doing").focus()
    await user.keyboard("{Enter}")
    expect(titles("Doing")).toContain("Book the courier")
    await user.keyboard("{Enter}")
    expect(titles("Done")).toContain("Book the courier")
    expect(note("Book the courier").matches("[data-state=checked]")).toBe(true)
  })

  it("lets a note be picked up and dropped on another column", () => {
    renderUI(<KanbanBoard />, opts)
    const dt = dataTransfer()
    fireEvent.dragStart(note("Write the newsletter"), { dataTransfer: dt })
    const doing = column("Doing").querySelector("ul")!.parentElement!
    fireEvent.dragOver(doing, { dataTransfer: dt })
    expect(doing).toHaveAttribute("data-over", "true")
    fireEvent.drop(doing, { dataTransfer: dt })
    expect(titles("Doing")).toContain("Write the newsletter")
    expect(titles("To do")).not.toContain("Write the newsletter")
    expect(status()).toHaveTextContent("Moved “Write the newsletter” to Doing")
  })

  it("ignores a drag that did not start on a note", () => {
    renderUI(<KanbanBoard />, opts)
    const doing = column("Doing").querySelector("ul")!.parentElement!
    const dt = dataTransfer()
    fireEvent.dragOver(doing, { dataTransfer: dt })
    expect(doing).not.toHaveAttribute("data-over")
  })

  it("adds a note at the foot of a column and puts focus back on the button", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    await user.click(within(column("To do")).getByRole("button", { name: /Add a note/ }))
    const form = screen.getByRole("form", { name: "New note in To do" })
    await user.click(within(form).getByRole("button", { name: "Stick it up" }))
    expect(within(form).getByRole("alert")).toHaveTextContent("Write a few words on the note first.")
    expect(within(form).getByRole("textbox", { name: "What needs doing?" })).toHaveAttribute("aria-invalid", "true")
    await user.type(within(form).getByRole("textbox", { name: "What needs doing?" }), "Wrap the samples{Enter}")
    expect(titles("To do").at(-1)).toBe("Wrap the samples")
    expect(status()).toHaveTextContent("Added “Wrap the samples” to To do.")
    await waitFor(() => expect(within(column("To do")).getByRole("button", { name: /Add a note/ })).toHaveFocus())
  })

  it("cancels a new note with Escape", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    await user.click(within(column("Doing")).getByRole("button", { name: /Add a note/ }))
    await user.keyboard("half a thought{Escape}")
    expect(screen.queryByRole("form")).not.toBeInTheDocument()
    expect(titles("Doing")).toHaveLength(3)
  })

  it("clears the done notes and shows an empty column kindly", async () => {
    const { user } = renderUI(<KanbanBoard />, opts)
    await user.click(screen.getByRole("button", { name: "Clear the 3 done notes" }))
    expect(titles("Done")).toHaveLength(0)
    expect(within(column("Done")).getByText(/Nothing here yet/)).toBeInTheDocument()
    expect(status()).toHaveTextContent("Cleared 3 done notes.")
    expect(screen.queryByRole("button", { name: /^Clear the/ })).not.toBeInTheDocument()
  })

  it("draws the board with its ink and passes axe", async () => {
    const { container } = renderUI(<KanbanBoard />, opts)
    expectInkLayers(container, { min: 1 })
    await axeCheck(container)
  })

  it("passes axe with the add form open", async () => {
    const { user, container } = renderUI(<KanbanBoard />, opts)
    await user.click(within(column("Done")).getByRole("button", { name: /Add a note/ }))
    await axeCheck(container)
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <KanbanBoard />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <KanbanBoard />
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
