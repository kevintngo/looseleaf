import * as React from "react"
import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { examples, smokeSlug } from "./_glob"
import { expectInkLayers, mockBox } from "./helpers"

const BAD = /NaN|Infinity|undefined|\[object/
const MODES = [
  { name: "120x36", box: [120, 36] as const, density: undefined, dir: "ltr", strict: false },
  { name: "16x16", box: [16, 16] as const, density: undefined, dir: "ltr", strict: false },
  { name: "320x200 strict", box: [320, 200] as const, density: undefined, dir: "ltr", strict: true },
  { name: "44x24 calm rtl", box: [44, 24] as const, density: "calm" as const, dir: "rtl", strict: false },
]

function problemsOf(container: HTMLElement): string[] {
  const out: string[] = []
  for (const svg of document.querySelectorAll("svg[data-ink]")) {
    const html = svg.outerHTML
    const bad = BAD.exec(html)
    if (bad) out.push(`<svg data-ink="${svg.getAttribute("data-ink")}"> contains "${bad[0]}": …${html.slice(Math.max(0, bad.index - 40), bad.index + 40)}…`)
  }
  const seen = new Map<string, number>()
  for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
  for (const [id, n] of seen) if (n > 1) out.push(`id "${id}" appears ${n} times`)
  try {
    expectInkLayers(container, { min: 0 })
  } catch (e) {
    out.push((e as Error).message)
  }
  for (const host of container.querySelectorAll("[data-ink-ready]")) {
    if (!host.querySelector(":scope > svg[data-ink]") && !host.matches("[data-slot=paper]")) out.push(`a host is marked data-ink-ready but has no svg child: <${host.tagName.toLowerCase()} data-slot="${host.getAttribute("data-slot")}">`)
  }
  return out
}

describe("drawn smoke", () => {
  test("the harness draws: a measured host gets its svg and its layers", async () => {
    const { Button } = await import("@/components/ui/button")
    const restoreBox = mockBox(120, 36)
    try {
      const { container } = render(<Button>Draw me</Button>)
      expect(container.querySelector("button > svg[data-ink='button'] > g[data-layer='rest']")).toBeTruthy()
    } finally {
      restoreBox()
    }
  })

  if (!examples.length) {
    test(smokeSlug ? `no docs examples for "${smokeSlug}"` : "no docs examples yet", () => expect(examples).toHaveLength(0))
    return
  }
  let restore = () => {}
  afterEach(() => {
    restore()
    cleanup()
    document.querySelectorAll("[data-ll-defs]").forEach((n) => n.remove())
  })

  for (const item of examples) {
    const name = item.path.replace("/src/docs/examples/", "")
    describe(name, () => {
      for (const mode of MODES) {
        test(mode.name, async () => {
          const mod = await item.load()
          const Example = mod.default as React.ComponentType
          restore = mockBox(mode.box[0], mode.box[1])
          const errors = vi.spyOn(console, "error").mockImplementation(() => {})
          const Wrap = mode.strict ? React.StrictMode : React.Fragment
          const { container } = render(
            <Wrap>
              <div dir={mode.dir}>
                <InkProvider density={mode.density}>
                  <Example />
                </InkProvider>
              </div>
            </Wrap>
          )
          await act(async () => {})
          const problems = problemsOf(container)
          const logged = errors.mock.calls.map((c) => String(c[0]).slice(0, 160))
          errors.mockRestore()
          expect(logged, `${name} logged React errors`).toEqual([])
          expect(problems, `${name} (${mode.name})\n  - ${problems.join("\n  - ")}`).toEqual([])
        })
      }
    })
  }
})
