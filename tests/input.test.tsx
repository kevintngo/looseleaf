import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Input, InputControl } from "@/components/ui/input"
import { splitFieldClass } from "@/lib/field-class"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { inputRecipe } from "@/lib/ink/recipes/input-ink"
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
const frameOf = (input: HTMLElement) => input.parentElement as HTMLElement

describe("Input structure", () => {
  it("is a frame span around a real input: the input keeps upstream's slot, the frame is the ink host", () => {
    mockBox(260, 36)
    const { getByRole } = render(<Input placeholder="you@example.com" />)
    const input = getByRole("textbox")
    expect(input.tagName).toBe("INPUT")
    expect(input).toHaveAttribute("data-slot", "input")
    expect(input).not.toHaveAttribute("type")
    const frame = frameOf(input)
    expect(frame.tagName).toBe("SPAN")
    expect(frame).toHaveAttribute("data-slot", "input-frame")
    expect(frame).toHaveAttribute("data-ink-host")
    expect(frame).toHaveAttribute("data-ink-ready")
    expect(frame).toHaveAttribute("data-ink-focus", "within")
    expect(frame).toHaveClass("relative", "isolate", "h-9", "w-full")
    expect(Array.from(frame.children).map((c) => c.tagName)).toEqual(["svg", "INPUT"])
  })

  it("a typed password is set in the mono face (Kalam's bullet is a speck); the placeholder keeps the hand", () => {
    mockBox(260, 36)
    const { container } = render(<Input type="password" defaultValue="hunter2" />)
    const input = container.querySelector("input") as HTMLInputElement
    expect(input.className).toContain("[&[type=password]:not(:placeholder-shown)]:font-mono")
  })

  it("the ink is decorative, behind the input, and the frame is the host", () => {
    mockBox(260, 36)
    const { getByRole } = render(<Input />)
    const frame = frameOf(getByRole("textbox"))
    expectInkLayers(frame, { min: 1, kinds: ["field"], absolute: true, layers: ["rest"] })
    const svg = frame.querySelector("svg") as SVGElement
    expect(svg.parentElement).toBe(frame)
    expect(svg.style.zIndex).toBe("-1")
    expect(svg).toHaveAttribute("data-still")
    expect(layers(frame)).toEqual(["rest"])
  })

  it("has no drawing before it is measured (server, hidden tab) and keeps the host marker", () => {
    mockBox(0, 0)
    const { getByRole } = render(<Input />)
    const frame = frameOf(getByRole("textbox"))
    expect(frame).toHaveAttribute("data-ink-host")
    expect(frame).not.toHaveAttribute("data-ink-ready")
    expect(frame.querySelector("svg")).toBeNull()
  })

  it("type=hidden renders the bare input and nothing else", () => {
    const { container } = render(<Input type="hidden" name="csrf" defaultValue="abc" />)
    expect(container.children).toHaveLength(1)
    const el = container.firstElementChild as HTMLInputElement
    expect(el.tagName).toBe("INPUT")
    expect(el).toHaveAttribute("type", "hidden")
    expect(el.value).toBe("abc")
  })

  it("InputControl is the bare input (for composites that draw their own box)", () => {
    const { getByRole } = render(<InputControl aria-label="bare" />)
    const el = getByRole("textbox")
    expect(el).toHaveAttribute("data-slot", "input")
    expect(el.parentElement?.tagName).toBe("DIV")
    expect(el.querySelector("svg")).toBeNull()
  })
})

describe("Input paper-and-felt hooks", () => {
  it("what you type is blue felt with a felt caret; native chrome that fights the page is removed; autofill stays on paper", () => {
    const { getByRole } = render(<Input />)
    const input = getByRole("textbox")
    expect(frameOf(input)).toHaveClass("text-(--ll-input-ink)", "caret-(--ll-caret)", "font-hand", "text-base")
    expect(input.className).not.toMatch(/(?:^|\s)text-(?:base|sm|lg|ink|foreground)|font-hand/)
    expect(input).toHaveClass("[text-align:inherit]", "text-[length:inherit]", "border-0", "bg-transparent")
    expect(input.className).toContain("autofill:shadow-[inset_0_0_0_1000px_var(--ll-slip)]")
    expect(input.className).toContain("[&::-webkit-inner-spin-button]:appearance-none")
    expect(input.className).toContain("[&::-webkit-search-cancel-button]:appearance-none")
    expect(input.className).toContain("file:bg-hi-select")
    expect(input.className).toContain("aria-invalid:pe-9")
    expect(input).not.toHaveClass("outline-none")
  })

  it("compact and calm density change the height of the frame, not of the input", () => {
    const { getByRole } = render(<Input />)
    expect(frameOf(getByRole("textbox"))).toHaveClass("compact:h-8", "calm:h-7")
  })
})

