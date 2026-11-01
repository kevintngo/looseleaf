import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Rating, RatingItem } from "@/components/ui/rating"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { ratingRecipe } from "@/lib/ink/recipes/rating-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(24, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const states = (root: ParentNode) => Array.from(root.querySelectorAll("[data-slot=rating-item]")).map((i) => i.getAttribute("data-state"))
const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
const move = (el: Element, pointerType = "mouse") => fireEvent.pointerEnter(el, { pointerType })

describe("Rating structure", () => {
  it("is a radiogroup of max drawn glyphs, each with a radio button named 'n of max'", () => {
    const { getByRole, getAllByRole, container } = renderUI(<Rating defaultValue={3} aria-label="Rate it" />)
    const g = getByRole("radiogroup", { name: "Rate it" })
    expect(g).toHaveAttribute("data-slot", "rating")
    const radios = getAllByRole("radio")
    expect(radios.map((r) => r.getAttribute("aria-label"))).toEqual(["1 of 5", "2 of 5", "3 of 5", "4 of 5", "5 of 5"])
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "false", "true", "false", "false"])
    expect(states(container)).toEqual(["checked", "checked", "checked", "unchecked", "unchecked"])
    const item = container.querySelector("[data-slot=rating-item]") as HTMLElement
    expect(item).toHaveAttribute("data-ink-host")
    expect(item).toHaveAttribute("data-ink-ready")
    expect(item).toHaveAttribute("data-ink-focus", "within")
    expectInkLayers(item, { min: 1, kinds: ["rating"], absolute: true, layers: ["rest", "checked", "indeterminate"] })
    expect(layers(item)).toEqual(["rest", "checked", "indeterminate"])
    expect(radios[0].parentElement).toBe(item)
  })

  it("hit areas reach 2 px past the glyph on every outer side, so whole steps are 24 px targets at size sm (WCAG 2.5.8) and a row of them tiles without a gap; halves split the glyph", () => {
    const whole = renderUI(<Rating size="sm" aria-label="w" />)
    for (const r of whole.getAllByRole("radio")) expect(r).toHaveClass("absolute", "-inset-y-0.5", "-inset-x-0.5")
    expect(whole.container.querySelector("[data-slot=rating-item]")).toHaveClass("size-5")
    const halves = renderUI(<Rating allowHalf aria-label="h" />)
    const [left, right] = Array.from(halves.container.querySelectorAll("[data-slot=rating-item]")[0].querySelectorAll("[role=radio]"))
    expect(left).toHaveClass("-start-0.5", "w-[calc(50%+2px)]", "-inset-y-0.5")
    expect(right).toHaveClass("-end-0.5", "w-[calc(50%+2px)]", "-inset-y-0.5")
  })

  it("max, icon and size change the row; getLabel names the radios", () => {
    const { getAllByRole, container } = renderUI(<Rating max={3} icon="heart" size="lg" getLabel={(v) => `${v} hearts`} aria-label="r" />)
    expect(getAllByRole("radio").map((r) => r.getAttribute("aria-label"))).toEqual(["1 hearts", "2 hearts", "3 hearts"])
    expect(container.querySelector("[data-slot=rating-item]")).toHaveClass("size-8")
    expect(container.querySelector("[data-slot=rating-item] svg")!.innerHTML).toContain("var(--ll-tomato)")
  })

  it("allowHalf puts two radios in each glyph, one over each half, the first at the start", () => {
    const { getAllByRole, container } = renderUI(<Rating allowHalf defaultValue={2.5} aria-label="r" />)
    const radios = getAllByRole("radio")
    expect(radios).toHaveLength(10)
    expect(radios.slice(0, 4).map((r) => r.getAttribute("aria-label"))).toEqual(["0.5 of 5", "1 of 5", "1.5 of 5", "2 of 5"])
    expect(radios[0]).toHaveClass("-start-0.5", "w-[calc(50%+2px)]")
    expect(radios[1]).toHaveClass("-end-0.5", "w-[calc(50%+2px)]")
    expect(radios[4].getAttribute("aria-label")).toBe("2.5 of 5")
    expect(radios[4]).toHaveAttribute("aria-checked", "true")
    expect(states(container)).toEqual(["checked", "checked", "indeterminate", "unchecked", "unchecked"])
  })

  it("the ref reaches the group, and RatingItem outside a Rating throws", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByRole } = renderUI(<Rating ref={ref} aria-label="r" />)
    expect(ref.current).toBe(getByRole("radiogroup"))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderUI(<RatingItem index={1} />)).toThrow(/within <Rating>/)
    spy.mockRestore()
  })

  it("children replace the default row (compose RatingItem yourself)", () => {
    const { container } = renderUI(
      <Rating max={3} aria-label="r" defaultValue={2}>
        <RatingItem index={1} />
        <span>|</span>
        <RatingItem index={2} />
        <RatingItem index={3} />
      </Rating>,
    )
    expect(container.querySelectorAll("[data-slot=rating-item]")).toHaveLength(3)
    expect(container.querySelector("span:not([data-slot])")).toHaveTextContent("|")
  })
})

