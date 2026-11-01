import * as React from "react"
import { describe, expect, it } from "vitest"
import { hydrationProblems } from "./_hydrate-lib"
import { formatProblems, smokeRender, withServerGlobals } from "./_ssr-lib"

const PAGES = ["icons", "stickers-doodles", "accessibility", "principles"] as const

const load = (page: (typeof PAGES)[number]) => () => import(`../src/docs/content/foundations/${page}.tsx`) as Promise<Record<string, unknown>>

describe.each(PAGES)("foundations/%s", (page) => {
  it("renders on the server, twice the same", async () => {
    const mod = await withServerGlobals(load(page))
    const Page = mod.default as React.ComponentType
    const { problems, markup } = await withServerGlobals(() => smokeRender(() => React.createElement(Page)))
    expect(formatProblems(problems)).toBe("")
    expect(markup?.length ?? 0).toBeGreaterThan(1000)
  })

  it("hydrates without a mismatch", async () => {
    expect(formatProblems(await hydrationProblems(load(page)))).toBe("")
  }, 60_000)
})