describe("Input className, style and ref semantics", () => {
  it("className and style go to the frame; padding and control-only variants are moved onto the input", () => {
    mockBox(260, 36)
    const { getByRole } = render(
      <Input className="max-w-sm text-lg mt-2 pl-9 placeholder:italic md:px-4" inputClassName="font-mono" style={{ width: 200 }} data-testid="x" />,
    )
    const input = getByRole("textbox")
    const frame = frameOf(input)
    expect(frame).toHaveClass("max-w-sm", "text-lg", "mt-2")
    expect(frame).not.toHaveClass("pl-9")
    expect(frame.style.width).toBe("200px")
    expect(input).toHaveClass("pl-9", "placeholder:italic", "md:px-4", "font-mono")
    expect(input).not.toHaveClass("max-w-sm", "mt-2")
    expect(input).toHaveAttribute("data-testid", "x")
  })

  it("a later utility wins as in shadcn: className overrides the defaults on the right element", () => {
    const { getByRole } = render(<Input className="h-12 w-64 px-1" />)
    const input = getByRole("textbox")
    expect(frameOf(input)).toHaveClass("h-12", "w-64")
    expect(frameOf(input)).not.toHaveClass("h-9", "w-full")
    expect(input).toHaveClass("px-1")
    expect(input).not.toHaveClass("px-3")
  })

  it("ref is the input (React 19 ref prop), also with a callback ref", () => {
    mockBox(260, 36)
    const ref = React.createRef<HTMLInputElement>()
    const cb = vi.fn()
    const { getByRole } = render(
      <>
        <Input ref={ref} aria-label="a" />
        <Input ref={cb} aria-label="b" />
      </>,
    )
    expect(ref.current).toBe(getByRole("textbox", { name: "a" }))
    expect(cb).toHaveBeenCalledWith(getByRole("textbox", { name: "b" }))
    ref.current?.focus()
    expect(getByRole("textbox", { name: "a" })).toHaveFocus()
  })
})

describe("splitFieldClass", () => {
  it("sends padding, resize, field-sizing and control pseudo variants to the control, the rest to the frame", () => {
    expect(splitFieldClass("w-64 px-3 pt-1 -ms-1 pe-8 resize-none field-sizing-fixed file:font-bold selection:bg-hi focus-visible:ring-0 md:py-2 text-sm mt-2")).toEqual({
      frame: "w-64 -ms-1 text-sm mt-2",
      control: "px-3 pt-1 pe-8 resize-none field-sizing-fixed file:font-bold selection:bg-hi focus-visible:ring-0 md:py-2",
    })
  })
  it("does not mistake other p-words for padding, and reads variants around brackets", () => {
    expect(splitFieldClass("pointer-events-none place-items-center peer prose has-[>input:disabled]:opacity-50 data-[a:b]:p-2! aria-[invalid=true]:pl-4")).toEqual({
      frame: "pointer-events-none place-items-center peer prose has-[>input:disabled]:opacity-50",
      control: "data-[a:b]:p-2! aria-[invalid=true]:pl-4",
    })
    expect(splitFieldClass(undefined)).toEqual({ frame: "", control: "" })
    expect(splitFieldClass("  ")).toEqual({ frame: "", control: "" })
  })
})

