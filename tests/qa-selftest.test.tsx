import * as React from "react"
import { describe, expect, test } from "vitest"

import { discover } from "./_glob"
import { hydrationProblems } from "./_hydrate-lib"
import { checkMarkup, checkSource, formatProblems, smokeExample, smokeRender, smokeUiModule, withServerGlobals, type Problem } from "./_ssr-lib"
import { AxeViolationError, INK_LAYER_NAMES, axeCheck, expectInkLayers, getInkLayers, inkLayerNames, renderUI } from "./helpers"

const checks = (problems: Problem[]) => problems.map((p) => p.check)
const render = (Component: React.ComponentType) => smokeRender(() => React.createElement(Component))

const goodUi = discover(
  import.meta.glob<Record<string, unknown>>("/tools/fixtures/good/src/components/ui/fake-{card,panel}.tsx"),
  import.meta.glob<string>("/tools/fixtures/good/src/components/ui/fake-{card,panel}.tsx", { query: "?raw", import: "default" })
)
const badUi = discover(
  import.meta.glob<Record<string, unknown>>("/tools/fixtures/bad/src/components/ui/bad-*.tsx"),
  import.meta.glob<string>("/tools/fixtures/bad/src/components/ui/bad-*.tsx", { query: "?raw", import: "default" })
)
const badExamples = discover(
  import.meta.glob<Record<string, unknown>>("/tools/fixtures/bad/src/docs/examples/**/*.tsx"),
  import.meta.glob<string>("/tools/fixtures/bad/src/docs/examples/**/*.tsx", { query: "?raw", import: "default" })
)
const ssrExamples = discover(
  import.meta.glob<Record<string, unknown>>("/tools/fixtures/ssr/examples/*.tsx"),
  import.meta.glob<string>("/tools/fixtures/ssr/examples/*.tsx", { query: "?raw", import: "default" })
)
const pick = (list: typeof badUi, name: string) => {
  const hit = list.find((d) => d.path.endsWith(`/${name}`))
  if (!hit) throw new Error(`fixture ${name} not found`)
  return hit
}

describe("discovery", () => {
  test("helper files (_name) are not examples and order is stable", () => {
    const load = async () => ({})
    const found = discover({ "/x/b.tsx": load, "/x/_shared.tsx": load, "/x/a.tsx": load }, {})
    expect(found.map((f) => f.path)).toEqual(["/x/a.tsx", "/x/b.tsx"])
  })
})

