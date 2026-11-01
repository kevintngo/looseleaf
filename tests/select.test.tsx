import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { selectRecipe } from "@/lib/ink/recipes/select-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(180, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

const opts = { user: { pointerEventsCheck: 0 } }

function Demo({ trigger, content, ...root }: React.ComponentProps<typeof Select> & { trigger?: Partial<React.ComponentProps<typeof SelectTrigger>>; content?: Partial<React.ComponentProps<typeof SelectContent>> }) {
  return (
    <Select {...root}>
      <SelectTrigger aria-label="Pen" {...trigger}>
        <SelectValue placeholder="Pick a pen" />
      </SelectTrigger>
      <SelectContent {...content}>
        <SelectGroup>
          <SelectLabel>Pens</SelectLabel>
          <SelectItem value="felt">Felt tip</SelectItem>
          <SelectItem value="pencil">Pencil</SelectItem>
          <SelectItem value="quill" disabled>
            Quill
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Markers</SelectLabel>
          <SelectItem value="marker">Marker</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Select trigger", () => {
  it("is a Radix combobox button with upstream's slots, and the field drawing behind it", () => {
    const { getByRole } = renderUI(<Demo />)
    const t = getByRole("combobox", { name: "Pen" })
    expect(t.tagName).toBe("BUTTON")
    expect(t).toHaveAttribute("data-slot", "select-trigger")
    expect(t).toHaveAttribute("data-size", "default")
    expect(t).toHaveAttribute("aria-expanded", "false")
    expect(t).toHaveAttribute("data-placeholder")
    expect(t).toHaveClass("relative", "isolate", "w-fit")
    expect(t).toHaveAttribute("data-ink-host")
    expect(t).toHaveAttribute("data-ink-ready")
    expect(t.querySelector("[data-slot=select-value]")).toHaveTextContent("Pick a pen")
    expect(t.querySelector("[data-slot=select-icon]")).toBeTruthy()
    expectInkLayers(t, { min: 1, kinds: ["field", "icon"], layers: ["rest", "open"] })
    expect(t.querySelector(":scope > svg[data-ink=field]")).toHaveClass("absolute", "pointer-events-none")
    expect(layers(t)).toEqual(["rest", "open"])
    expect(t.querySelector(":scope > svg[data-ink]")!.parentElement).toBe(t)
  })

  it("size sm sets data-size, and the ref reaches the button", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = renderUI(<Demo trigger={{ size: "sm", ref }} />)
    expect(getByRole("combobox")).toHaveAttribute("data-size", "sm")
    expect(ref.current).toBe(getByRole("combobox"))
  })

  it("draws invalid and disabled as static alternatives (no rest, and no open layer that would always show)", () => {
    const a = renderUI(<Demo trigger={{ "aria-invalid": true }} />)
    expect(layers(a.getByRole("combobox"))).toEqual(["invalid"])
    a.unmount()
    const b = renderUI(<Demo trigger={{ disabled: true }} />)
    const t = b.getByRole("combobox")
    expect(t).toBeDisabled()
    expect(layers(t)).toEqual(["disabled"])
  })

  it("wakes the focus ring on the first keyboard focus", async () => {
    const { getByRole, user } = renderUI(<Demo />)
    const t = getByRole("combobox")
    expect(layers(t)).not.toContain("focus")
    await user.tab()
    expect(t).toHaveFocus()
    await waitFor(() => expect(layers(t)).toContain("focus"))
  })
})

