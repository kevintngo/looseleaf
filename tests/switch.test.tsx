import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { inkCache } from "@/lib/ink/react/cache"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { switchRecipe, switchThumbRecipe } from "@/lib/ink/recipes/switch-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(44, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Switch structure", () => {
  it("is a Radix switch button with upstream's slots, a drawn track and a drawn thumb", () => {
    const { getByRole } = renderUI(<Switch aria-label="Airplane" />)
    const s = getByRole("switch", { name: "Airplane" })
    expect(s.tagName).toBe("BUTTON")
    expect(s).toHaveAttribute("data-slot", "switch")
    expect(s).toHaveAttribute("data-size", "default")
    expect(s).toHaveAttribute("data-state", "unchecked")
    expect(s).toHaveAttribute("aria-checked", "false")
    expect(s).toHaveClass("peer", "relative", "isolate", "shrink-0", "after:-inset-1")
    expect(s).toHaveAttribute("data-ink-host")
    expect(s).toHaveAttribute("data-ink-ready")
    expectInkLayers(s, { min: 2, kinds: ["switch", "thumb"], absolute: true, layers: ["rest", "checked", "hover"], intrinsic: false })
    expect(layers(s)).toEqual(["rest", "checked", "hover"])
    const thumb = s.querySelector("[data-slot=switch-thumb]") as HTMLElement
    expect(thumb).toBeTruthy()
    expect(thumb.parentElement).toBe(s)
    expect(thumb).toHaveAttribute("data-ink-host")
    expect(layers(thumb)).toEqual(["rest"])
  })

  it("size sm sets data-size; the thumb travels by size and has rtl twins", () => {
    const { getByRole } = renderUI(<Switch size="sm" aria-label="x" />)
    const s = getByRole("switch")
    expect(s).toHaveAttribute("data-size", "sm")
    const t = s.querySelector("[data-slot=switch-thumb]") as HTMLElement
    for (const c of ["size-(--sw-t)", "data-[state=checked]:translate-x-(--sw-on)", "rtl:data-[state=checked]:-translate-x-(--sw-on)", "data-[state=unchecked]:translate-x-1", "rtl:data-[state=unchecked]:-translate-x-1"])
      expect(t, c).toHaveClass(c)
    for (const c of ["[--sw-on:1.5rem]", "[--sw-t:1rem]", "data-[size=sm]:[--sw-on:1.25rem]", "data-[size=sm]:[--sw-t:0.75rem]", "calm:[--sw-on:1.25rem]", "calm:[--sw-t:0.75rem]", "calm:h-5", "calm:w-9"])
      expect(s, c).toHaveClass(c)
  })

  it("the ref reaches the button; the ink is behind, decorative and never focusable", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = renderUI(<Switch ref={ref} aria-label="x" />)
    const s = getByRole("switch")
    expect(ref.current).toBe(s)
    const svg = s.querySelector(":scope > svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.style.zIndex).toBe("-1")
  })

  it("draws disabled with its rest layer kept (checked stays state-driven) and invalid in red", () => {
    const a = renderUI(<Switch disabled aria-label="d" />)
    expect(layers(a.getByRole("switch"))).toEqual(["rest", "checked"])
    a.unmount()
    const b = renderUI(<Switch aria-invalid aria-label="i" />)
    const rest = b.getByRole("switch").querySelector("[data-layer=rest]")!.innerHTML
    expect(rest).toContain("var(--ll-red)")
  })

  it("has forced-colors fallbacks (a real border, a Highlight fill, a solid thumb)", () => {
    const { getByRole } = renderUI(<Switch aria-label="x" />)
    const s = getByRole("switch")
    expect(s).toHaveClass("forced-colors:border", "forced-colors:data-[state=checked]:bg-[Highlight]")
    expect(s.querySelector("[data-slot=switch-thumb]")).toHaveClass("forced-colors:bg-[ButtonText]")
  })
})