describe("checkMarkup", () => {
  test.each([
    ['<path d="M 0 NaN L 4 4"></path>', "NaN in path data"],
    ['<div style="width:undefinedpx"></div>', "undefinedpx in style"],
    ['<svg viewBox="0 0 Infinity 4"></svg>', "Infinity in viewBox"],
    ['<svg points="-Infinity,3"></svg>', "-Infinity in points"],
    ['<div class="bg-undefined"></div>', "undefined in a class"],
    ['<div title="[object Object]"></div>', "[object Object] in an attribute"],
    ["<p>width is NaN%</p>", "NaN% in text"],
    ["<p>[object Object]</p>", "[object Object] in text"],
    ["<p>undefined</p>", "a text node that is exactly undefined"],
    ["<style>.a{width:NaNpx}</style><p>x</p>", "NaN inside a <style> body"],
  ])("catches %s (%s)", (markup) => {
    expect(checks(checkMarkup(markup))).toContain("leaked-value")
  })

  test("does not fire on look-alikes or ordinary prose", () => {
    const ok = [
      '<path d="M 0 0 L 4 4" data-name="banana"></path>',
      '<div class="w-[calc(100%-2rem)]" aria-label="Undefined behavior is fun"></div>',
      "<p>Handling undefined values, NaN checks and Infinity in prose is fine.</p>",
      '<p data-x="unDefined NaNa"></p>',
    ]
    for (const markup of ok) expect(checkMarkup(markup)).toEqual([])
  })

  test("ink layers must be aria-hidden with a kind", () => {
    expect(checks(checkMarkup('<svg data-ink="underline" focusable="false"></svg>'))).toEqual(["ink-aria-hidden"])
    expect(checks(checkMarkup('<svg data-ink="underline" aria-hidden="false" focusable="false"></svg>'))).toEqual(["ink-aria-hidden"])
    expect(checks(checkMarkup('<svg data-ink="" aria-hidden="true"></svg>'))).toEqual(["ink-kind"])
    expect(checks(checkMarkup('<svg data-ink="true" aria-hidden="true"></svg>'))).toEqual(["ink-kind"])
    expect(checkMarkup('<svg data-ink="underline" aria-hidden="true" focusable="false"></svg><span>x</span>')).toEqual([])
  })

  test("an ink svg root carries focusable=false (CONTRACT ink-layer conventions)", () => {
    expect(checks(checkMarkup('<svg data-ink="icon" aria-hidden="true"></svg>'))).toEqual(["ink-focusable"])
    expect(checks(checkMarkup('<svg data-ink="icon" aria-hidden="true" focusable="true"></svg>'))).toEqual(["ink-focusable"])
    expect(checkMarkup('<svg data-ink="icon" aria-hidden="true" focusable="false"></svg>')).toEqual([])
  })

  test("named intrinsic art (role=img + a name) replaces aria-hidden; overlay ink never does", () => {
    expect(checkMarkup('<svg data-ink="icon" role="img" aria-label="Done" focusable="false"></svg>')).toEqual([])
    expect(checkMarkup('<svg data-ink="prop" aria-hidden="true" focusable="false"></svg>')).toEqual([])
    expect(checks(checkMarkup('<svg data-ink="icon" role="img" focusable="false"></svg>'))).toEqual(["ink-aria-hidden"])
    expect(checks(checkMarkup('<div data-ink-host=""><svg data-ink="box" role="img" aria-label="Box" focusable="false"></svg></div>'))).toEqual(["ink-aria-hidden"])
  })

  test("overlay ink sits directly in a host marked data-ink-host; intrinsic art needs no host", () => {
    const svg = '<svg data-ink="button" aria-hidden="true" focusable="false"><g data-layer="rest"></g></svg>'
    expect(checkMarkup(`<button data-ink-host="">${svg}Save</button>`)).toEqual([])
    expect(checks(checkMarkup(`<button>${svg}Save</button>`))).toEqual(["ink-host"])
    expect(checks(checkMarkup(`<div data-ink-host=""><span>${svg}</span></div>`))).toEqual(["ink-host"])
    expect(checkMarkup('<span><svg data-ink="sticker" aria-hidden="true" focusable="false"></svg></span>')).toEqual([])
    expect(checkMarkup('<div data-ink-host=""><input/><svg data-ink="fill" aria-hidden="true" focusable="false"></svg></div>')).toEqual([])
  })

  test("state layers: one of the ten names, once per svg, only inside ink", () => {
    const wrap = (inner: string) => `<div data-ink-host=""><svg data-ink="box" aria-hidden="true" focusable="false">${inner}</svg></div>`
    const ten = ["rest", "hover", "pressed", "focus", "disabled", "invalid", "checked", "indeterminate", "open", "busy"]
    expect(checkMarkup(wrap(ten.map((n) => `<g data-layer="${n}"><path d="M0 0"></path></g>`).join("")))).toEqual([])
    expect(checks(checkMarkup(wrap('<g data-layer="hovr"></g>')))).toEqual(["ink-layer-name"])
    expect(checks(checkMarkup(wrap('<g data-layer="rest"></g><g data-layer="rest"></g>')))).toEqual(["ink-layer-name"])
    expect(checks(checkMarkup('<div><g data-layer="rest"></g></div>'))).toEqual(["ink-layer-name"])
    expect(checkMarkup(`${wrap('<g data-layer="rest"></g>')}${wrap('<g data-layer="rest"></g>')}`)).toEqual([])
  })

  test("duplicate ids and empty output", () => {
    expect(checks(checkMarkup('<i id="a"></i><b id="a"></b>'))).toEqual(["duplicate-id"])
    expect(checks(checkMarkup("  "))).toEqual(["empty"])
    expect(checkMarkup("", { allowEmpty: true })).toEqual([])
  })

  test("checkSource flags lucide-react in every import shape", () => {
    for (const src of ['import { Check } from "lucide-react"', "import Icon from 'lucide-react/dist/esm/icons/x'", 'import { X } from "@lucide/react"', 'const m = require("lucide-react")']) {
      expect(checks(checkSource(src))).toEqual(["lucide"])
    }
    expect(checkSource('import { Slot } from "radix-ui"\n// mention lucide in a comment')).toEqual([])
  })
})