describe("Rating state, pointer and keyboard", () => {
  it("clicking a glyph chooses it, uncontrolled and controlled; the same value again does nothing (or clears with `clearable`)", async () => {
    const onValueChange = vi.fn()
    const { getAllByRole, user, container } = renderUI(<Rating aria-label="r" onValueChange={onValueChange} />)
    await user.click(getAllByRole("radio")[3])
    expect(states(container)).toEqual(["checked", "checked", "checked", "checked", "unchecked"])
    await user.click(getAllByRole("radio")[3])
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([4])

    function Controlled() {
      const [v, setV] = React.useState(2)
      return (
        <>
          <Rating value={v} onValueChange={setV} clearable aria-label="c" />
          <output>{v}</output>
        </>
      )
    }
    const c = renderUI(<Controlled />)
    const five = () => within(c.container).getByRole("radio", { name: "5 of 5" })
    await c.user.click(five())
    expect(c.container.querySelector("output")).toHaveTextContent("5")
    await c.user.click(five())
    expect(c.container.querySelector("output")).toHaveTextContent("0")
  })

  it("hovering previews the value and leaving restores it; touch does not preview", () => {
    const { getAllByRole, getByRole, container } = renderUI(<Rating defaultValue={2} aria-label="r" />)
    move(getAllByRole("radio")[3])
    expect(states(container)).toEqual(["checked", "checked", "checked", "checked", "unchecked"])
    fireEvent.pointerLeave(getByRole("radiogroup"))
    expect(states(container)).toEqual(["checked", "checked", "unchecked", "unchecked", "unchecked"])
    move(getAllByRole("radio")[4], "touch")
    expect(states(container)).toEqual(["checked", "checked", "unchecked", "unchecked", "unchecked"])
  })

  it("a half preview fills half of the glyph", () => {
    const { getAllByRole, container } = renderUI(<Rating allowHalf aria-label="r" />)
    move(getAllByRole("radio")[4])
    expect(states(container)).toEqual(["checked", "checked", "indeterminate", "unchecked", "unchecked"])
    move(getAllByRole("radio")[5])
    expect(states(container).slice(0, 3)).toEqual(["checked", "checked", "checked"])
    move(getAllByRole("radio")[2])
    expect(states(container).slice(0, 3)).toEqual(["checked", "indeterminate", "unchecked"])
  })

  it("Tab lands on the chosen glyph (the first when none) and skips the rest; arrows choose and move focus; Home and End go to the ends", async () => {
    const onValueChange = vi.fn()
    const { getAllByRole, user } = renderUI(<Rating defaultValue={3} onValueChange={onValueChange} aria-label="r" />)
    const radios = getAllByRole("radio")
    expect(radios.map((r) => r.getAttribute("tabindex"))).toEqual(["-1", "-1", "0", "-1", "-1"])
    await user.tab()
    expect(radios[2]).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(radios[3]).toHaveFocus()
    expect(radios[3]).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowUp}{ArrowUp}")
    expect(radios[4]).toHaveFocus()
    await user.keyboard("{ArrowLeft}{ArrowDown}")
    expect(radios[2]).toHaveFocus()
    await user.keyboard("{Home}")
    expect(radios[0]).toHaveFocus()
    expect(radios[0]).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{End}")
    expect(radios[4]).toHaveAttribute("aria-checked", "true")
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([4, 5, 4, 3, 1, 5])
  })

  it("with no value the first glyph is the tab stop", () => {
    const none = renderUI(<Rating aria-label="n" />)
    expect(none.getAllByRole("radio").map((r) => r.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"])
  })

  it("arrows step by a half with allowHalf", async () => {
    const { getAllByRole, user } = renderUI(<Rating allowHalf defaultValue={2} aria-label="r" />)
    await user.tab()
    await user.keyboard("{ArrowRight}")
    expect(getAllByRole("radio", { name: "2.5 of 5" })[0]).toHaveFocus()
  })

  it("swaps the left and right arrows in a right-to-left row", async () => {
    const rtl = renderUI(<Rating defaultValue={2} aria-label="rtl" dir="rtl" style={{ direction: "rtl" }} />)
    await rtl.user.tab()
    await rtl.user.keyboard("{ArrowLeft}")
    expect(rtl.getByRole("radio", { name: "3 of 5" })).toHaveAttribute("aria-checked", "true")
  })

  it("choosing never redraws a glyph (the state is an attribute)", async () => {
    const { getAllByRole, user } = renderUI(<Rating aria-label="r" />)
    const runs = inkCache.stats().runs
    await user.click(getAllByRole("radio")[2])
    move(getAllByRole("radio")[4])
    await user.click(getAllByRole("radio")[0])
    expect(inkCache.stats().runs).toBe(runs)
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { container, user } = renderUI(<Rating defaultValue={2} aria-label="r" />)
    const item = container.querySelector("[data-slot=rating-item]") as HTMLElement
    expect(layers(item)).not.toContain("focus")
    await user.tab()
    expect(layers(container.querySelectorAll("[data-slot=rating-item]")[1])).toContain("focus")
  })
})

describe("Rating read-only, disabled and forms", () => {
  it("readOnly is an image with a text alternative and no buttons", () => {
    const { getByRole, queryAllByRole, container } = renderUI(<Rating readOnly value={4.5} allowHalf />)
    const img = getByRole("img", { name: "Rated 4.5 out of 5" })
    expect(img).toHaveAttribute("data-readonly")
    expect(queryAllByRole("radio")).toHaveLength(0)
    expect(container.querySelector("button")).toBeNull()
    expect(states(container)).toEqual(["checked", "checked", "checked", "checked", "indeterminate"])
    expect(container.querySelector("[data-slot=rating-item]")).not.toHaveClass("hover:scale-110")
  })

  it("readOnly takes your own alternative", () => {
    const { getByRole } = renderUI(<Rating readOnly value={3} aria-label="Average rating: 3 stars" />)
    expect(getByRole("img", { name: "Average rating: 3 stars" })).toBeTruthy()
  })

  it("disabled disables the radios and ignores clicks, keys and hover", async () => {
    const onValueChange = vi.fn()
    const { getAllByRole, getByRole, user, container } = renderUI(<Rating disabled defaultValue={2} onValueChange={onValueChange} aria-label="d" />)
    expect(getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true")
    expect(getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true)
    await user.click(getAllByRole("radio")[4])
    move(getAllByRole("radio")[4])
    expect(onValueChange).not.toHaveBeenCalled()
    expect(states(container)).toEqual(["checked", "checked", "unchecked", "unchecked", "unchecked"])
  })

  it("name adds a hidden input, so the value is in FormData; required is aria-required and blocks the submit while the value is 0", async () => {
    const seen: Array<string | null> = []
    const { getAllByRole, getByRole, user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).get("stars") as string | null)
        }}
      >
        <Rating name="stars" required allowHalf aria-label="r" />
        <button type="submit">go</button>
      </form>,
    )
    expect(getByRole("radiogroup")).toHaveAttribute("aria-required", "true")
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual([])
    await user.click(getAllByRole("radio", { name: "3.5 of 5" })[0])
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual(["3.5"])
  })

  it("a value that is not on a step is snapped and clamped", () => {
    const a = renderUI(<Rating value={3.3} aria-label="r" />)
    expect(states(a.container)).toEqual(["checked", "checked", "checked", "unchecked", "unchecked"])
    a.unmount()
    const b = renderUI(<Rating value={9} aria-label="r" />)
    expect(states(b.container)).toEqual(["checked", "checked", "checked", "checked", "checked"])
  })
})

