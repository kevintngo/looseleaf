import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import NotesApp from "@/blocks/notes-app/page"
import { NOTEBOOKS, NOTES, parseLine, stripMarks, toggleMark, wordCount } from "@/blocks/notes-app/components/notes-app-data"
import Preview from "@/docs/content/blocks/notes-app"
import meta from "@/docs/content/blocks/notes-app.meta"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox, renderUI } from "./helpers"
import { expectDrawnClean, expectHydrates, expectSsrStable } from "./_blocks-apps"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 60)
})
afterEach(() => restore())

const app = () => (
  <InkProvider>
    <NotesApp />
  </InkProvider>
)

describe("notes-app marks", () => {
  it("reads marks out of a line and strips them for snippets", () => {
    expect(parseLine("a ==b== c __d__ ((e)) ~~f~~")).toEqual([
      { text: "a " },
      { text: "b", mark: "highlight" },
      { text: " c " },
      { text: "d", mark: "underline" },
      { text: " " },
      { text: "e", mark: "circle" },
      { text: " " },
      { text: "f", mark: "strike" },
    ])
    expect(stripMarks("one ==two==\nthree")).toBe("one two\nthree")
    expect(wordCount("one ==two==\nthree")).toBe(3)
  })

  it("puts a mark on a selection, takes it off again, and marks each line of a selection on its own", () => {
    const on = toggleMark("say hello there", 4, 9, "highlight")!
    expect(on.text).toBe("say ==hello== there")
    expect(on.text.slice(on.start, on.end)).toBe("hello")
    const off = toggleMark(on.text, on.start, on.end, "highlight")!
    expect(off.text).toBe("say hello there")
    expect(off.text.slice(off.start, off.end)).toBe("hello")
    expect(toggleMark("say ==hello== there", 4, 13, "highlight")!.text).toBe("say hello there")
    expect(toggleMark("abc", 1, 1, "circle")).toBeNull()
    expect(toggleMark("a   b", 1, 4, "circle")).toBeNull()
    const two = toggleMark("one two\n three four", 4, 19, "underline")!
    expect(two.text).toBe("one __two__\n __three four__")
    expect(two.text.slice(two.start, two.end)).toBe("two__\n __three four")
  })
})

