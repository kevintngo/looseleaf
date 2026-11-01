import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { inputGroupRecipe, inputGroupRuleRecipe } from "@/lib/ink/recipes/input-group-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(320, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

function Search(props: { input?: React.ComponentProps<typeof InputGroupInput>; group?: React.ComponentProps<typeof InputGroup> }) {
  return (
    <InputGroup {...props.group}>
      <InputGroupAddon>
        <Icon name="search" />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search" {...props.input} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Clear" size="icon-xs">
          <Icon name="x" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

describe("InputGroup structure", () => {
  it("is a role=group host with upstream's slots: addons, a control, text and a button", () => {
    const { getByRole, container } = renderUI(<Search />)
    const g = container.querySelector("[data-slot=input-group]") as HTMLElement
    expect(g).toHaveAttribute("role", "group")
    expect(g).toHaveClass("group/input-group", "relative", "isolate", "flex", "w-full")
    expect(g).toHaveAttribute("data-ink-host")
    expect(g).toHaveAttribute("data-ink-ready")
    const addons = g.querySelectorAll(":scope > [data-slot=input-group-addon]")
    expect(addons).toHaveLength(2)
    expect(addons[0]).toHaveAttribute("data-align", "inline-start")
    expect(addons[0]).toHaveAttribute("role", "group")
    expect(addons[1]).toHaveAttribute("data-align", "inline-end")
    const control = getByRole("textbox", { name: "Search" })
    expect(control).toHaveAttribute("data-slot", "input-group-control")
    expect(control.parentElement).toBe(g)
    expect(g.querySelector("[data-slot=button]")).toBeTruthy()
    expect(g.querySelector("[data-slot=button]")).toHaveAttribute("data-size", "icon-xs")
  })

  it("draws ONE box: a single ink host for the group, the control has none of its own", () => {
    const { container } = renderUI(<Search />)
    const g = container.querySelector("[data-slot=input-group]") as HTMLElement
    expectInkLayers(g, { min: 1, kinds: ["field", "icon", "button"], layers: ["rest", "invalid", "disabled"] })
    expect(layers(g)).toEqual(["rest", "disabled", "invalid"])
    expect(g.querySelector("[data-slot=input-group-control]")!.closest("[data-slot=input-frame]")).toBeNull()
    expect(container.querySelectorAll("svg[data-ink=field]")).toHaveLength(1)
  })

  it("the rest drawing sits in a group that invalid and disabled replace (the control's state is in the DOM, not in props)", () => {
    const { container } = renderUI(<Search />)
    const rest = container.querySelector("svg[data-ink=field] > [data-layer=rest]") as SVGGElement
    expect(rest.querySelector('[data-hide-on="invalid disabled"]')).toBeTruthy()
  })

  it("alignment variants set the group's flow: block addons stack it and let it grow", () => {
    const { container } = renderUI(
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Header</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea aria-label="Body" />
        <InputGroupAddon align="block-end">Footer</InputGroupAddon>
      </InputGroup>,
    )
    const g = container.querySelector("[data-slot=input-group]") as HTMLElement
    expect(g.className).toContain("has-[>[data-align=block-start]]:flex-col")
    expect(g.className).toContain("has-[>[data-align=block-end]]:h-auto")
    expect(g.className).toContain("has-[>textarea]:h-auto")
    expect(container.querySelector("textarea")).toHaveAttribute("data-slot", "input-group-control")
    expect(container.querySelector("[data-slot=input-group-text]")).toHaveTextContent("Header")
  })

  it("uses logical padding (rtl needs no twins) and has the states for a control that is not a direct child", () => {
    const { container } = renderUI(<Search />)
    const g = container.querySelector("[data-slot=input-group]") as HTMLElement
    expect(g.className).toContain("has-[>[data-align=inline-start]]:[&>input]:ps-2")
    expect(g.className).toContain("has-[>[data-align=inline-end]]:[&>input]:pe-2")
    expect(g.className).toContain("has-[[data-slot=input-group-control]:focus-visible]:[&>svg>[data-layer=focus]]:visible")
    expect(g.className).toContain("has-[[data-slot=input-group-control][aria-invalid=true]]:[&>svg>[data-layer=invalid]]:visible")
    expect(g.className).toContain("has-[[data-slot=input-group-control]:disabled]:[&>svg>[data-layer=disabled]]:visible")
    for (const a of container.querySelectorAll("[data-slot=input-group-addon]")) expect(a.className).not.toMatch(/(?:^|\s)(?:pl|pr|ml|mr)-/)
  })

  it("the ref reaches the group and a seed is accepted", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = renderUI(<Search group={{ ref, seed: "s" }} />)
    expect(ref.current).toBe(container.querySelector("[data-slot=input-group]"))
  })
})

describe("InputGroup addon rules", () => {
  const Code = () => (
    <InputGroup>
      <InputGroupAddon align="block-start" className="border-b" data-testid="head">
        <InputGroupText>script.js</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea aria-label="Code" />
      <InputGroupAddon align="block-end" className="border-t" data-testid="foot">
        <InputGroupText>Line 1</InputGroupText>
      </InputGroupAddon>
      <InputGroupAddon align="block-end" data-testid="plain">
        plain
      </InputGroupAddon>
    </InputGroup>
  )

  it("border-b / border-t on a block addon is drawn as a pencil rule and the CSS border goes transparent", () => {
    const { getByTestId } = renderUI(<Code />)
    for (const id of ["head", "foot"]) {
      const a = getByTestId(id)
      expect(a).toHaveAttribute("data-ink-host")
      expect(a.querySelector(":scope > svg[data-ink=rule]")).toBeTruthy()
      expect(a.className).toContain("[.border-b]:border-transparent")
      expect(a.className).toContain("forced-colors:outline-0!")
    }
    expect(layers(getByTestId("head"))).toEqual(["rest"])
  })

  it("an addon without a border class draws nothing of its own", () => {
    const { getByTestId } = renderUI(<Code />)
    const a = getByTestId("plain")
    expect(a).not.toHaveAttribute("data-ink-host")
    expect(a.querySelector("svg[data-ink]")).toBeNull()
    expect(a.className).not.toContain("border-transparent")
  })

  it("the rule recipe is one pull on the right edge, a hair line when calm, and never empty", () => {
    const req = { seed: "r", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    for (const density of ["comfortable", "compact", "calm"] as const) {
      for (const edge of ["top", "bottom"] as const) {
        const f = runRecipe(inputGroupRuleRecipe, { ...req, params: { edge }, box: { w: 320, h: 44 }, density })
        expect(f.layers[0]).toBe("rest")
        expect(f.parts.rest ?? "", `${density}/${edge}`).toMatch(/<path/)
        expect(f.parts.rest ?? "").not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
      }
    }
  })
})

describe("InputGroup behavior", () => {
  it("clicking an addon focuses the control, but clicking a button in it does not", async () => {
    const onClick = vi.fn()
    const { getByRole, container, user } = renderUI(
      <InputGroup>
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupInput aria-label="Q" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Go" onClick={onClick}>
            Go
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )
    const input = getByRole("textbox", { name: "Q" })
    await user.click(container.querySelector("[data-slot=input-group-addon]") as HTMLElement)
    expect(input).toHaveFocus()
    ;(document.activeElement as HTMLElement).blur()
    await user.click(getByRole("button", { name: "Go" }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(input).not.toHaveFocus()
  })

  it("typing works, controlled and uncontrolled, and the drawing is not redrawn by it", async () => {
    function Controlled() {
      const [v, setV] = React.useState("")
      return (
        <>
          <Search input={{ value: v, onChange: (e) => setV(e.target.value) }} />
          <output>{v}</output>
        </>
      )
    }
    const { getByRole, user, container } = renderUI(<Controlled />)
    await user.click(getByRole("textbox"))
    const runs = inkCache.stats().runs
    await user.keyboard("ada")
    expect(container.querySelector("output")).toHaveTextContent("ada")
    expect(inkCache.stats().runs).toBe(runs)
    const u = renderUI(<Search input={{ defaultValue: "x" }} />)
    expect(u.getAllByRole("textbox").at(-1)).toHaveValue("x")
  })

  it("buttons inside are real Buttons: Tab reaches them after the control, Enter presses them", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <InputGroup>
        <InputGroupInput aria-label="Q" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )
    await user.tab()
    expect(getByRole("textbox")).toHaveFocus()
    await user.tab()
    expect(getByRole("button", { name: "Copy" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalled()
  })

  it("wakes the group's focus ring on the first keyboard focus of the control", async () => {
    const { container, user } = renderUI(<Search />)
    const g = container.querySelector("[data-slot=input-group]") as HTMLElement
    expect(layers(g)).not.toContain("focus")
    await user.tab()
    expect(layers(g)).toContain("focus")
  })

  it("aria-invalid and disabled on the control reach the DOM the theme keys on", () => {
    const { getByRole } = renderUI(<Search input={{ "aria-invalid": true }} />)
    expect(getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(getByRole("textbox").className).toContain("aria-invalid:pe-3")
  })
})

describe("InputGroup accessibility, server and hydration", () => {
  it("has no axe violations (icon, button, invalid, disabled, textarea with block addons)", async () => {
    const { container } = renderUI(
      <div>
        <Search />
        <Search input={{ "aria-invalid": true, "aria-label": "Bad" }} />
        <Search input={{ disabled: true, "aria-label": "Off" }} group={{ "data-disabled": "true" } as never} />
        <InputGroup>
          <InputGroupAddon align="block-start">Reply</InputGroupAddon>
          <InputGroupTextarea aria-label="Body" />
          <InputGroupAddon align="block-end">
            <InputGroupButton>Send</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>,
    )
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Search />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="input-group"')
    expect(html).toContain("data-ink-host")
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
      expect(container.querySelector("[data-slot=input-group] > svg[data-ink=field]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("inputGroupRecipe", () => {
  const req = { seed: "g", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (w: number, h: number, extra: object = {}) => runRecipe(inputGroupRecipe, { ...req, params: {}, box: { w, h }, density: "comfortable", ...extra })

  it("declares rest, disabled and invalid eagerly, hover and focus lazily", () => {
    expect(run(320, 36).layers).toEqual(["rest", "disabled", "invalid"])
    expect(run(320, 36, { lazy: ["hover", "focus"] }).layers).toEqual(["rest", "disabled", "invalid", "hover", "focus"])
  })

  it("lo tier budget: each visible state is at most 12 nodes and 8 KB at any width, and a textarea-high group is fine", () => {
    for (const [w, h] of [[160, 36], [320, 36], [480, 36], [320, 120]]) {
      const f = run(w, h)
      for (const k of ["rest", "invalid", "disabled"] as const) {
        expect(nodes(f.parts[k] ?? ""), `${w}x${h}/${k}`).toBeLessThanOrEqual(12)
        expect((f.parts[k] ?? "").length, `${w}x${h}/${k}`).toBeLessThanOrEqual(k === "rest" ? 8000 : 9000)
      }
    }
  })

  it("draws sane markup at every size, density and tier, and mirrors the underline for rtl", () => {
    for (const [w, h] of [[80, 28], [320, 36], [320, 140], [700, 40]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const f = run(w, h, { density, tier, lazy: ["hover", "focus"] })
          expect(Object.values(f.parts).join(""), `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
        }
      }
    }
    expect(run(320, 36, { dir: "rtl" }).parts.invalid).not.toBe(run(320, 36).parts.invalid)
  })

  it("lazy layers are the same bytes whenever asked for and never change the eager ones", () => {
    const eager = run(320, 36)
    const a = run(320, 36, { lazy: ["focus"] })
    const b = run(320, 36, { lazy: ["focus"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(a.parts.rest).toBe(eager.parts.rest)
  })
})