describe("smokeRender", () => {
  test("good: seeded art and useId are identical across renders", () => {
    function seeded(seed: string) {
      let h = 2166136261
      for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
      return (h >>> 0) / 4294967296
    }
    function GoodInk() {
      const id = React.useId()
      const x = Math.round(seeded(id) * 100)
      return (
        <div data-ink-host="">
          <svg data-ink="border" aria-hidden="true" focusable="false" viewBox="0 0 100 20">
            <path d={`M 0 ${x} L 100 ${x}`} />
          </svg>
          <label htmlFor={id}>Name</label>
          <input id={id} />
        </div>
      )
    }
    const { problems, markup } = render(GoodInk)
    expect(problems).toEqual([])
    expect(markup).toContain('data-ink="border"')
  })

  test("bad: NaN path data", () => {
    const Bad = () => (
      <svg data-ink="icon" aria-hidden="true" focusable="false">
        <path d={`M 0 ${Math.sqrt(-1)}`} />
      </svg>
    )
    expect(checks(render(Bad).problems)).toEqual(["leaked-value"])
  })

  test("bad: undefined leaks into an attribute", () => {
    const Bad = () => <div data-seed={String(undefined)} />
    expect(checks(render(Bad).problems)).toContain("leaked-value")
  })

  test("bad: Infinity in a computed size", () => {
    const Bad = () => <div style={{ width: `${1 / 0}px` }} />
    expect(checks(render(Bad).problems)).toContain("leaked-value")
  })

  test("bad: an object stringified into a class", () => {
    const Bad = () => <div className={`a ${{ toString: () => "[object Object]" }}`} />
    expect(checks(render(Bad).problems)).toContain("leaked-value")
  })

  test("bad: ink layer without aria-hidden", () => {
    const Bad = () => <svg data-ink="scribble" focusable="false" viewBox="0 0 4 4" />
    expect(checks(render(Bad).problems)).toEqual(["ink-aria-hidden"])
  })

  test("bad: Math.random in render is not deterministic", () => {
    const Bad = () => <span>{Math.random()}</span>
    expect(checks(render(Bad).problems)).toEqual(["deterministic"])
  })

  test("bad: a module-level counter is not deterministic (the classic non-useId id)", () => {
    let counter = 0
    const Bad = () => <input id={`field-${++counter}`} />
    expect(checks(render(Bad).problems)).toEqual(["deterministic"])
  })

  test("bad: throwing components are reported, not thrown", () => {
    const Bad = () => {
      throw new Error("boom")
    }
    const { problems, markup } = render(Bad)
    expect(markup).toBeNull()
    expect(problems[0].check).toBe("render")
    expect(problems[0].message).toContain("boom")
  })
})

describe("server globals", () => {
  test("window/document are hidden while importing and rendering, then restored", async () => {
    expect(typeof window).toBe("object")
    await withServerGlobals(() => {
      expect(typeof window).toBe("undefined")
      expect(typeof document).toBe("undefined")
    })
    expect(typeof window).toBe("object")
    expect(typeof document).toBe("object")
  })

  test("a component that reads window during render fails the smoke render; a typeof guard passes", async () => {
    const Unsafe = () => <span>{window.innerWidth}</span>
    const Guarded = () => <span>{typeof window === "undefined" ? "server" : "client"}</span>
    const unsafe = await withServerGlobals(() => render(Unsafe))
    expect(unsafe.problems[0]?.check).toBe("render")
    const guarded = await withServerGlobals(() => render(Guarded))
    expect(guarded.problems).toEqual([])
    expect(guarded.markup).toContain("server")
  })
})

