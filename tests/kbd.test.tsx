import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Icon } from "@/components/ui/icon"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { KEY_DEPTH, kbdRecipe } from "@/lib/ink/recipes/kbd-ink"
import { axeCheck, expectInkLayers, mockBox } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(40, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

describe("Kbd", () => {
  it("is a <kbd> with upstream's slot and a keycap drawn behind its text", () => {
    const { getByText } = render(<Kbd>Ctrl</Kbd>)
    const k = getByText("Ctrl")
    expect(k.tagName).toBe("KBD")
    expect(k).toHaveAttribute("data-slot", "kbd")
    expect(k).toHaveClass("relative", "isolate", "inline-flex", "font-hand", "select-none")
    expect(k).toHaveAttribute("data-ink-host")
    expect(k).toHaveAttribute("data-ink-ready")
    expectInkLayers(k, { min: 1, kinds: ["keycap"], absolute: true, layers: ["rest"] })
    expect(k.textContent).toBe("Ctrl")
  })

  it("reserves the drawn thickness as padding, so the label sits on the cap", () => {
    const { getByText } = render(<Kbd>K</Kbd>)
    expect(getByText("K")).toHaveClass("pr-[6.4px]", "pb-[2.4px]")
    expect(KEY_DEPTH).toBe(2.4)
  })

  it("presses: the pointer-down and data-pressed styles are on the host, the thickness hides on the drawing", () => {
    const { getByText } = render(<Kbd>Enter</Kbd>)
    const k = getByText("Enter")
    expect(k).toHaveClass("active:translate-y-[1.6px]", "[&[data-pressed]:not([data-pressed=false])]:translate-y-[1.6px]")
    expect(k).toHaveAttribute("data-ink-sink", "self")
    const depth = k.querySelector("svg [data-part=depth]")
    expect(depth).toBeTruthy()
    expect(depth).toHaveAttribute("data-hide-on", "pressed")
  })

  it("follows the text color in tooltips (the drawing is currentColor)", () => {
    const { getByText } = render(<Kbd>Esc</Kbd>)
    const k = getByText("Esc")
    expect(k).toHaveClass("[[data-slot=tooltip-content]_&]:text-inherit")
    expect(k.querySelector("svg")?.innerHTML).toContain('fill="currentColor"')
    expect(k.querySelector("svg")?.innerHTML).not.toMatch(/var\(--ll-ink\)/)
  })

  it("takes an icon as its label", () => {
    const { getByRole } = render(
      <Kbd>
        <Icon name="chevron-up" label="Up" />
      </Kbd>
    )
    const k = getByRole("img", { name: "Up" }).parentElement as HTMLElement
    expect(k.tagName).toBe("KBD")
    expect(k.querySelectorAll(":scope > svg")).toHaveLength(2)
  })

  it("forwards ref, className, id and data attributes", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByText } = render(
      <Kbd ref={ref} id="k1" className="ms-2" data-pressed="" data-testid="kk">
        x
      </Kbd>
    )
    expect(ref.current).toBe(getByText("x"))
    expect(ref.current).toHaveAttribute("id", "k1")
    expect(ref.current).toHaveClass("ms-2")
    expect(ref.current).toHaveAttribute("data-pressed")
  })
})

describe("KbdGroup", () => {
  it("groups keys inline, like upstream (a kbd around kbds)", () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    )
    const g = container.querySelector("[data-slot=kbd-group]") as HTMLElement
    expect(g.tagName).toBe("KBD")
    expect(g).toHaveClass("inline-flex", "items-center", "gap-1")
    expect(g.querySelectorAll("[data-slot=kbd]")).toHaveLength(2)
  })

  it("has no axe violations: keys, groups, icon keys, inline in a paragraph", async () => {
    const { container } = render(
      <div>
        <p>
          Press <Kbd>Esc</Kbd> to close
        </p>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <span>+</span>
          <Kbd>K</Kbd>
        </KbdGroup>
        <Kbd>
          <Icon name="arrow-up" label="Arrow up" />
        </Kbd>
      </div>
    )
    await axeCheck(container)
  })
})

describe("Kbd on the server and hydration", () => {
  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    restore()
    const tree = () => (
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="kbd"')
    expect(html).toContain('data-slot="kbd-group"')
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(<Kbd>Tab</Kbd>) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      restore()
      container.innerHTML = renderToString(ui)
      restore = mockBox(40, 24)
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=kbd] > svg[data-ink=keycap]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("kbdRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (w: number, h: number, extra: object = {}) => runRecipe(kbdRecipe, { ...req, box: { w, h }, ...extra })

  it("draws the rest layer only, in currentColor, with the thickness in a hide-on-pressed group", () => {
    const f = run(40, 24)
    expect(f.layers).toEqual(["rest"])
    const m = f.parts.rest ?? ""
    expect(m).toContain("currentColor")
    expect(m).toMatch(/data-part="depth"/)
    expect(m).toMatch(/data-hide-on="pressed"/)
  })

  it("calm density draws the plain box without the thickness", () => {
    const m = run(40, 24, { density: "calm" }).parts.rest ?? ""
    expect(m).not.toMatch(/data-part="depth"/)
    expect(m.length).toBeGreaterThan(50)
  })

  it("draws sane markup at many boxes, densities and tiers within the lo budget", () => {
    for (const [w, h] of [
      [24, 24],
      [32, 24],
      [64, 24],
      [120, 28],
      [20, 20],
    ] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const m = Object.values(run(w, h, { density, tier }).parts).join("")
          expect(m, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    const lo = run(48, 24).parts.rest ?? ""
    expect((lo.match(/<(?:path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(lo.length).toBeLessThanOrEqual(8000)
  })
})
