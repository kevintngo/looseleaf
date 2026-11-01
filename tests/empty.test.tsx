import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { emptyFrameRecipe, emptyMediaRecipe } from "@/lib/ink/recipes/empty-ink"
import Icons from "@/docs/examples/empty/01-icon"
import Stubby from "@/docs/examples/empty/02-stubby"
import Drop from "@/docs/examples/empty/03-dropzone"
import NoResults from "@/docs/examples/empty/04-no-results"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(480, 260)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

function Sample(props: React.ComponentProps<typeof Empty> & { media?: React.ComponentProps<typeof EmptyMedia> }) {
  const { media, ...rest } = props
  return (
    <Empty {...rest}>
      <EmptyHeader>
        <EmptyMedia {...media}>{media?.variant === "icon" ? <Icon name="inbox" /> : null}</EmptyMedia>
        <EmptyTitle>Nothing here</EmptyTitle>
        <EmptyDescription>Start by adding one.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button type="button">Add</button>
      </EmptyContent>
    </Empty>
  )
}

describe("Empty structure", () => {
  it("has upstream's six parts with their data-slots (media is `empty-icon`)", () => {
    const { container } = render(<Sample />)
    for (const slot of ["empty", "empty-header", "empty-icon", "empty-title", "empty-description", "empty-content"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
  })

  it("keeps upstream's layout classes", () => {
    const { container } = render(<Sample />)
    expect(container.querySelector("[data-slot=empty]")).toHaveClass("flex", "min-w-0", "flex-1", "flex-col", "items-center", "justify-center", "gap-6", "p-6", "text-center", "text-balance", "md:p-12")
    expect(container.querySelector("[data-slot=empty-header]")).toHaveClass("flex", "max-w-sm", "flex-col", "items-center", "gap-2", "text-center")
    expect(container.querySelector("[data-slot=empty-content]")).toHaveClass("flex", "w-full", "max-w-sm", "min-w-0", "flex-col", "items-center", "gap-4", "text-sm", "text-balance")
    expect(container.querySelector("[data-slot=empty-description]")).toHaveClass("text-sm/relaxed", "text-muted-foreground")
  })

  it("titles are in the script font", () => {
    const { getByText } = render(<Sample />)
    expect(getByText("Nothing here")).toHaveClass("font-script", "font-semibold")
  })

  it("media: default is transparent, icon is a tile; both report their variant", () => {
    const d = render(<Sample />)
    expect(d.container.querySelector("[data-slot=empty-icon]")).toHaveAttribute("data-variant", "default")
    expect(d.container.querySelector("[data-slot=empty-icon]")).toHaveClass("bg-transparent", "mb-2")
    d.unmount()
    const i = render(<Sample media={{ variant: "icon" }} />)
    expect(i.container.querySelector("[data-slot=empty-icon]")).toHaveAttribute("data-variant", "icon")
    expect(i.container.querySelector("[data-slot=empty-icon]")).toHaveClass("size-11", "relative", "isolate")
  })

  it("media pose renders Stubby, doodle renders a doodle, and size passes through", () => {
    const { container } = render(<Sample media={{ pose: "sleep", size: 120 }} />)
    const mascot = container.querySelector("[data-slot=mascot]")!
    expect(mascot).toHaveAttribute("data-pose", "sleep")
    expect(mascot).toHaveAttribute("aria-hidden", "true")
    const d = render(<Sample media={{ doodle: "star", size: 64 }} />)
    expect(d.container.querySelector("[data-slot=doodle]")).toHaveAttribute("data-doodle", "star")
  })

  it("every pose named in the docs draws something, or renders nothing (never throws)", () => {
    for (const pose of ["idle", "wave", "think", "write", "sketch", "celebrate", "oops", "shrug", "sleep", "peek", "point", "carry", "halt", "search", "unplug"]) {
      const { container, unmount } = render(<EmptyMedia pose={pose as never} />)
      expect(container.querySelector("[data-slot=empty-icon]")).not.toBeNull()
      unmount()
    }
  })
})

describe("Empty drawing", () => {
  it("draws nothing by default: no border class, no host, no svg", () => {
    const { container } = render(<Sample />)
    expect(container.querySelector("[data-slot=empty]")).not.toHaveAttribute("data-ink-host")
    expect(container.querySelector("svg")).toBeNull()
  })

  it("a `border` in className becomes the sketched frame, and the CSS border goes transparent", () => {
    const { container } = render(<Sample className="border" seed="f" />)
    const e = container.querySelector("[data-slot=empty]")!
    expect(e).toHaveAttribute("data-ink-host")
    expect(e.firstElementChild).toHaveAttribute("data-ink", "frame")
    expect(e.className).toContain("[.border]:border-transparent")
    expectInkLayers(container, { kinds: ["frame"], absolute: true, layers: ["rest"] })
  })

  it("does not mistake border-dashed or a border color for `border`", () => {
    const { container } = render(<Sample className="border-dashed border-ink" />)
    expect(container.querySelector("svg")).toBeNull()
  })

  it("the icon tile is its own host", () => {
    const { container } = render(<Sample media={{ variant: "icon" }} />)
    const tile = container.querySelector("[data-slot=empty-icon]")!
    expect(tile).toHaveAttribute("data-ink-host")
    expect(tile.firstElementChild).toHaveAttribute("data-ink", "tile")
    expect(tile.querySelector("svg[data-icon=inbox]")).not.toBeNull()
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<Sample className="border" media={{ pose: "search" }} />)
    await axeCheck(container)
  })
})

describe("recipes", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("the frame is dashes of pencil at any size, and stays affordable when the view is large", () => {
    for (const box of [{ w: 120, h: 80 }, { w: 480, h: 260 }, { w: 900, h: 500 }, { w: 1400, h: 900 }]) {
      const f = runRecipe(emptyFrameRecipe, { ...req, params: {}, box })
      expect(f.layers).toEqual(["rest"])
      expect(f.parts.rest).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
      expect(f.parts.rest!.length, `${box.w}x${box.h}`).toBeLessThan(box.w > 1000 ? 40_000 : 24_000)
    }
    expect(runRecipe(emptyFrameRecipe, { ...req, density: "calm", params: {}, box: { w: 480, h: 260 } }).parts.rest!.length).toBeLessThan(runRecipe(emptyFrameRecipe, { ...req, params: {}, box: { w: 480, h: 260 } }).parts.rest!.length)
  })

  it("the tile is inside the budget of a control", () => {
    const f = runRecipe(emptyMediaRecipe, { ...req, params: {}, box: { w: 44, h: 44 } })
    expect(nodes(f.parts.rest!)).toBeLessThanOrEqual(16)
    expect(f.parts.rest!.length).toBeLessThan(8_000)
  })
})

