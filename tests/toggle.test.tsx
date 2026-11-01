import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Icon } from "@/components/ui/icon"
import { Toggle, toggleVariants } from "@/components/ui/toggle"
import { InkProvider, inkCache } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { toggleRecipe, toggleToneList, toggleVariantList, type ToggleParams } from "@/lib/ink/recipes/toggle-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(80, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Toggle structure", () => {
  it("is a Radix toggle button with upstream's slot and defaults, and a drawing behind it", () => {
    const { getByRole } = render(<Toggle aria-label="Bold">B</Toggle>)
    const t = getByRole("button", { name: "Bold" })
    expect(t.tagName).toBe("BUTTON")
    expect(t).toHaveAttribute("data-slot", "toggle")
    expect(t).toHaveAttribute("data-variant", "default")
    expect(t).toHaveAttribute("data-size", "default")
    expect(t).toHaveAttribute("data-state", "off")
    expect(t).toHaveAttribute("aria-pressed", "false")
    expect(t).toHaveClass("relative", "isolate", "font-hand")
    expect(t).toHaveAttribute("data-ink-host")
    expect(t).toHaveAttribute("data-ink-ready")
    expectInkLayers(t, { min: 1, kinds: ["toggle"], absolute: true, layers: ["rest", "hover", "checked"] })
    expect(layers(t)).toEqual(["rest", "checked", "hover"])
    expect(t.querySelector(":scope > svg")?.parentElement).toBe(t)
  })

  it.each(toggleVariantList)("variant %s draws at every size and keeps its data attributes", (variant) => {
    for (const size of ["default", "sm", "lg"] as const) {
      const { getByRole, unmount } = render(
        <Toggle variant={variant} size={size} aria-label="x">
          x
        </Toggle>
      )
      const t = getByRole("button")
      expect(t).toHaveAttribute("data-variant", variant)
      expect(t).toHaveAttribute("data-size", size)
      expect(t.querySelector(":scope > svg[data-ink=toggle]")).toBeTruthy()
      unmount()
    }
  })

  it("sinks itself when pressed and says so, so the stylesheet does not sink the drawing twice", () => {
    const { getByRole } = render(<Toggle aria-label="x">x</Toggle>)
    const t = getByRole("button")
    expect(t).toHaveAttribute("data-ink-sink", "self")
    expect(t).toHaveClass("active:translate-y-(--ll-press-sink)", "[&[data-pressed]:not([data-pressed=false])]:translate-y-(--ll-press-sink)")
  })

  it("toggleVariants is layout only, with upstream's three heights", () => {
    expect(toggleVariants({ size: "default" })).toContain("h-9")
    expect(toggleVariants({ size: "sm" })).toContain("h-8")
    expect(toggleVariants({ size: "lg" })).toContain("h-10")
    expect(toggleVariants({ className: "mt-2" })).toContain("mt-2")
    expect(toggleVariants()).toContain("[&_svg:not(.absolute):not([class*='size-'])]:size-4")
    expect(toggleVariants({ variant: "outline" })).not.toMatch(/\brounded|(?<![:\w])bg-|\bborder\b|shadow/)
  })

  it("forwards ref, className, id, name and data attributes to the button", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = render(
      <Toggle ref={ref} id="t1" className="ms-3" data-testid="tt" aria-label="x">
        x
      </Toggle>
    )
    expect(ref.current).toBe(getByRole("button"))
    expect(ref.current).toHaveAttribute("id", "t1")
    expect(ref.current).toHaveClass("ms-3")
    expect(ref.current).toHaveAttribute("data-testid", "tt")
  })

  it("an icon inside keeps its own size and the ink svg is never counted as the icon", () => {
    const { getByRole } = render(
      <Toggle aria-label="Watch">
        <Icon name="bell" />
        Watch
      </Toggle>
    )
    const t = getByRole("button", { name: "Watch" })
    expect(t.querySelectorAll(":scope > svg")).toHaveLength(2)
    expect(t.querySelector(":scope > svg[data-slot=icon]")).toBeTruthy()
  })
})

