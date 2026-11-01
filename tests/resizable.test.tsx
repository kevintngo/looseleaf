import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup, type GroupImperativeHandle } from "@/components/ui/resizable"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { resizableRecipe } from "@/lib/ink/recipes/resizable-ink"
import Panels from "@/docs/examples/resizable/01-panels"
import Vertical from "@/docs/examples/resizable/02-vertical"
import Persisted from "@/docs/examples/resizable/03-persisted"
import Mail from "@/docs/examples/resizable/04-mail"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

const P = HTMLElement.prototype
const saved = ["offsetWidth", "offsetHeight", "clientWidth", "clientHeight"].map((k) => [k, Object.getOwnPropertyDescriptor(P, k)] as const)
const savedRect = P.getBoundingClientRect
beforeEach(() => {
  const set = (k: string, v: number) => Object.defineProperty(P, k, { configurable: true, get: () => v })
  set("offsetWidth", 400)
  set("offsetHeight", 200)
  set("clientWidth", 400)
  set("clientHeight", 200)
  P.getBoundingClientRect = (() => ({ x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 200, width: 400, height: 200, toJSON() {} })) as never
})
afterEach(() => {
  for (const [k, d] of saved) if (d) Object.defineProperty(P, k, d)
  P.getBoundingClientRect = savedRect
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 40)) })

function Sample(props: React.ComponentProps<typeof ResizablePanelGroup> & { withHandle?: boolean; onLayout?: (l: Record<string, number>) => void }) {
  const { withHandle, onLayout, ...rest } = props
  return (
    <ResizablePanelGroup onLayoutChanged={onLayout} {...rest}>
      <ResizablePanel id="a" defaultSize="30%" minSize="10%" maxSize="80%">
        A
      </ResizablePanel>
      <ResizableHandle withHandle={withHandle} aria-label="Resize A" />
      <ResizablePanel id="b">B</ResizablePanel>
    </ResizablePanelGroup>
  )
}