describe("fixture files", () => {
  test("good ui fixtures import, have named exports, and render cleanly", async () => {
    expect(goodUi.length).toBe(2)
    for (const item of goodUi) {
      const result = await smokeUiModule(item)
      expect(result.problems, formatProblems(result.problems)).toEqual([])
      expect(result.rendered.length).toBeGreaterThan(0)
    }
  })

  test("module-scope window access fails the import (bad-ssr.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-ssr.tsx"))
    expect(checks(problems)).toEqual(["import"])
    expect(problems[0].message).toMatch(/window|document/)
  })

  test("default export in a ui file (bad-default.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-default.tsx"))
    expect(checks(problems)).toContain("default-export")
  })

  test("ink layer without aria-hidden (bad-ink.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-ink.tsx"))
    expect(checks(problems)).toEqual(expect.arrayContaining(["ink-aria-hidden", "ink-kind"]))
  })

  test("Math.random / Date.now in render (bad-random.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-random.tsx"))
    expect(checks(problems)).toContain("deterministic")
  })

  test("lucide import is caught from source and never imported (bad-imports.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-imports.tsx"))
    expect(checks(problems)).toEqual(["lucide"])
  })

  test("a syntax error is an import problem, not a crash (bad-parse.tsx)", async () => {
    const { problems } = await smokeUiModule(pick(badUi, "bad-parse.tsx"))
    expect(checks(problems)).toEqual(["import"])
  })

  test("an example importing lucide-react is caught from source (oops.tsx)", async () => {
    const problems = await smokeExample(pick(badExamples, "oops.tsx"))
    expect(checks(problems)).toEqual(["lucide"])
  })

  test("example fixtures: the good one is clean, each bad one trips its own check", async () => {
    expect(await smokeExample(pick(ssrExamples, "good-01-card.tsx"))).toEqual([])
    expect(checks(await smokeExample(pick(ssrExamples, "bad-no-meta.tsx")))).toEqual(["meta"])
    expect(checks(await smokeExample(pick(ssrExamples, "bad-no-default.tsx")))).toEqual(["export"])
    expect(checks(await smokeExample(pick(ssrExamples, "bad-nan.tsx")))).toEqual(["leaked-value"])
    expect(checks(await smokeExample(pick(ssrExamples, "bad-empty.tsx")))).toEqual(["empty"])
  })
})

describe("helpers: renderUI + axeCheck", () => {
  test("renderUI returns a working user-event instance", async () => {
    function Counter() {
      const [n, setN] = React.useState(0)
      return <button onClick={() => setN(n + 1)}>clicked {n}</button>
    }
    const { user, getByRole } = renderUI(<Counter />)
    await user.click(getByRole("button"))
    expect(getByRole("button")).toHaveTextContent("clicked 1")
  })

  test("axeCheck passes an accessible control", async () => {
    const { container } = renderUI(
      <form>
        <label htmlFor="n">Name</label>
        <input id="n" />
        <button type="submit">Save</button>
      </form>
    )
    await axeCheck(container)
  })

  test("axeCheck throws a readable list of violations", async () => {
    const { container } = renderUI(
      <div>
        <button type="button" />
        <img src="x.png" />
        <input />
      </div>
    )
    const error = await axeCheck(container).then(
      () => null,
      (e: unknown) => e
    )
    expect(error).toBeInstanceOf(AxeViolationError)
    const message = (error as AxeViolationError).message
    expect(message).toMatch(/axe found \d+ accessibility violations?/)
    expect(message).toContain("button-name")
    expect(message).toContain("image-alt")
    expect(message).toContain("label")
    expect(message).toContain("target:")
  })

  test("layout-dependent rules are off in jsdom (color contrast, region)", async () => {
    const { container } = renderUI(<p style={{ color: "#fefefe", background: "#ffffff" }}>faint but this is a token-level concern</p>)
    await axeCheck(container)
  })

  test("only / rules options narrow the run", async () => {
    const { container } = renderUI(<button type="button" />)
    await axeCheck(container, { only: ["image-alt"] })
    await axeCheck(container, { rules: { "button-name": { enabled: false } } })
  })
})