describe("Toggle behaviour", () => {
  it("toggles by click, Space and Enter; uncontrolled", async () => {
    const onPressedChange = vi.fn()
    const { getByRole, user } = renderUI(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>
    )
    const t = getByRole("button")
    await user.click(t)
    expect(t).toHaveAttribute("aria-pressed", "true")
    expect(t).toHaveAttribute("data-state", "on")
    expect(t).toHaveFocus()
    await user.keyboard(" ")
    expect(t).toHaveAttribute("data-state", "off")
    await user.keyboard("{Enter}")
    expect(t).toHaveAttribute("data-state", "on")
    expect(onPressedChange.mock.calls.map((c) => c[0])).toEqual([true, false, true])
  })

  it("defaultPressed starts on", () => {
    const { getByRole } = render(
      <Toggle defaultPressed aria-label="x">
        x
      </Toggle>
    )
    expect(getByRole("button")).toHaveAttribute("data-state", "on")
  })

  it("controlled: pressed decides, onPressedChange asks", async () => {
    function Controlled() {
      const [p, setP] = React.useState(false)
      return (
        <>
          <Toggle pressed={p} onPressedChange={setP} aria-label="c">
            c
          </Toggle>
          <output>{String(p)}</output>
        </>
      )
    }
    const { getByRole, container, user } = renderUI(<Controlled />)
    await user.click(getByRole("button"))
    expect(container.querySelector("output")?.textContent).toBe("true")
    expect(getByRole("button")).toHaveAttribute("aria-pressed", "true")
    const stuck = renderUI(
      <Toggle pressed={false} aria-label="stuck">
        s
      </Toggle>
    )
    await stuck.user.click(stuck.getByRole("button", { name: "stuck" }))
    expect(stuck.getByRole("button", { name: "stuck" })).toHaveAttribute("aria-pressed", "false")
  })

  it("disabled cannot be toggled, leaves the tab order, and draws its own alternative", async () => {
    const onPressedChange = vi.fn()
    const { getByRole, user } = renderUI(
      <Toggle disabled aria-label="off" onPressedChange={onPressedChange}>
        x
      </Toggle>
    )
    const t = getByRole("button")
    expect(t).toBeDisabled()
    expect(t).toHaveAttribute("data-disabled")
    await user.click(t)
    await user.tab()
    expect(t).not.toHaveFocus()
    expect(onPressedChange).not.toHaveBeenCalled()
    expect(layers(t)).not.toContain("hover")
  })

  it("a click never redraws the ink (state is CSS)", async () => {
    const { getByRole, user } = renderUI(
      <Toggle aria-label="Bold" seed="s">
        B
      </Toggle>
    )
    const before = inkCache.stats().runs
    await user.click(getByRole("button"))
    await user.click(getByRole("button"))
    expect(inkCache.stats().runs).toBe(before)
  })

  it("draws the focus ring lazily on keyboard focus only", async () => {
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(<Toggle aria-label="x">x</Toggle>)
    const t = getByRole("button")
    expect(layers(t)).not.toContain("focus")
    await user.tab()
    expect(layers(t)).toContain("focus")
    spy.mockRestore()
  })

  it("asChild puts the toggle on your element with the drawing inside it", () => {
    const { getByRole } = render(
      <Toggle asChild aria-label="link toggle">
        <a href="/x" role="button">
          Go
        </a>
      </Toggle>
    )
    const a = getByRole("button", { name: "link toggle" })
    expect(a.tagName).toBe("A")
    expect(a).toHaveAttribute("data-slot", "toggle")
    expect(a.querySelector(":scope > svg[data-ink=toggle]")).toBeTruthy()
    expect(a.textContent).toBe("Go")
  })
})

describe("Toggle in a form and accessibility", () => {
  it("has no axe violations across variants, sizes, on/off and disabled", async () => {
    const { container } = render(
      <div>
        {toggleVariantList.map((v) => (
          <Toggle key={v} variant={v} aria-label={`${v} toggle`}>
            <Icon name="eye" />
          </Toggle>
        ))}
        <Toggle defaultPressed aria-label="on">
          on
        </Toggle>
        <Toggle disabled aria-label="disabled">
          d
        </Toggle>
        <Toggle size="sm">Small label</Toggle>
        <Toggle size="lg" tone="marker">
          Large
        </Toggle>
      </div>
    )
    await axeCheck(container)
  })
})

