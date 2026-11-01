import * as React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { Combobox, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DirectionProvider, useDirection } from "@/components/ui/direction"
import { Item, ItemGroup } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import Autoplay, { autoplay } from "@/docs/examples/carousel/52-autoplay"
import { mockBox } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.documentElement.removeAttribute("dir")
})

function Probe() {
  return <output data-testid="probe">{useDirection()}</output>
}

describe("DirectionProvider asChild", () => {
  it("puts dir on your own element without turning it into `display: contents`", () => {
    const { container } = render(
      <DirectionProvider direction="rtl" asChild>
        <main className="p-4">x</main>
      </DirectionProvider>
    )
    const main = container.firstElementChild!
    expect(main).toHaveAttribute("dir", "rtl")
    expect(main).toHaveClass("p-4")
    expect(main).not.toHaveClass("contents")
  })

  it("the wrapper (no asChild) stays layout-neutral", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <span>x</span>
      </DirectionProvider>
    )
    expect(container.querySelector("[data-slot=direction]")).toHaveClass("contents")
  })
})

describe("DirectionProvider following the page", () => {
  it("skips a dir that says nothing (`auto`, junk) and keeps looking upwards", () => {
    render(
      <div dir="rtl">
        <div dir="auto">
          <DirectionProvider>
            <Probe />
          </DirectionProvider>
        </div>
      </div>
    )
    expect(screen.getByTestId("probe")).toHaveTextContent("rtl")
  })

  it("falls back to <html dir> when the nearest dir says nothing", () => {
    document.documentElement.setAttribute("dir", "rtl")
    render(
      <div dir="auto">
        <DirectionProvider>
          <Probe />
        </DirectionProvider>
      </div>
    )
    expect(screen.getByTestId("probe")).toHaveTextContent("rtl")
  })

  it("follows a dir that is set on an ancestor after mount (not only <html> and the nearest island)", async () => {
    render(
      <section data-testid="mid">
        <div>
          <DirectionProvider>
            <Probe />
          </DirectionProvider>
        </div>
      </section>
    )
    expect(screen.getByTestId("probe")).toHaveTextContent("ltr")
    await act(async () => screen.getByTestId("mid").setAttribute("dir", "rtl"))
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("rtl"))
    await act(async () => screen.getByTestId("mid").removeAttribute("dir"))
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("ltr"))
  })
})

describe("Button: upstream's className=\"rounded-full\" makes a pill", () => {
  const ink = (el: HTMLElement) => el.querySelector(":scope > svg[data-ink]")?.innerHTML ?? ""

  it("says so on the host and draws a different box than the default one", () => {
    render(
      <>
        <Button seed="a" size="icon" aria-label="round" className="rounded-full">
          o
        </Button>
        <Button seed="a" size="icon" aria-label="square">
          o
        </Button>
      </>
    )
    const round = screen.getByRole("button", { name: "round" })
    const square = screen.getByRole("button", { name: "square" })
    expect(round).toHaveAttribute("data-shape", "pill")
    expect(square).not.toHaveAttribute("data-shape")
    expect(ink(round)).not.toBe("")
    expect(ink(round)).not.toBe(ink(square))
  })

  it("reaches through InputGroupButton, asChild and every variant without breaking the drawing", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="field" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton className="rounded-full" size="icon-xs" aria-label="go">
            o
          </InputGroupButton>
        </InputGroupAddon>
        {(["default", "destructive", "outline", "secondary", "ghost", "link"] as const).map((variant) => (
          <Button key={variant} variant={variant} className="rounded-full" disabled={variant === "link"}>
            {variant}
          </Button>
        ))}
        <Button asChild className="rounded-full">
          <a href="#x">link</a>
        </Button>
      </InputGroup>
    )
    expect(screen.getByRole("button", { name: "go" })).toHaveAttribute("data-shape", "pill")
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("data-shape", "pill")
    for (const b of screen.getAllByRole("button")) expect(ink(b)).not.toMatch(/NaN|undefined/)
  })
})

describe("Item: upstream's <Item asChild role=\"listitem\"> inside a group", () => {
  it("keeps the link a link (the wrapper is the list item)", () => {
    render(
      <ItemGroup>
        <Item asChild role="listitem">
          <a href="#track">Track</a>
        </Item>
        <Item asChild role="presentation">
          <a href="#other">Other</a>
        </Item>
      </ItemGroup>
    )
    expect(screen.getByRole("link", { name: "Track" })).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("Other")).toHaveAttribute("role", "presentation")
  })
})