describe("helpers: expectInkLayers", () => {
  const svgProps = { "aria-hidden": true, focusable: "false" } as const

  test("accepts decorative ink layers on a marked host", () => {
    const { container } = renderUI(
      <button className="relative [&_svg]:pointer-events-none" data-ink-host="">
        <svg data-ink="border" {...svgProps} className="absolute inset-0" />
        Save
        <span className="pointer-events-none absolute inset-0" data-ink-host="">
          <svg data-ink="underline" {...svgProps} />
        </span>
      </button>
    )
    expect(getInkLayers(container)).toHaveLength(2)
    const layers = expectInkLayers(container, { min: 2, kinds: ["border", "underline"] })
    expect(layers.map((l) => l.dataset.ink)).toEqual(["border", "underline"])
    expectInkLayers(container, { absolute: true })
  })

  test("accepts inline style pointer-events", () => {
    const { container } = renderUI(<svg data-ink="icon" {...svgProps} style={{ pointerEvents: "none" }} />)
    expectInkLayers(container, { min: 1 })
  })

  test("reports every problem at once", () => {
    const { container } = renderUI(
      <div>
        <svg data-ink="border" />
        <svg data-ink="" aria-hidden="true" className="pointer-events-none" />
        <svg data-ink="hit" aria-hidden="true" className="pointer-events-none">
          <a href="#x">link</a>
        </svg>
      </div>
    )
    let message = ""
    try {
      expectInkLayers(container)
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toContain("not aria-hidden")
    expect(message).toContain("no pointer-events-none")
    expect(message).toContain("must name a kind")
    expect(message).toContain("focusable")
    expect(message).toContain('carries focusable="false"')
    expect(message).toContain("data-ink-host")
  })

  test("min and unexpected kinds fail", () => {
    const { container } = renderUI(
      <div data-ink-host="">
        <svg data-ink="border" {...svgProps} className="pointer-events-none" />
      </div>
    )
    expect(() => expectInkLayers(container, { min: 2 })).toThrow(/at least 2/)
    expect(() => expectInkLayers(container, { kinds: ["underline"] })).toThrow(/not one of/)
    expect(() => expectInkLayers(container, { absolute: true })).toThrow(/absolutely positioned/)
  })

  test("overlay ink needs a host; intrinsic art does not; host: false opts out", () => {
    const { container } = renderUI(
      <div>
        <svg data-ink="box" {...svgProps} className="pointer-events-none" />
      </div>
    )
    expect(() => expectInkLayers(container)).toThrow(/direct child of a host marked data-ink-host \(parent: <div>\)/)
    expectInkLayers(container, { host: false })
    const icon = renderUI(
      <span>
        <svg data-ink="icon" {...svgProps} className="pointer-events-none" />
      </span>
    )
    expectInkLayers(icon.container, { min: 1, intrinsic: true })
    expect(() => expectInkLayers(icon.container, { intrinsic: false })).toThrow(/expected overlay ink/)
    const nested = renderUI(
      <div data-ink-host="">
        <span>
          <svg data-ink="box" {...svgProps} className="pointer-events-none" />
        </span>
      </div>
    )
    expect(() => expectInkLayers(nested.container)).toThrow(/parent: <span>/)
  })

  test("data-ink-ready is checked on request (jsdom never measures unless the test mocks a size)", () => {
    const layer = (ready: boolean) => (
      <div data-ink-host="" {...(ready ? { "data-ink-ready": "" } : {})}>
        <svg data-ink="box" {...svgProps} className="pointer-events-none" />
      </div>
    )
    expectInkLayers(renderUI(layer(true)).container, { ready: true })
    expectInkLayers(renderUI(layer(false)).container, { ready: false })
    expect(() => expectInkLayers(renderUI(layer(false)).container, { ready: true })).toThrow(/is not marked data-ink-ready/)
    expect(() => expectInkLayers(renderUI(layer(true)).container, { ready: false })).toThrow(/already marked data-ink-ready/)
    expectInkLayers(renderUI(layer(false)).container)
  })

  test("state layers: all ten names are known, others are rejected", () => {
    const ten = ["rest", "hover", "pressed", "focus", "disabled", "invalid", "checked", "indeterminate", "open", "busy"]
    const { container } = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" {...svgProps} className="pointer-events-none">
          {ten.map((name) => (
            <g key={name} data-layer={name} />
          ))}
        </svg>
      </div>
    )
    expectInkLayers(container, { layers: ["rest", "hover", "pressed", "focus", "indeterminate", "open", "busy"] })
    expect(inkLayerNames(container)).toHaveLength(10)
    expect([...INK_LAYER_NAMES].sort()).toEqual([...ten].sort())
    const bad = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" {...svgProps} className="pointer-events-none">
          <g data-layer="hovered" />
        </svg>
      </div>
    )
    expect(() => expectInkLayers(bad.container)).toThrow(/data-layer="hovered" is not one of rest, disabled, invalid/)
  })

  test("state layers: duplicates and nesting are caught; layers / onlyLayers assert what is drawn", () => {
    const dup = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" {...svgProps} className="pointer-events-none">
          <g data-layer="rest" />
          <g data-layer="rest" />
        </svg>
      </div>
    )
    expect(() => expectInkLayers(dup.container)).toThrow(/data-layer="rest" appears twice in one svg/)
    const nested = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" {...svgProps} className="pointer-events-none">
          <g data-layer="rest">
            <g data-layer="hover" />
          </g>
        </svg>
      </div>
    )
    expect(() => expectInkLayers(nested.container)).toThrow(/data-layer="hover" is nested inside another state layer/)
    const one = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" {...svgProps} className="pointer-events-none">
          <g data-layer="disabled" />
        </svg>
      </div>
    )
    expectInkLayers(one.container, { onlyLayers: ["disabled"] })
    expectInkLayers(one.container, { layers: ["disabled"] })
    expect(() => expectInkLayers(one.container, { layers: ["rest", "focus"] })).toThrow(/state layers not drawn: rest, focus \(drawn: disabled\)/)
    expect(() => expectInkLayers(one.container, { onlyLayers: ["rest"] })).toThrow(/expected exactly the state layers rest; unexpected: disabled; missing: rest/)
  })

  test("named intrinsic art may be role=img + aria-label instead of aria-hidden", () => {
    const named = renderUI(
      <span>
        <svg data-ink="icon" role="img" aria-label="Done" focusable="false" className="pointer-events-none" />
      </span>
    )
    expectInkLayers(named.container, { min: 1, intrinsic: true })
    const unnamed = renderUI(
      <span>
        <svg data-ink="icon" role="img" focusable="false" className="pointer-events-none" />
      </span>
    )
    expect(() => expectInkLayers(unnamed.container)).toThrow(/not aria-hidden/)
    const overlay = renderUI(
      <div data-ink-host="">
        <svg data-ink="box" role="img" aria-label="Box" focusable="false" className="pointer-events-none" />
      </div>
    )
    expect(() => expectInkLayers(overlay.container)).toThrow(/not aria-hidden/)
  })

  test("intrinsic art has no state layers", () => {
    const { container } = renderUI(
      <span>
        <svg data-ink="sticker" {...svgProps} className="pointer-events-none">
          <g data-layer="rest" />
        </svg>
      </span>
    )
    expect(() => expectInkLayers(container)).toThrow(/intrinsic art has no state layers/)
  })
})

