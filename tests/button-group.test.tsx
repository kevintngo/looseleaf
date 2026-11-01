import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { buttonGroupTextRecipe } from "@/lib/ink/recipes/button-group-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(80, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const Group = (props: React.ComponentProps<typeof ButtonGroup>) => (
  <ButtonGroup aria-label="Range" {...props}>
    <Button variant="outline">Years</Button>
    <Button variant="outline">Months</Button>
    <Button variant="outline">Days</Button>
  </ButtonGroup>
)

describe("ButtonGroup structure", () => {
  it("is a role=group div with upstream's slot and orientation attribute", () => {
    const { getByRole } = render(<Group />)
    const g = getByRole("group", { name: "Range" })
    expect(g.tagName).toBe("DIV")
    expect(g).toHaveAttribute("data-slot", "button-group")
    expect(g).toHaveAttribute("data-orientation", "horizontal")
    expect(g).toHaveClass("flex", "w-fit", "items-stretch")
    expect(g.querySelector(":scope > svg")).toBeNull()
  })

  it("vertical stacks the buttons", () => {
    const { getByRole } = render(<Group orientation="vertical" />)
    const g = getByRole("group")
    expect(g).toHaveAttribute("data-orientation", "vertical")
    expect(g).toHaveClass("flex-col")
  })

  it("trims the shared edge with a clip instead of dropping the drawing: start edge of non-first, end edge before a separator, never while focused", () => {
    const cls = buttonGroupVariants()
    expect(cls).toContain("[&>*:not([data-slot=button-group-separator]):not(:first-child)]:[--cl-s:15px]")
    expect(cls).toContain("[&>*:has(+[data-slot=button-group-separator])]:[--cl-e:15px]")
    expect(cls).toContain(":not(:focus-visible):not(:has(:focus-visible))>svg.absolute]:[clip-path:inset(-14px_var(--cl-e,-14px)_-14px_var(--cl-s,-14px))]")
    expect(cls).toContain("rtl:[&>*")
    expect(buttonGroupVariants({ orientation: "vertical" })).toContain("[clip-path:inset(var(--cl-s,-14px)_-14px_var(--cl-e,-14px)_-14px)]")
    expect(cls).not.toMatch(/\brounded|\bborder\b|shadow/)
  })

  it("every button keeps its own full drawing", () => {
    const { getAllByRole } = render(<Group />)
    const buttons = getAllByRole("button")
    expect(buttons).toHaveLength(3)
    for (const b of buttons) expectInkLayers(b, { min: 1, kinds: ["button"], absolute: true, layers: ["rest"] })
  })

  it("forwards className, ref and other props to the group", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByRole } = render(<Group ref={ref} className="ms-4" data-testid="g" />)
    expect(ref.current).toBe(getByRole("group"))
    expect(ref.current).toHaveClass("ms-4")
    expect(ref.current).toHaveAttribute("data-testid", "g")
  })

  it("keeps upstream's rules for nested groups, selects and inputs", () => {
    const cls = buttonGroupVariants()
    expect(cls).toContain("has-[>[data-slot=button-group]]:gap-2")
    expect(cls).toContain("[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit")
    expect(cls).toContain("[&>input]:flex-1")
    expect(cls).toContain("[&>[data-slot=input-frame]]:flex-1")
  })
})

describe("ButtonGroupText and ButtonGroupSeparator", () => {
  it("ButtonGroupText is a drawn cell with real text", () => {
    const { getByText } = render(
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Input aria-label="Host" />
      </ButtonGroup>
    )
    const t = getByText("https://")
    expect(t).toHaveAttribute("data-slot", "button-group-text")
    expect(t).toHaveClass("relative", "isolate", "flex", "items-center", "gap-2")
    expectInkLayers(t, { min: 1, kinds: ["cell"], absolute: true, layers: ["rest"] })
    expect(t.textContent).toBe("https://")
  })

  it("ButtonGroupText asChild draws inside your element", () => {
    const { getByText } = render(
      <ButtonGroupText asChild>
        <label htmlFor="x">Host</label>
      </ButtonGroupText>
    )
    const l = getByText("Host")
    expect(l.tagName).toBe("LABEL")
    expect(l).toHaveAttribute("data-slot", "button-group-text")
    expect(l.querySelector(":scope > svg[data-ink=cell]")).toBeTruthy()
  })

  it("ButtonGroupSeparator is a vertical drawn rule by default, decorative, stretching to the group's height", () => {
    const { container } = render(
      <ButtonGroup>
        <Button variant="secondary">Copy</Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">Paste</Button>
      </ButtonGroup>
    )
    const s = container.querySelector("[data-slot=button-group-separator]") as HTMLElement
    expect(s).toHaveAttribute("data-orientation", "vertical")
    expect(s).toHaveAttribute("role", "none")
    expect(s).toHaveClass("self-stretch", "relative")
    expect(s.querySelector(":scope > svg[data-ink=rule]")).toBeTruthy()
  })

  it("ButtonGroupSeparator takes a separator variant and orientation", () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button>Up</Button>
        <ButtonGroupSeparator orientation="horizontal" variant="dashed" />
        <Button>Down</Button>
      </ButtonGroup>
    )
    const s = container.querySelector("[data-slot=button-group-separator]")
    expect(s).toHaveAttribute("data-orientation", "horizontal")
    expect(s).toHaveAttribute("data-variant", "dashed")
  })
})

