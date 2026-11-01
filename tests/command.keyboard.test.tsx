import * as React from "react"
import { act, cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 48)
})
afterEach(() => {
  restore()
  cleanup()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Palette() {
  return (
    <Command label="Commands">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Profile</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const selectedRow = () => screen.queryAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")
const namedRow = (input: HTMLElement) => {
  const id = input.getAttribute("aria-activedescendant")
  return id ? document.getElementById(id) : null
}

describe("aria-activedescendant", () => {
  it("names the selected row after every keystroke (cmdk writes it before the rows are redrawn, so it used to name a row that was gone)", async () => {
    const { user } = renderUI(<Palette />, opts)
    const input = screen.getByRole("combobox")
    await user.click(input)
    await waitFor(() => expect(namedRow(input)).toBe(selectedRow()))
    expect(namedRow(input)).toHaveTextContent("Calendar")
    for (const [typed, first] of [
      ["b", "Billing"],
      ["i", "Billing"],
      ["{Backspace}{Backspace}", "Calendar"],
      ["pro", "Profile"],
    ] as const) {
      await user.type(input, typed)
      await waitFor(() => expect(namedRow(input)).toBe(selectedRow()))
      expect(namedRow(input)).toHaveTextContent(first)
      expect(namedRow(input)?.isConnected).toBe(true)
    }
  })

  it("follows the arrow keys, and is dropped when nothing matches", async () => {
    const { user } = renderUI(<Palette />, opts)
    const input = screen.getByRole("combobox")
    await user.click(input)
    await user.keyboard("{ArrowDown}{ArrowDown}")
    await waitFor(() => expect(namedRow(input)).toHaveTextContent("Billing"))
    expect(namedRow(input)).toBe(selectedRow())
    await user.type(input, "zzzz")
    await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0))
    expect(input).not.toHaveAttribute("aria-activedescendant")
  })

  it("reads the list of ITS OWN palette when several are on the page", async () => {
    renderUI(
      <>
        <Palette />
        <Command label="Other">
          <CommandInput placeholder="Other..." />
          <CommandList>
            <CommandItem>Zebra</CommandItem>
            <CommandItem>Yak</CommandItem>
          </CommandList>
        </Command>
      </>,
      opts,
    )
    const [first, second] = screen.getAllByRole("combobox")
    await waitFor(() => expect(namedRow(first)).toHaveTextContent("Calendar"))
    await waitFor(() => expect(namedRow(second)).toHaveTextContent("Zebra"))
  })
})

describe("CommandDialog focus", () => {
  function Demo({ onChoose }: { onChoose?: () => void }) {
    const [open, setOpen] = React.useState(false)
    const [went, setWent] = React.useState(false)
    React.useEffect(() => {
      if (went && !open) document.getElementById("next-page")?.focus()
    }, [went, open])
    return (
      <>
        <button onClick={() => setOpen(true)}>Search</button>
        <h1 id="next-page" tabIndex={-1}>
          Next page
        </h1>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandItem
              onSelect={() => {
                onChoose?.()
                setWent(true)
                setOpen(false)
              }}
            >
              Go to next page
            </CommandItem>
          </CommandList>
        </CommandDialog>
      </>
    )
  }

  it("does not pull the focus back to the opener when the app moved it on while the palette was closing", async () => {
    const chose = vi.fn()
    const { user } = renderUI(<Demo onChoose={chose} />, opts)
    const button = screen.getByRole("button", { name: "Search" })
    await user.click(button)
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("combobox")).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(chose).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await act(() => new Promise((r) => setTimeout(r, 60)))
    expect(screen.getByRole("heading", { name: "Next page" })).toHaveFocus()
    expect(button).not.toHaveFocus()
  })

  it("still hands the focus back to the opener on Escape", async () => {
    const { user } = renderUI(<Demo />, opts)
    const button = screen.getByRole("button", { name: "Search" })
    await user.click(button)
    await screen.findByRole("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(button).toHaveFocus())
  })

  it("sits near the top of the window, so the input does not move as the list changes length", async () => {
    const { user } = renderUI(<Demo />, opts)
    await user.click(screen.getByRole("button", { name: "Search" }))
    const dialog = await screen.findByRole("dialog")
    expect(dialog.className).toContain("mt-[12dvh]")
    expect(dialog.className).toContain("mb-auto")
  })
})

describe("Command in Windows high contrast", () => {
  it("the selected row falls back to the system Highlight colours (the swipe's own are replaced there)", async () => {
    renderUI(<Palette />, opts)
    const row = selectedRow() ?? screen.getAllByRole("option")[0]
    expect(row.className).toContain("forced-colors:data-[selected=true]:bg-[color:Highlight]!")
    expect(row.className).toContain("forced-colors:data-[selected=true]:text-[color:HighlightText]!")
  })
})
