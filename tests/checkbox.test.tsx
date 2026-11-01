import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { checkboxRecipe } from "@/lib/ink/recipes/checkbox-ink"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

const proto = HTMLElement.prototype
const descW = Object.getOwnPropertyDescriptor(proto, "offsetWidth")
const descH = Object.getOwnPropertyDescriptor(proto, "offsetHeight")
function mockBox(w: number, h: number) {
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => w })
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => h })
}
afterEach(() => {
  if (descW) Object.defineProperty(proto, "offsetWidth", descW)
  if (descH) Object.defineProperty(proto, "offsetHeight", descH)
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Checkbox structure", () => {
  it("is a Radix checkbox button with upstream's slots and a drawing behind it", () => {
    mockBox(16, 16)
    const { getByRole } = render(<Checkbox aria-label="Agree" />)
    const c = getByRole("checkbox", { name: "Agree" })
    expect(c.tagName).toBe("BUTTON")
    expect(c).toHaveAttribute("data-slot", "checkbox")
    expect(c).toHaveAttribute("data-state", "unchecked")
    expect(c).toHaveAttribute("aria-checked", "false")
    expect(c).toHaveClass("peer", "relative", "isolate", "size-4", "shrink-0")
    expect(c).toHaveAttribute("data-ink-host")
    expect(c).toHaveAttribute("data-ink-ready")
    expectInkLayers(c, { min: 1, kinds: ["checkbox"], absolute: true, layers: ["rest", "hover", "checked", "indeterminate"] })
    expect(layers(c)).toEqual(["rest", "checked", "indeterminate", "hover"])
    expect((c.querySelector(":scope > svg") as SVGElement).parentElement).toBe(c)
  })

  it("has a big hit area that does not move the layout (an ::after inset, not padding)", () => {
    const { getByRole } = render(<Checkbox aria-label="x" />)
    expect(getByRole("checkbox")).toHaveClass("after:absolute", "after:-inset-1.5")
  })

  it("keeps the indicator slot, and the ref reaches the button", () => {
    mockBox(16, 16)
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = render(<Checkbox ref={ref} defaultChecked aria-label="x" />)
    expect(ref.current).toBe(getByRole("checkbox"))
    expect(ref.current?.querySelector("[data-slot=checkbox-indicator]")).toHaveAttribute("data-state", "checked")
  })

  it("the ink is behind the box, decorative and never focusable", () => {
    mockBox(20, 20)
    const { getByRole } = render(<Checkbox aria-label="x" className="size-5" />)
    const svg = getByRole("checkbox").querySelector("svg") as SVGElement
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg.style.zIndex).toBe("-1")
  })
})

describe("Checkbox state", () => {
  it("toggles by click and by Space; Enter does not toggle (it belongs to the form)", async () => {
    const onCheckedChange = vi.fn()
    const { getByRole, user } = renderUI(<Checkbox aria-label="x" onCheckedChange={onCheckedChange} />)
    const c = getByRole("checkbox")
    await user.tab()
    expect(c).toHaveFocus()
    await user.keyboard(" ")
    expect(c).toHaveAttribute("data-state", "checked")
    expect(c).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{Enter}")
    expect(c).toHaveAttribute("data-state", "checked")
    await user.click(c)
    expect(c).toHaveAttribute("data-state", "unchecked")
    await user.click(c)
    expect(c).toHaveAttribute("data-state", "checked")
    expect(onCheckedChange.mock.calls.map((a) => a[0])).toEqual([true, false, true])
  })

  it("is uncontrolled with defaultChecked and controlled with checked + onCheckedChange", async () => {
    const { getByRole, user, rerender } = renderUI(<Checkbox aria-label="u" defaultChecked />)
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "checked")
    await user.click(getByRole("checkbox"))
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "unchecked")

    function Controlled() {
      const [v, setV] = React.useState<boolean | "indeterminate">("indeterminate")
      return (
        <>
          <Checkbox aria-label="c" checked={v} onCheckedChange={setV} />
          <output>{String(v)}</output>
        </>
      )
    }
    rerender(<Controlled />)
    const c = getByRole("checkbox")
    expect(c).toHaveAttribute("data-state", "indeterminate")
    expect(c).toHaveAttribute("aria-checked", "mixed")
    await user.click(c)
    expect(c).toHaveAttribute("data-state", "checked")
    expect(document.querySelector("output")).toHaveTextContent("true")
  })

  it("a controlled checkbox that ignores the change stays put", async () => {
    const { getByRole, user } = renderUI(<Checkbox aria-label="fixed" checked={false} onCheckedChange={() => {}} />)
    await user.click(getByRole("checkbox"))
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "unchecked")
  })

  it("the drawing does not re-render when the state changes (CSS follows data-state)", async () => {
    mockBox(16, 16)
    const { getByRole, user } = renderUI(<Checkbox aria-label="x" seed="s" />)
    const c = getByRole("checkbox")
    const before = c.querySelector("svg")?.innerHTML
    await user.click(c)
    expect(c.querySelector("svg")?.innerHTML).toBe(before)
  })
})