describe("Input states", () => {
  it("aria-invalid draws the red-pencil alternative (and keeps the prop on the input)", () => {
    mockBox(260, 36)
    const { getByRole } = render(<Input aria-invalid />)
    const input = getByRole("textbox")
    expect(input).toHaveAttribute("aria-invalid", "true")
    const frame = frameOf(input)
    expect(layers(frame)).toEqual(["invalid"])
    expect(frame.querySelector("[data-layer=invalid]")?.innerHTML).toMatch(/var\(--ll-red\)/)
  })

  it('aria-invalid="false" is not invalid', () => {
    mockBox(260, 36)
    const { getByRole } = render(<Input aria-invalid="false" />)
    expect(layers(frameOf(getByRole("textbox")))).toEqual(["rest"])
  })

  it("disabled is a real disabled input and draws only the dashed alternative", async () => {
    mockBox(260, 36)
    const onChange = vi.fn()
    const { getByRole, user } = renderUI(<Input disabled defaultValue="x" onChange={onChange} />)
    const input = getByRole("textbox")
    expect(input).toBeDisabled()
    expect(layers(frameOf(input))).toEqual(["disabled"])
    await user.type(input, "abc")
    expect(onChange).not.toHaveBeenCalled()
    await user.tab()
    expect(input).not.toHaveFocus()
  })

  it("readOnly is focusable and selectable, keeps its value, and is drawn as printed (no hover)", async () => {
    mockBox(260, 36)
    const { getByRole, user } = renderUI(<Input readOnly defaultValue="fixed" />)
    const input = getByRole("textbox") as HTMLInputElement
    expect(layers(frameOf(input))).toEqual(["rest"])
    await user.tab()
    expect(input).toHaveFocus()
    await user.keyboard("more")
    expect(input.value).toBe("fixed")
  })

  it("toggling aria-invalid redraws the same box in the other state, without remounting", () => {
    mockBox(260, 36)
    const { getByRole, rerender } = render(<Input seed="t" />)
    const input = getByRole("textbox")
    expect(layers(frameOf(input))).toEqual(["rest"])
    rerender(<Input seed="t" aria-invalid />)
    expect(getByRole("textbox")).toBe(input)
    expect(layers(frameOf(input))).toEqual(["invalid"])
    rerender(<Input seed="t" aria-invalid={false} />)
    expect(layers(frameOf(input))).toEqual(["rest"])
  })

  it("disabled wins over invalid", () => {
    mockBox(260, 36)
    const { getByRole } = render(<Input disabled aria-invalid />)
    expect(layers(frameOf(getByRole("textbox")))).toEqual(["disabled"])
  })

  it("draws the hover pass lazily, on the first pointerenter (red pencil when invalid), and never for read-only", async () => {
    mockBox(260, 36)
    const { getByLabelText, user } = renderUI(
      <div>
        <Input aria-label="a" />
        <Input aria-label="b" aria-invalid />
        <Input aria-label="c" readOnly />
      </div>,
    )
    for (const name of ["a", "b", "c"]) expect(layers(frameOf(getByLabelText(name)))).not.toContain("hover")
    await user.hover(getByLabelText("a"))
    await user.hover(getByLabelText("b"))
    await user.hover(getByLabelText("c"))
    expect(layers(frameOf(getByLabelText("a")))).toEqual(["rest", "hover"])
    expect(layers(frameOf(getByLabelText("b")))).toEqual(["invalid", "hover"])
    expect(frameOf(getByLabelText("b")).querySelector("[data-layer=hover]")?.innerHTML).toMatch(/var\(--ll-red\)/)
    expect(layers(frameOf(getByLabelText("c")))).toEqual(["rest"])
  })

  it("draws the focus ring lazily, when the keyboard (or a click in a text box) focuses the input", async () => {
    mockBox(260, 36)
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(<Input />)
    const input = getByRole("textbox")
    expect(layers(frameOf(input))).not.toContain("focus")
    await user.tab()
    expect(input).toHaveFocus()
    expect(layers(frameOf(input))).toContain("focus")
    spy.mockRestore()
  })

  it("draws for the host's writing direction: inside dir=rtl the invalid marks move to the left end", () => {
    mockBox(260, 36)
    const one = (dir?: string) => {
      const { getByRole, unmount } = render(
        <div dir={dir}>
          <Input seed="d" aria-invalid />
        </div>,
      )
      const html = frameOf(getByRole("textbox")).querySelector("[data-layer=invalid]")?.innerHTML
      unmount()
      return html
    }
    expect(one("rtl")).not.toBe(one("ltr"))
    expect(one("ltr")).toBe(one(undefined))
  })

  it("seed pins the hand: same seed, same drawing, also across remounts", () => {
    mockBox(260, 36)
    const draw = (seed: string) => {
      const { getByRole, unmount } = render(<Input seed={seed} />)
      const html = frameOf(getByRole("textbox")).querySelector("svg")?.innerHTML
      unmount()
      return html
    }
    expect(draw("same")).toBe(draw("same"))
    expect(draw("same")).not.toBe(draw("other"))
  })
})