describe("hydrationProblems", () => {
  const load = (Component: React.ComponentType) => async () => ({ default: Component })

  test("good: useId-seeded markup hydrates cleanly", async () => {
    function Good() {
      const id = React.useId()
      const [open, setOpen] = React.useState(false)
      return (
        <div>
          <button aria-controls={id} aria-expanded={open} onClick={() => setOpen(!open)}>
            More
          </button>
          <div id={id} hidden={!open} />
          <svg data-ink="icon" aria-hidden="true" focusable="false">
            <path d="M0 0 L4 4" />
          </svg>
        </div>
      )
    }
    expect(await hydrationProblems(load(Good))).toEqual([])
  })

  test("bad: a typeof-window render branch mismatches", async () => {
    const Bad = () => (typeof window === "undefined" ? <span className="server">hi</span> : <b className="client">hi</b>)
    const problems = await hydrationProblems(load(Bad))
    expect(problems.length).toBeGreaterThan(0)
    expect(checks(problems)).toContain("hydration-mismatch")
  })

  test("bad: a random value in render mismatches", async () => {
    const Bad = () => <span data-seed={Math.random()}>x</span>
    const problems = await hydrationProblems(load(Bad))
    expect(checks(problems)).toContain("hydration-mismatch")
  })

  test("bad: React warnings printed while rendering are findings (missing keys)", async () => {
    const BadKeys = () => (
      <ul>
        {["a", "b"].map((x) => (
          <li>{x}</li>
        ))}
      </ul>
    )
    const problems = await hydrationProblems(load(BadKeys))
    expect(checks(problems)).toContain("console-error")
    expect(problems.map((p) => p.message).join("\n")).toMatch(/unique "key" prop/)
  })

  test("bad: invalid DOM nesting is reported as a hydration problem", async () => {
    const BadNesting = () => (
      <p>
        <div>block in a paragraph</div>
      </p>
    )
    const problems = await hydrationProblems(load(BadNesting))
    expect(problems.length).toBeGreaterThan(0)
  })

  test("good: the same example also hydrates inside <InkProvider> when the library has one", async () => {
    function Plain() {
      const id = React.useId()
      return <label htmlFor={id}>Name<input id={id} /></label>
    }
    expect(await hydrationProblems(load(Plain))).toEqual([])
  })

  test("bad: a component that throws on the server is reported", async () => {
    const Bad = () => {
      throw new Error("server boom")
    }
    expect(checks(await hydrationProblems(load(Bad)))).toEqual(["hydrate-server"])
  })
})