describe("Switch state and keyboard", () => {
  it("toggles by click, Space and Enter", async () => {
    const onCheckedChange = vi.fn()
    const { getByRole, user } = renderUI(<Switch aria-label="x" onCheckedChange={onCheckedChange} />)
    const s = getByRole("switch")
    await user.tab()
    expect(s).toHaveFocus()
    await user.keyboard(" ")
    expect(s).toHaveAttribute("data-state", "checked")
    expect(s).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{Enter}")
    expect(s).toHaveAttribute("data-state", "unchecked")
    await user.click(s)
    expect(s).toHaveAttribute("data-state", "checked")
    expect(onCheckedChange.mock.calls.map((a) => a[0])).toEqual([true, false, true])
  })

  it("is uncontrolled with defaultChecked and controlled with checked + onCheckedChange", async () => {
    const a = renderUI(<Switch aria-label="u" defaultChecked />)
    expect(a.getByRole("switch")).toHaveAttribute("data-state", "checked")
    await a.user.click(a.getByRole("switch"))
    expect(a.getByRole("switch")).toHaveAttribute("data-state", "unchecked")
    a.unmount()

    function Controlled() {
      const [v, setV] = React.useState(false)
      return (
        <>
          <Switch aria-label="c" checked={v} onCheckedChange={setV} />
          <output>{String(v)}</output>
        </>
      )
    }
    const { getByRole, user, container } = renderUI(<Controlled />)
    await user.click(getByRole("switch"))
    expect(container.querySelector("output")).toHaveTextContent("true")
    expect(getByRole("switch")).toHaveAttribute("aria-checked", "true")
  })

  it("a click does not redraw the track (the state is CSS)", async () => {
    const { getByRole, user } = renderUI(<Switch aria-label="x" />)
    const runs = inkCache.stats().runs
    await user.click(getByRole("switch"))
    await user.click(getByRole("switch"))
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("a disabled switch cannot be toggled or focused", async () => {
    const onCheckedChange = vi.fn()
    const { getByRole, user } = renderUI(<Switch aria-label="x" disabled onCheckedChange={onCheckedChange} />)
    await user.click(getByRole("switch"))
    expect(onCheckedChange).not.toHaveBeenCalled()
    await user.tab()
    expect(getByRole("switch")).not.toHaveFocus()
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { getByRole, user } = renderUI(<Switch aria-label="x" />)
    const s = getByRole("switch")
    expect(layers(s)).not.toContain("focus")
    await user.tab()
    expect(layers(s)).toContain("focus")
  })
})

describe("Switch in forms and with labels", () => {
  it("submits name / value like a checkbox: on gives the value, off nothing, and resets with the form", async () => {
    const seen: Array<string | null> = []
    const { getByRole, user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).get("digest") as string | null)
        }}
      >
        <Switch aria-label="Digest" name="digest" value="weekly" />
        <button type="submit">go</button>
        <button type="reset">reset</button>
      </form>,
    )
    await user.click(getByRole("button", { name: "go" }))
    await user.click(getByRole("switch"))
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual([null, "weekly"])
  })

  it("a label click toggles it, and a disabled switch dims its label", async () => {
    const { getByRole, getByText, user } = renderUI(
      <div>
        <div className="flex gap-2">
          <Switch id="a" />
          <Label htmlFor="a">Airplane</Label>
        </div>
        <div className="flex gap-2">
          <Switch id="b" disabled />
          <Label htmlFor="b">Locked</Label>
        </div>
      </div>,
    )
    await user.click(getByText("Airplane"))
    expect(getByRole("switch", { name: "Airplane" })).toHaveAttribute("data-state", "checked")
    expect(getByRole("switch", { name: "Locked" })).toBeDisabled()
    expect(getByText("Locked")).toHaveClass("peer-disabled:text-pencil-text")
  })

  it("required is exposed to assistive tech", () => {
    const { getByRole } = renderUI(<Switch aria-label="x" required />)
    expect(getByRole("switch")).toHaveAttribute("aria-required", "true")
  })
})

describe("Switch accessibility, RTL, server and hydration", () => {
  it("has no axe violations in any state", async () => {
    const { container } = renderUI(
      <div>
        <Switch aria-label="a" />
        <Switch aria-label="b" defaultChecked />
        <Switch aria-label="c" size="sm" />
        <Switch aria-label="d" disabled />
        <Switch aria-label="e" aria-invalid />
        <form>
          <Switch aria-label="f" name="f" />
        </form>
      </div>,
    )
    await axeCheck(container)
  })

  it("draws for an rtl host", () => {
    const { getByRole } = renderUI(
      <div dir="rtl">
        <Switch aria-label="x" defaultChecked />
      </div>,
    )
    expect(getByRole("switch")).toHaveAttribute("data-ink-ready")
  })

  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    const tree = () => <Switch aria-label="x" defaultChecked />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="switch"')
    expect(html).toContain('data-state="checked"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare, in a form, inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <form>{n}</form>, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(<Switch aria-label="h" name="h" defaultChecked />) as React.ReactElement
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
      expect(container.querySelector("[data-slot=switch] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("switchRecipe and switchThumbRecipe", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, w = 44, h = 24, extra: object = {}) => runRecipe(switchRecipe, { ...req, params, box: { w, h }, density: "comfortable", ...extra })

  it("declares rest, checked and hover eagerly, focus lazily; disabled keeps rest", () => {
    expect(run({}).layers).toEqual(["rest", "checked", "hover"])
    expect(run({}, 44, 24, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "hover", "focus"])
    expect(run({ disabled: true }).layers).toEqual(["rest", "checked"])
  })

  it("lo tier budget: the rest state is at most 12 nodes and 8 KB; the on-layer is a marker fill, a rim and a bar", () => {
    for (const [w, h] of [[36, 20], [44, 24], [60, 32]]) {
      const f = run({}, w, h)
      expect(nodes(f.parts.rest ?? ""), `${w}/rest`).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length, `${w}/rest`).toBeLessThanOrEqual(8000)
      expect(nodes(f.parts.checked ?? ""), `${w}/checked`).toBeLessThanOrEqual(14)
      expect((f.parts.checked ?? "").length, `${w}/checked`).toBeLessThanOrEqual(8000)
    }
    const t = runRecipe(switchThumbRecipe, { ...req, params: {}, box: { w: 16, h: 16 }, density: "comfortable" })
    expect(nodes(t.parts.rest ?? "")).toBeLessThanOrEqual(12)
  })

  it("the on fill is a data-part=fill group the CSS can nudge and snap", () => {
    expect(run({}).parts.checked).toMatch(/data-part="fill" style="--mx:-?[\d.]+;--my:-?[\d.]+"/)
  })

  it("draws sane markup at every size, density and tier, and mirrors for rtl", () => {
    for (const [w, h] of [[36, 20], [44, 24], [70, 36]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { invalid: true }, { disabled: true }]) {
            const f = run(params, w, h, { density, tier, lazy: ["focus"] })
            expect(Object.values(f.parts).join(""), `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
    expect(run({}, 44, 24, { dir: "rtl" }).parts.rest).not.toBe(run({}).parts.rest)
  })

  it("lazy layers are the same bytes whenever asked for and never change the eager ones", () => {
    const eager = run({})
    const a = run({}, 44, 24, { lazy: ["focus"] })
    const b = run({}, 44, 24, { lazy: ["focus"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(a.parts.checked).toBe(eager.parts.checked)
  })
})
