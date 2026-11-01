import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import Inbox from "@/blocks/inbox/page"
import { icons } from "@/lib/ink/art/icons"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

const sources = import.meta.glob("../src/blocks/inbox/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
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
  restore = mockBox(360, 80)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const list = (name = /^Inbox/) => screen.getByRole("list", { name })
const rows = (name?: RegExp) => within(list(name)).getAllByRole("button")
const row = (subject: RegExp) => screen.getByRole("button", { name: subject })
const status = () => screen.getByRole("status", { name: "Inbox updates" })
const letter = () => screen.getByRole("article")

describe("inbox block", () => {

  it("only names icons that are drawn", () => {
    const names = namedIcons()
    expect(names.size).toBeGreaterThan(1)
    expect([...names].filter((n) => !(n in icons))).toEqual([])
  })
  it("is one main landmark: a title, folders, a list of letters and nothing open yet", () => {
    const { container } = renderUI(<Inbox />, opts)
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 1, name: "The post" })).toBeInTheDocument()
    expect(screen.getByText("2 letters are waiting.")).toBeInTheDocument()
    expect(screen.getAllByRole("tab").map((t) => t.textContent?.replace(/\d+$/, ""))).toEqual(["Inbox", "Archive", "Trash"])
    expect(rows()).toHaveLength(8)
    expect(screen.getByText("Pick a letter to read")).toBeInTheDocument()
    expect(screen.queryByRole("article")).not.toBeInTheDocument()
    expectInkLayers(container, { min: 1 })
  })

  it("shows unread letters as closed envelopes with a word for screen readers", () => {
    renderUI(<Inbox />, opts)
    expect(row(/The sticker sheet, finally/)).toHaveTextContent("Unread. Ada Lovelace")
    expect(row(/The sticker sheet, finally/).querySelector('[data-icon="mail"]')).toBeTruthy()
    expect(row(/Postal code field is fixed/).querySelector('[data-icon="mail-check"]')).toBeTruthy()
    expect(within(row(/Photos of the field notebooks/)).getByRole("img", { name: "Starred" })).toBeInTheDocument()
  })

  it("opens a letter on its own sheet and marks it read", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/The sticker sheet, finally/))
    expect(letter()).toHaveAccessibleName("The sticker sheet, finally")
    expect(within(letter()).getByText("ada@marigold.example · 9:12")).toBeInTheDocument()
    expect(within(letter()).getByText("snail-sticker.png")).toBeInTheDocument()
    expect(row(/The sticker sheet, finally/)).toHaveAttribute("aria-current", "true")
    expect(row(/The sticker sheet, finally/)).not.toHaveTextContent("Unread.")
    expect(screen.getByText("One letter is waiting.")).toBeInTheDocument()
  })

  it("keeps the whole list to one tab stop and walks it with the arrow keys", async () => {
    const { user } = renderUI(<Inbox />, opts)
    const all = rows()
    expect(all.filter((b) => b.tabIndex === 0)).toHaveLength(1)
    all[0].focus()
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(all[2]).toHaveFocus()
    await user.keyboard("{End}")
    expect(all.at(-1)).toHaveFocus()
    await user.keyboard("{Home}")
    expect(all[0]).toHaveFocus()
    await user.keyboard("{ArrowUp}")
    expect(all[0]).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(letter()).toBeInTheDocument()
  })

  it("filters by unread and by a word, and says when nothing matches", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(screen.getByRole("radio", { name: "Unread" }))
    expect(rows()).toHaveLength(2)
    await user.click(screen.getByRole("radio", { name: "All" }))
    await user.type(screen.getByRole("searchbox", { name: "Search letters" }), "plum")
    expect(rows()).toHaveLength(1)
    expect(row(/Did you eat/)).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox", { name: "Search letters" }))
    await user.type(screen.getByRole("searchbox", { name: "Search letters" }), "zzzz")
    expect(screen.getByText("No letters like that")).toBeInTheDocument()
  })

  it("archives a letter, opens the next one, and says so", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Photos of the field notebooks/))
    await user.click(within(letter()).getByRole("button", { name: "Archive" }))
    expect(status()).toHaveTextContent("Archived “Photos of the field notebooks”.")
    expect(rows()).toHaveLength(7)
    expect(letter()).toHaveAccessibleName("Postal code field is fixed")
    await user.click(screen.getByRole("tab", { name: /Archive/ }))
    expect(rows(/^Archive/)).toHaveLength(2)
    await user.click(row(/Invoice 118/))
    expect(within(letter()).getByRole("button", { name: "Move to inbox" })).toBeInTheDocument()
    expect(within(letter()).queryByRole("button", { name: "Archive" })).toBeNull()
  })

  it("deletes into the trash and brings a letter back", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Supper on Saturday/))
    await user.click(within(letter()).getByRole("button", { name: "Delete" }))
    await user.click(screen.getByRole("tab", { name: /Trash/ }))
    expect(rows(/^Trash/)).toHaveLength(2)
    await user.click(row(/Supper on Saturday/))
    expect(within(letter()).queryByRole("button", { name: "Delete" })).toBeNull()
    await user.click(within(letter()).getByRole("button", { name: "Move to inbox" }))
    expect(status()).toHaveTextContent("Moved to the inbox: “Supper on Saturday?”.")
  })

  it("stars a letter and marks one unread again", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Postal code field is fixed/))
    const star = within(letter()).getByRole("button", { name: "Star" })
    expect(star).toHaveAttribute("aria-pressed", "false")
    await user.click(star)
    expect(within(letter()).getByRole("button", { name: "Star" })).toHaveAttribute("aria-pressed", "true")
    expect(within(row(/Postal code field is fixed/)).getByRole("img", { name: "Starred" })).toBeInTheDocument()
    await user.click(within(letter()).getByRole("button", { name: "Mark as unread" }))
    expect(status()).toHaveTextContent("Marked “Postal code field is fixed” as unread.")
    expect(row(/Postal code field is fixed/)).toHaveTextContent("Unread.")
    const again = within(letter()).getByRole("button", { name: "Mark as read" })
    expect(again).toBeEnabled()
    await user.click(again)
    expect(status()).toHaveTextContent("Marked “Postal code field is fixed” as read.")
    expect(row(/Postal code field is fixed/)).not.toHaveTextContent("Unread.")
    expect(within(letter()).getByRole("button", { name: "Mark as unread" })).toBeEnabled()
  })

  it("sends a reply and shows it under the letter", async () => {
    const { user } = renderUI(<Inbox />, opts)
    await user.click(row(/Supper on Saturday/))
    const send = within(letter()).getByRole("button", { name: "Send" })
    expect(send).toBeDisabled()
    await user.type(within(letter()).getByRole("textbox", { name: "Reply to Ada" }), "Yes please, and I will bring bread.")
    await user.click(send)
    expect(within(letter()).getByText("Yes please, and I will bring bread.")).toBeInTheDocument()
    expect(status()).toHaveTextContent("Reply sent to Ada.")
    expect(within(letter()).getByRole("textbox", { name: "Reply to Ada" })).toHaveValue("")
    expect(within(letter()).getByRole("textbox", { name: "Reply to Ada" })).toHaveFocus()
  })

  it("finishes with a friendly empty inbox", async () => {
    const { user } = renderUI(<Inbox />, opts)
    for (let i = 0; i < 8; i++) {
      await user.click(rows()[0])
      await user.click(within(letter()).getByRole("button", { name: "Archive" }))
    }
    expect(screen.getByText("Inbox zero")).toBeInTheDocument()
    expect(screen.getByText("All read.")).toBeInTheDocument()
  })

  it("has no axe violations, with a letter open too", async () => {
    const { user, container } = renderUI(<Inbox />, opts)
    await axeCheck(container)
    await user.click(row(/The sticker sheet, finally/))
    await axeCheck(container)
  })

  it("mounts under StrictMode without a warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    renderUI(
      <React.StrictMode>
        <Inbox />
      </React.StrictMode>,
      opts,
    )
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("renders the same on the server twice and hydrates without a warning", () => {
    const tree = <Inbox />
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