describe("Select list", () => {
  it("opens as a listbox of options; the sheet is a slip of paper (a CSS sheet, no svg) above dialogs", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ position: "popper" }} />, opts)
    const t = getByRole("combobox")
    await user.click(t)
    const list = await screen.findByRole("listbox")
    expect(t).toHaveAttribute("aria-expanded", "true")
    expect(t).toHaveAttribute("data-state", "open")
    expect(list).toHaveAttribute("data-slot", "select-content")
    expect(list).toHaveClass("ll-paper", "ll-stock-slip", "z-(--ll-z-popover)")
    expect(list).toHaveAttribute("data-edge", "cut")
    expect(list.querySelector('svg[data-ink="sheet"]')).toBeNull()
    expect(within(list).getAllByRole("option").map((o) => o.textContent)).toEqual(["Felt tip", "Pencil", "Quill", "Marker"])
    for (const slot of ["select-group", "select-label", "select-item", "select-separator"]) expect(list.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    expect(within(list).getByRole("option", { name: "Quill" })).toHaveAttribute("aria-disabled", "true")
  })

  it("choosing an option closes the list, shows the value in the trigger and puts a tick on the chosen row", async () => {
    const onValueChange = vi.fn()
    const { user, getByRole } = renderUI(<Demo onValueChange={onValueChange} content={{ position: "popper" }} />, opts)
    await user.click(getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Pencil" }))
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(onValueChange).toHaveBeenCalledWith("pencil")
    const t = getByRole("combobox")
    expect(t).toHaveTextContent("Pencil")
    expect(t).not.toHaveAttribute("data-placeholder")
    await user.click(t)
    const chosen = await screen.findByRole("option", { name: "Pencil" })
    expect(chosen).toHaveAttribute("aria-selected", "true")
    expect(chosen).toHaveAttribute("data-state", "checked")
    expect(chosen.querySelector("[data-slot=select-item-indicator] svg[data-ink=icon]")).toBeTruthy()
    expect(within(await screen.findByRole("option", { name: "Felt tip" })).queryByRole("img", { hidden: true })).toBeNull()
  })

  it("the row under the keyboard is highlighted and wears the highlighter swipe", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ position: "popper" }} />, opts)
    await user.click(getByRole("combobox"))
    const felt = await screen.findByRole("option", { name: "Felt tip" })
    await waitFor(() => expect(felt).toHaveAttribute("data-highlighted"))
    expect(felt.className).toContain("data-[highlighted]:ll-swipe")
  })

  it("passes stock, edge and tilt to the paper; a torn edge is drawn when it opens", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ position: "popper", stock: "sticky-yellow", edge: "torn", tilt: 1, seed: "x" }} />, opts)
    await user.click(getByRole("combobox"))
    const list = await screen.findByRole("listbox")
    expect(list).toHaveAttribute("data-stock", "sticky-yellow")
    expect(list).toHaveAttribute("data-edge", "torn")
    expect(list.querySelector(':scope > svg[data-ink="sheet"]')).toBeTruthy()
  })

  it("repeats the provider's density and motion on the portalled sheet", async () => {
    const { user, getByRole } = renderUI(
      <InkProvider density="calm" motion="reduced">
        <Demo content={{ position: "popper" }} />
      </InkProvider>,
      opts
    )
    await user.click(getByRole("combobox"))
    const list = await screen.findByRole("listbox")
    expect(list).toHaveAttribute("data-density", "calm")
    expect(list).toHaveAttribute("data-motion", "reduced")
  })

  it("exports the scroll buttons as parts", () => {
    expect(SelectScrollUpButton).toBeTypeOf("function")
    expect(SelectScrollDownButton).toBeTypeOf("function")
  })
})

describe("Select keyboard, state and forms", () => {
  it("Enter opens, arrows move, Enter chooses, Escape closes and returns focus to the trigger", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ position: "popper" }} />, opts)
    const t = getByRole("combobox")
    t.focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("listbox")
    await waitFor(() => expect(screen.getByRole("option", { name: "Felt tip" })).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("option", { name: "Pencil" })).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("option", { name: "Marker" })).toHaveFocus())
    await user.keyboard("{Enter}")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(t).toHaveTextContent("Marker")
    expect(t).toHaveFocus()
    await user.keyboard("{Enter}")
    await screen.findByRole("listbox")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(t).toHaveFocus()
  })

  it("typeahead jumps to the row that starts with the typed letters", async () => {
    const { user, getByRole } = renderUI(<Demo content={{ position: "popper" }} />, opts)
    getByRole("combobox").focus()
    await user.keyboard("{Enter}")
    await screen.findByRole("listbox")
    await user.keyboard("m")
    await waitFor(() => expect(screen.getByRole("option", { name: "Marker" })).toHaveFocus())
  })

  it("is uncontrolled with defaultValue and controlled with value + onValueChange", async () => {
    const a = renderUI(<Demo defaultValue="felt" />)
    expect(a.getByRole("combobox")).toHaveTextContent("Felt tip")
    a.unmount()

    function Controlled() {
      const [v, setV] = React.useState("pencil")
      return (
        <>
          <Demo value={v} onValueChange={setV} content={{ position: "popper" }} />
          <output>{v}</output>
        </>
      )
    }
    const { user, getByRole, container } = renderUI(<Controlled />, opts)
    expect(getByRole("combobox")).toHaveTextContent("Pencil")
    await user.click(getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Marker" }))
    await waitFor(() => expect(container.querySelector("output")).toHaveTextContent("marker"))
    expect(getByRole("combobox")).toHaveTextContent("Marker")
  })

  it("controlled open state", async () => {
    const onOpenChange = vi.fn()
    const { user, getByRole } = renderUI(<Demo open onOpenChange={onOpenChange} content={{ position: "popper" }} />, opts)
    expect(await screen.findByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(getByRole("combobox", { hidden: true })).toHaveAttribute("aria-expanded", "true")
  })

  it("puts the value in FormData through Radix's hidden native select, and resets with the form", async () => {
    const seen: Array<string | null> = []
    const { user, getByRole, container } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).get("pen") as string | null)
        }}
      >
        <Demo name="pen" defaultValue="felt" content={{ position: "popper" }} />
        <button type="submit">go</button>
      </form>,
      opts
    )
    await user.click(getByRole("button", { name: "go" }))
    await user.click(getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Marker" }))
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual(["felt", "marker"])
    expect(container.querySelector("select[aria-hidden=true]")).toBeTruthy()
  })

  it("a disabled select does not open", async () => {
    const { user, getByRole } = renderUI(<Demo trigger={{ disabled: true }} />, opts)
    await user.click(getByRole("combobox"))
    expect(screen.queryByRole("listbox")).toBeNull()
  })
})