describe("ButtonGroup behaviour and accessibility", () => {
  it("Tab moves through the buttons in order and each keeps its own click", async () => {
    const onClick = vi.fn()
    const { getAllByRole, user } = renderUI(
      <ButtonGroup aria-label="Range">
        <Button variant="outline" onClick={() => onClick("a")}>
          A
        </Button>
        <Button variant="outline" onClick={() => onClick("b")}>
          B
        </Button>
        <Button variant="outline" onClick={() => onClick("c")}>
          C
        </Button>
      </ButtonGroup>
    )
    const [a, b, c] = getAllByRole("button")
    await user.tab()
    expect(a).toHaveFocus()
    await user.tab()
    expect(b).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.tab()
    expect(c).toHaveFocus()
    await user.keyboard(" ")
    await user.click(a)
    expect(onClick.mock.calls.map((x) => x[0])).toEqual(["b", "c", "a"])
  })

  it("has no axe violations: buttons, text cell, input, separator, nested groups, vertical", async () => {
    const { container } = render(
      <div>
        <Group />
        <ButtonGroup aria-label="URL">
          <ButtonGroupText>https://</ButtonGroupText>
          <Input aria-label="Host" />
          <Button>Go</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Clipboard">
          <Button variant="secondary">Copy</Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">Paste</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Nested">
          <ButtonGroup aria-label="One">
            <Button variant="outline">1</Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Two">
            <Button variant="outline">2</Button>
          </ButtonGroup>
        </ButtonGroup>
        <Group orientation="vertical" aria-label="Vertical" />
      </div>
    )
    await axeCheck(container)
  })
})

describe("ButtonGroup on the server and hydration", () => {
  it("renders deterministically, with host markers and no drawing before it is measured", () => {
    restore()
    const tree = () => (
      <ButtonGroup>
        <ButtonGroupText>@</ButtonGroupText>
        <Button variant="outline">Follow</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Mute</Button>
      </ButtonGroup>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="button-group"')
    expect(html).toContain('data-slot="button-group-text"')
    expect(html).toContain('data-slot="button-group-separator"')
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws every host", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(
        <ButtonGroup aria-label="h">
          <ButtonGroupText>@</ButtonGroupText>
          <Button variant="outline">Follow</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Mute</Button>
        </ButtonGroup>
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
      expect(container.querySelectorAll("svg[data-ink]").length).toBe(4)
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("buttonGroupTextRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (w: number, h: number, extra: object = {}) => runRecipe(buttonGroupTextRecipe, { ...req, box: { w, h }, ...extra })

  it("draws a body under a box in the rest layer only", () => {
    const f = run(80, 36)
    expect(f.layers).toEqual(["rest"])
    expect(f.parts.rest).toContain("var(--ll-paper-shade)")
    expect(f.parts.rest).toContain("var(--ll-ink)")
  })

  it("draws sane markup at many boxes, densities and tiers within the lo budget", () => {
    for (const [w, h] of [
      [24, 24],
      [56, 28],
      [80, 36],
      [200, 40],
      [40, 120],
    ] as const) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const m = Object.values(run(w, h, { density, tier }).parts).join("")
          expect(m, `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    const lo = run(80, 36).parts.rest ?? ""
    expect((lo.match(/<(?:path|g)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(lo.length).toBeLessThanOrEqual(8000)
  })
})
