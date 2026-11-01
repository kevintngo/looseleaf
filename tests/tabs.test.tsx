import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "@/components/ui/tabs"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { tabsRecipe, type TabsParams } from "@/lib/ink/recipes/tabs-ink"
import Account from "@/docs/examples/tabs/01-account"
import LineIcons from "@/docs/examples/tabs/02-line-icons"
import Vertical from "@/docs/examples/tabs/03-vertical"
import Controlled from "@/docs/examples/tabs/04-controlled"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(112, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

function Sample(props: React.ComponentProps<typeof Tabs> & { variant?: "default" | "line"; disabledTwo?: boolean }) {
  const { variant, disabledTwo, ...rest } = props
  return (
    <Tabs defaultValue="a" {...rest}>
      <TabsList variant={variant} aria-label="Sections">
        <TabsTrigger value="a">Account</TabsTrigger>
        <TabsTrigger value="b" disabled={disabledTwo}>
          Password
        </TabsTrigger>
        <TabsTrigger value="c">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
      <TabsContent value="c">Panel C</TabsContent>
    </Tabs>
  )
}

describe("Tabs structure", () => {
  it("has upstream's parts and data-slots with Radix roles", () => {
    const { container, getByRole, getAllByRole } = render(<Sample />)
    for (const slot of ["tabs", "tabs-list", "tabs-trigger", "tabs-content"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    expect(getByRole("tablist", { name: "Sections" })).toHaveAttribute("data-variant", "default")
    const tabs = getAllByRole("tab")
    expect(tabs.map((t) => t.textContent)).toEqual(["Account", "Password", "Team"])
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    expect(tabs[0]).toHaveAttribute("data-state", "active")
    expect(tabs[1]).toHaveAttribute("aria-selected", "false")
    const panel = getByRole("tabpanel")
    expect(panel).toHaveTextContent("Panel A")
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id)
    expect(tabs[0]).toHaveAttribute("aria-controls", panel.id)
  })

  it("exports tabsListVariants like upstream", () => {
    expect(tabsListVariants({ variant: "line" })).toContain("gap-1")
    expect(tabsListVariants()).toContain("group/tabs-list")
  })

  it("mirrors the orientation on the root, list and triggers", () => {
    const { container, getByRole } = render(<Sample orientation="vertical" />)
    expect(container.querySelector("[data-slot=tabs]")).toHaveAttribute("data-orientation", "vertical")
    expect(getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
  })
})

describe("Tabs keyboard and state", () => {
  it("moves with the arrow keys, opening tabs as it goes (automatic), Home and End included", async () => {
    const { user, getByRole, getAllByRole } = renderUI(<Sample />)
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
    expect(getByRole("tabpanel")).toHaveTextContent("Panel B")
    await user.keyboard("{End}")
    expect(tabs[2]).toHaveFocus()
    expect(tabs[2]).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{ArrowRight}")
    expect(tabs[0]).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(tabs[2]).toHaveFocus()
    await user.keyboard("{Home}")
    expect(tabs[0]).toHaveFocus()
  })

  it("uses the vertical arrows when vertical", async () => {
    const { user, getAllByRole } = renderUI(<Sample orientation="vertical" />)
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowDown}")
    expect(tabs[1]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
  })

  it("mirrors the horizontal arrows in right-to-left", async () => {
    const { user, getAllByRole } = renderUI(<Sample dir="rtl" />)
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowLeft}")
    expect(tabs[1]).toHaveFocus()
  })

  it("skips a disabled tab", async () => {
    const { user, getAllByRole } = renderUI(<Sample disabledTwo />)
    const tabs = getAllByRole("tab")
    expect(tabs[1]).toBeDisabled()
    await user.click(tabs[0])
    await user.keyboard("{ArrowRight}")
    expect(tabs[2]).toHaveFocus()
    await user.click(tabs[1])
    expect(tabs[2]).toHaveAttribute("aria-selected", "true")
  })

  it("waits for Enter in manual activation", async () => {
    const { user, getByRole, getAllByRole } = renderUI(<Sample activationMode="manual" />)
    const tabs = getAllByRole("tab")
    await user.click(tabs[0])
    await user.keyboard("{ArrowRight}")
    expect(tabs[1]).toHaveFocus()
    expect(getByRole("tabpanel")).toHaveTextContent("Panel A")
    await user.keyboard("{Enter}")
    expect(getByRole("tabpanel")).toHaveTextContent("Panel B")
  })

  it("works uncontrolled and controlled", async () => {
    const seen: string[] = []
    function C() {
      const [v, setV] = React.useState("c")
      return (
        <>
          <Sample value={v} onValueChange={(x) => (seen.push(x), setV(x))} />
          <output>{v}</output>
        </>
      )
    }
    const { user, getByRole, getAllByRole, container } = renderUI(<C />)
    expect(getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true")
    await user.click(getByRole("tab", { name: "Account" }))
    expect(seen).toEqual(["a"])
    expect(container.querySelector("output")).toHaveTextContent("a")
    const u = renderUI(<Sample defaultValue="c" />)
    expect(within(u.container).getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true")
  })
})

describe("Tabs drawing", () => {
  it("every trigger hosts its own drawing: rest, hover, checked, and the ring only when asked for", () => {
    const { getAllByRole, container } = render(<Sample />)
    const tabs = getAllByRole("tab")
    for (const t of tabs) {
      expect(t).toHaveAttribute("data-ink-host")
      expect(t).toHaveAttribute("data-ink-ready")
      expect(t.firstElementChild).toHaveAttribute("data-ink", "tab")
    }
    expectInkLayers(container, { kinds: ["tab"], absolute: true, layers: ["rest", "hover", "checked"] })
    expect(container.querySelector('[data-layer="focus"]')).toBeNull()
    expect(tabs[0].querySelector('[data-layer="checked"]')).not.toBeNull()
    expect(tabs[1].querySelector('[data-layer="checked"]')).not.toBeNull()
  })

  it("hides the baseline of the active tab: it is a part of rest that goes away on checked", () => {
    const { getAllByRole } = render(<Sample />)
    expect(getAllByRole("tab")[0].querySelector('[data-hide-on~="checked"]')).not.toBeNull()
  })

  it("draws the focus ring on the first keyboard focus", async () => {
    const { user, getAllByRole } = renderUI(<Sample />)
    const tabs = getAllByRole("tab")
    await user.tab()
    expect(tabs[0]).toHaveFocus()
    expect(tabs[0].querySelector('[data-layer="focus"]')).not.toBeNull()
  })

  it("does not re-run the recipe when the selection changes", async () => {
    const { inkCache } = await import("@/lib/ink/react")
    const { user, getAllByRole } = renderUI(<Sample />)
    const tabs = getAllByRole("tab")
    const runs = inkCache.stats().runs
    await user.click(tabs[1])
    await user.click(tabs[2])
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("draws a disabled tab as a static alternative", () => {
    const { getAllByRole } = render(<Sample disabledTwo />)
    const svg = getAllByRole("tab")[1].querySelector("svg[data-ink]")!
    expect(Array.from(svg.querySelectorAll(":scope > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["disabled"])
  })

  it("passes the orientation and variant to the recipe (the line variant draws no sketch)", () => {
    const { getAllByRole, rerender } = render(<Sample variant="line" />)
    const svg = getAllByRole("tab")[0].querySelector("svg[data-ink]")!
    expect(svg.querySelector('[data-part="swipe"]')).not.toBeNull()
    expect(svg.querySelector("[data-hide-on]")).toBeNull()
    rerender(<Sample orientation="vertical" />)
    expect(getAllByRole("tab")[0].className).toContain("data-[orientation=vertical]:w-full")
  })

  it("lifts the active tab (translate on data-state) and keeps the label upright", () => {
    const { getAllByRole } = render(<Sample />)
    expect(getAllByRole("tab")[0].className).toContain("data-[orientation=horizontal]:data-[state=active]:-translate-y-0.5")
    expect(getAllByRole("tab")[0].className).toContain("rtl:data-[state=active]:-translate-x-0.5")
  })

  it("has no accessibility violations (horizontal, vertical, line, disabled)", async () => {
    for (const ui of [<Sample />, <Sample orientation="vertical" />, <Sample variant="line" disabledTwo />]) {
      const { container, unmount } = renderUI(ui)
      await axeCheck(container)
      unmount()
    }
  })
})

describe("tabsRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (params: TabsParams, box = { w: 112, h: 36 }, extra: object = {}) => runRecipe(tabsRecipe, { ...req, params, box, ...extra })
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length

  it("declares its layers", () => {
    expect(run({ variant: "default", orientation: "horizontal" }).layers).toEqual(["rest", "checked", "hover"])
    expect(run({ variant: "default", orientation: "horizontal" }, undefined, { lazy: ["focus"] }).layers).toContain("focus")
    expect(run({ variant: "default", orientation: "horizontal", disabled: true }).layers).toEqual(["disabled"])
  })

  it("stays inside the budget of a control in every variant and orientation (12 nodes, 8 KB per visible state)", () => {
    for (const variant of ["default", "line"] as const) {
      for (const orientation of ["horizontal", "vertical"] as const) {
        const f = run({ variant, orientation })
        for (const layer of ["rest", "hover", "checked"] as const) {
          const s = f.parts[layer] ?? ""
          expect(nodes(s), `${variant} ${orientation} ${layer}`).toBeLessThanOrEqual(24)
          expect(s.length, `${variant} ${orientation} ${layer}`).toBeLessThan(8_000)
        }
      }
    }
  })

  it("is deterministic, mirrors for right-to-left, and never emits NaN or hex", () => {
    const a = run({ variant: "default", orientation: "vertical" })
    expect(run({ variant: "default", orientation: "vertical" }).parts.rest).toBe(a.parts.rest)
    expect(run({ variant: "default", orientation: "vertical" }, undefined, { dir: "rtl" }).parts.checked).not.toBe(a.parts.checked)
    for (const density of ["comfortable", "compact", "calm"] as const) {
      for (const box of [{ w: 40, h: 24 }, { w: 112, h: 36 }, { w: 300, h: 44 }]) {
        const f = run({ variant: "default", orientation: "horizontal" }, box, { density })
        for (const s of Object.values(f.parts)) expect(s).not.toMatch(/NaN|undefined|#[0-9a-f]{3,6}\b/)
      }
    }
  })
})

describe("SSR and hydration", () => {
  it("renders identical markup twice", () => {
    expect(renderToString(<Sample />)).toBe(renderToString(<Sample />))
  })

  it("hydrates without warnings, bare and inside the provider, and then draws", () => {
    for (const wrap of [(x: React.ReactElement) => x, (x: React.ReactElement) => <InkProvider>{x}</InkProvider>]) {
      const ui = wrap(<Sample />)
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
      expect(container.querySelector("[role=tab] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("examples", () => {
  it("Account and password switches panels with the keyboard", async () => {
    const { user, getByRole } = renderUI(<Account />)
    await user.click(getByRole("tab", { name: "Account" }))
    await user.keyboard("{ArrowRight}")
    expect(getByRole("tabpanel")).toHaveTextContent("Change your password here")
    await axeCheck()
  })

  it("Line tabs skip the disabled tab", async () => {
    const { user, getByRole } = renderUI(<LineIcons />)
    await user.click(getByRole("tab", { name: "Settings" }))
    await user.keyboard("{ArrowRight}")
    expect(getByRole("tab", { name: "Search" })).toHaveFocus()
    await axeCheck()
  })

  it("Binder tabs are vertical", async () => {
    const { user, getByRole } = renderUI(<Vertical />)
    expect(getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
    await user.click(getByRole("tab", { name: "General" }))
    await user.keyboard("{ArrowDown}")
    expect(getByRole("tab", { name: "Notifications" })).toHaveFocus()
    await axeCheck()
  })

  it("The controlled example is driven from outside", async () => {
    const { user, getByRole } = renderUI(<Controlled />)
    expect(getByRole("tab", { name: "Tue" })).toHaveAttribute("aria-selected", "true")
    await user.click(getByRole("button", { name: "Later" }))
    expect(getByRole("tab", { name: "Wed" })).toHaveAttribute("aria-selected", "true")
    await user.click(getByRole("button", { name: "Earlier" }))
    await user.click(getByRole("button", { name: "Earlier" }))
    expect(getByRole("button", { name: "Earlier" })).toBeDisabled()
    await axeCheck()
  })
})