describe("Input as a form control", () => {
  it("is uncontrolled by default: typing updates the value, onChange fires", async () => {
    const onChange = vi.fn()
    const { getByRole, user } = renderUI(<Input defaultValue="ada" onChange={onChange} />)
    const input = getByRole("textbox") as HTMLInputElement
    await user.type(input, " lovelace")
    expect(input.value).toBe("ada lovelace")
    expect(onChange).toHaveBeenCalledTimes(9)
  })

  it("is controlled with value + onChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("a")
      return (
        <>
          <Input value={v} onChange={(e) => setV(e.target.value.toUpperCase())} aria-label="c" />
          <output>{v}</output>
        </>
      )
    }
    const { getByRole, user } = renderUI(<Controlled />)
    await user.type(getByRole("textbox"), "bc")
    expect(getByRole("textbox")).toHaveValue("ABC")
    expect(document.querySelector("output")).toHaveTextContent("ABC")
  })

  it("submits with its form: name, value, and not when disabled", async () => {
    const seen: Array<Record<string, FormDataEntryValue>> = []
    const { getByRole, user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(Object.fromEntries(new FormData(e.currentTarget)))
        }}
      >
        <Input name="email" type="email" aria-label="email" />
        <Input name="off" defaultValue="hidden from the form" disabled aria-label="off" />
        <Input name="csrf" type="hidden" defaultValue="tok" />
        <button>Send</button>
      </form>,
    )
    await user.type(getByRole("textbox", { name: "email" }), "ada@example.com")
    await user.click(getByRole("button", { name: "Send" }))
    expect(seen).toEqual([{ email: "ada@example.com", csrf: "tok" }])
  })

  it("Enter in the input submits the form", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { getByRole, user } = renderUI(
      <form onSubmit={onSubmit}>
        <Input name="q" aria-label="q" />
        <button>Go</button>
      </form>,
    )
    await user.type(getByRole("textbox"), "hi{Enter}")
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("required and native validation still work (the browser owns the bubble)", () => {
    const { getByRole } = render(<Input required minLength={3} aria-label="name" />)
    const input = getByRole("textbox") as HTMLInputElement
    expect(input.required).toBe(true)
    expect(input.checkValidity()).toBe(false)
    input.value = "abcd"
    expect(input.checkValidity()).toBe(true)
  })

  it.each(["email", "password", "search", "number", "tel", "url", "date", "file"])("type=%s reaches the input", (type) => {
    const { container } = render(<Input type={type} aria-label={type} />)
    expect(container.querySelector("input")).toHaveAttribute("type", type)
    expect(container.querySelector("input")?.className).toMatch(/file:/)
  })

  it("is labelled by a real <label htmlFor>", async () => {
    const { getByLabelText, user } = renderUI(
      <>
        <label htmlFor="who">Who</label>
        <Input id="who" />
      </>,
    )
    await user.click(document.querySelector("label") as HTMLElement)
    expect(getByLabelText("Who")).toHaveFocus()
  })

  it("passes maxLength, autoComplete, inputMode and aria-describedby straight through", () => {
    const { getByRole } = render(<Input maxLength={5} autoComplete="email" inputMode="email" aria-describedby="hint" />)
    const input = getByRole("textbox")
    expect(input).toHaveAttribute("maxlength", "5")
    expect(input).toHaveAttribute("autocomplete", "email")
    expect(input).toHaveAttribute("inputmode", "email")
    expect(input).toHaveAttribute("aria-describedby", "hint")
  })
})

describe("Input accessibility", () => {
  it("has no axe violations in any state", async () => {
    mockBox(260, 36)
    const { container } = render(
      <div>
        <Input aria-label="one" />
        <Input aria-label="two" aria-invalid aria-describedby="err" />
        <span id="err">Not an email</span>
        <Input aria-label="three" disabled />
        <Input aria-label="four" readOnly value="x" />
        <Input aria-label="five" type="file" />
        <Input aria-label="six" type="password" required />
      </div>,
    )
    await axeCheck(container)
  })

  it("is keyboard reachable in order and the ink never takes focus", async () => {
    mockBox(260, 36)
    const { getAllByRole, user } = renderUI(
      <div>
        <Input aria-label="a" />
        <Input aria-label="b" />
      </div>,
    )
    await user.tab()
    expect(getAllByRole("textbox")[0]).toHaveFocus()
    await user.tab()
    expect(getAllByRole("textbox")[1]).toHaveFocus()
    expect(document.querySelectorAll("svg[tabindex], svg[data-ink] [tabindex]")).toHaveLength(0)
  })
})