describe("SSR and hydration", () => {
  const tree = () => <Sample className="border" seed="s" media={{ variant: "icon", seed: "m" }} />

  it("renders identical markup twice", () => {
    expect(renderToString(tree())).toBe(renderToString(tree()))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(tree())
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

describe("examples", () => {
  it("Icon tile", async () => {
    const { getByRole } = renderUI(<Icons />)
    expect(getByRole("button", { name: "Create project" })).toBeTruthy()
    await axeCheck()
  })

  it("Stubby shows three states with three poses", async () => {
    const { container } = renderUI(<Stubby />)
    expect(Array.from(container.querySelectorAll("[data-slot=mascot]")).map((m) => m.getAttribute("data-pose"))).toEqual(["search", "sleep", "unplug"])
    await axeCheck()
  })

  it("Placeholder frame draws the dashed frame inside a taped paper", async () => {
    const { container } = renderUI(<Drop />)
    expect(container.querySelector("[data-slot=empty][data-ink-host]")).not.toBeNull()
    expect(container.querySelector("[data-slot=doodle]")).toHaveAttribute("data-doodle", "paper-plane")
    await axeCheck()
  })

  it("Search with no results swaps the list for an empty state and back", async () => {
    const { user, getByRole, queryByText, container } = renderUI(<NoResults />)
    expect(container.querySelector("[data-slot=empty]")).not.toBeNull()
    expect(queryByText("No contacts found")).not.toBeNull()
    await user.click(getByRole("button", { name: "Show everyone" }))
    expect(container.querySelector("[data-slot=empty]")).toBeNull()
    expect(getByRole("list", { name: "Contacts" }).children).toHaveLength(6)
    await user.type(getByRole("textbox", { name: "Search contacts" }), "ada")
    expect(getByRole("list", { name: "Contacts" }).children).toHaveLength(1)
    await axeCheck()
  })
})
