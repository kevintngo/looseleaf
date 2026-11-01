import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"
import { InkProvider } from "@/lib/ink/react"
import { inkCache } from "@/lib/ink/react/cache"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { nativeSelectRecipe } from "@/lib/ink/recipes/native-select-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(200, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

function Demo(props: React.ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect aria-label="Country" {...props}>
      <NativeSelectOption value="">Choose</NativeSelectOption>
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="is">Iceland</NativeSelectOption>
        <NativeSelectOption value="pt">Portugal</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}

describe("NativeSelect structure", () => {
  it("is a real select in a drawn frame, with upstream's slots", () => {
    const { getByRole, container } = renderUI(<Demo />)
    const sel = getByRole("combobox", { name: "Country" })
    expect(sel.tagName).toBe("SELECT")
    expect(sel).toHaveAttribute("data-slot", "native-select")
    expect(sel).toHaveAttribute("data-size", "default")
    const frame = container.querySelector("[data-slot=native-select-wrapper]") as HTMLElement
    expect(frame).toHaveAttribute("data-ink-host")
    expect(frame).toHaveAttribute("data-ink-ready")
    expect(frame).toHaveClass("relative", "isolate", "w-fit")
    expect(sel.parentElement).toBe(frame)
    expect(frame.querySelector("[data-slot=native-select-icon]")).toHaveAttribute("aria-hidden", "true")
    expectInkLayers(frame, { min: 1, kinds: ["field", "icon"], layers: ["rest"] })
    expect(frame.querySelector(":scope > svg[data-ink=field]")).toHaveClass("absolute", "pointer-events-none")
    expect(layers(frame)).toEqual(["rest"])
    expect(frame.querySelector("[data-slot=native-select-option]")).toBeTruthy()
    expect(frame.querySelector("[data-slot=native-select-optgroup]")).toBeTruthy()
  })

  it("ref and props reach the select; className goes to the frame, padding to the select", () => {
    const ref = React.createRef<HTMLSelectElement>()
    const { getByRole, container } = renderUI(<Demo ref={ref} name="c" className="w-[180px] ps-6 focus:text-red" id="c1" />)
    const sel = getByRole("combobox")
    expect(ref.current).toBe(sel)
    expect(sel).toHaveAttribute("name", "c")
    expect(sel).toHaveAttribute("id", "c1")
    const frame = container.querySelector("[data-slot=native-select-wrapper]") as HTMLElement
    expect(frame.className).toContain("w-[180px]")
    expect(frame.className).not.toContain("ps-6")
    expect(sel.className).toContain("ps-6")
    expect(sel.className).toContain("focus:text-red")
  })

  it("size sm sets data-size on both", () => {
    const { getByRole, container } = renderUI(<Demo size="sm" />)
    expect(getByRole("combobox")).toHaveAttribute("data-size", "sm")
    expect(container.querySelector("[data-slot=native-select-wrapper]")).toHaveAttribute("data-size", "sm")
  })

  it("draws invalid and disabled as static alternatives", () => {
    const a = renderUI(<Demo aria-invalid />)
    expect(layers(a.container.querySelector("[data-slot=native-select-wrapper]")!)).toEqual(["invalid"])
    a.unmount()
    const b = renderUI(<Demo disabled />)
    expect(b.getByRole("combobox")).toBeDisabled()
    expect(layers(b.container.querySelector("[data-slot=native-select-wrapper]")!)).toEqual(["disabled"])
  })

  it("an invalid field keeps room at the end of the text for the red bang it draws before the chevron cell", () => {
    const { getByRole } = renderUI(<Demo aria-invalid />)
    expect(getByRole("combobox").className).toContain("aria-invalid:pe-14")
  })

  it("styles an empty-valued selected option as the placeholder", () => {
    const { getByRole } = renderUI(<Demo />)
    expect(getByRole("combobox").className).toContain("has-[option[value='']:checked]:text-(--ll-placeholder)")
  })
})