describe("Input on the server and hydration", () => {
  it("renders the host marker, the input and no drawing before it is measured", () => {
    const html = renderToString(<Input placeholder="x" />)
    expect(html).toContain('data-slot="input-frame"')
    expect(html).toContain("data-ink-host")
    expect(html).toContain('data-slot="input"')
    expect(html).not.toContain("<svg")
  })

  it("is deterministic between two renders (useId seeds)", () => {
    const tree = () => <Input aria-invalid disabled={false} />
    expect(renderToString(tree())).toBe(renderToString(tree()))
  })

  it("hydrates without warnings, then measures and draws (bare and inside the provider)", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      mockBox(260, 36)
      const ui = wrap(<Input defaultValue="x" aria-label="h" />) as React.ReactElement
      const container = document.createElement("div")
      document.body.appendChild(container)
      container.innerHTML = renderToString(ui)
      expect(container.querySelector("svg[data-ink]")).toBeNull()
      const errors = vi.spyOn(console, "error").mockImplementation(() => {})
      let root: ReturnType<typeof hydrateRoot> | undefined
      act(() => {
        root = hydrateRoot(container, ui)
      })
      expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
      errors.mockRestore()
      expect(container.querySelector("[data-slot=input-frame] > svg[data-ink]")).toBeTruthy()
      expect((container.querySelector("input") as HTMLInputElement).value).toBe("x")
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("inputRecipe", () => {
  const req = { params: {}, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length
  const run = (params: object, box = { w: 260, h: 36 }, extra: object = {}) => runRecipe(inputRecipe, { ...req, params, box, ...extra })

  it("declares its layers: rest eagerly, hover and focus lazily, invalid and disabled as static alternatives", () => {
    expect(run({}).layers).toEqual(["rest"])
    expect(run({}, undefined, { lazy: ["focus", "hover"] }).layers).toEqual(["rest", "hover", "focus"])
    expect(run({ invalid: true }).layers).toEqual(["invalid"])
    expect(run({ invalid: true }, undefined, { lazy: ["hover"] }).layers).toEqual(["invalid", "hover"])
    expect(run({ readOnly: true }, undefined, { lazy: ["hover", "focus"] }).layers).toEqual(["rest", "focus"])
    expect(run({ disabled: true }).layers).toEqual(["disabled"])
    expect(run({ readOnly: true }).layers).toEqual(["rest"])
  })

  it("draws sane markup at every width, density and tier (no NaN, only var(--ll-*) colours)", () => {
    for (const w of [16, 44, 72, 120, 260, 480, 900]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { invalid: true }, { disabled: true }, { readOnly: true }]) {
            const f = run(params, { w, h: density === "calm" ? 28 : 36 }, { density, tier, lazy: ["focus", "hover"] })
            const all = Object.values(f.parts).join("")
            expect(all, `${w}/${density}/${tier}/${JSON.stringify(params)}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            expect(all.length).toBeGreaterThan(50)
          }
        }
      }
    }
  })

  it("lo tier budget: the visible rest state is at most 12 nodes and 8 KB (DESIGN must-fix 1)", () => {
    for (const w of [120, 260, 480]) {
      const rest = run({}, { w, h: 36 }).parts.rest ?? ""
      expect(nodes(rest)).toBeLessThanOrEqual(12)
      expect(rest.length).toBeLessThanOrEqual(8000)
    }
  })

  it("no squiggle in calm density; a very narrow invalid field keeps the box but drops the mark", () => {
    const comfy = run({ invalid: true }).parts.invalid ?? ""
    const calm = run({ invalid: true }, { w: 260, h: 28 }, { density: "calm" }).parts.invalid ?? ""
    expect(calm.length).toBeLessThan(comfy.length)
    expect((run({ invalid: true }, { w: 40, h: 36 }).parts.invalid ?? "").length).toBeLessThan(comfy.length)
  })

  it("right-to-left mirrors the end-of-line marks (! and the wavy underline) to the left", () => {
    const ltr = run({ invalid: true }).parts.invalid
    const rtl = run({ invalid: true }, undefined, { dir: "rtl" }).parts.invalid
    expect(rtl).not.toBe(ltr)
    expect(run({}, undefined, { dir: "rtl" }).parts.rest).toBe(run({}).parts.rest)
  })

  it("lazy layers are the same bytes whenever they are asked for and never change the eager ones", () => {
    const eager = run({})
    const a = run({}, undefined, { lazy: ["focus", "hover"] })
    const b = run({}, undefined, { lazy: ["focus", "hover"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(b.parts.hover).toBe(a.parts.hover)
    expect(a.parts.rest).toBe(eager.parts.rest)
  })
})

describe("foundation polish: calm is hairline (audit 4.12)", () => {
  const req = { seed: "polish", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS, box: { w: 240, h: 28 } }
})
