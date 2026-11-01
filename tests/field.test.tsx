import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { fieldErrorRecipe } from "@/lib/ink/recipes/field-error-ink"
import { fieldChoiceRecipe } from "@/lib/ink/recipes/field-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(160, 24)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const layers = (root: ParentNode) => Array.from(root.querySelectorAll(":scope > svg[data-ink] > g[data-layer]")).map((g) => g.getAttribute("data-layer"))

describe("Field parts", () => {
  it("renders every part with upstream's data-slot and element", () => {
    const { container } = renderUI(
      <FieldSet>
        <FieldLegend>Legend</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="x">Name</FieldLabel>
            <Input id="x" />
            <FieldDescription>Help</FieldDescription>
            <FieldError>Bad</FieldError>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Title</FieldTitle>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>,
    )
    const q = (s: string) => container.querySelector(`[data-slot="${s}"]`) as HTMLElement
    expect(q("field-set").tagName).toBe("FIELDSET")
    expect(q("field-legend").tagName).toBe("LEGEND")
    expect(q("field-legend")).toHaveAttribute("data-variant", "legend")
    expect(q("field-group")).toHaveClass("@container/field-group")
    expect(q("field")).toHaveAttribute("role", "group")
    expect(q("field")).toHaveAttribute("data-orientation", "vertical")
    expect(q("field-label").tagName).toBe("LABEL")
    expect(q("field-description").tagName).toBe("P")
    expect(q("field-error")).toHaveAttribute("role", "alert")
    expect(q("field-separator")).toHaveAttribute("data-content", "false")
    expect(q("field-content")).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="field"]')[1]).toHaveAttribute("data-orientation", "horizontal")
  })

  it("orientation sets the layout classes; responsive uses the group's container query", () => {
    const { container } = renderUI(
      <FieldGroup>
        <Field orientation="vertical" />
        <Field orientation="horizontal" />
        <Field orientation="responsive" />
      </FieldGroup>,
    )
    const [v, h, r] = Array.from(container.querySelectorAll('[data-slot="field"]'))
    expect(v).toHaveClass("flex-col")
    expect(h).toHaveClass("flex-row", "items-center")
    expect(r.className).toContain("@md/field-group:flex-row")
  })

  it("FieldLegend has the label variant, and data-invalid reddens the words", () => {
    const { container } = renderUI(
      <>
        <FieldLegend variant="label">L</FieldLegend>
        <Field data-invalid="true" />
      </>,
    )
    expect(container.querySelector("legend")).toHaveAttribute("data-variant", "label")
    expect(container.querySelector('[data-slot="field"]')!.className).toContain("data-[invalid=true]:text-destructive")
  })

  it("FieldSeparator with children is a labeled divider built on the pencil Separator", () => {
    const { container } = renderUI(<FieldSeparator>or</FieldSeparator>)
    const s = container.querySelector('[data-slot="field-separator"]') as HTMLElement
    expect(s).toHaveAttribute("data-content", "true")
    expect(s.querySelector('[data-slot="separator-label"]')).toHaveTextContent("or")
    expect(s.querySelectorAll('[data-slot="separator-line"]')).toHaveLength(2)
  })
})