describe("notes-app block", () => {
  it("shows the notebooks as tabs, the pages as cards and the open page with its marks", () => {
    renderUI(app())
    const tabs = screen.getByRole("tablist", { name: "Notebooks" })
    for (const nb of NOTEBOOKS) expect(within(tabs).getByRole("tab", { name: new RegExp(nb.name) })).toBeInTheDocument()
    expect(within(tabs).getByRole("tab", { name: /Everything/ })).toHaveAttribute("aria-selected", "true")
    const list = screen.getByRole("list", { name: "Everything pages" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(NOTES.length)
    expect(screen.getByRole("heading", { level: 2, name: "On owning books" })).toBeInTheDocument()
    expect(screen.getByText("a swipe of yellow").closest("mark")).not.toBeNull()
    expect(screen.getByRole("button", { name: "Open On owning books" })).toHaveAttribute("aria-current", "true")
  })

  it("has no axe violations on the page, in write mode and on the shelf of another notebook", async () => {
    const { container, user } = renderUI(app())
    await axeCheck(container)
    await user.click(screen.getByRole("radio", { name: "Write" }))
    await axeCheck(container)
    await user.click(screen.getByRole("tab", { name: /Garden/ }))
    await axeCheck(container)
  })

  it("filters the pages by notebook and by search", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("tab", { name: /Recipes/ }))
    const list = screen.getByRole("list", { name: "Recipes pages" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
    await user.type(screen.getByRole("searchbox", { name: "Search this notebook" }), "shivers")
    expect(within(list).getAllByRole("listitem")).toHaveLength(1)
    expect(within(list).getByRole("button", { name: "Open Porridge, the slow way" })).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox", { name: "Search this notebook" }))
    await user.type(screen.getByRole("searchbox", { name: "Search this notebook" }), "qqqq")
    expect(screen.getByText("No page says that")).toBeInTheDocument()
  })

  it("opens a page from a card", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "Open Lisbon, three days" }))
    expect(screen.getByRole("heading", { level: 2, name: "Lisbon, three days" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open Lisbon, three days" })).toHaveAttribute("aria-current", "true")
    expect(screen.getByText("pastel de nata").closest("mark")).not.toBeNull()
  })

  it("writes, marks the selected words and shows them drawn on the page", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("radio", { name: "Write" }))
    const body = screen.getByRole("textbox", { name: "Note" }) as HTMLTextAreaElement
    await user.clear(body)
    await user.type(body, "Buy good tape")
    body.setSelectionRange(4, 8)
    await user.click(screen.getByRole("button", { name: "Highlight" }))
    expect(body.value).toBe("Buy ==good== tape")
    await user.click(screen.getByRole("button", { name: "Highlight" }))
    expect(body.value).toBe("Buy good tape")
    body.setSelectionRange(0, 3)
    await user.click(screen.getByRole("button", { name: "Cross out" }))
    expect(body.value).toBe("~~Buy~~ good tape")
    await user.click(screen.getByRole("radio", { name: "Page" }))
    expect(screen.getByText("Buy").closest("s")).not.toBeNull()
    expect(screen.getByText(/3 words/)).toBeInTheDocument()
  })

  it("a mark pressed on the page takes you to Write with the words to select", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: "Circle" }))
    expect(screen.getByRole("radio", { name: "Write" })).toBeChecked()
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveFocus()
  })

  it("starts a new page in write mode, renames it, and tears it out again", async () => {
    const { user } = renderUI(app())
    await user.click(screen.getByRole("button", { name: /New page/ }))
    const title = screen.getByRole("textbox", { name: "Title" })
    expect(title).toHaveValue("")
    expect(title).toHaveFocus()
    await user.type(title, "Shopping")
    expect(screen.getByRole("button", { name: "Open Shopping" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Tear this page out" }))
    await user.click(await screen.findByRole("button", { name: "Tear it out" }))
    expect(screen.queryByRole("button", { name: "Open Shopping" })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("heading", { level: 2, name: "Notes" })).toHaveFocus())
  })

  it("counts another read as tally marks", async () => {
    const { user } = renderUI(app())
    expect(screen.getByRole("img", { name: "Read 7 times" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Count another read" }))
    expect(screen.getByRole("img", { name: "Read 8 times" })).toBeInTheDocument()
  })

  it("shows one pane at a time on a phone", async () => {
    const { user, container } = renderUI(app())
    const root = container.querySelector("[data-slot=notes-app]")!
    expect(root).toHaveAttribute("data-view", "list")
    await user.click(screen.getByRole("button", { name: "Open On owning books" }))
    expect(root).toHaveAttribute("data-view", "editor")
    await user.click(screen.getByRole("button", { name: "Back to notes" }))
    expect(root).toHaveAttribute("data-view", "list")
  })

  it("is stable on the server and hydrates cleanly", () => {
    expectDrawnClean(app())
    expectSsrStable(app())
    expectHydrates(<NotesApp />)
  })
})

describe("notes-app data", () => {
  it("starts from the notes it is given and reports the whole list after every change", async () => {
    const onNotesChange = vi.fn()
    const mine = [{ id: "a", notebook: "recipes", title: "Just one", body: "a ==b==", updated: "today", reads: 0 }]
    const { user } = renderUI(<InkProvider><NotesApp defaultNotes={mine} onNotesChange={onNotesChange} /></InkProvider>)
    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Count another read" }))
    expect(onNotesChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "a", reads: 1, updated: "just now" })])
    await user.click(screen.getByRole("button", { name: /New page/ }))
    expect(onNotesChange).toHaveBeenCalledTimes(2)
    expect(onNotesChange.mock.calls[1]![0]).toHaveLength(2)
  })
})

describe("notes-app docs preview", () => {
  it("lays the block on the desk, has a title and description for the gallery, and is accessible", async () => {
    const { container } = renderUI(<InkProvider><Preview /></InkProvider>)
    expect(container.querySelector("[data-slot=desk]")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Notes" })).toBeInTheDocument()
    expect(meta.title.length).toBeGreaterThan(2)
    expect(meta.description).toMatch(/paper|desk/)
    expect(meta.tags?.length).toBeGreaterThan(1)
    await axeCheck(container)
  })
})