describe("Rating accessibility, server and hydration", () => {
  it("has no axe violations (interactive, half, read-only, disabled)", async () => {
    const { container } = renderUI(
      <div>
        <Rating defaultValue={2} aria-label="a" />
        <Rating allowHalf defaultValue={2.5} aria-label="b" icon="heart" />
        <Rating readOnly value={3} />
        <Rating disabled defaultValue={1} aria-label="d" />
        <form>
          <Rating name="n" aria-label="e" />
        </form>
      </div>,
    )
    await axeCheck(container)
  })

  it("has forced-colors text stars as its fallback", () => {
    const { container } = renderUI(<Rating aria-label="r" />)
    expect(container.querySelector("[data-slot=rating-item]")!.className).toContain("forced-colors:data-[state=checked]:before:content-['★']")
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Rating defaultValue={3.5} allowHalf name="r" aria-label="r" />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="rating"')
    expect(html).toContain('data-state="indeterminate"')
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree()) as React.ReactElement
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
      expect(container.querySelector("[data-slot=rating-item] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("ratingRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, px = 24, extra: object = {}) => runRecipe(ratingRecipe, { ...req, params, box: { w: px, h: px }, density: "comfortable", ...extra })

  it("declares rest, checked and indeterminate eagerly and focus lazily; disabled draws no ring", () => {
    expect(run({}).layers).toEqual(["rest", "checked", "indeterminate"])
    expect(run({}, 24, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "indeterminate", "focus"])
    expect(run({ disabled: true }, 24, { lazy: ["focus"] }).layers).toEqual(["rest", "checked", "indeterminate"])
  })

  it("lo tier budget: each layer is at most 12 nodes and 8 KB for every glyph and size", () => {
    for (const icon of ["star", "heart", "sun"]) {
      for (const px of [16, 18, 24, 32, 40]) {
        const f = run({ icon }, px)
        for (const k of ["rest", "checked", "indeterminate"] as const) {
          expect(nodes(f.parts[k] ?? ""), `${icon}${px}/${k}`).toBeLessThanOrEqual(12)
          expect((f.parts[k] ?? "").length, `${icon}${px}/${k}`).toBeLessThanOrEqual(8000)
        }
      }
    }
  })

  it("draws sane markup for every glyph, size, density, tier and direction", () => {
    for (const icon of ["star", "heart", "sun"]) {
      for (const px of [14, 24, 48]) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          for (const tier of ["lo", "hi"] as const) {
            for (const dir of ["ltr", "rtl"] as const) {
              const f = run({ icon, disabled: px === 14 }, px, { density, tier, dir, lazy: ["focus"] })
              expect(Object.values(f.parts).join(""), `${icon}${px}/${density}/${tier}/${dir}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            }
          }
        }
      }
    }
  })

  it("the half fills the start side: it mirrors for rtl", () => {
    expect(run({}, 24, { dir: "rtl" }).parts.indeterminate).not.toBe(run({}).parts.indeterminate)
  })

  it("the fills are data-part=fill groups the CSS can nudge", () => {
    expect(run({}).parts.checked).toContain('data-part="fill"')
  })
})
