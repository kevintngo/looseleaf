import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { InkProvider } from "@/lib/ink/react"
import { axeCheck, mockBox } from "./helpers"

const slugs = ["select", "native-select", "radio-group", "switch", "slider", "input-group", "field", "form", "progress", "rating"]
const mods = import.meta.glob<{ default: React.ComponentType; meta: { title: string } }>("/src/docs/examples/*/*.tsx", { eager: true })
const mine = Object.entries(mods).filter(([p]) => slugs.some((s) => p.startsWith(`/src/docs/examples/${s}/`)))

let restore = () => {}
beforeEach(() => {
  restore = mockBox(240, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"],[data-ll-paper-defs]').forEach((n) => n.remove())
})

describe("wp-forms-a examples are accessible", () => {
  it("finds the examples", () => {
    expect(mine.length).toBeGreaterThanOrEqual(30)
  })
  for (const [path, mod] of mine) {
    it(path.replace("/src/docs/examples/", ""), async () => {
      const Example = mod.default
      const { container } = render(
        <InkProvider>
          <Example />
        </InkProvider>
      )
      await axeCheck(container)
    })
  }
})
