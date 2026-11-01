import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Textarea, TextareaControl } from "@/components/ui/textarea"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { textareaRecipe } from "@/lib/ink/recipes/textarea-ink"
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
const frameOf = (el: HTMLElement) => el.parentElement as HTMLElement
const svgHtml = (el: HTMLElement) => frameOf(el).querySelector("svg")?.innerHTML ?? ""

describe("Textarea structure", () => {
  it("is a frame span around a real textarea with upstream's slot; the frame is the ink host", () => {
    mockBox(340, 112)
    const { getByRole } = render(<Textarea placeholder="Tell us" />)
    const ta = getByRole("textbox")
    expect(ta.tagName).toBe("TEXTAREA")
    expect(ta).toHaveAttribute("data-slot", "textarea")
    expect(ta).toHaveClass("field-sizing-content")
    const frame = frameOf(ta)
    expect(frame.tagName).toBe("SPAN")
    expect(frame).toHaveAttribute("data-slot", "textarea-frame")
    expect(frame).toHaveAttribute("data-ink-host")
    expect(frame).toHaveAttribute("data-ink-ready")
    expect(frame).toHaveAttribute("data-ink-focus", "within")
    expect(frame).toHaveClass("relative", "isolate", "min-h-16", "w-full")
    expect(Array.from(frame.children).map((c) => c.tagName)).toEqual(["svg", "TEXTAREA"])
    expectInkLayers(frame, { min: 1, kinds: ["field"], absolute: true, layers: ["rest"] })
    expect(layers(frame)).toEqual(["rest"])
  })

  it("className and style go to the frame; padding, resize and control variants to the textarea; ref is the textarea", () => {
    mockBox(340, 112)
    const ref = React.createRef<HTMLTextAreaElement>()
    const { getByRole } = render(<Textarea ref={ref} className="max-w-md min-h-32 px-5 resize-none placeholder:italic" inputClassName="font-mono" style={{ width: 300 }} rows={4} />)
    const ta = getByRole("textbox")
    expect(ref.current).toBe(ta)
    const frame = frameOf(ta)
    expect(frame).toHaveClass("max-w-md", "min-h-32")
    expect(frame).not.toHaveClass("min-h-16", "px-5")
    expect(frame.style.width).toBe("300px")
    expect(ta).toHaveClass("px-5", "resize-none", "placeholder:italic", "font-mono")
    expect(ta).not.toHaveClass("px-3", "resize-y", "max-w-md")
    expect(ta).toHaveAttribute("rows", "4")
  })

  it("TextareaControl is the bare textarea", () => {
    const { getByRole } = render(<TextareaControl aria-label="bare" />)
    expect(getByRole("textbox").parentElement?.tagName).toBe("DIV")
    expect(getByRole("textbox")).toHaveAttribute("data-slot", "textarea")
  })

  it("autoGrow={false} fixes the height (field-sizing: fixed)", () => {
    const { getByRole } = render(<Textarea autoGrow={false} rows={5} aria-label="x" />)
    expect(getByRole("textbox")).toHaveClass("field-sizing-fixed")
    expect(getByRole("textbox")).not.toHaveClass("field-sizing-content")
  })
})

describe("Textarea ruled paper", () => {
  it("fixes the rhythm to 28 px lines starting 8 px from the top, and always grows", () => {
    mockBox(340, 112)
    const { getByRole } = render(<Textarea ruled autoGrow={false} className="py-6" aria-label="r" />)
    const ta = getByRole("textbox")
    expect(ta).toHaveClass("leading-7", "pt-2", "pb-2", "field-sizing-content")
    expect(ta).not.toHaveClass("py-6", "field-sizing-fixed")
    expect(frameOf(ta)).toHaveClass("min-h-24")
  })

  it("draws the rules into the paper: one per line box that fits", () => {
    const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
    const at = (h: number, extra: object = {}) => runRecipe(textareaRecipe, { ...req, box: { w: 340, h }, params: { ruled: true, lineHeight: 28, ruleTop: 8, ...extra } }).parts.rest ?? ""
    for (const h of [64, 124, 152]) {
      const plain = runRecipe(textareaRecipe, { ...req, box: { w: 340, h }, params: {} }).parts.rest ?? ""
      expect(at(h)).not.toBe(plain)
      expect(at(h)).toBe(at(h))
      expect((at(h).match(/<path/g) ?? []).length).toBeGreaterThanOrEqual((plain.match(/<path/g) ?? []).length)
    }
    expect(at(152)).not.toBe(at(124))
  })
})