describe("FieldLabel", () => {
  it("is a plain label, with no drawing, around a control", () => {
    const { container, getByLabelText } = renderUI(
      <Field>
        <FieldLabel htmlFor="a">Name</FieldLabel>
        <Input id="a" />
      </Field>,
    )
    const l = container.querySelector('[data-slot="field-label"]') as HTMLElement
    expect(l).not.toHaveAttribute("data-ink-host")
    expect(l.querySelector("svg")).toBeNull()
    expect(getByLabelText("Name")).toBeTruthy()
  })

  it("becomes a drawn choice card when it wraps a whole Field", () => {
    const { container } = renderUI(
      <RadioGroup aria-label="Plan" defaultValue="b">
        <FieldLabel htmlFor="ra">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Starter</FieldTitle>
            </FieldContent>
            <RadioGroupItem value="a" id="ra" />
          </Field>
        </FieldLabel>
        <FieldLabel htmlFor="rb">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Studio</FieldTitle>
            </FieldContent>
            <RadioGroupItem value="b" id="rb" />
          </Field>
        </FieldLabel>
      </RadioGroup>,
    )
    const cards = Array.from(container.querySelectorAll("label[data-slot=field-label]")) as HTMLElement[]
    expect(cards).toHaveLength(2)
    for (const c of cards) {
      expect(c).toHaveAttribute("data-ink-host")
      expect(c).toHaveAttribute("data-ink-ready")
      expectInkLayers(c, { min: 1, kinds: ["card", "radio"], layers: ["rest", "hover", "checked"] })
      expect(layers(c)).toEqual(["rest", "checked", "hover"])
      expect(c.className).toContain("has-data-[state=checked]:[&>svg>[data-layer=checked]]:visible")
      expect(c.className).toContain("has-[>[data-slot=field]]:w-full")
    }
  })

  it("the Field inside a card is presentational, so the label still names its control", () => {
    const { container, getByRole } = renderUI(
      <FieldLabel htmlFor="pn">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Named by this</FieldTitle>
          </FieldContent>
          <Checkbox id="pn" />
        </Field>
      </FieldLabel>,
    )
    expect(container.querySelector("label [data-slot=field]")).toHaveAttribute("role", "none")
    expect(getByRole("checkbox", { name: "Named by this" })).toBeTruthy()
  })

  it("`card` forces the drawing on or off", () => {
    const a = renderUI(<FieldLabel card>hi</FieldLabel>)
    expect(a.container.querySelector("label")).toHaveAttribute("data-ink-host")
    a.unmount()
    const b = renderUI(
      <FieldLabel card={false}>
        <Field />
      </FieldLabel>,
    )
    expect(b.container.querySelector("label")).not.toHaveAttribute("data-ink-host")
  })

  it("a click on a card checks the control inside it", async () => {
    const { getByRole, container, user } = renderUI(
      <FieldLabel htmlFor="cb">
        <Field orientation="horizontal">
          <Checkbox id="cb" />
          <FieldContent>
            <FieldTitle>News</FieldTitle>
          </FieldContent>
        </Field>
      </FieldLabel>,
    )
    await user.click(container.querySelector("label") as HTMLElement)
    expect(getByRole("checkbox")).toHaveAttribute("data-state", "checked")
  })
})

describe("FieldError", () => {
  it("shows children, and nothing when there is nothing to say", () => {
    const a = renderUI(<FieldError>Enter an address.</FieldError>)
    expect(a.getByRole("alert")).toHaveTextContent("Enter an address.")
    a.unmount()
    const b = renderUI(<FieldError />)
    expect(b.container.querySelector('[data-slot="field-error"]')).toBeNull()
    const c = renderUI(<FieldError errors={[]} />)
    expect(c.container.querySelector('[data-slot="field-error"]')).toBeNull()
  })

  it("one error is text, several are a list, duplicates collapse", () => {
    const one = renderUI(<FieldError errors={[{ message: "Too short" }]} />)
    expect(one.getByRole("alert")).toHaveTextContent("Too short")
    expect(one.container.querySelector("ul")).toBeNull()
    one.unmount()
    const many = renderUI(<FieldError errors={[{ message: "Too short" }, { message: "Add a number" }, { message: "Too short" }, undefined]} />)
    expect(many.container.querySelectorAll("li")).toHaveLength(2)
  })

  it("wears a wavy underline drawn by a host of its own, and stays as wide as its words", () => {
    const { getByRole } = renderUI(<FieldError>Bad</FieldError>)
    const e = getByRole("alert")
    expect(e).toHaveAttribute("data-ink-host")
    expect(e).toHaveAttribute("data-ink-ready")
    expect(e).toHaveClass("w-fit", "text-destructive")
    expectInkLayers(e, { min: 1, kinds: ["underline"], absolute: true, layers: ["rest"] })
    expect(layers(e)).toEqual(["rest"])
    expect(e.querySelector("svg")!.innerHTML).toContain("var(--ll-red)")
  })

  it("passes ids and refs through (aria-describedby targets)", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { getByRole } = renderUI(
      <FieldError id="err" ref={ref}>
        Bad
      </FieldError>,
    )
    expect(getByRole("alert")).toHaveAttribute("id", "err")
    expect(ref.current).toBe(getByRole("alert"))
  })
})