describe("Checkbox drawing", () => {
  it("the checked and indeterminate layers are revealed by a mask stroke the CSS can draw on (ll-draw)", () => {
    mockBox(20, 20)
    const { getByRole } = render(<Checkbox aria-label="x" className="size-5" />)
    const c = getByRole("checkbox")
    for (const layer of ["checked", "indeterminate"]) {
      const g = c.querySelector(`[data-layer=${layer}]`) as SVGGElement
      const path = g.querySelector("mask [data-part=reveal]") as SVGPathElement
      expect(path, layer).toBeTruthy()
      expect(path).toHaveAttribute("pathLength", "1")
      const id = g.querySelector("mask")?.id as string
      expect(g.querySelector(`g[mask="url(#${id})"]`), layer).toBeTruthy()
    }
    const cls = c.className
    expect(cls).toContain("data-[state=checked]:[&>svg_[data-part=reveal]]:animate-[ll-draw_var(--ll-dur-sheet)_var(--ll-ease-out)_both]")
    expect(cls).toContain("data-[state=indeterminate]:[&>svg_[data-part=reveal]]:animate-[ll-draw_var(--ll-dur-sheet)_var(--ll-ease-out)_both]")
    expect(cls).toContain("[&>svg_[data-part=reveal]]:[stroke-dasharray:1]")
  })

  it("mask ids are unique per checkbox (a document with many boxes has no duplicate ids)", () => {
    mockBox(16, 16)
    const { container } = render(
      <div>
        <Checkbox aria-label="a" />
        <Checkbox aria-label="b" />
        <Checkbox aria-label="c" />
      </div>,
    )
    const ids = Array.from(container.querySelectorAll("[id]")).map((n) => n.id)
    expect(ids.length).toBeGreaterThanOrEqual(9)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("aria-invalid draws the box in red pencil; disabled draws dashes and no hover", () => {
    mockBox(16, 16)
    const { getByLabelText } = render(
      <div>
        <Checkbox aria-label="ok" seed="s" />
        <Checkbox aria-label="bad" seed="s" aria-invalid />
        <Checkbox aria-label="off" seed="s" disabled />
      </div>,
    )
    const rest = (l: string) => getByLabelText(l).querySelector("[data-layer=rest]")?.innerHTML ?? ""
    expect(rest("bad")).toMatch(/var\(--ll-red\)/)
    expect(rest("ok")).not.toMatch(/var\(--ll-red\)/)
    expect(layers(getByLabelText("off"))).not.toContain("hover")
    expect(layers(getByLabelText("off"))).toContain("checked")
    expect(getByLabelText("off")).toBeDisabled()
    expect(getByLabelText("off")).toHaveClass("disabled:cursor-not-allowed")
  })

  it("draws the focus ring lazily on keyboard focus", async () => {
    mockBox(16, 16)
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(<Checkbox aria-label="x" />)
    expect(layers(getByRole("checkbox"))).not.toContain("focus")
    await user.tab()
    expect(layers(getByRole("checkbox"))).toContain("focus")
    spy.mockRestore()
  })

  it("lights its hover layer from a Field row (group/field) or an adjacent label", () => {
    const { getByRole } = render(<Checkbox aria-label="x" />)
    const cls = getByRole("checkbox").className
    expect(cls).toContain("group-hover/field:[&>svg_[data-layer=hover]]:visible")
    expect(cls).toContain("has-[+[data-slot=label]:hover]:[&>svg_[data-layer=hover]]:opacity-100")
    expect(cls).toContain("has-[+input+[data-slot=label]:hover]:[&>svg_[data-layer=hover]]:visible")
  })
})

describe("Checkbox in forms and with Label", () => {
  it("submits through Radix's hidden input: checked -> name=on (or value), unchecked and disabled -> nothing", async () => {
    const seen: Array<Record<string, FormDataEntryValue>> = []
    const { getByRole, user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(Object.fromEntries(new FormData(e.currentTarget)))
        }}
      >
        <Checkbox name="terms" aria-label="terms" />
        <Checkbox name="news" value="weekly" defaultChecked aria-label="news" />
        <Checkbox name="off" defaultChecked disabled aria-label="off" />
        <button>Go</button>
      </form>,
    )
    await user.click(getByRole("checkbox", { name: "terms" }))
    await user.click(getByRole("button", { name: "Go" }))
    expect(seen).toEqual([{ terms: "on", news: "weekly" }])
    await user.click(getByRole("checkbox", { name: "terms" }))
    await user.click(getByRole("button", { name: "Go" }))
    expect(seen[1]).toEqual({ news: "weekly" })
  })

  it("form reset restores defaultChecked", async () => {
    const { getByRole, user } = renderUI(
      <form>
        <Checkbox name="a" aria-label="a" />
        <button type="reset">Reset</button>
      </form>,
    )
    await user.click(getByRole("checkbox"))
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "checked")
    await user.click(getByRole("button", { name: "Reset" }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "unchecked")
  })

  it("a Label toggles it (htmlFor and wrapping), and dims when the box is disabled (peer-disabled)", async () => {
    const { getByRole, getByText, user } = renderUI(
      <div>
        <div className="group/field flex gap-2">
          <Checkbox id="t1" />
          <Label htmlFor="t1">Accept</Label>
        </div>
        <div className="flex gap-2">
          <Checkbox id="t2" disabled />
          <Label htmlFor="t2">Locked</Label>
        </div>
      </div>,
    )
    await user.click(getByText("Accept"))
    expect(getByRole("checkbox", { name: "Accept" })).toHaveAttribute("data-state", "checked")
    expect(getByRole("checkbox", { name: "Locked" })).toBeDisabled()
    expect(getByText("Locked")).toHaveClass("peer-disabled:text-pencil-text", "peer-disabled:cursor-not-allowed")
  })

  it("required is exposed to assistive tech", () => {
    const { getByRole } = render(<Checkbox aria-label="x" required />)
    expect(getByRole("checkbox")).toBeRequired()
  })
})