describe("Textarea states", () => {
  it("aria-invalid, disabled and readOnly choose the drawing", () => {
    mockBox(340, 112)
    const { getByLabelText } = render(
      <div>
        <Textarea aria-label="inv" aria-invalid />
        <Textarea aria-label="dis" disabled />
        <Textarea aria-label="ro" readOnly defaultValue="x" />
        <Textarea aria-label="ok" />
      </div>,
    )
    expect(layers(frameOf(getByLabelText("inv")))).toEqual(["invalid"])
    expect(layers(frameOf(getByLabelText("dis")))).toEqual(["disabled"])
    expect(layers(frameOf(getByLabelText("ro")))).toEqual(["rest"])
    expect(layers(frameOf(getByLabelText("ok")))).toEqual(["rest"])
    expect(getByLabelText("dis")).toBeDisabled()
    expect(getByLabelText("inv")).toHaveAttribute("aria-invalid", "true")
  })

  it("the drawn resize grip disappears with resize-none (and so does the resizing)", () => {
    mockBox(340, 112)
    const { getByLabelText } = render(
      <div>
        <Textarea aria-label="a" seed="grip" />
        <Textarea aria-label="b" seed="grip" className="resize-none" />
        <Textarea aria-label="c" seed="grip" inputClassName="md:resize-none" />
      </div>,
    )
    const a = svgHtml(getByLabelText("a")), b = svgHtml(getByLabelText("b")), c = svgHtml(getByLabelText("c"))
    expect(a).not.toBe(b)
    expect(c).toBe(b)
  })

  it("draws the focus ring lazily on focus", async () => {
    mockBox(340, 112)
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(<Textarea />)
    expect(layers(frameOf(getByRole("textbox")))).not.toContain("focus")
    await user.tab()
    expect(layers(frameOf(getByRole("textbox")))).toContain("focus")
    spy.mockRestore()
  })
})

describe("Textarea as a form control", () => {
  it("is uncontrolled by default; Enter makes a new line and does not submit", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const { getByRole, user } = renderUI(
      <form onSubmit={onSubmit}>
        <Textarea aria-label="t" defaultValue="one" />
      </form>,
    )
    const ta = getByRole("textbox") as HTMLTextAreaElement
    await user.type(ta, "{Enter}two")
    expect(ta.value).toBe("one\ntwo")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("is controlled with value + onChange", async () => {
    function Controlled() {
      const [v, setV] = React.useState("a")
      return <Textarea aria-label="c" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} />
    }
    const { getByRole, user } = renderUI(<Controlled />)
    await user.type(getByRole("textbox"), "bc")
    expect(getByRole("textbox")).toHaveValue("ABC")
  })

  it("submits with its form (name/value), not when disabled", async () => {
    const seen: Array<Record<string, FormDataEntryValue>> = []
    const { getByRole, user } = renderUI(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          seen.push(Object.fromEntries(new FormData(e.currentTarget)))
        }}
      >
        <Textarea name="bio" aria-label="bio" />
        <Textarea name="nope" aria-label="nope" disabled defaultValue="x" />
        <button>Save</button>
      </form>,
    )
    await user.type(getByRole("textbox", { name: "bio" }), "hello{Enter}world")
    await user.click(getByRole("button"))
    expect(seen).toEqual([{ bio: "hello\nworld" }])
  })

  it("is labelled by <label htmlFor> and passes native attributes through", () => {
    const { getByLabelText } = render(
      <>
        <label htmlFor="bio">Bio</label>
        <Textarea id="bio" maxLength={120} rows={3} required aria-describedby="hint" spellCheck={false} />
      </>,
    )
    const ta = getByLabelText("Bio")
    expect(ta).toHaveAttribute("maxlength", "120")
    expect(ta).toHaveAttribute("rows", "3")
    expect(ta).toBeRequired()
    expect(ta).toHaveAttribute("aria-describedby", "hint")
    expect(ta).toHaveAttribute("spellcheck", "false")
  })
})