describe("NativeSelect behaviour", () => {
  it("selects an option by keyboard and pointer, uncontrolled and controlled", async () => {
    const { getByRole, user } = renderUI(<Demo defaultValue="is" />)
    const sel = getByRole("combobox") as HTMLSelectElement
    expect(sel.value).toBe("is")
    await user.selectOptions(sel, "pt")
    expect(sel.value).toBe("pt")

    function Controlled() {
      const [v, setV] = React.useState("pt")
      return (
        <>
          <Demo value={v} onChange={(e) => setV(e.target.value)} aria-label="Controlled" />
          <output>{v}</output>
        </>
      )
    }
    const c = renderUI(<Controlled />)
    await c.user.selectOptions(c.getByRole("combobox", { name: "Controlled" }), "is")
    expect(c.container.querySelector("output")).toHaveTextContent("is")
  })

  it("submits in a form and resets", async () => {
    const seen: Array<string | null> = []
    const { user, getByRole } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(new FormData(e.currentTarget).get("c") as string | null)
        }}
      >
        <Demo name="c" defaultValue="is" />
        <button type="submit">go</button>
      </form>,
    )
    await user.selectOptions(getByRole("combobox"), "pt")
    await user.click(getByRole("button", { name: "go" }))
    expect(seen).toEqual(["pt"])
  })

  it("wakes the ring on the first keyboard focus and never redraws for a change", async () => {
    const { container, getByRole, user } = renderUI(<Demo />)
    const frame = container.querySelector("[data-slot=native-select-wrapper]") as HTMLElement
    expect(layers(frame)).not.toContain("focus")
    await user.tab()
    expect(getByRole("combobox")).toHaveFocus()
    expect(layers(frame)).toContain("focus")
    const runs = inkCache.stats().runs
    fireEvent.change(getByRole("combobox"), { target: { value: "pt" } })
    expect(inkCache.stats().runs).toBe(runs)
  })
})

describe("NativeSelect accessibility, server and hydration", () => {
  it("has no axe violations (default, sm, invalid, disabled, with groups)", async () => {
    const { container } = renderUI(
      <div>
        <Demo />
        <Demo size="sm" aria-label="Small" />
        <Demo aria-invalid aria-label="Bad" />
        <Demo disabled aria-label="Off" />
      </div>,
    )
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => <Demo defaultValue="is" />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="native-select-wrapper"')
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
      expect(container.querySelector("[data-slot=native-select-wrapper] > svg[data-ink=field]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("nativeSelectRecipe", () => {
  const req = { seed: "n", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = (params: object, w = 200, h = 36, extra: object = {}) => runRecipe(nativeSelectRecipe, { ...req, params, box: { w, h }, density: "comfortable", ...extra })

  it("declares rest eagerly, hover and focus lazily, and the alternatives from props; there is no open layer", () => {
    expect(run({}).layers).toEqual(["rest"])
    expect(run({}, 200, 36, { lazy: ["hover", "focus"] }).layers).toEqual(["rest", "hover", "focus"])
    expect(run({ invalid: true }).layers).toEqual(["invalid"])
    expect(run({ disabled: true }).layers).toEqual(["disabled"])
  })

  it("lo tier budget: the visible state is at most 12 nodes and 9 KB up to 480 px", () => {
    for (const w of [120, 200, 320, 480]) {
      for (const params of [{}, { invalid: true }, { disabled: true }]) {
        const f = run(params, w)
        const markup = Object.values(f.parts).join("")
        expect(nodes(markup), `${w}/${JSON.stringify(params)}`).toBeLessThanOrEqual(12)
        expect(markup.length, `${w}/${JSON.stringify(params)}`).toBeLessThanOrEqual(9000)
      }
    }
  })

  it("draws sane markup at every size, density and tier", () => {
    for (const [w, h] of [[80, 28], [200, 36], [500, 32]]) {
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
})
