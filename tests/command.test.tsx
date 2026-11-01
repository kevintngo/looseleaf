import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { commandInputRecipe } from "@/lib/ink/recipes/command-ink"
import { axeCheck, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(400, 48)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Palette(props: React.ComponentProps<typeof Command> & { onPick?: (v: string) => void; search?: string; onSearch?: (s: string) => void }) {
  const { onPick, search, onSearch, ...root } = props
  return (
    <Command label="Commands" {...root}>
      <CommandInput placeholder="Type a command or search..." value={search} onValueChange={onSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={onPick}>
            <Icon name="calendar" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={onPick}>Search Emoji</CommandItem>
          <CommandItem disabled onSelect={onPick}>
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={onPick}>
            Profile
            <CommandShortcut>Ctrl P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onPick}>Billing</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const options = () => screen.queryAllByRole("option")
const selected = () => options().find((o) => o.getAttribute("data-selected") === "true")

describe("Command structure and slots", () => {
  it("is a combobox input over a listbox of options, with the upstream data-slots", () => {
    const { container } = renderUI(<Palette />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("data-slot", "command-input")
    expect(input).toHaveAttribute("placeholder", "Type a command or search...")
    const list = screen.getByRole("listbox")
    expect(list).toHaveAttribute("data-slot", "command-list")
    expect(options()).toHaveLength(5)
    for (const slot of ["command", "command-input-wrapper", "command-group", "command-item", "command-separator", "command-shortcut"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    expect(screen.getByText("SUGGESTIONS", { exact: false })).toBeInTheDocument()
  })

  it("the palette is a slip of paper (a CSS sheet, no svg) that switches its own sheet off on other paper", () => {
    const { container } = renderUI(<Palette />)
    const root = container.querySelector('[data-slot="command"]') as HTMLElement
    expect(root).toHaveAttribute("cmdk-root")
    const sheet = root.querySelector(':scope > [data-slot="command-sheet"]') as HTMLElement
    expect(sheet).toHaveClass("ll-paper", "ll-stock-slip")
    expect(sheet.className).toContain("[[data-slot=popover-content]_&]:before:hidden")
    expect(sheet.className).toContain("[[data-slot=dialog-content]_&]:before:hidden")
    expect(sheet.querySelector(":scope > svg[data-ink='sheet']")).toBeNull()
  })

  it("sheet={false} draws no sheet; a stock passes through", () => {
    const { container, rerender } = renderUI(<Palette sheet={false} />)
    expect(container.querySelector('[data-slot="command-sheet"]')).toBeNull()
    rerender(<Palette sheet={{ stock: "napkin" }} />)
    expect(container.querySelector('[data-slot="command-sheet"]')).toHaveAttribute("data-stock", "napkin")
  })

  it("rows carry no ink of their own: the only ink is the rule under the search field", () => {
    const { container } = renderUI(<Palette />)
    const inks = Array.from(container.querySelectorAll("svg[data-ink]"))
    const kinds = inks.map((s) => s.getAttribute("data-ink"))
    expect(kinds.filter((k) => k !== "icon" && k !== "mascot" && k !== "keycap")).toEqual(["rule", "rule"])
    const host = container.querySelector('[data-slot="command-input-wrapper"]') as HTMLElement
    expect(host).toHaveAttribute("data-ink-host")
    expect(host).toHaveAttribute("data-ink-focus", "within")
    expect(host.querySelector(":scope > svg[data-ink='rule']")).not.toBeNull()
    expect(host.querySelector(":scope > input")).not.toBeNull()
    expect(container.querySelectorAll('[data-slot="command-item"] svg[data-ink="rule"]')).toHaveLength(0)
  })

  it("a string shortcut becomes a pencil keycap; nodes are left alone", () => {
    const { container } = renderUI(
      <Command>
        <CommandList>
          <CommandItem>
            One<CommandShortcut>Ctrl K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Two<CommandShortcut><b>x</b></CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const shortcuts = container.querySelectorAll('[data-slot="command-shortcut"]')
    expect(shortcuts[0].querySelector("kbd")).toHaveTextContent("Ctrl K")
    expect(shortcuts[1].querySelector("kbd")).toBeNull()
    expect(shortcuts[1].querySelector("b")).not.toBeNull()
  })
})

describe("Command filtering and keyboard", () => {
  it("typing filters and sorts, hides separators and empty groups, and the first match is highlighted", async () => {
    const { user, container } = renderUI(<Palette />)
    await user.type(screen.getByRole("combobox"), "cal")
    expect(options().map((o) => o.textContent).sort()).toEqual(["Calculator", "Calendar"])
    expect(container.querySelector('[data-slot="command-separator"]')).toBeNull()
    expect(screen.getByText("Settings").closest("[cmdk-group]")).toHaveAttribute("hidden")
    expect(options()).toContain(selected())
  })

  it("shows the empty state, with Stubby, when nothing matches", async () => {
    const { user, container } = renderUI(<Palette />)
    await user.type(screen.getByRole("combobox"), "zzzz")
    const empty = container.querySelector('[data-slot="command-empty"]') as HTMLElement
    expect(empty).toHaveTextContent("No results found.")
    const mascot = empty.querySelector('svg[data-slot="mascot"]')
    expect(mascot).toHaveAttribute("data-pose", "search")
    expect(mascot).toHaveAttribute("aria-hidden", "true")
    expect(options()).toHaveLength(0)
  })

  it("says how many results are left in a polite status, silent until you type", async () => {
    const { user } = renderUI(<Palette />)
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("")
    await user.type(screen.getByRole("combobox"), "cal")
    expect(status).toHaveTextContent("2 results")
    await user.type(screen.getByRole("combobox"), "endar")
    expect(status).toHaveTextContent("1 result")
    await user.type(screen.getByRole("combobox"), "zz")
    expect(status).toHaveTextContent("No results")
  })

  it("mascot={false} leaves Stubby out", async () => {
    const { user, container } = renderUI(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty mascot={false}>Nothing.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    await user.type(screen.getByRole("combobox"), "q")
    expect(container.querySelector('[data-slot="command-empty"] svg')).toBeNull()
  })

  it("arrow keys move the highlight (skipping disabled rows), Home and End jump, Enter selects", async () => {
    const onPick = vi.fn()
    const { user } = renderUI(<Palette onPick={onPick} />)
    screen.getByRole("combobox").focus()
    expect(selected()).toHaveTextContent("Calendar")
    await user.keyboard("{ArrowDown}")
    expect(selected()).toHaveTextContent("Search Emoji")
    await user.keyboard("{ArrowDown}")
    expect(selected()).toHaveTextContent("Profile")
    await user.keyboard("{End}")
    expect(selected()).toHaveTextContent("Billing")
    await user.keyboard("{Home}")
    expect(selected()).toHaveTextContent("Calendar")
    await user.keyboard("{ArrowUp}")
    expect(selected()).toHaveTextContent("Calendar")
    await user.keyboard("{ArrowDown}{Enter}")
    expect(onPick).toHaveBeenCalledWith("Search Emoji")
  })

  it("loop wraps around; a click selects; a disabled row is inert", async () => {
    const onPick = vi.fn()
    const { user } = renderUI(<Palette loop onPick={onPick} />)
    screen.getByRole("combobox").focus()
    await user.keyboard("{ArrowUp}")
    expect(selected()).toHaveTextContent("Billing")
    await user.click(screen.getByRole("option", { name: /Calculator/ }))
    expect(onPick).not.toHaveBeenCalled()
    expect(screen.getByRole("option", { name: /Calculator/ })).toHaveAttribute("aria-disabled", "true")
    await user.click(screen.getByRole("option", { name: /Search Emoji/ }))
    expect(onPick).toHaveBeenCalledTimes(1)
  })

  it("controlled: the search text and the highlighted value come from props", async () => {
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    const { user, rerender } = renderUI(<Palette search="" onSearch={onSearch} value="Billing" onValueChange={onValueChange} />)
    expect(selected()).toHaveTextContent("Billing")
    await user.type(screen.getByRole("combobox"), "p")
    expect(onSearch).toHaveBeenCalledWith("p")
    rerender(<Palette search="prof" onSearch={onSearch} value="Billing" onValueChange={onValueChange} />)
    expect(screen.getByRole("combobox")).toHaveValue("prof")
    expect(options().map((o) => o.textContent)).toEqual(["ProfileCtrl P"])
  })

  it("shouldFilter={false} leaves the list to you", async () => {
    const { user } = renderUI(<Palette shouldFilter={false} />)
    await user.type(screen.getByRole("combobox"), "zzzz")
    expect(options()).toHaveLength(5)
  })

  it("CommandLoading is a progressbar with cursive loops and your words", () => {
    const { container } = renderUI(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandLoading>Searching invoices...</CommandLoading>
        </CommandList>
      </Command>,
    )
    const loading = screen.getByRole("progressbar")
    expect(loading).toHaveTextContent("Searching invoices...")
    expect(loading).toHaveAttribute("data-slot", "command-loading")
    expect(container.querySelector('[data-slot="spinner"]')).not.toBeNull()
  })
})

describe("CommandDialog", () => {
  function Demo(props: Partial<React.ComponentProps<typeof CommandDialog>>) {
    return (
      <CommandDialog {...props}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Billing</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    )
  }

  it("opens a named dialog on a napkin with the palette inside (title and description for screen readers only)", async () => {
    renderUI(<Demo open onOpenChange={() => {}} />, opts)
    const dialog = await screen.findByRole("dialog", { name: "Command Palette" })
    expect(dialog).toHaveAttribute("data-slot", "dialog-content")
    expect(dialog).toHaveAttribute("data-stock", "napkin")
    expect(dialog).toHaveAccessibleDescription("Search for a command to run...")
    expect(within(dialog).getByRole("combobox")).toBeInTheDocument()
    expect(within(dialog).getAllByRole("option")).toHaveLength(2)
    expect(dialog.querySelector('[data-slot="dialog-header"]')).toHaveClass("sr-only")
    expect(dialog.querySelector('[data-slot="command"]')).not.toBeNull()
    expect(dialog.querySelector('[data-slot="command-sheet"]')).toBeNull()
  })

  it("gives the focus back to whoever had it when it opened (Radix only does so for a DialogTrigger; a shortcut or a button that sets `open` has none)", async () => {
    function Opener() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Search</button>
          <Demo open={open} onOpenChange={setOpen} />
        </>
      )
    }
    const { user } = renderUI(<Opener />, opts)
    const button = screen.getByRole("button", { name: "Search" })
    await user.click(button)
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("combobox")).toHaveFocus()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(button).toHaveFocus()
    await user.click(button)
    await user.keyboard("{Enter}")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(button).toHaveFocus()
  })

  it("has no corner x by default, an optional one, and Escape closes it", async () => {
    const onOpenChange = vi.fn()
    const { user, rerender } = renderUI(<Demo open onOpenChange={onOpenChange} />, opts)
    const dialog = await screen.findByRole("dialog")
    expect(dialog.querySelector('[data-part="x"]')).toBeNull()
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    rerender(<Demo open onOpenChange={onOpenChange} showCloseButton />)
    expect((await screen.findByRole("dialog")).querySelector('[data-part="x"]')).not.toBeNull()
  })

  it("title, description and commandProps are passed on", async () => {
    renderUI(<Demo open onOpenChange={() => {}} title="Jump to" description="Find a page" commandProps={{ shouldFilter: false, loop: true }} />, opts)
    const dialog = await screen.findByRole("dialog", { name: "Jump to" })
    expect(dialog).toHaveAccessibleDescription("Find a page")
  })

  it("typing filters inside the dialog and Enter selects", async () => {
    const onSelect = vi.fn()
    const { user } = renderUI(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput />
        <CommandList>
          <CommandItem onSelect={onSelect}>Calendar</CommandItem>
          <CommandItem onSelect={onSelect}>Billing</CommandItem>
        </CommandList>
      </CommandDialog>,
      opts,
    )
    await screen.findByRole("dialog")
    await user.type(screen.getByRole("combobox"), "bill{Enter}")
    expect(onSelect).toHaveBeenCalledWith("Billing")
  })
})

describe("Command inside a Popover", () => {
  it("sits on the popover's slip (its own sheet is switched off by CSS)", async () => {
    const { user } = renderUI(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Commands" className="p-0">
          <Palette />
        </PopoverContent>
      </Popover>,
      opts,
    )
    await user.click(screen.getByRole("button", { name: "Open" }))
    const pop = await screen.findByRole("dialog", { name: "Commands" })
    expect(pop.querySelector('[data-slot="command"]')).not.toBeNull()
    expect(pop).toHaveAttribute("data-slot", "popover-content")
  })
})

describe("Command recipe, accessibility, rendering", () => {
  const req = { seed: "s", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("the search rule is a cheap rest layer with a lazy focus rule, whatever the width", () => {
    for (const w of [120, 400, 900]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        const f = runRecipe(commandInputRecipe, { ...req, density, params: {}, box: { w, h: 48 }, lazy: ["focus"] })
        expect(f.layers).toEqual(["rest", "focus"])
        expect(nodes(f.parts.rest ?? "")).toBeLessThanOrEqual(12)
        expect((f.parts.rest ?? "").length).toBeLessThanOrEqual(8000)
        expect(Object.values(f.parts).join("")).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
      }
    }
    const eager = runRecipe(commandInputRecipe, { ...req, params: {}, box: { w: 400, h: 48 } })
    expect(eager.layers).toEqual(["rest"])
    expect(runRecipe(commandInputRecipe, { ...req, params: {}, box: { w: 400, h: 48 }, lazy: ["focus"], lazyOnly: true }).parts.focus).toBe(
      runRecipe(commandInputRecipe, { ...req, params: {}, box: { w: 400, h: 48 }, lazy: ["focus"] }).parts.focus,
    )
  })

  it("has no axe violations (list, filtered, empty, dialog)", async () => {
    const { container, user } = renderUI(<Palette />, opts)
    await axeCheck(container)
    await user.type(screen.getByRole("combobox"), "cal")
    await axeCheck(container)
    await user.clear(screen.getByRole("combobox"))
    await user.type(screen.getByRole("combobox"), "zzzz")
    await axeCheck(container)
    const empty = container.querySelector('[data-slot="command-empty"]') as HTMLElement
    expect(empty).not.toBeNull()
    expect(empty.closest('[role="listbox"]')).toBeNull()
    expect(empty.parentElement).toHaveAttribute("data-slot", "command-status")
    cleanup()
    renderUI(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput />
        <CommandList>
          <CommandGroup heading="A">
            <CommandItem>One</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>,
      opts,
    )
    await screen.findByRole("dialog")
    await axeCheck()
  })

  it("renders on the server twice the same and hydrates cleanly, bare and in a provider", async () => {
    const el = <Palette />
    const a = renderToString(el)
    expect(renderToString(el)).toBe(a)
    expect(a).not.toMatch(/NaN|undefined|\[object/)
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      cleanup()
      const host = document.createElement("div")
      document.body.appendChild(host)
      host.innerHTML = renderToString(wrap(el))
      const err = vi.spyOn(console, "error").mockImplementation(() => {})
      await act(async () => {
        hydrateRoot(host, wrap(el))
      })
      expect(err.mock.calls.map((c) => String(c[0])).filter((m) => !/act\(/.test(m))).toEqual([])
      err.mockRestore()
      host.remove()
    }
  })

  it("the loading line is written beside the listbox too, with or without rows, and still reads cmdk's state", async () => {
    const { container, rerender } = renderUI(
      <Command label="c" shouldFilter={false}>
        <CommandInput placeholder="s" />
        <CommandList>
          <CommandLoading>Searching...</CommandLoading>
        </CommandList>
      </Command>,
    )
    const bar = screen.getByRole("progressbar")
    expect(bar.closest('[role="listbox"]')).toBeNull()
    expect(bar.parentElement).toHaveAttribute("data-slot", "command-status")
    await axeCheck(container)
    rerender(
      <Command label="c" shouldFilter={false}>
        <CommandInput placeholder="s" />
        <CommandList>
          <CommandLoading>Searching...</CommandLoading>
          <CommandGroup heading="g">
            <CommandItem>One</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
    await axeCheck(container)
    expect(screen.getAllByRole("option")).toHaveLength(1)
  })

  it("survives StrictMode", async () => {
    const { user } = renderUI(
      <React.StrictMode>
        <Palette />
      </React.StrictMode>,
    )
    await user.type(screen.getByRole("combobox"), "bil")
    await waitFor(() => expect(options()).toHaveLength(1))
  })
})