describe("Textarea character counter", () => {
  it("counts what is typed (uncontrolled), with the limit, and describes the field", async () => {
    const { getByRole, user, container } = renderUI(<Textarea aria-label="t" showCount maxLength={20} defaultValue="abc" aria-describedby="hint" />)
    const ta = getByRole("textbox")
    const count = container.querySelector("[data-slot=textarea-count]") as HTMLElement
    expect(count).toHaveTextContent("3/20")
    expect(count.querySelector("[aria-hidden=true]")).toHaveTextContent("3/20")
    expect(count).toHaveTextContent("3 characters of 20")
    expect(ta.getAttribute("aria-describedby")).toBe(`${count.id} hint`)
    await user.type(ta, "de")
    expect(count).toHaveTextContent("5/20")
    await user.clear(ta)
    expect(count).toHaveTextContent("0/20")
  })

  it("follows value when controlled and accepts a render function", () => {
    const { container, rerender } = render(<Textarea aria-label="t" showCount={({ length, max }) => `${length} of ${max ?? "∞"} left`} value="hello" onChange={() => {}} />)
    expect(container.querySelector("[data-slot=textarea-count]")).toHaveTextContent("5 of ∞ left")
    rerender(<Textarea aria-label="t" showCount={({ length, max }) => `${length} of ${max ?? "∞"} left`} value="hello world" onChange={() => {}} maxLength={30} />)
    expect(container.querySelector("[data-slot=textarea-count]")).toHaveTextContent("11 of 30 left")
  })

  it("resets with its form", async () => {
    const { container, getByRole, user } = renderUI(
      <form>
        <Textarea aria-label="t" showCount defaultValue="ab" />
        <button type="reset">Reset</button>
      </form>,
    )
    await user.type(getByRole("textbox"), "cd")
    expect(container.querySelector("[data-slot=textarea-count]")).toHaveTextContent("4")
    await user.click(getByRole("button", { name: "Reset" }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(container.querySelector("[data-slot=textarea-count]")).toHaveTextContent("2")
  })

  it("is off by default", () => {
    const { container } = render(<Textarea aria-label="t" />)
    expect(container.querySelector("[data-slot=textarea-count]")).toBeNull()
  })
})

describe("Textarea accessibility", () => {
  it("has no axe violations in any state", async () => {
    mockBox(340, 112)
    const { container } = render(
      <div>
        <Textarea aria-label="one" />
        <Textarea aria-label="two" aria-invalid showCount maxLength={10} />
        <Textarea aria-label="three" disabled />
        <Textarea aria-label="four" readOnly defaultValue="x" ruled />
      </div>,
    )
    await axeCheck(container)
  })
})

describe("Textarea on the server and hydration", () => {
  it("renders the host marker and the textarea, no drawing yet, deterministically", () => {
    const tree = () => <Textarea showCount ruled defaultValue="x" />
    const html = renderToString(tree())
    expect(html).toContain('data-slot="textarea-frame"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
    expect(renderToString(tree())).toBe(html)
  })

  it("hydrates without warnings (bare and inside the provider) and then draws", () => {
    for (const wrap of [(n: React.ReactNode) => n, (n: React.ReactNode) => <InkProvider>{n}</InkProvider>]) {
      mockBox(340, 112)
      const ui = wrap(<Textarea aria-label="h" showCount defaultValue="hi" />) as React.ReactElement
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
      expect(container.querySelector("[data-slot=textarea-frame] > svg[data-ink]")).toBeTruthy()
      expect(container.querySelector("[data-slot=textarea-count]")).toHaveTextContent("2")
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("textareaRecipe", () => {
  const req = { seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (params: object, box = { w: 340, h: 112 }, extra: object = {}) => runRecipe(textareaRecipe, { ...req, params, box, ...extra })

  it("declares its layers like the input", () => {
    expect(run({}).layers).toEqual(["rest"])
    expect(run({}, undefined, { lazy: ["focus", "hover"] }).layers).toEqual(["rest", "hover", "focus"])
    expect(run({ invalid: true }).layers).toEqual(["invalid"])
    expect(run({ disabled: true, ruled: true }).layers).toEqual(["disabled"])
  })

  it("draws sane markup for every state, size, density and tier", () => {
    for (const h of [44, 64, 112, 260]) {
      for (const density of ["comfortable", "compact", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          for (const params of [{}, { ruled: true, grip: true }, { invalid: true, ruled: true }, { disabled: true, grip: true }, { readOnly: true, ruled: true }]) {
            const f = run(params, { w: 320, h }, { density, tier, lazy: ["focus", "hover"] })
            const all = Object.values(f.parts).join("")
            expect(all, `${h}/${density}/${tier}/${JSON.stringify(params)}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })

  it("right-to-left moves the resize grip to the left corner, where the browser puts it", () => {
    const ltr = run({ grip: true }).parts.rest
    const rtl = run({ grip: true }, undefined, { dir: "rtl" }).parts.rest
    expect(rtl).not.toBe(ltr)
    expect(run({ grip: true, invalid: true }, undefined, { dir: "rtl" }).parts.invalid).not.toBe(run({ grip: true, invalid: true }).parts.invalid)
  })

  it("lo tier budget: the plain rest state is at most 12 nodes and 8 KB", () => {
    const rest = run({ grip: true }).parts.rest ?? ""
    expect((rest.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length).toBeLessThanOrEqual(12)
    expect(rest.length).toBeLessThanOrEqual(8000)
  })
})