describe("Field accessibility, server and hydration", () => {
  it("has no axe violations in a full form", async () => {
    const { container } = renderUI(
      <form>
        <FieldSet>
          <FieldLegend>Account</FieldLegend>
          <FieldGroup>
            <Field data-invalid="true">
              <FieldLabel htmlFor="e">Email</FieldLabel>
              <Input id="e" aria-invalid aria-describedby="e-err" />
              <FieldDescription>Help</FieldDescription>
              <FieldError id="e-err">Bad</FieldError>
            </Field>
            <FieldSeparator>or</FieldSeparator>
            <RadioGroup aria-label="Plan">
              <FieldLabel htmlFor="p1">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Starter</FieldTitle>
                    <FieldDescription>One</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="1" id="p1" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldGroup>
        </FieldSet>
      </form>,
    )
    await axeCheck(container)
  })

  it("renders deterministically on the server and hydrates without warnings, bare and inside the provider", () => {
    const tree = () => (
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="h">Name</FieldLabel>
          <Input id="h" />
          <FieldError>Bad</FieldError>
        </Field>
        <FieldLabel htmlFor="k">
          <Field orientation="horizontal">
            <Checkbox id="k" />
            <FieldContent>
              <FieldTitle>News</FieldTitle>
            </FieldContent>
          </Field>
        </FieldLabel>
      </FieldGroup>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="field-error"')
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
      expect(container.querySelector("[data-slot=field-error] > svg[data-ink]")).toBeTruthy()
      act(() => root?.unmount())
      container.remove()
    }
  })
})

describe("field recipes", () => {
  const req = { seed: "f", tier: "lo" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const nodes = (s: string) => (s.match(/<(?:path|g|use|clipPath|defs|mask)\b/g) ?? []).length
  const run = <P,>(recipe: Parameters<typeof runRecipe<P>>[0], w: number, h: number, extra: object = {}) =>
    runRecipe(recipe, { ...req, params: {} as P, box: { w, h }, density: "comfortable", ...extra })

  it("declare their layers", () => {
    expect(run(fieldErrorRecipe, 120, 24).layers).toEqual(["rest"])
    expect(run(fieldChoiceRecipe, 320, 64).layers).toEqual(["rest", "checked", "hover"])
  })

  it("lo tier budget: the underline and each card layer stay within 12 nodes and 8 KB", () => {
    for (const w of [40, 160, 320, 600]) {
      const u = run(fieldErrorRecipe, w, 24).parts.rest ?? ""
      expect(nodes(u), `underline ${w}`).toBeLessThanOrEqual(12)
      expect(u.length, `underline ${w}`).toBeLessThanOrEqual(8000)
    }
    for (const [w, h] of [[200, 56], [320, 64], [420, 96]]) {
      const f = run(fieldChoiceRecipe, w, h)
      for (const k of ["rest", "hover", "checked"] as const) {
        expect(nodes(f.parts[k] ?? ""), `${w}x${h}/${k}`).toBeLessThanOrEqual(12)
        expect((f.parts[k] ?? "").length, `${w}x${h}/${k}`).toBeLessThanOrEqual(8000)
      }
    }
  })

  it("draw sane markup at every size, density and tier", () => {
    for (const density of ["comfortable", "compact", "calm"] as const) {
      for (const tier of ["lo", "hi"] as const) {
        for (const [w, h] of [[30, 20], [200, 24], [500, 60]]) {
          for (const r of [fieldErrorRecipe, fieldChoiceRecipe] as const) {
            const f = run(r as never, w, h, { density, tier })
            expect(Object.values(f.parts).join(""), `${density}/${tier}/${w}x${h}`).not.toMatch(/NaN|undefined|Infinity|#[0-9a-f]{3,8}\b/i)
          }
        }
      }
    }
  })
})
