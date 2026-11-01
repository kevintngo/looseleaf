import * as React from "react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon, markerVariants } from "@/components/ui/marker"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { markerRuleRecipe } from "@/lib/ink/recipes/marker-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(160, 16)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
})

const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

function Sep(props: React.ComponentProps<typeof Marker>) {
  return (
    <Marker {...props}>
      <MarkerContent>Today</MarkerContent>
    </Marker>
  )
}

describe("Marker", () => {
  it("has upstream's parts and slots", () => {
    const { container } = render(
      <Marker variant="separator">
        <MarkerIcon>
          <Icon name="asterisk" />
        </MarkerIcon>
        <MarkerContent>New messages</MarkerContent>
      </Marker>,
    )
    const m = container.querySelector('[data-slot="marker"]') as HTMLElement
    expect(m).toHaveAttribute("data-variant", "separator")
    expect(m).toHaveClass("group/marker", "relative", "flex", "min-h-4", "w-full", "items-center", "gap-2", "text-sm", "text-muted-foreground")
    expect(container.querySelector('[data-slot="marker-icon"]')).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelector('[data-slot="marker-content"]')).toHaveTextContent("New messages")
  })

  it("markerVariants stays exported and picks the variant", () => {
    expect(markerVariants({ variant: "border" })).toContain("pb-3")
    expect(markerVariants({ variant: "separator" })).toContain("group/marker")
  })

  it("a separator draws a line on each side, a border one line under, the default none", () => {
    const sep = render(<Sep variant="separator" />).container
    const rules = Array.from(sep.querySelectorAll('[data-slot="marker-rule"]'))
    expect(rules.map((r) => r.getAttribute("data-side"))).toEqual(["start", "end"])
    expect(sep.querySelector('[data-slot="marker"]')!.children[1]).toHaveAttribute("data-slot", "marker-content")
    for (const r of rules) {
      expect(r).toHaveAttribute("data-ink-host")
      expect(r.querySelector('svg[data-ink="rule"]')).not.toBeNull()
    }
    expectInkLayers(sep, { min: 2, kinds: ["rule"], absolute: true, layers: ["rest"] })
    const border = render(<Sep variant="border" />).container
    expect(border.querySelectorAll('[data-slot="marker-rule"]')).toHaveLength(1)
    expect(border.querySelector('[data-slot="marker-rule"]')).toHaveAttribute("data-side", "full")
    expect(render(<Sep />).container.querySelector('[data-slot="marker-rule"]')).toBeNull()
    expect(render(<Sep />).container.querySelector("svg")).toBeNull()
  })

  it("tone=new is red pencil, a bold swipe and a red asterisk", () => {
    const { container } = render(
      <Marker variant="separator" tone="new">
        <MarkerIcon>
          <Icon name="asterisk" />
        </MarkerIcon>
        <MarkerContent>New messages</MarkerContent>
      </Marker>,
    )
    expect(container.querySelector('[data-slot="marker"]')).toHaveAttribute("data-tone", "new")
    expect(container.querySelector('[data-slot="marker-rule"] svg')!.innerHTML).toContain("var(--ll-red)")
    expect(container.querySelector('[data-slot="marker-content"]')!.className).toContain("group-data-[tone=new]/marker:ll-swipe")
    expect(container.querySelector('[data-slot="marker-icon"]')!.className).toContain("group-data-[tone=new]/marker:text-red")
    expect(render(<Sep variant="separator" />).container.querySelector('[data-slot="marker"]')).not.toHaveAttribute("data-tone")
  })

  it("the separator words are the script font at 20 px", () => {
    const { getByText } = render(<Sep variant="separator" />)
    expect(getByText("Today")).toHaveClass("group-data-[variant=separator]/marker:font-script", "group-data-[variant=separator]/marker:text-xl")
  })

  it("asChild makes the marker a real button and keeps the lines inside it", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Marker variant="separator" tone="new" asChild>
        <button type="button" onClick={onClick}>
          <MarkerContent>New messages</MarkerContent>
        </button>
      </Marker>,
    )
    const b = getByRole("button", { name: "New messages" })
    expect(b).toHaveAttribute("data-slot", "marker")
    expect(b.querySelectorAll('[data-slot="marker-rule"]')).toHaveLength(2)
    await user.tab()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("the same seed draws the same lines", () => {
    const html = (seed: string) => {
      const { container, unmount } = render(<Sep variant="separator" seed={seed} />)
      const s = container.innerHTML
      unmount()
      return s
    }
    expect(html("a")).toBe(html("a"))
    expect(html("a")).not.toBe(html("b"))
  })

  it("rule=wavy changes the border line", () => {
    const a = render(<Sep variant="border" seed="x" />).container.querySelector("svg")!.innerHTML
    const b = render(<Sep variant="border" seed="x" rule="wavy" />).container.querySelector("svg")!.innerHTML
    expect(a).not.toBe(b)
  })
})