describe("Resizable structure", () => {
  it("has upstream's three parts and slots, and a real separator", async () => {
    const { container, getByRole } = render(<Sample />)
    await settle()
    for (const slot of ["resizable-panel-group", "resizable-panel", "resizable-handle"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const sep = getByRole("separator", { name: "Resize A" })
    expect(sep).toHaveAttribute("data-slot", "resizable-handle")
    expect(sep).toHaveAttribute("aria-orientation", "vertical")
    expect(sep).toHaveAttribute("aria-valuenow", "30")
    expect(sep).toHaveAttribute("aria-valuemin")
    expect(sep).toHaveAttribute("tabindex", "0")
    expect(container.querySelector("[data-slot=resizable-panel-group]")).toHaveClass("flex", "h-full", "w-full")
    expect(container.querySelector("[data-slot=resizable-panel-group]")).toHaveAttribute("data-orientation", "horizontal")
  })

  it("leaves height and width to the classes (the library's inline 100% would beat h-64), and lets a style of your own win", async () => {
    const { container, rerender } = render(<Sample />)
    await settle()
    const group = () => container.querySelector<HTMLElement>("[data-slot=resizable-panel-group]")!
    expect(group().style.height).toBe("")
    expect(group().style.width).toBe("")
    rerender(<Sample style={{ height: 120 }} />)
    await settle()
    expect(group().style.height).toBe("120px")
  })

  it("stacked groups have horizontal seams", async () => {
    const { getByRole } = render(<Sample orientation="vertical" />)
    await settle()
    expect(getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal")
    expect(getByRole("separator").className).toContain("h-2")
  })

  it("keeps the panel content inside the library's own wrapper", () => {
    const { container } = render(<Sample />)
    expect(container.querySelector("[data-slot=resizable-panel]")).toHaveTextContent("A")
  })
})

describe("Resizable keyboard and layout", () => {
  it("resizes with the arrow keys, Home and End, within the limits", async () => {
    const seen: Array<Record<string, number>> = []
    const { user, getByRole } = renderUI(<Sample onLayout={(l) => seen.push(l)} />)
    await settle()
    const sep = getByRole("separator")
    sep.focus()
    await user.keyboard("{ArrowRight}")
    await settle()
    expect(sep).toHaveAttribute("aria-valuenow", "35")
    expect(seen.at(-1)).toEqual({ a: 35, b: 65 })
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    await settle()
    expect(sep).toHaveAttribute("aria-valuenow", "25")
    await user.keyboard("{End}")
    expect(Number(sep.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(80)
    await user.keyboard("{Home}")
    expect(Number(sep.getAttribute("aria-valuenow"))).toBe(10)
  })

  it("sets a layout through the group's imperative handle", async () => {
    const ref = React.createRef<GroupImperativeHandle>()
    const { getByRole } = render(<Sample groupRef={ref} />)
    await settle()
    act(() => void ref.current?.setLayout({ a: 60, b: 40 }))
    await settle()
    expect(getByRole("separator")).toHaveAttribute("aria-valuenow", "60")
    expect(ref.current?.getLayout()).toEqual({ a: 60, b: 40 })
  })

  it("does not move a disabled handle", async () => {
    const { user, getByRole } = renderUI(
      <ResizablePanelGroup>
        <ResizablePanel id="a" defaultSize="30%">A</ResizablePanel>
        <ResizableHandle disabled aria-label="Resize A" />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizablePanelGroup>,
    )
    await settle()
    getByRole("separator").focus()
    await user.keyboard("{ArrowRight}")
    expect(getByRole("separator")).toHaveAttribute("aria-valuenow", "30")
  })
})

describe("Resizable drawing", () => {
  it("draws the seam as its own host with the four interactive layers, the ring lazy", async () => {
    const { container, getByRole } = render(<Sample />)
    await settle()
    const sep = getByRole("separator")
    expect(sep).toHaveAttribute("data-ink-host")
    expect(sep.querySelector(":scope > svg")).toHaveAttribute("data-ink", "seam")
    expectInkLayers(container, { kinds: ["seam"], absolute: true, layers: ["rest", "hover", "pressed"] })
    expect(sep.querySelector('[data-layer="focus"]')).toBeNull()
  })

  it("the layers follow the library's data-separator attribute", async () => {
    const { getByRole } = render(<Sample />)
    await settle()
    const cls = getByRole("separator").className
    expect(cls).toContain("data-[separator=hover]:[&>svg_[data-layer=hover]]:visible")
    expect(cls).toContain("data-[separator=active]:[&>svg_[data-layer=pressed]]:visible")
    expect(cls).toContain("data-[separator=active]:[&>svg_[data-layer=hover]]:opacity-0")
  })

  it("draws the focus ring on keyboard focus", async () => {
    const { user, getByRole } = renderUI(<Sample />)
    await settle()
    await user.tab()
    expect(getByRole("separator")).toHaveFocus()
    expect(getByRole("separator").querySelector('[data-layer="focus"]')).not.toBeNull()
  })

  it("withHandle adds the paper tab and the grip glyph; without it there is neither", async () => {
    const without = render(<Sample />)
    await settle()
    expect(without.container.querySelector("[data-slot=resizable-handle-grip]")).toBeNull()
    const noTab = without.getByRole("separator").querySelector("svg[data-ink=seam] [data-layer=rest]")!.innerHTML.length
    without.unmount()
    const withTab = render(<Sample withHandle />)
    await settle()
    const grip = withTab.container.querySelector("[data-slot=resizable-handle-grip]")!
    expect(grip.querySelector("svg[data-icon=grip-vertical]")).not.toBeNull()
    expect(withTab.getByRole("separator").querySelector("svg[data-ink=seam] [data-layer=rest]")!.innerHTML.length).toBeGreaterThan(noTab * 0.5)
  })

  it("turns the grip for a stacked group", async () => {
    const { container } = render(<Sample orientation="vertical" withHandle />)
    await settle()
    expect(container.querySelector("[data-slot=resizable-handle-grip] svg")).toHaveClass("rotate-90")
  })

  it("draws a disabled seam as a static alternative", async () => {
    const { getByRole } = render(
      <ResizablePanelGroup>
        <ResizablePanel id="a">A</ResizablePanel>
        <ResizableHandle disabled aria-label="x" />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizablePanelGroup>,
    )
    await settle()
    const layers = Array.from(getByRole("separator").querySelectorAll(":scope > svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(layers).toEqual(["disabled"])
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<Sample withHandle />)
    await settle()
    await axeCheck(container)
  })
})

describe("resizableRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (line: "vertical" | "horizontal", len: number, extra: { grip?: boolean; disabled?: boolean } = {}, density: "comfortable" | "calm" = "comfortable") =>
    runRecipe(resizableRecipe, { ...req, density, params: { line, grip: !!extra.grip, disabled: !!extra.disabled }, box: line === "vertical" ? { w: 8, h: len } : { w: len, h: 8 } })
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("declares rest, hover and pressed eagerly, focus lazily, disabled alone", () => {
    expect(run("vertical", 300).layers).toEqual(expect.arrayContaining(["rest", "hover", "pressed"]))
    expect(runRecipe(resizableRecipe, { ...req, params: { line: "vertical", grip: false }, box: { w: 8, h: 300 }, lazy: ["focus"] }).layers).toContain("focus")
    expect(run("vertical", 300, { disabled: true }).layers).toEqual(["disabled"])
  })

  it("stays cheap along a long seam and never breaks on short ones", () => {
    for (const len of [4, 12, 40, 120, 400, 900, 2000]) {
      for (const line of ["vertical", "horizontal"] as const) {
        for (const grip of [false, true]) {
          const f = run(line, len, { grip })
          for (const s of Object.values(f.parts)) expect(s, `${line} ${len} ${grip}`).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
          expect((f.parts.rest ?? "").length).toBeLessThan(len > 1000 ? 26_000 : 14_000)
        }
      }
    }
    expect(nodes(run("vertical", 240, { grip: true }).parts.rest!)).toBeLessThanOrEqual(40)
  })

  it("leaves room for the tab: no stitch runs under it", () => {
    const plain = run("vertical", 240).parts.rest!
    const tabbed = run("vertical", 240, { grip: true }).parts.rest!
    expect(plain).not.toBe(tabbed)
  })

  it("is deterministic and hairline in calm", () => {
    const a = run("vertical", 300, { grip: true })
    expect(run("vertical", 300, { grip: true }).parts.rest).toBe(a.parts.rest)
    expect(run("vertical", 300, { grip: true }, "calm").parts.rest).not.toBe(a.parts.rest)
  })
})

describe("SSR and hydration", () => {
  it("renders identical markup twice", () => {
    expect(renderToString(<Sample withHandle id="g" />)).toBe(renderToString(<Sample withHandle id="g" />))
  })

  it("hydrates without warnings, bare and inside the provider", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample withHandle id="g" />)
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
  it("Panels: a row with a column inside, two labelled handles", async () => {
    const { getByRole, getAllByRole } = renderUI(<Panels />)
    await settle()
    expect(getAllByRole("separator")).toHaveLength(2)
    expect(getByRole("separator", { name: "Resize the first panel" })).toHaveAttribute("aria-orientation", "vertical")
    expect(getByRole("separator", { name: "Resize the second panel" })).toHaveAttribute("aria-orientation", "horizontal")
    await axeCheck()
  })

  it("Vertical stops at the limits", async () => {
    const { user, getByRole } = renderUI(<Vertical />)
    await settle()
    const sep = getByRole("separator", { name: "Resize the footer" })
    sep.focus()
    await user.keyboard("{End}")
    await settle()
    expect(Number(sep.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(100)
    await axeCheck()
  })

  it("Remembered layout survives an unmount, held in memory and not in localStorage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const { user, getByRole } = renderUI(<Persisted />)
    await settle()
    const sep = getByRole("separator", { name: "Resize the notes" })
    sep.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    await settle()
    expect(sep).toHaveAttribute("aria-valuenow", "45")
    await user.click(getByRole("button", { name: "Unmount" }))
    await user.click(getByRole("button", { name: "Remount" }))
    await settle()
    expect(getByRole("separator", { name: "Resize the notes" })).toHaveAttribute("aria-valuenow", "45")
    await user.click(getByRole("button", { name: "Reset to 35 / 65" }))
    await settle()
    expect(getByRole("separator", { name: "Resize the notes" })).toHaveAttribute("aria-valuenow", "35")
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
  })

  it("Mail layout collapses the inbox from a button", async () => {
    const { user, getByRole } = renderUI(<Mail />)
    await settle()
    await user.click(getByRole("button", { name: "Hide the inbox" }))
    await settle()
    expect(getByRole("button", { name: "Show the inbox" })).toBeTruthy()
    expect(document.querySelector("ul[inert]")).not.toBeNull()
    await user.click(getByRole("button", { name: "Show the inbox" }))
    await settle()
    expect(getByRole("button", { name: "Hide the inbox" })).toBeTruthy()
    expect(document.querySelector("ul[inert]")).toBeNull()
    await axeCheck()
  })
})
