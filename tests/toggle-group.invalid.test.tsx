import * as React from "react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { toggleGroupRecipe } from "@/lib/ink/recipes/toggle-group-ink"
import { mockBox, renderUI } from "./helpers"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(160, 36)
})
afterEach(() => {
  restore()
  document.querySelectorAll('[data-ll-defs="injected"]').forEach((n) => n.remove())
})

const RED = /var\(--ll-red/

describe("toggleGroupRecipe: invalid", () => {
  const req = { seed: "inv", tier: "lo" as const, density: "comfortable" as const, dir: "ltr" as const, knobs: DEFAULT_KNOBS }
  const run = (params: { joined: boolean; disabled?: boolean; invalid?: boolean }, w = 200, density: "comfortable" | "calm" = "comfortable") =>
    runRecipe(toggleGroupRecipe, { ...req, density, params, box: { w, h: 36 } })

  it("turns the shared box red pencil in the rest layer, in both densities and at any width, and only then", () => {
    for (const density of ["comfortable", "calm"] as const) {
      for (const w of [120, 200, 480]) {
        const ok = run({ joined: true }, w, density)
        const bad = run({ joined: true, invalid: true }, w, density)
        expect(ok.layers).toEqual(["rest"])
        expect(bad.layers).toEqual(["rest"])
        expect(ok.parts.rest).not.toMatch(RED)
        expect(bad.parts.rest).toMatch(RED)
        expect(bad.parts.rest!.length).toBeGreaterThan(200)
        expect(bad.parts.rest).not.toMatch(/NaN|undefined/)
      }
    }
  })

  it("draws nothing extra for a group that draws no box (separate toggles draw their own), and disabled wins over invalid", () => {
    expect(run({ joined: false, invalid: true }).layers).toEqual([])
    const d = run({ joined: true, disabled: true, invalid: true })
    expect(d.layers).toEqual(["disabled"])
    expect(d.parts.disabled).not.toMatch(RED)
  })
})

describe("ToggleGroup aria-invalid", () => {
  const Group = (props: Partial<React.ComponentProps<typeof ToggleGroup>> & { itemInvalid?: boolean }) => {
    const { itemInvalid, ...rest } = props
    return (
      <ToggleGroup type="single" aria-label="Paper" {...(rest as object)}>
        <ToggleGroupItem value="plain">Plain</ToggleGroupItem>
        <ToggleGroupItem value="ruled" aria-invalid={itemInvalid}>
          Ruled
        </ToggleGroupItem>
      </ToggleGroup>
    )
  }
  const redIn = (el: Element) => RED.test(el.querySelector(":scope > svg[data-ink]")?.innerHTML ?? "")

  it("a joined outline group draws its one box red", () => {
    const { getByRole } = renderUI(<Group variant="outline" aria-invalid />)
    const group = getByRole("radiogroup", { name: "Paper" })
    expect(group).toHaveAttribute("aria-invalid", "true")
    expect(redIn(group)).toBe(true)
  })

  it("a valid group is not red", () => {
    const { getByRole } = renderUI(<Group variant="outline" />)
    expect(redIn(getByRole("radiogroup", { name: "Paper" }))).toBe(false)
  })

  it("separate toggles each draw their own box red; an item's own aria-invalid={false} wins", () => {
    const { getAllByRole } = renderUI(<Group variant="outline" spacing={2} aria-invalid itemInvalid={false} />)
    const [plain, ruled] = getAllByRole("radio")
    expect(redIn(plain)).toBe(true)
    expect(redIn(ruled)).toBe(false)
  })

  it("a disabled group does not show red", () => {
    const { getByRole } = renderUI(<Group variant="outline" aria-invalid disabled />)
    expect(redIn(getByRole("radiogroup", { name: "Paper" }))).toBe(false)
  })
})