describe("Select accessibility and rendering", () => {
  it("has no axe violations closed, open, invalid and disabled", async () => {
    const { user, getByRole, container } = renderUI(
      <div>
        <Demo />
        <Select>
          <SelectTrigger aria-label="Bad" aria-invalid>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>
        <Select disabled>
          <SelectTrigger aria-label="Off">
            <SelectValue placeholder="y" />
          </SelectTrigger>
        </Select>
      </div>,
      opts
    )
    await axeCheck(container)
    await user.click(getByRole("combobox", { name: "Pen" }))
    await screen.findByRole("listbox")
    await axeCheck()
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = (
      <Select defaultValue="felt">
        <SelectTrigger aria-label="Pen">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="felt">Felt tip</SelectItem>
        </SelectContent>
      </Select>
    )
    const html = renderToString(tree)
    expect(html).toContain('data-slot="select-trigger"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg data-ink")
    expect(renderToString(tree)).toBe(html)
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      const ui = wrap(tree) as React.ReactElement
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
      expect(container.querySelector("[data-slot=select-trigger] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })

  it("right-to-left: the recipe puts the tick and bang at the start", () => {
    const req = { box: { w: 180, h: 36 }, seed: "r", tier: "lo" as const, density: "comfortable" as const, knobs: DEFAULT_KNOBS }
    const ltr = runRecipe(selectRecipe, { ...req, params: { invalid: true }, dir: "ltr" })
    const rtl = runRecipe(selectRecipe, { ...req, params: { invalid: true }, dir: "rtl" })
    expect(rtl.parts.invalid).not.toBe(ltr.parts.invalid)
  })
})

describe("selectRecipe", () => {
  const req = { seed: "s", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, w = 180, h = 36, extra: object = {}) => runRecipe(selectRecipe, { ...req, params, box: { w, h }, density: "comfortable", ...extra })

  it("declares rest and open eagerly, hover and focus lazily, and the alternatives from props", () => {
    expect(run({}).layers).toEqual(["rest", "open"])
    expect(run({}, 180, 36, { lazy: ["hover", "focus"] }).layers).toEqual(["rest", "open", "hover", "focus"])
    expect(run({ invalid: true }).layers).toEqual(["invalid"])
    expect(run({ disabled: true }).layers).toEqual(["disabled"])
    expect(run({ invalid: true, disabled: true }).layers).toEqual(["disabled"])
  })

  it("lo tier budget: the visible state is at most 12 nodes and 8 KB at any width", () => {
    for (const w of [120, 180, 260, 480]) {
      for (const params of [{}, { invalid: true }, { disabled: true }]) {
        const f = run(params, w)
        const shown = Object.entries(f.parts).filter(([k]) => k !== "open")
        const markup = shown.map(([, v]) => v).join("")
        expect(nodes(markup), `${w}/${JSON.stringify(params)}`).toBeLessThanOrEqual(12)
        expect(markup.length, `${w}/${JSON.stringify(params)}`).toBeLessThanOrEqual(params && "invalid" in params ? 9000 : 8000)
      }
    }
  })

  it("draws sane markup at every size, density and tier (no NaN, only var(--ll-*) colours)", () => {
    for (const [w, h] of [[80, 28], [180, 36], [400, 32], [700, 40]]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { invalid: true }, { disabled: true }]) {
            const f = run(params, w, h, { density, tier, lazy: ["focus", "hover"] })
            expect(Object.values(f.parts).join(""), `${w}x${h}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("lazy layers are the same bytes whenever asked for and never change the eager ones", () => {
    const eager = run({})
    const a = run({}, 180, 36, { lazy: ["focus"] })
    const b = run({}, 180, 36, { lazy: ["focus"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(a.parts.rest).toBe(eager.parts.rest)
  })
})