describe("markerRuleRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("one layer, cheap, in every side and tone", () => {
    for (const side of ["start", "end", "full"] as const) {
      for (const tone of ["default", "new"] as const) {
        for (const w of [40, 160, 560]) {
          const f = runRecipe(markerRuleRecipe, { ...req, params: { side, tone }, box: { w, h: 16 } })
          expect(f.layers).toEqual(["rest"])
          expect(nodes(f.parts.rest ?? ""), `${side}/${tone}/${w}`).toBeLessThanOrEqual(12)
          expect((f.parts.rest ?? "").length, `${side}/${tone}/${w}`).toBeLessThanOrEqual(8000)
          expect(f.parts.rest ?? "").not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
  })

  it("the end that touches the words follows the reading direction", () => {
    const xs = (dir: "ltr" | "rtl", side: "start" | "end") => {
      const f = runRecipe(markerRuleRecipe, { ...req, params: { side, tone: "default" }, box: { w: 200, h: 16 }, dir })
      const m = Array.from((f.parts.rest ?? "").matchAll(/M(-?[\d.]+)/g)).map((x) => Number(x[1]))
      return { min: Math.min(...m), max: Math.max(...m) }
    }
    expect(xs("ltr", "start").max).toBeLessThan(200)
    expect(xs("rtl", "start").min).toBeGreaterThan(-4)
  })

  it("tone new draws red, default draws pencil; calm density is a hairline", () => {
    const red = runRecipe(markerRuleRecipe, { ...req, params: { side: "full", tone: "new" }, box: { w: 200, h: 16 } })
    const pen = runRecipe(markerRuleRecipe, { ...req, params: { side: "full", tone: "default" }, box: { w: 200, h: 16 } })
    expect(red.parts.rest).toContain("var(--ll-red)")
    expect(pen.parts.rest).not.toContain("var(--ll-red)")
    const calm = runRecipe(markerRuleRecipe, { ...req, params: { side: "full", tone: "default" }, box: { w: 200, h: 16 }, density: "calm" })
    expect((calm.parts.rest ?? "").length).toBeLessThan((pen.parts.rest ?? "").length)
  })
})

describe("Marker on the server", () => {
  it("is deterministic and hydrates cleanly", async () => {
    restore()
    const tree = () => (
      <Marker variant="separator" tone="new">
        <MarkerIcon>
          <Icon name="asterisk" />
        </MarkerIcon>
        <MarkerContent>New messages</MarkerContent>
      </Marker>
    )
    const html = renderToString(tree())
    expect(renderToString(tree())).toBe(html)
    expect(html).toContain("New messages")
    const root = document.createElement("div")
    root.innerHTML = html
    document.body.append(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    await act(async () => {
      hydrateRoot(root, tree())
    })
    expect(err).not.toHaveBeenCalled()
    err.mockRestore()
    root.remove()
  })

  it("has no axe violations", async () => {
    const { container } = render(
      <div role="log" aria-label="chat">
        <Sep variant="separator" />
        <Marker variant="border">
          <MarkerContent>Thursday</MarkerContent>
        </Marker>
        <Marker>
          <MarkerIcon>
            <Icon name="user-plus" />
          </MarkerIcon>
          <MarkerContent>Lin joined</MarkerContent>
        </Marker>
        <Marker variant="separator" tone="new" asChild>
          <button type="button">
            <MarkerContent>New messages</MarkerContent>
          </button>
        </Marker>
      </div>,
    )
    await axeCheck(container)
  })
})
