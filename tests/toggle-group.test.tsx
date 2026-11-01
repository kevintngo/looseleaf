import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InkProvider, inkCache } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { toggleGroupRecipe, type ToggleGroupParams } from "@/lib/ink/recipes/toggle-group-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(120, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

const Single = (props: Partial<React.ComponentProps<typeof ToggleGroup>> = {}) => (
  <ToggleGroup type="single" aria-label="Alignment" {...(props as object)}>
    <ToggleGroupItem value="left">Left</ToggleGroupItem>
    <ToggleGroupItem value="center">Center</ToggleGroupItem>
    <ToggleGroupItem value="right">Right</ToggleGroupItem>
  </ToggleGroup>
)

describe("ToggleGroup structure", () => {
  it("keeps upstream's slots, data attributes and the --gap variable", () => {
    const { getByRole, getAllByRole } = render(<Single variant="outline" size="sm" spacing={2} />)
    const g = getByRole("radiogroup", { name: "Alignment" })
    expect(g).toHaveAttribute("data-slot", "toggle-group")
    expect(g).toHaveAttribute("data-variant", "outline")
    expect(g).toHaveAttribute("data-size", "sm")
    expect(g).toHaveAttribute("data-spacing", "2")
    expect(g.style.getPropertyValue("--gap")).toBe("2")
    expect(g).toHaveClass("group/toggle-group", "flex", "w-fit", "relative", "isolate")
    const items = getAllByRole("radio")
    expect(items).toHaveLength(3)
    for (const it of items) {
      expect(it).toHaveAttribute("data-slot", "toggle-group-item")
      expect(it).toHaveAttribute("data-variant", "outline")
      expect(it).toHaveAttribute("data-size", "sm")
      expect(it).toHaveAttribute("data-spacing", "2")
    }
  })

  it("items sink themselves when pressed and say so", () => {
    const { getAllByRole } = render(<Single />)
    for (const it of getAllByRole("radio")) expect(it).toHaveAttribute("data-ink-sink", "self")
  })

  it("type=multiple is a toolbar of pressed buttons", () => {
    const { getByRole, getAllByRole } = render(
      <ToggleGroup type="multiple" aria-label="Format">
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="i">I</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(getByRole("toolbar", { name: "Format" })).toBeTruthy()
    expect(getAllByRole("button").map((b) => b.getAttribute("aria-pressed"))).toEqual(["false", "false"])
  })

  it("a joined outline group draws one box; items draw seams, bodies and rings", () => {
    const { getByRole, getAllByRole } = render(<Single variant="outline" />)
    const g = getByRole("radiogroup")
    expectInkLayers(g, { min: 1, kinds: ["toggle-group", "toggle"], absolute: true, layers: ["rest"] })
    expect(layers(g)).toEqual(["rest"])
    for (const it of getAllByRole("radio")) {
      expect(layers(it)).toEqual(["rest", "checked", "hover"])
      expect(it.querySelector(":scope > svg [data-part=seam]")).toBeTruthy()
    }
    expect(getAllByRole("radio")[0]).toHaveClass("data-[spacing=0]:first-of-type:[&>svg_[data-part=seam]]:hidden")
  })

  it("separate items (spacing > 0) draw their own outline and no seam; the group draws nothing", () => {
    const { getByRole, getAllByRole } = render(<Single variant="outline" spacing={2} />)
    expect(layers(getByRole("radiogroup"))).toEqual([])
    for (const it of getAllByRole("radio")) expect(it.querySelector(":scope > svg [data-part=seam]")).toBeNull()
  })

  it("a borderless group draws no group box (items whisper their seams)", () => {
    const { getByRole } = render(<Single />)
    expect(layers(getByRole("radiogroup"))).toEqual([])
  })

  it("a disabled borderless group still draws the dashed box (its only visible sign), separate disabled toggles their own", () => {
    const { getByRole, unmount } = render(<Single disabled />)
    expect(layers(getByRole("radiogroup"))).toEqual(["disabled"])
    unmount()
    const { getByRole: again } = render(<Single disabled spacing={2} />)
    expect(layers(again("radiogroup"))).toEqual([])
  })

  it("items can override size and variant only when the group has none", () => {
    const { getAllByRole } = render(
      <ToggleGroup type="single" aria-label="x">
        <ToggleGroupItem value="a" size="lg">
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>
    )
    const [a, b] = getAllByRole("radio")
    expect(a).toHaveClass("h-10")
    expect(b).toHaveClass("h-9")
    expect(a).toHaveAttribute("data-size", "lg")
  })

  it("forwards refs and className", () => {
    const g = React.createRef<HTMLDivElement>()
    const i = React.createRef<HTMLButtonElement>()
    const { getByRole } = render(
      <ToggleGroup type="single" ref={g} className="ms-4" aria-label="x">
        <ToggleGroupItem value="a" ref={i} className="text-lg">
          A
        </ToggleGroupItem>
      </ToggleGroup>
    )
    expect(g.current).toBe(getByRole("radiogroup"))
    expect(g.current).toHaveClass("ms-4")
    expect(i.current).toBe(getByRole("radio"))
    expect(i.current).toHaveClass("text-lg")
  })

  it("vertical groups stack and stretch their items", () => {
    const { getByRole } = render(<Single orientation="vertical" variant="outline" />)
    const g = getByRole("radiogroup")
    expect(g).toHaveAttribute("data-orientation", "vertical")
    expect(g).toHaveClass("data-[orientation=vertical]:flex-col", "data-[orientation=vertical]:items-stretch")
  })
})

describe("ToggleGroup behaviour", () => {
  it("single: one item is on; clicking another moves it; clicking the on one clears it (uncontrolled)", async () => {
    const onValueChange = vi.fn()
    const { getAllByRole, user } = renderUI(<Single onValueChange={onValueChange} />)
    const [l, c, r] = getAllByRole("radio")
    await user.click(l)
    expect([l, c, r].map((b) => b.getAttribute("data-state"))).toEqual(["on", "off", "off"])
    expect(l).toHaveAttribute("aria-checked", "true")
    await user.click(r)
    expect([l, c, r].map((b) => b.getAttribute("data-state"))).toEqual(["off", "off", "on"])
    await user.click(r)
    expect([l, c, r].map((b) => b.getAttribute("data-state"))).toEqual(["off", "off", "off"])
    expect(onValueChange.mock.calls.map((x) => x[0])).toEqual(["left", "right", ""])
  })

  it("multiple: any number of items are on", async () => {
    const { getAllByRole, user } = renderUI(
      <ToggleGroup type="multiple" aria-label="Format">
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="i">I</ToggleGroupItem>
        <ToggleGroupItem value="u">U</ToggleGroupItem>
      </ToggleGroup>
    )
    const [b, i, u] = getAllByRole("button")
    await user.click(b)
    await user.click(u)
    expect([b, i, u].map((x) => x.getAttribute("aria-pressed"))).toEqual(["true", "false", "true"])
  })

  it("roving focus: one tab stop, arrow keys move between items, Home and End jump, Space selects", async () => {
    const { getAllByRole, user } = renderUI(<Single />)
    const [l, c, r] = getAllByRole("radio")
    await user.tab()
    expect(l).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(c).toHaveFocus()
    await user.keyboard("{End}")
    expect(r).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(l).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(r).toHaveFocus()
    await user.keyboard("{Home}")
    expect(l).toHaveFocus()
    await user.keyboard(" ")
    expect(l).toHaveAttribute("data-state", "on")
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it("vertical groups use the up and down arrows", async () => {
    const { getAllByRole, user } = renderUI(<Single orientation="vertical" />)
    const [l, c] = getAllByRole("radio")
    await user.tab()
    expect(l).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    expect(c).toHaveFocus()
    await user.keyboard("{ArrowUp}")
    expect(l).toHaveFocus()
  })

  it("defaultValue and controlled value", async () => {
    const a = render(<Single defaultValue="center" />)
    expect(a.getAllByRole("radio").map((b) => b.getAttribute("data-state"))).toEqual(["off", "on", "off"])
    a.unmount()
    function Controlled() {
      const [v, setV] = React.useState("left")
      return (
        <>
          <Single value={v} onValueChange={(next: string) => next && setV(next)} />
          <output>{v}</output>
        </>
      )
    }
    const { getAllByRole, container, user } = renderUI(<Controlled />)
    await user.click(getAllByRole("radio")[2])
    expect(container.querySelector("output")?.textContent).toBe("right")
    expect(getAllByRole("radio")[2]).toHaveAttribute("data-state", "on")
  })

  it("a disabled group and a disabled item cannot be pressed and draw their disabled alternatives", async () => {
    const { getByRole, getAllByRole, user } = renderUI(<Single disabled variant="outline" />)
    const g = getByRole("radiogroup")
    expect(layers(g)).toEqual(["disabled"])
    for (const it of getAllByRole("radio")) {
      expect(it).toBeDisabled()
      await user.click(it)
      expect(it).toHaveAttribute("data-state", "off")
      expect(layers(it)).not.toContain("hover")
    }
    const one = render(
      <ToggleGroup type="single" aria-label="one">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" disabled>
          B
        </ToggleGroupItem>
      </ToggleGroup>
    )
    const radios = within(one.container).getAllByRole("radio")
    expect(radios[1]).toBeDisabled()
    expect(radios[0]).not.toBeDisabled()
  })

  it("a click never redraws the ink", async () => {
    const { getAllByRole, user } = renderUI(<Single variant="outline" />)
    const before = inkCache.stats().runs
    await user.click(getAllByRole("radio")[0])
    await user.click(getAllByRole("radio")[1])
    expect(inkCache.stats().runs).toBe(before)
  })
})

describe("ToggleGroup accessibility", () => {
  it("has no axe violations: single, multiple, icons with labels, disabled", async () => {
    const { container } = render(
      <div>
        <Single variant="outline" />
        <ToggleGroup type="multiple" aria-label="View" spacing={2}>
          <ToggleGroupItem value="a" aria-label="List">
            <Icon name="list" />
          </ToggleGroupItem>
          <ToggleGroupItem value="b" aria-label="Menu">
            <Icon name="menu" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Single disabled />
      </div>
    )
    await axeCheck(container)
  })
})

describe("ToggleGroup on the server and hydration", () => {
  it("renders host markers and no drawing before it is measured, deterministically", () => {
    restore()
    const tree = () => <Single defaultValue="center" variant="outline" />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="toggle-group"')
    expect(html).toContain('data-state="on"')
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(<Single defaultValue="left" variant="outline" />) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      restore()
      container.innerHTML = renderToString(ui)
      restore = mockBox(120, 36)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=toggle-group] > svg[data-ink]")).toBeTruthy()
      expect(container.querySelector("[data-slot=toggle-group-item] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("toggleGroupRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (params: ToggleGroupParams, w = 200, h = 36, extra: object = {}) => runRecipe(toggleGroupRecipe, { ...req, params, box: { w, h }, ...extra })

  it("draws a box when joined, a dashed alternative when disabled, and nothing when not joined", () => {
    expect(run({ joined: true }).layers).toEqual(["rest"])
    expect(run({ joined: true, disabled: true }).layers).toEqual(["disabled"])
    expect(run({ joined: false }).layers).toEqual([])
  })

  it("draws sane markup at many boxes, densities and tiers", () => {
    for (const [w, h] of [
      [80, 36],
      [200, 36],
      [600, 40],
      [36, 108],
    ] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const p of [{ joined: true }, { joined: true, disabled: true }] as const) {
            const all = Object.values(run(p, w, h, { density, tier }).parts).join("")
            expect(all, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("stays within the lo budget for a wide group", () => {
    const m = run({ joined: true }, 400, 36).parts.rest ?? ""
    expect((m.match(/<(?:path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(m.length).toBeLessThanOrEqual(8000)
  })
})
