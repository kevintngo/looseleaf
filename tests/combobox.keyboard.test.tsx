import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(260, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }
const FRAMEWORKS = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"]

const Items = () => (
  <ComboboxList>
    <ComboboxEmpty>No framework found.</ComboboxEmpty>
    {FRAMEWORKS.map((f) => (
      <ComboboxItem key={f} value={f}>
        {f}
      </ComboboxItem>
    ))}
  </ComboboxList>
)

const named = (input: HTMLElement) => {
  const id = input.getAttribute("aria-activedescendant")
  return (id ? document.getElementById(id) : null) ?? undefined
}
const selected = () => screen.queryAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")

describe("Combobox with a trigger: keyboard", () => {
  function Basic() {
    return (
      <Combobox label="Framework">
        <ComboboxTrigger aria-label="Framework">
          <ComboboxValue placeholder="Select framework..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search framework..." />
          <Items />
        </ComboboxContent>
      </Combobox>
    )
  }
  const trigger = () => screen.getAllByRole("combobox").find((el) => el.tagName === "BUTTON") as HTMLElement

  it("the search field names the selected row as you type, and choosing with Enter puts the focus back on the trigger", async () => {
    const { user } = renderUI(<Basic />, opts)
    trigger().focus()
    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog")
    const search = within(dialog).getByRole("combobox")
    expect(search).toHaveFocus()
    await waitFor(() => expect(named(search)).toBe(selected()))
    await user.type(search, "re")
    await waitFor(() => expect(named(search)).toBe(selected()))
    expect(named(search)).toHaveTextContent("Remix")
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger()).toHaveTextContent("Remix")
    await waitFor(() => expect(trigger()).toHaveFocus())
  })

  it("Escape closes the list, keeps the old value and returns the focus to the trigger", async () => {
    const { user } = renderUI(<Basic />, opts)
    await user.click(trigger())
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByRole("combobox"), "as")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger()).toHaveTextContent("Select framework...")
    await waitFor(() => expect(trigger()).toHaveFocus())
    expect(trigger()).toHaveAttribute("aria-expanded", "false")
  })
})

describe("Combobox as an editable field: keyboard", () => {
  function Field() {
    return (
      <Combobox label="Framework" defaultValue="Astro">
        <ComboboxInput aria-label="Framework" placeholder="Search framework..." />
        <ComboboxContent>
          <Items />
        </ComboboxContent>
      </Combobox>
    )
  }
  const input = () => screen.getByRole("combobox", { name: "Framework" })

  it("names the selected row while the list is open, and nothing (no stale id) once it is closed", async () => {
    const { user } = renderUI(<Field />, opts)
    expect(input()).not.toHaveAttribute("aria-activedescendant")
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("listbox")
    await waitFor(() => expect(named(input())).toBe(selected()))
    await user.clear(input())
    await user.keyboard("nu")
    await waitFor(() => expect(named(input())).toBe(selected()))
    expect(named(input())).toHaveTextContent("Nuxt.js")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(input()).toHaveFocus()
    expect(input()).toHaveValue("Astro")
    expect(input()).not.toHaveAttribute("aria-activedescendant")
    expect(input()).toHaveAttribute("aria-expanded", "false")
  })

  it("Enter on the highlighted row chooses it and leaves the caret in the field", async () => {
    const { user } = renderUI(<Field />, opts)
    await user.click(input())
    await user.keyboard("{ArrowDown}")
    await screen.findByRole("listbox")
    await user.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}")
    await user.keyboard("rem{Enter}")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(input()).toHaveValue("Remix")
    expect(input()).toHaveFocus()
  })
})
