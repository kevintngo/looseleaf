import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { radioRecipe } from "@/lib/ink/recipes/radio-group-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(16, 16)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

function Demo({ group, disabledMid }: { group?: Partial<React.ComponentProps<typeof RadioGroup>>; disabledMid?: boolean }) {
  return (
    <RadioGroup aria-label="Density" {...group}>
      {["default", "comfortable", "compact"].map((v) => (
        <div key={v} className="flex items-center gap-2">
          <RadioGroupItem value={v} id={v} disabled={disabledMid && v === "comfortable"} />
          <Label htmlFor={v}>{v}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

describe("RadioGroup structure", () => {
  it("is a radiogroup of Radix radio buttons with upstream's slots and a drawing behind each", () => {
    const { getByRole, getAllByRole } = renderUI(<Demo group={{ defaultValue: "comfortable" }} />)
    const g = getByRole("radiogroup", { name: "Density" })
    expect(g).toHaveAttribute("data-slot", "radio-group")
    expect(g).toHaveClass("grid", "gap-3")
    const radios = getAllByRole("radio")
    expect(radios).toHaveLength(3)
    const r = radios[1]
    expect(r.tagName).toBe("BUTTON")
    expect(r).toHaveAttribute("data-slot", "radio-group-item")
    expect(r).toHaveAttribute("aria-checked", "true")
    expect(r).toHaveAttribute("data-state", "checked")
    expect(r).toHaveClass("peer", "relative", "isolate", "size-4", "shrink-0", "after:-inset-2")
    expect(r).toHaveAttribute("data-ink-host")
    expect(r).toHaveAttribute("data-ink-ready")
    expectInkLayers(r, { min: 1, kinds: ["radio"], absolute: true, layers: ["rest", "hover", "checked"] })
    expect(layers(r)).toEqual(["rest", "checked", "hover"])
    expect(r.querySelector("[data-slot=radio-group-indicator]")).toBeTruthy()
  })

  it("horizontal orientation lays the group out in a row", () => {
    const { getByRole } = renderUI(<Demo group={{ orientation: "horizontal" }} />)
    const g = getByRole("radiogroup")
    expect(g).toHaveAttribute("data-orientation", "horizontal")
    expect(g.className).toContain("data-[orientation=horizontal]:flex")
  })

  it("the ref reaches the button; the ink is behind, decorative and never focusable", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = renderUI(
      <RadioGroup aria-label="g">
        <RadioGroupItem ref={ref} value="a" aria-label="A" />
      </RadioGroup>,
    )
    expect(ref.current).toBe(getByRole("radio"))
    const svg = ref.current!.querySelector(":scope > svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.style.zIndex).toBe("-1")
  })

  it("keeps rest when disabled (checked stays state-driven) and draws invalid in red", () => {
    const a = renderUI(<Demo disabledMid />)
    expect(layers(a.getByRole("radio", { name: "comfortable" }))).toEqual(["rest", "checked"])
    a.unmount()
    const b = renderUI(
      <RadioGroup aria-label="g">
        <RadioGroupItem value="a" aria-label="A" aria-invalid />
      </RadioGroup>,
    )
    expect(b.getByRole("radio").querySelector("[data-layer=rest]")!.innerHTML).toContain("var(--ll-red)")
  })
})

describe("RadioGroup state and keyboard", () => {
  it("chooses one at a time by click; label clicks work", async () => {
    const onValueChange = vi.fn()
    const { getByRole, getByText, user } = renderUI(<Demo group={{ onValueChange }} />)
    await user.click(getByRole("radio", { name: "compact" }))
    expect(getByRole("radio", { name: "compact" })).toHaveAttribute("aria-checked", "true")
    await user.click(getByText("default"))
    expect(getByRole("radio", { name: "default" })).toHaveAttribute("aria-checked", "true")
    expect(getByRole("radio", { name: "compact" })).toHaveAttribute("aria-checked", "false")
    expect(onValueChange.mock.calls.map((a) => a[0])).toEqual(["compact", "default"])
  })

  it("Tab enters at the chosen radio; arrows move and choose, skipping disabled ones; Space chooses", async () => {
    const { getAllByRole, user } = renderUI(<Demo group={{ defaultValue: "default" }} disabledMid />)
    const [a, b, c] = getAllByRole("radio")
    await user.tab()
    expect(a).toHaveFocus()
    const press = async (key: string, expectFocus: HTMLElement) => {
      await user.keyboard(`{${key}>}`)
      await waitFor(() => expect(expectFocus).toHaveFocus())
      await user.keyboard(`{/${key}}`)
    }
    await press("ArrowDown", c)
    expect(b).not.toHaveFocus()
    expect(c).toHaveAttribute("aria-checked", "true")
    await press("ArrowDown", a)
    expect(a).toHaveAttribute("aria-checked", "true")
    await press("ArrowUp", c)
  })

  it("is uncontrolled with defaultValue and controlled with value + onValueChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("compact")
      return (
        <>
          <Demo group={{ value: v, onValueChange: setV }} />
          <output>{v}</output>
        </>
      )
    }
    const { getByRole, user, container } = renderUI(<Controlled />)
    expect(getByRole("radio", { name: "compact" })).toHaveAttribute("aria-checked", "true")
    await user.click(getByRole("radio", { name: "default" }))
    expect(container.querySelector("output")).toHaveTextContent("default")
    expect(getByRole("radio", { name: "default" })).toHaveAttribute("aria-checked", "true")
  })

  it("draw-on needs a touch: the classes require data-touched, a click writes it and a group chosen at load never replays", async () => {
    const { getByRole, user } = renderUI(<Demo group={{ defaultValue: "default" }} />)
    const a = getByRole("radio", { name: "default" })
    expect(a.className).toContain("data-touched:data-[state=checked]:[&>svg_[data-part=reveal]]:animate-[ll-draw")
    expect(a).not.toHaveAttribute("data-touched")
    await user.click(getByRole("radio", { name: "compact" }))
    expect(getByRole("radio", { name: "compact" })).toHaveAttribute("data-touched")
  })

  it("arrow keys count as touches (Radix clicks the radio it lands on) and the caller's onClickCapture still runs", async () => {
    const spy = vi.fn()
    const { getAllByRole, user } = renderUI(
      <RadioGroup aria-label="g" defaultValue="a">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" onClickCapture={spy} />
      </RadioGroup>,
    )
    await user.tab()
    await user.keyboard("{ArrowDown>}")
    await waitFor(() => expect(getAllByRole("radio")[1]).toHaveFocus())
    await user.keyboard("{/ArrowDown}")
    expect(getAllByRole("radio")[1]).toHaveAttribute("data-touched")
    expect(spy).toHaveBeenCalled()
  })

  it("a click does not redraw the ring (the state is CSS)", async () => {
    const { getByRole, user } = renderUI(<Demo />)
    const runs = inkCache.stats().runs
    await user.click(getByRole("radio", { name: "compact" }))
    await user.click(getByRole("radio", { name: "default" }))
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { getByRole, user } = renderUI(<Demo />)
    const r = getByRole("radio", { name: "default" })
    expect(layers(r)).not.toContain("focus")
    await user.tab()
    expect(layers(r)).toContain("focus")
  })
})

describe("RadioGroup in forms", () => {
  it("submits the chosen value under `name`, requires a choice, and resets with the form", async () => {
    const seen: Array<string | null> = []
    const { getByRole, user, container } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).get("density") as string | null)
        }}
      >
        <Demo group={{ name: "density", required: true, defaultValue: "default" }} />
        <button type="submit">go</button>
      </form>,
    )
    await user.click(getByRole("radio", { name: "compact" }))
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual(["compact"])
    expect(container.querySelectorAll("input[type=radio][aria-hidden=true]").length).toBeGreaterThan(0)
  })
})