describe("Command in a menu", () => {
  it("puts its own slip away on the paper of dropdown, context and menubar menus (and their sub-menus)", () => {
    const { container } = render(
      <Command>
        <CommandInput aria-label="filter" />
        <CommandList>
          <CommandItem>one</CommandItem>
        </CommandList>
      </Command>
    )
    const cls = (container.querySelector('[data-slot="command-sheet"]') as HTMLElement).className
    for (const slot of ["dropdown-menu-content", "dropdown-menu-sub-content", "context-menu-content", "context-menu-sub-content", "menubar-content", "menubar-sub-content"]) {
      expect(cls).toContain(`[[data-slot=${slot}]_&]:before:hidden`)
    }
  })
})

describe("carousel/52 autoplay", () => {
  const fakeApi = () => ({ canScrollNext: () => true, scrollNext: vi.fn(), scrollTo: vi.fn(), on: vi.fn() })

  afterEach(() => vi.useRealTimers())

  it("the person's Pause survives Embla re-measuring (it destroys and re-inits every plugin on a resize)", () => {
    vi.useFakeTimers()
    const api = fakeApi()
    const p = autoplay(1000)
    p.init(api as never)
    vi.advanceTimersByTime(1000)
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
    p.want(false)
    vi.advanceTimersByTime(5000)
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
    p.destroy()
    p.init(api as never)
    vi.advanceTimersByTime(5000)
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
    p.want(true)
    vi.advanceTimersByTime(1000)
    expect(api.scrollNext).toHaveBeenCalledTimes(2)
    expect(api.on).toHaveBeenCalledTimes(2)
    p.destroy()
  })

  it("holds while the pointer, focus or a finger is on it, and lets go only when all three have", () => {
    vi.useFakeTimers()
    const api = fakeApi()
    const p = autoplay(1000)
    p.init(api as never)
    p.hold("pointer", true)
    p.hold("focus", true)
    vi.advanceTimersByTime(3000)
    expect(api.scrollNext).not.toHaveBeenCalled()
    p.hold("pointer", false)
    vi.advanceTimersByTime(3000)
    expect(api.scrollNext).not.toHaveBeenCalled()
    p.hold("focus", false)
    vi.advanceTimersByTime(1000)
    expect(api.scrollNext).toHaveBeenCalledTimes(1)
    p.destroy()
  })

  it("wraps back to the first slide at the end", () => {
    vi.useFakeTimers()
    const api = { ...fakeApi(), canScrollNext: () => false }
    const p = autoplay(500)
    p.init(api as never)
    vi.advanceTimersByTime(500)
    expect(api.scrollTo).toHaveBeenCalledWith(0)
    p.destroy()
  })

  it("has a Pause button that says what it will do, and no button at all when the reader asked for less motion", async () => {
    const { unmount } = render(<Autoplay />)
    const button = screen.getByRole("button", { name: "Pause autoplay" })
    await act(async () => button.click())
    expect(screen.getByRole("button", { name: "Play autoplay" })).toBeInTheDocument()
    unmount()

    document.documentElement.setAttribute("data-motion", "reduced")
    try {
      render(<Autoplay />)
      await waitFor(() => expect(screen.queryByRole("button", { name: /autoplay/ })).toBeNull())
      expect(screen.getByText(/asked for less motion/)).toBeInTheDocument()
    } finally {
      document.documentElement.removeAttribute("data-motion")
    }
  })
})

describe("Combobox keeps the id you give its input", () => {
  it("so a <Label htmlFor> reaches a single-select field", () => {
    render(
      <>
        <Label htmlFor="country">Country</Label>
        <Combobox items={[{ value: "nz", label: "New Zealand" }]} label="Country">
          <ComboboxInput id="country" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="nz">New Zealand</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </>
    )
    const input = document.getElementById("country")
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input).toHaveAttribute("role", "combobox")
    expect(screen.getByLabelText("Country", { selector: "input" })).toBe(input)
  })

  it("and a chips field", () => {
    render(
      <>
        <Label htmlFor="labels">Labels</Label>
        <Combobox multiple items={[{ value: "a", label: "A" }]} label="Labels">
          <ComboboxChips>
            <ComboboxChipsInput id="labels" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="a">A</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </>
    )
    expect(document.getElementById("labels")).toBeInstanceOf(HTMLInputElement)
  })
})