describe("Checkbox accessibility, RTL and sizes", () => {
  it("has no axe violations in any state", async () => {
    mockBox(16, 16)
    const { container } = render(
      <div>
        <Checkbox aria-label="a" />
        <Checkbox aria-label="b" defaultChecked />
        <Checkbox aria-label="c" checked="indeterminate" onCheckedChange={() => {}} />
        <Checkbox aria-label="d" disabled />
        <Checkbox aria-label="e" aria-invalid />
        <form>
          <Checkbox aria-label="f" name="f" />
        </form>
      </div>,
    )
    await axeCheck(container)
  })

  it("works right-to-left: the drawing is made for an rtl host and the box, hit area and ring are symmetric", () => {
    mockBox(16, 16)
    const { getByRole } = render(
      <div dir="rtl" className="flex gap-2">
        <Checkbox id="r" defaultChecked />
        <Label htmlFor="r">موافق</Label>
      </div>,
    )
    const c = getByRole("checkbox")
    expect(c).toHaveAttribute("data-ink-ready")
    expect(c.className).not.toMatch(/(?:^|\s)(?:pl|pr|ml|mr|left|right)-/)
    expect(c.className).toContain("after:-inset-1.5")
  })

  it.each([16, 20, 28])("draws at %ipx", (px) => {
    mockBox(px, px)
    const { getByRole } = render(<Checkbox aria-label="x" style={{ width: px, height: px }} />)
    const svg = getByRole("checkbox").querySelector("svg") as SVGElement
    expect(svg.getAttribute("viewBox")).toBe(`-12 -12 ${px + 24} ${px + 24}`)
  })
})