describe("RadioGroup accessibility, RTL, server and hydration", () => {
  it("has no axe violations in any state", async () => {
    const { container } = renderUI(
      <div>
        <Demo group={{ defaultValue: "compact" }} disabledMid />
        <RadioGroup aria-label="bad">
          <RadioGroupItem value="a" aria-label="invalid" aria-invalid />
        </RadioGroup>
        <form>
          <Demo group={{ name: "n" }} />
        </form>
      </div>,
    )
    await axeCheck(container)
  })

  it("works right-to-left: symmetric hit area, an rtl host", () => {
    const { getByRole } = renderUI(
      <div dir="rtl">
        <RadioGroup aria-label="g" dir="rtl">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>
      </div>,
    )
    const r = getByRole("radio")
    expect(r).toHaveAttribute("data-ink-ready")
    expect(r.className).not.toMatch(/(?:^|\s)(?:pl|pr|ml|mr|left|right)-/)
  })

  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    const tree = () => <Demo group={{ defaultValue: "default" }} />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="radio-group-item"')
    expect(html).toContain('data-state="checked"')
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare, in a form, inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <form>{n}</form>, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(<Demo group={{ defaultValue: "default", name: "d" }} />) as React.ReactElement
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
      expect(container.querySelector("[data-slot=radio-group-item] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("radioRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, px = 16, extra: object = {}) => runRecipe(radioRecipe, { ...req, params, box: { w: px, h: px }, density: "comfortable", ...extra })

  it("declares rest, checked and hover eagerly, focus lazily; disabled keeps rest", () => {
    expect(run({}).layers).toEqual(["rest", "checked", "hover"])
    expect(run({}, 16, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "hover", "focus"])
    expect(run({ disabled: true }).layers).toEqual(["rest", "checked"])
  })

  it("draws sane markup at every size, density and tier", () => {
    for (const px of [14, 16, 18, 20, 24, 28, 36]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { invalid: true }, { disabled: true }]) {
            const f = run(params, px, { density, tier, lazy: ["focus"] })
            expect(Object.values(f.parts).join(""), `${px}/${density}/${tier}/${JSON.stringify(params)}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("lo tier budget: the rest state is at most 12 nodes and 8 KB; the dot adds a blot, a spiral and its reveal mask (14 nodes, 4 KB)", () => {
    for (const px of [16, 20, 28]) {
      const f = run({}, px)
      expect(nodes(f.parts.rest ?? ""), `${px}/rest`).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length, `${px}/rest`).toBeLessThanOrEqual(8000)
      expect(nodes(f.parts.checked ?? ""), `${px}/checked`).toBeLessThanOrEqual(14)
      expect((f.parts.checked ?? "").length, `${px}/checked`).toBeLessThanOrEqual(4000)
    }
  })

  it("the dot is a data-part=fill group with a misregistration vector, and the spiral is written on through a reveal mask", () => {
    const c = run({}).parts.checked ?? ""
    expect(c).toMatch(/data-part="fill" style="--mx:-?[\d.]+;--my:-?[\d.]+"/)
    expect(c).toContain('data-part="reveal"')
    expect(c).toContain('pathLength="1"')
  })

  it("lazy layers are the same bytes whenever asked for and never change the eager ones", () => {
    const eager = run({})
    const a = run({}, 16, { lazy: ["focus"] })
    const b = run({}, 16, { lazy: ["focus"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(a.parts.checked).toBe(eager.parts.checked)
  })
})
