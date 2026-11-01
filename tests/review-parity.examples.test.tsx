import * as React from "react"
import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"

import { axeCheck } from "./helpers"

type Mod = { default: React.ComponentType; meta: { title: string } }

const everything = import.meta.glob<Mod>("/src/docs/examples/*/*.tsx", { eager: true })
const parity = Object.entries(everything)
  .filter(([path]) => /\/examples\/(?!chart\/)[^/]+\/[5-9]\d-[^/]+\.tsx$/.test(path))
  .sort(([a], [b]) => a.localeCompare(b))
const slugOf = (path: string) => /\/examples\/([^/]+)\//.exec(path)![1]
const slugs = [...new Set(parity.map(([p]) => slugOf(p)))]

afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  vi.useRealTimers()
})

describe("official-parity examples", () => {
  it("are the 190 the three packages report (the sanity check for the glob above)", () => {
    expect(parity.length).toBeGreaterThanOrEqual(190)
  })

  describe.each(parity)("%s", (_path, mod) => {
    const Example = mod.default
    it("has no axe violations at rest", async () => {
      const { container } = render(<Example />)
      await axeCheck(container)
    })

    it("renders no h1 or h2 (the docs page owns those levels; Radix's accordion rows are h3, as the ARIA pattern has them)", () => {
      const { container } = render(<Example />)
      expect(container.querySelectorAll("h1, h2")).toHaveLength(0)
    })
  })
})

describe("a docs page mounts every example of a component at once", () => {
  it.each(slugs)("%s: no id is used twice, and every label and aria-labelledby points at something", (slug) => {
    const all = Object.entries(everything)
      .filter(([path]) => path.startsWith(`/src/docs/examples/${slug}/`) && !/\/_[^/]*$/.test(path))
      .sort(([a], [b]) => a.localeCompare(b))
    const { container } = render(
      <div>
        {all.map(([path, mod]) => {
          const Example = mod.default
          return <Example key={path} />
        })}
      </div>
    )
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id).filter(Boolean)
    const repeated = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect([...new Set(repeated)], `repeated ids in ${slug}`).toEqual([])

    const has = (id: string) => container.ownerDocument.getElementById(id) !== null
    const dangling: string[] = []
    for (const el of container.querySelectorAll("label[for]:not([cmdk-label])")) {
      const target = el.getAttribute("for")!
      if (!has(target)) dangling.push(`label for="${target}"`)
    }
    for (const el of container.querySelectorAll("[aria-labelledby]")) {
      for (const id of el.getAttribute("aria-labelledby")!.split(/\s+/).filter(Boolean)) if (!has(id)) dangling.push(`aria-labelledby="${id}"`)
    }
    expect(dangling, `dangling references in ${slug}`).toEqual([])
  })
})