describe("Checkbox on the server and hydration", () => {
  it("renders the host marker and no drawing before it is measured, deterministically", () => {
    const tree = () => <Checkbox aria-label="x" defaultChecked />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="checkbox"')
    expect(html).toContain('data-state="checked"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare, in a form, inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <form>{n}</form>, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      mockBox(16, 16)
      const ui = wrap(<Checkbox aria-label="h" name="h" defaultChecked />) as React.ReactElement
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
      expect(container.querySelector("[data-slot=checkbox] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("checkboxRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, px = 16, extra: object = {}) => runRecipe(checkboxRecipe, { ...req, params, box: { w: px, h: px }, ...extra })

  it("declares its layers: rest, checked, indeterminate, hover eagerly, focus lazily", () => {
    expect(run({}).layers).toEqual(["rest", "checked", "indeterminate", "hover"])
    expect(run({}, 16, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "indeterminate", "hover", "focus"])
    expect(run({ disabled: true }).layers).toEqual(["rest", "checked", "indeterminate"])
  })

  it("draws sane markup at every size, density and tier (no NaN, only var(--ll-*) colors)", () => {
    for (const px of [14, 16, 18, 20, 24, 28, 36]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { invalid: true }, { disabled: true }]) {
            const f = run(params, px, { density, tier, lazy: ["focus"] })
            const all = Object.values(f.parts).join("")
            expect(all, `${px}/${density}/${tier}/${JSON.stringify(params)}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("lo tier budget: the rest state is at most 12 nodes and 8 KB; the on-layers add a fill, a felt tick and its reveal mask (14 nodes, 4 KB)", () => {
    for (const px of [16, 20, 28]) {
      const f = run({}, px)
      expect(nodes(f.parts.rest ?? ""), `${px}/rest`).toBeLessThanOrEqual(12)
      expect((f.parts.rest ?? "").length, `${px}/rest`).toBeLessThanOrEqual(8000)
      for (const layer of ["checked", "indeterminate"] as const) {
        const m = f.parts[layer] ?? ""
        expect(nodes(m), `${px}/${layer}`).toBeLessThanOrEqual(14)
        expect(m.length, `${px}/${layer}`).toBeLessThanOrEqual(4000)
      }
    }
  })

  it("the checked fill is a data-part=fill group with a misregistration vector (the CSS nudges it)", () => {
    expect(run({}).parts.checked).toMatch(/data-part="fill" style="--mx:-?[\d.]+;--my:-?[\d.]+"/)
  })

  it("lazy layers are the same bytes whenever asked for and never change the eager ones", () => {
    const eager = run({})
    const a = run({}, 16, { lazy: ["focus"] })
    const b = run({}, 16, { lazy: ["focus"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(a.parts.checked).toBe(eager.parts.checked)
  })
})

describe("foundation polish (audit 4.3, 4.4, 4.5, 4.12)", () => {
  const req = { seed: "polish", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (params: Record<string, unknown>, density: "comfortable" | "calm" = "comfortable", px = 16) =>
    runRecipe(checkboxRecipe, { ...req, box: { w: px, h: px }, params, density })

  it("draw-on needs a touch: the classes require data-touched, and a click writes it without re-rendering", async () => {
    mockBox(16, 16)
    const { getByRole, user } = renderUI(<Checkbox aria-label="Agree" defaultChecked />)
    const c = getByRole("checkbox", { name: "Agree" })
    expect(c.className).toContain("data-touched:data-[state=checked]:[&>svg_[data-part=reveal]]:animate-[ll-draw")
    expect(c.className).toContain("data-touched:data-[state=indeterminate]:[&>svg_[data-part=reveal]]:animate-[ll-draw")
    expect(c).toHaveAttribute("data-state", "checked")
    expect(c).not.toHaveAttribute("data-touched")
    await user.click(c)
    expect(c).toHaveAttribute("data-touched")
    expect(c).toHaveAttribute("data-state", "unchecked")
  })

  it("Space and a label click count as touches too, and the caller's onClickCapture still runs", async () => {
    mockBox(16, 16)
    const spy = vi.fn()
    const { getByRole, getByText, user } = renderUI(
      <div>
        <Checkbox id="t1" aria-label="A" onClickCapture={spy} />
        <Label htmlFor="t1">Label A</Label>
        <Checkbox aria-label="B" />
      </div>,
    )
    const a = getByRole("checkbox", { name: "A" })
    await user.click(getByText("Label A"))
    expect(a).toHaveAttribute("data-touched")
    expect(spy).toHaveBeenCalled()
    const b = getByRole("checkbox", { name: "B" })
    b.focus()
    expect(b).not.toHaveAttribute("data-touched")
    await user.keyboard(" ")
    expect(b).toHaveAttribute("data-touched")
    expect(b).toHaveAttribute("data-state", "checked")
  })

  it("a disabled box is findable at 16 px: graphite wash and the darker pencil for the dashes", () => {
    const off = run({ disabled: true }).parts.rest!
    const enabled = run({}).parts.rest!
    expect(off).toContain("var(--ll-pencil-mark)")
    expect(off).toContain("var(--ll-pencil)")
    expect(off).not.toContain("var(--ll-paper-shade)")
    expect(enabled).not.toContain("var(--ll-pencil)")
  })

  it("a ticked or dashed invalid box keeps its red: the outline is drawn again above the marker body", () => {
    for (const layer of ["checked", "indeterminate"] as const) {
      expect(run({ invalid: true }).parts[layer], layer).toContain("var(--ll-red)")
      expect(run({}).parts[layer], layer).not.toContain("var(--ll-red)")
    }
    for (const px of [16, 20, 28]) expect(run({ invalid: true }, "comfortable", px).parts.checked).toContain("var(--ll-red)")
  })

  it("calm is hairline: no ink felt in the rest layer, a lighter drawing, and a hover that is a second outline", () => {
    const calm = run({}, "calm", 20)
    const comfy = run({}, "comfortable", 20)
    expect(calm.parts.rest!.length).toBeLessThan(comfy.parts.rest!.length)
    expect(calm.parts.rest).not.toBe(comfy.parts.rest)
    expect((calm.parts.hover ?? "").length).toBeGreaterThan(100)
  })
})
