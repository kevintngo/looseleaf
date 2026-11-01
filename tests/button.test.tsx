import * as React from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { Button, buttonVariants } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { buttonRecipe, buttonSizeList, buttonVariantList } from "@/lib/ink/recipes/button-ink"
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

describe("Button", () => {
  it("renders a real button with the upstream slots and defaults", () => {
    const { getByRole } = render(<Button>Save</Button>)
    const b = getByRole("button", { name: "Save" })
    expect(b.tagName).toBe("BUTTON")
    expect(b).toHaveAttribute("data-slot", "button")
    expect(b).toHaveAttribute("data-variant", "default")
    expect(b).toHaveAttribute("data-size", "default")
    expect(b).not.toHaveAttribute("type")
    expect(b).toHaveAttribute("data-ink-host")
  })

  it.each(buttonVariantList)("variant %s and every size: data attributes, classes and a drawing", (variant) => {
    mockBox(120, 36)
    for (const size of buttonSizeList) {
      const { getByRole, unmount } = render(
        <Button variant={variant} size={size}>
          x
        </Button>,
      )
      const b = getByRole("button")
      expect(b).toHaveAttribute("data-variant", variant)
      expect(b).toHaveAttribute("data-size", size)
      expect(b).toHaveClass("relative", "isolate", "font-hand")
      expect(b).toHaveAttribute("data-ink-ready")
      expect(layers(b)).toEqual(["rest", "hover"])
      unmount()
    }
  })

  it("buttonVariants is layout only: heights of upstream shadcn, no colours, no rounding", () => {
    expect(buttonVariants({ size: "default" })).toContain("h-9")
    expect(buttonVariants({ size: "xs" })).toContain("h-6")
    expect(buttonVariants({ size: "sm" })).toContain("h-8")
    expect(buttonVariants({ size: "lg" })).toContain("h-10")
    expect(buttonVariants({ size: "icon" })).toContain("size-9")
    expect(buttonVariants({ size: "icon-xs" })).toContain("size-6")
    expect(buttonVariants({ size: "icon-sm" })).toContain("size-8")
    expect(buttonVariants({ size: "icon-lg" })).toContain("size-10")
    expect(buttonVariants({ variant: "link", className: "mt-2" })).toContain("mt-2")
    expect(buttonVariants()).toContain("active:translate-y-(--ll-press-sink)")
    expect(buttonVariants()).not.toMatch(/\brounded|\bbg-|\bborder\b|shadow/)
  })

  it("the ink svg is decorative: aria-hidden, absolute, behind the label, never counted as an icon", () => {
    mockBox(120, 36)
    const { getByRole } = render(<Button>Save</Button>)
    const b = getByRole("button")
    expectInkLayers(b, { min: 1, kinds: ["button"], absolute: true })
    const svg = b.querySelector("svg") as SVGElement
    expect(svg.parentElement).toBe(b)
    expect(svg.getAttribute("class")).toContain("absolute")
    expect(svg.style.zIndex).toBe("-1")
    expect(buttonVariants()).toContain("[&_svg:not(.absolute):not([class*='size-'])]:size-4")
    expect(buttonVariants()).toContain("has-[>svg:not(.absolute)]:px-3")
  })

  it("draws the pressed pass lazily: on pointerdown", async () => {
    mockBox(120, 36)
    const { getByRole, user } = renderUI(<Button>Save</Button>)
    const b = getByRole("button")
    expect(layers(b)).toEqual(["rest", "hover"])
    await user.pointer({ keys: "[MouseLeft>]", target: b })
    expect(layers(b)).toContain("pressed")
  })

  it("draws the pressed pass lazily: on Enter", async () => {
    mockBox(120, 36)
    const { getByRole, user } = renderUI(<Button>Keys</Button>)
    const b = getByRole("button")
    await user.tab()
    expect(layers(b)).not.toContain("pressed")
    await user.keyboard("{Enter}")
    expect(layers(b)).toContain("pressed")
  })

  it("clicks, and activates from the keyboard (Enter, Space)", async () => {
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(<Button onClick={onClick}>Save</Button>)
    await user.click(getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
    await user.tab()
    await user.tab()
    expect(getByRole("button")).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.keyboard(" ")
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it("a disabled button is a real disabled button, is not clickable and draws only the disabled alternative", async () => {
    mockBox(120, 36)
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    )
    const b = getByRole("button")
    expect(b).toBeDisabled()
    await user.click(b)
    expect(onClick).not.toHaveBeenCalled()
    expect(layers(b)).toEqual(["disabled"])
    await user.tab()
    expect(b).not.toHaveFocus()
  })

  it("forwards a ref (React 19 ref prop) to the button and still measures it", () => {
    mockBox(120, 36)
    const ref = React.createRef<HTMLButtonElement>()
    const { getByRole } = render(<Button ref={ref}>Ref</Button>)
    expect(ref.current).toBe(getByRole("button"))
    expect(ref.current).toHaveAttribute("data-ink-ready")
  })

  it("passes type, form and aria props through", () => {
    const { getByRole } = render(
      <Button type="submit" aria-label="Send it" aria-pressed="false" name="go">
        <span aria-hidden>+</span>
      </Button>,
    )
    const b = getByRole("button", { name: "Send it" })
    expect(b).toHaveAttribute("type", "submit")
    expect(b).toHaveAttribute("aria-pressed", "false")
    expect(b).toHaveAttribute("name", "go")
  })

  it("draws the focus ring when the keyboard focuses it (lazy layer)", async () => {
    mockBox(120, 36)
    const original = Element.prototype.matches
    const spy = vi.spyOn(Element.prototype, "matches")
    spy.mockImplementation(function (this: Element, sel: string) {
      return sel === ":focus-visible" ? this === document.activeElement : original.call(this, sel)
    })
    const { getByRole, user } = renderUI(<Button>Save</Button>)
    const b = getByRole("button")
    expect(layers(b)).not.toContain("focus")
    await user.tab()
    expect(b).toHaveFocus()
    expect(layers(b)).toContain("focus")
    spy.mockRestore()
  })

  it("is accessible in every variant", async () => {
    mockBox(120, 36)
    const { container } = render(
      <div>
        {buttonVariantList.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
        <Button size="icon" aria-label="Add">
          +
        </Button>
        <Button disabled>disabled</Button>
      </div>,
    )
    await axeCheck(container)
  })
})

describe("Button asChild", () => {
  it("renders the child element with the button's props and puts the drawing INSIDE it", () => {
    mockBox(120, 36)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const { getByRole } = render(
      <Button asChild variant="link">
        <a href="/docs">Docs</a>
      </Button>,
    )
    const a = getByRole("link", { name: "Docs" })
    expect(a.tagName).toBe("A")
    expect(a).toHaveAttribute("href", "/docs")
    expect(a).toHaveAttribute("data-slot", "button")
    expect(a).toHaveAttribute("data-variant", "link")
    expect(a).toHaveAttribute("data-ink-host")
    expect(a).toHaveAttribute("data-ink-ready")
    expect(a.querySelector(":scope > svg[data-ink]")).toBeTruthy()
    expect(a.textContent).toBe("Docs")
    expect(layers(a)).toEqual(["rest", "hover"])
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
  })

  it("keeps the child's own handlers and merges classes", async () => {
    const own = vi.fn()
    const outer = vi.fn()
    const { getByRole, user } = renderUI(
      <Button asChild onClick={outer}>
        <a href="#x" className="mine" onClick={own}>
          Go
        </a>
      </Button>,
    )
    await user.click(getByRole("link"))
    expect(own).toHaveBeenCalledTimes(1)
    expect(outer).toHaveBeenCalledTimes(1)
    expect(getByRole("link")).toHaveClass("mine", "relative", "isolate")
  })

  it("disabled + asChild: announced and drawn as disabled, out of the tab order, click swallowed", async () => {
    mockBox(120, 36)
    const onClick = vi.fn()
    const { getByRole, user } = renderUI(
      <Button asChild disabled>
        <a href="/nowhere" onClick={onClick}>
          Nope
        </a>
      </Button>,
    )
    const a = getByRole("link")
    expect(a).toHaveAttribute("aria-disabled", "true")
    expect(a).toHaveAttribute("tabindex", "-1")
    expect(a).not.toHaveAttribute("disabled")
    expect(layers(a)).toEqual(["disabled"])
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true })
    a.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
    await user.tab()
    expect(a).not.toHaveFocus()
  })

  it("asChild works with any element, e.g. a span role=button", () => {
    const { getByRole } = render(
      <Button asChild variant="ghost">
        <span role="button" tabIndex={0}>
          Span
        </span>
      </Button>,
    )
    expect(getByRole("button", { name: "Span" }).tagName).toBe("SPAN")
  })
})

describe("Button on the server", () => {
  it("renders the host marker and no drawing before it is measured", () => {
    const html = renderToString(<Button>Save</Button>)
    expect(html).toContain('data-slot="button"')
    expect(html).toContain("data-ink-host")
    expect(html).not.toContain("<svg")
  })

  it("is deterministic (useId seeds) and asChild renders an anchor", () => {
    const tree = () => (
      <Button asChild>
        <a href="/x">Link</a>
      </Button>
    )
    expect(renderToString(tree())).toBe(renderToString(tree()))
    expect(renderToString(tree())).toMatch(/^<a /)
  })
})

describe("buttonRecipe", () => {
  const req = { params: { variant: "default", size: "default" } as const, seed: "r", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs)\b/g) ?? []).length

  it("declares its layers: rest and hover eagerly, pressed and focus lazily, disabled as an alternative", () => {
    const f = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 }, lazy: ["focus", "pressed"] })
    expect(f.layers).toEqual(["rest", "hover", "pressed", "focus"])
    expect(f.lazyLayers).toEqual(["pressed", "focus"])
    expect(runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 } }).layers).toEqual(["rest", "hover"])
    expect(runRecipe(buttonRecipe, { ...req, params: { variant: "default", size: "default", disabled: true }, box: { w: 120, h: 36 } }).layers).toEqual(["disabled"])
  })

  it("every variant x size x tier x density draws sane markup (no NaN, only var(--ll-*) colours)", () => {
    for (const variant of buttonVariantList) {
      for (const size of buttonSizeList) {
        for (const density of ["comfortable", "compact", "calm"] as const) {
          for (const tier of ["lo", "hi"] as const) {
            const square = size.startsWith("icon")
            const f = runRecipe(buttonRecipe, { ...req, params: { variant, size }, box: square ? { w: 36, h: 36 } : { w: 96, h: 36 }, density, tier, lazy: ["focus"] })
            const all = Object.values(f.parts).join("")
            expect(all, `${variant}/${size}/${density}/${tier}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
            expect(all.length).toBeGreaterThan(50)
          }
        }
      }
    }
  })

  it("lo tier budget: a single visible state is at most 12 nodes and 8 KB (DESIGN must-fix 1)", () => {
    for (const variant of buttonVariantList) {
      const f = runRecipe(buttonRecipe, { ...req, params: { variant, size: "default" }, box: { w: 120, h: 36 } })
      const rest = f.parts.rest ?? ""
      expect(nodes(rest), variant).toBeLessThanOrEqual(12)
      expect(rest.length, variant).toBeLessThanOrEqual(8000)
    }
  })

  it("calm density draws no drop-lines and no fill offset", () => {
    const calm = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 }, density: "calm" })
    const comfy = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 } })
    expect(calm.parts.rest).not.toBe(comfy.parts.rest)
    expect(calm.parts.rest).toMatch(/data-part="fill" style="--mx:0;--my:0"/)
    expect(comfy.parts.rest).not.toMatch(/data-part="fill" style="--mx:0;--my:0"/)
    expect((calm.parts.hover ?? "").length).toBeLessThan((comfy.parts.hover ?? "").length + 1)
  })

  it("lazy layers are the same bytes whenever they are asked for, and never change the eager ones", () => {
    const eager = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 } })
    const a = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 }, lazy: ["focus", "pressed"] })
    const b = runRecipe(buttonRecipe, { ...req, box: { w: 120, h: 36 }, lazy: ["focus", "pressed"], lazyOnly: true })
    expect(b.parts.focus).toBe(a.parts.focus)
    expect(b.parts.pressed).toBe(a.parts.pressed)
    expect(Object.keys(b.parts).sort()).toEqual(["focus", "pressed"])
    expect(a.parts.rest).toBe(eager.parts.rest)
    expect(a.parts.hover).toBe(eager.parts.hover)
  })
})

describe("foundation polish (audit 4.1, 4.6, 4.8, 4.12, 4.13)", () => {
  const base = { seed: "polish", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }

  it("destructive is the tight red hatch over a red wash, and a crossing pencil pass appears on hover", () => {
    const d = runRecipe(buttonRecipe, { ...base, box: { w: 96, h: 36 }, params: { variant: "destructive", size: "default" }, density: "comfortable" })
    const plain = runRecipe(buttonRecipe, { ...base, box: { w: 96, h: 36 }, params: { variant: "default", size: "default" }, density: "comfortable" })
    expect(d.parts.rest).toContain("var(--ll-red)")
    expect((d.parts.hover ?? "").length).toBeGreaterThan((plain.parts.hover ?? "").length * 1.5)
  })

  it("destructive carries a paper halo for its label and glyph, gone when disabled", () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>)
    const cls = getByRole("button").className
    expect(cls).toContain("[text-shadow:0_0_2px_var(--ll-slip),0_0_4px_var(--ll-slip)]")
    expect(cls).toContain("[&_svg:not(.absolute)]:[filter:drop-shadow(0_0_2px_var(--ll-slip))]")
    expect(cls).toContain("disabled:[text-shadow:none]")
    const other = render(<Button variant="outline">Other</Button>).getByRole("button", { name: "Other" })
    expect(other.className).not.toContain("text-shadow")
  })

  it("sinks itself when pressed and says so, so the drawing does not sink twice", () => {
    const { getByRole } = render(<Button>Save</Button>)
    const b = getByRole("button")
    expect(b).toHaveAttribute("data-ink-sink", "self")
    expect(b.className).toContain("active:translate-y-(--ll-press-sink)")
    const css = readFileSync(resolve(__dirname, "../src/styles/looseleaf.css"), "utf8")
    expect(css).toMatch(/\[data-ink-sink="self"\]:is\(:active[^{]*> svg\[data-ink\] \[data-layer="rest"\] \{\s*translate: calc\(var\(--ll-press-sink\) \* 0\.6\) 0;/)
  })

  it("xs sizes hand the 12 px icon tier to an Icon inside; other sizes leave 16", () => {
    const px = (size: "xs" | "icon-xs" | "default") => {
      const { container, unmount } = render(
        <Button size={size}>
          <Icon name="plus" />
        </Button>,
      )
      const w = container.querySelector("svg[data-ink='icon']")!.getAttribute("width")
      unmount()
      return w
    }
    expect(px("xs")).toBe("12")
    expect(px("icon-xs")).toBe("12")
    expect(px("default")).toBe("1em")
    const { container } = render(
      <Button size="xs">
        <Icon name="plus" size={16} />
      </Button>,
    )
    expect(container.querySelector("svg[data-ink='icon']")).toHaveAttribute("width", "16")
  })

  it("calm is hairline: a lighter rest, one fill pass, and a hover that is a quiet second outline", () => {
    for (const variant of ["default", "destructive", "outline"] as const) {
      const calm = runRecipe(buttonRecipe, { ...base, box: { w: 120, h: 36 }, params: { variant, size: "default" }, density: "calm" })
      const comfy = runRecipe(buttonRecipe, { ...base, box: { w: 120, h: 36 }, params: { variant, size: "default" }, density: "comfortable" })
      expect(calm.parts.rest!.length, variant).toBeLessThan(comfy.parts.rest!.length)
      expect((calm.parts.hover ?? "").length, variant).toBeGreaterThan(200)
    }
  })

  it("a full-width button does not cost more as it gets wider: rules are one body layer above 360 px", () => {
    const at = (w: number, variant: "default" | "outline" = "default") => runRecipe(buttonRecipe, { ...base, box: { w, h: 36 }, params: { variant, size: "default" }, density: "comfortable" })
    const wide = at(1200)
    const mid = at(320)
    expect(wide.parts.rest!.length).toBeLessThan(mid.parts.rest!.length)
    expect(wide.parts.rest!.length + (wide.parts.hover ?? "").length).toBeLessThan(12_000)
    expect(at(1200, "outline").parts.rest!.length).toBeLessThan(4_000)
  })
})