describe("Toggle on the server and hydration", () => {
  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    restore()
    const tree = () => (
      <Toggle defaultPressed aria-label="x">
        x
      </Toggle>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="toggle"')
    expect(html).toContain('data-state="on"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <Toggle defaultPressed variant="outline" aria-label="h">
          h
        </Toggle>
      ) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      restore()
      container.innerHTML = renderToString(ui)
      restore = mockBox(80, 36)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=toggle] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("toggleRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: Partial<ToggleParams>, w = 36, h = 36, extra: object = {}) =>
    runRecipe(toggleRecipe, { ...req, params: { variant: "default", ...params } as ToggleParams, box: { w, h }, ...extra })

  it("always has a rest layer, so `checked` stays driven by the host's state (a drawing without rest would show it always)", () => {
    for (const variant of toggleVariantList) {
      for (const disabled of [false, true]) expect(run({ variant, disabled }).parts.rest, `${variant}/${disabled}`).toBeTruthy()
      expect(run({ variant, joined: true }).parts.rest).toMatch(/data-part="seam"/)
    }
  })

  it("declares rest, checked, hover eagerly and focus lazily; a disabled toggle has no hover or focus", () => {
    expect(run({}).layers).toEqual(["rest", "checked", "hover"])
    expect(run({}, 36, 36, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "hover", "focus"])
    expect(run({ disabled: true }, 36, 36, { lazy: ["focus"] }).layers).toEqual(["rest", "checked"])
  })

  it("the on-body is a data-part=fill group the CSS can nudge and snap", () => {
    expect(run({}).parts.checked).toMatch(/data-part="fill" style="--mx:-?[\d.]+;--my:-?[\d.]+"/)
  })

  it("draws sane markup at many boxes, densities, tiers, tones and joins (no NaN, only var(--ll-*) colours)", () => {
    for (const [w, h] of [
      [24, 24],
      [28, 28],
      [36, 36],
      [40, 40],
      [96, 36],
      [200, 32],
      [36, 120],
    ] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const variant of toggleVariantList) {
            for (const tone of toggleToneList) {
              for (const extra of [{}, { disabled: true }, { joined: true }, { joined: true, vertical: true }]) {
                const f = run({ variant, tone, ...extra }, w, h, { density, tier, dir: w > 100 ? "rtl" : "ltr", lazy: ["focus"] })
                const all = Object.values(f.parts).join("")
                expect(all, `${w}x${h}/${density}/${tier}/${variant}/${tone}/${JSON.stringify(extra)}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
              }
            }
          }
        }
      }
    }
  })

  it("lo tier budget: every layer is at most 12 nodes and 8 KB at control sizes", () => {
    for (const variant of toggleVariantList) {
      for (const [w, h] of [
        [36, 36],
        [96, 36],
      ] as const) {
        const f = run({ variant }, w, h)
        for (const layer of ["rest", "hover", "checked"] as const) {
          const m = f.parts[layer] ?? ""
          expect(nodes(m), `${variant}/${w}/${layer}`).toBeLessThanOrEqual(12)
          expect(m.length, `${variant}/${w}/${layer}`).toBeLessThanOrEqual(8000)
        }
      }
    }
  })

  it("calm density is hairline: a single pencil.fine loop and a lighter outline than the comfortable pen", () => {
    const comfortable = run({ variant: "outline" }, 96, 36).parts.rest ?? ""
    const calm = run({ variant: "outline" }, 96, 36, { density: "calm" }).parts.rest ?? ""
    expect(calm.length).toBeLessThan(comfortable.length)
    expect(run({ variant: "outline" }, 96, 36, { density: "calm" }).parts.hover ?? "").not.toBe("")
    expect(run({ variant: "default" }, 96, 36, { density: "calm" }).parts.hover ?? "").not.toBe("")
  })

  it("a joined item mirrors its seam in RTL", () => {
    const ltr = run({ variant: "outline", joined: true }, 96, 36).parts.rest ?? ""
    const rtl = run({ variant: "outline", joined: true }, 96, 36, { dir: "rtl" }).parts.rest ?? ""
    expect(ltr).not.toBe(rtl)
  })

  it("lazy layers never change the eager ones", () => {
    const eager = run({})
    const withFocus = run({}, 36, 36, { lazy: ["focus"] })
    expect(withFocus.parts.checked).toBe(eager.parts.checked)
    expect(withFocus.parts.focus).toBeTruthy()
  })
})
