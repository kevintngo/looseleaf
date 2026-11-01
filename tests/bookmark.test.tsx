import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Bookmark, BookmarkRibbon } from "@/components/ui/bookmark"
import { NOTCH, bookmarkRecipe, ribbonPoly, type BookmarkParams } from "@/lib/ink/recipes/bookmark-ink"
import { InkProvider } from "@/lib/ink/react"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(32, 48)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

describe("Bookmark", () => {
  it("is a toggle button named by its content, a ribbon on its host", () => {
    const { getByRole, container } = render(<Bookmark>Save for later</Bookmark>)
    const b = getByRole("button", { name: "Save for later" })
    expect(b).toHaveAttribute("data-slot", "bookmark")
    expect(b).toHaveAttribute("aria-pressed", "false")
    expect(b).toHaveAttribute("data-state", "off")
    expect(b).toHaveAttribute("type", "button")
    expect(b.querySelector(":scope > svg[data-ink='bookmark']")).not.toBeNull()
    expect(b).toHaveAttribute("data-ink-ready")
    expect(container.querySelector(".sr-only")).toHaveTextContent("Save for later")
    expectInkLayers(container, { min: 1, kinds: ["bookmark"], absolute: true, layers: ["rest", "checked", "hover"] })
  })

  it("has a default name and a hit area beyond the ribbon", () => {
    const { getByRole } = render(<Bookmark />)
    const b = getByRole("button", { name: "Bookmark" })
    expect(b).toHaveClass("h-12", "w-8", "after:absolute", "after:-inset-1.5")
  })

  it("uncontrolled: click, Space and Enter toggle it", async () => {
    const { user, getByRole } = renderUI(<Bookmark defaultPressed>Save</Bookmark>)
    const b = getByRole("button", { name: "Save" })
    expect(b).toHaveAttribute("aria-pressed", "true")
    expect(b).toHaveAttribute("data-state", "on")
    await user.click(b)
    expect(b).toHaveAttribute("aria-pressed", "false")
    b.focus()
    await user.keyboard(" ")
    expect(b).toHaveAttribute("aria-pressed", "true")
    await user.keyboard("{Enter}")
    expect(b).toHaveAttribute("aria-pressed", "false")
  })

  it("controlled: the value decides and onPressedChange is told", async () => {
    const onPressedChange = vi.fn()
    const { user, getByRole, rerender } = renderUI(<Bookmark pressed={false} onPressedChange={onPressedChange}>Save</Bookmark>)
    const b = getByRole("button", { name: "Save" })
    await user.click(b)
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(b).toHaveAttribute("aria-pressed", "false")
    rerender(<Bookmark pressed onPressedChange={onPressedChange}>Save</Bookmark>)
    expect(b).toHaveAttribute("aria-pressed", "true")
  })

  it("disabled: not pressable, drawn as the pale ghost only (a static alternative)", async () => {
    const onPressedChange = vi.fn()
    const { user, getByRole, container } = renderUI(<Bookmark disabled onPressedChange={onPressedChange}>Save</Bookmark>)
    const b = getByRole("button", { name: "Save" })
    expect(b).toBeDisabled()
    await user.click(b)
    expect(onPressedChange).not.toHaveBeenCalled()
    const layers = Array.from(container.querySelectorAll("svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))
    expect(layers).toEqual(["disabled"])
  })

  it("the click does not redraw the ribbon", async () => {
    const { user, getByRole, container } = renderUI(<Bookmark>Save</Bookmark>)
    const before = container.querySelector("svg[data-ink]")!.innerHTML
    await user.click(getByRole("button", { name: "Save" }))
    expect(container.querySelector("svg[data-ink]")!.innerHTML).toBe(before)
  })

  it("turns with a seeded tilt (flat in calm density through the CSS clamp) and casts a shadow only when pressed", () => {
    const { getByRole } = render(<Bookmark seed="t" tilt={1.2}>Save</Bookmark>)
    const b = getByRole("button", { name: "Save" })
    expect(b.style.getPropertyValue("--ll-tilt")).toBe("1.2deg")
    expect(b.className).toContain("[&>svg]:[rotate:clamp(")
    expect(b.className).toContain("data-[state=on]:[&>svg]:[filter:var(--ll-drop-sticker)]")
  })

  it("forced colours: the pressed state fills with the system highlight, since the drawing is hidden there", () => {
    const { getByRole } = render(<Bookmark defaultPressed>Saved</Bookmark>)
    expect(getByRole("button", { name: "Saved" }).className).toContain("forced-colors:data-[state=on]:bg-[Highlight]")
  })

  it("passes className, ref, style and props through; takes a tone", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const a = render(<Bookmark ref={ref} className="absolute -top-1 end-6" style={{ marginTop: 2 }} data-testid="b" name="saved" value="yes" tone="teal" seed="x">Save</Bookmark>)
    expect(ref.current).toBe(a.getByTestId("b"))
    expect(a.getByTestId("b")).toHaveClass("absolute", "end-6")
    expect(a.getByTestId("b")).toHaveAttribute("name", "saved")
    const teal = a.container.querySelector("svg")!.innerHTML
    a.unmount()
    const tomato = render(<Bookmark seed="x">Save</Bookmark>).container.querySelector("svg")!.innerHTML
    expect(teal).not.toBe(tomato)
    expect(teal).toContain("var(--ll-teal)")
  })

  it("has no axe violations (off, on, disabled, in a group of them)", async () => {
    const { container } = renderUI(
      <div role="group" aria-label="Save">
        <Bookmark>Save article</Bookmark>
        <Bookmark defaultPressed>Saved article</Bookmark>
        <Bookmark disabled>Cannot save</Bookmark>
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Bookmark size={[32, 48]} seed="s" defaultPressed>Save</Bookmark>)
    expectHydrates(<Bookmark seed="h">Save</Bookmark>, "svg[data-ink='bookmark']", [32, 48])
    expectHydrates(<BookmarkRibbon seed="r" />, "svg[data-ink='bookmark']", [32, 56])
  })

  it("inside a calm provider it still draws", () => {
    const { container } = render(
      <InkProvider density="calm">
        <Bookmark>Save</Bookmark>
      </InkProvider>,
    )
    expect(container.querySelector("svg[data-ink='bookmark']")).not.toBeNull()
  })
})

describe("BookmarkRibbon", () => {
  it("is decoration: a hanging ribbon, aria-hidden, no pointer events, no button", () => {
    const { container, queryByRole } = render(<BookmarkRibbon tone="grape" className="absolute -top-1 end-6" />)
    const r = container.firstElementChild as HTMLElement
    expect(r).toHaveAttribute("data-slot", "bookmark-ribbon")
    expect(r).toHaveAttribute("aria-hidden", "true")
    expect(r).toHaveClass("pointer-events-none", "absolute")
    expect(queryByRole("button")).toBeNull()
    expect(Array.from(r.querySelectorAll("svg > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest"])
    expect(r.className).toContain("[&>svg]:[filter:var(--ll-drop-sticker)]")
  })
})

describe("bookmarkRecipe", () => {
  const p: BookmarkParams = { tone: "tomato", mode: "toggle", disabled: false }

  it("a toggle has a ghost (rest), the ribbon (checked) and a hover wash; disabled has only the ghost; static only the ribbon", () => {
    expect(run(bookmarkRecipe, p, 32, 48).layers).toEqual(["rest", "checked", "hover"])
    expect(run(bookmarkRecipe, p, 32, 48, { density: "calm" }).layers).toEqual(["rest", "checked"])
    expect(run(bookmarkRecipe, { ...p, disabled: true }, 32, 48).layers).toEqual(["disabled"])
    expect(run(bookmarkRecipe, { ...p, mode: "static" }, 32, 48).layers).toEqual(["rest"])
  })

  it("is deterministic per seed, differs across seeds and tones, clean at every size, density and tier", () => {
    const a = run(bookmarkRecipe, p, 32, 48).parts.checked!
    expect(a).toBe(run(bookmarkRecipe, p, 32, 48).parts.checked)
    expect(a).not.toBe(run(bookmarkRecipe, p, 32, 48, { seed: "x" }).parts.checked)
    expect(a).not.toBe(run(bookmarkRecipe, { ...p, tone: "sky" }, 32, 48).parts.checked)
    for (const [w, h] of [[10, 14], [32, 48], [60, 120], [200, 300]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [p, { ...p, mode: "static" as const }, { ...p, disabled: true }]) {
            const f = run(bookmarkRecipe, params, w, h, { density, tier })
            expectClean(Object.values(f.parts).join(""))
          }
        }
      }
    }
  })

  it("the swallowtail is a notch in the foot, and the whole ribbon is a few dozen nodes", () => {
    const poly = ribbonPoly(32, 48)
    expect(poly).toHaveLength(5)
    expect(poly[3][1]).toBeCloseTo(48 - Math.min(48 * 0.4, 32 * NOTCH), 5)
    const f = run(bookmarkRecipe, p, 32, 48).parts
    expect(nodes(f.checked!)).toBeLessThan(30)
    expect((f.checked ?? "").length + (f.rest ?? "").length).toBeLessThan(5000)
  })
})
