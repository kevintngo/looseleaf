import * as React from "react"
import { render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Tally } from "@/components/ui/tally"
import { InkProvider } from "@/lib/ink/react"
import { DEFAULT_KNOBS, runRecipe } from "@/lib/ink/recipes"
import { tallyBox, tallyRecipe } from "@/lib/ink/recipes/tally-ink"
import { describeBlockMark } from "./_block-suite"
import { inkSvgs } from "./_marks-lib"

describeBlockMark({
  name: "Tally",
  slot: "tally",
  kind: "tally",
  size: [80, 26],
  drawOn: "wipe",
  ssrDraws: true,
  make: (props) => <Tally count={7} {...props} />,
  variants: [{ count: 12 }, { tone: "blue" }, { weight: "brush" }, { size: "lg" }],
})

describe("Tally specifics", () => {
  it("announces the number, or your own words", () => {
    const a = render(<Tally data-testid="a" count={7} />)
    expect(a.getByTestId("a")).toHaveAttribute("role", "img")
    expect(a.getByTestId("a")).toHaveAttribute("aria-label", "7")
    a.unmount()
    const b = render(<Tally data-testid="b" count={12} label="12 votes" />)
    expect(b.getByRole("img", { name: "12 votes" })).toBeInTheDocument()
  })

  it("clamps to 0..99, rounds down, and copes with nonsense", () => {
    const n = (count: number) => {
      const { getByTestId, unmount } = render(<Tally data-testid="t" count={count} />)
      const v = getByTestId("t").getAttribute("aria-label")
      unmount()
      return v
    }
    expect(n(150)).toBe("99")
    expect(n(-3)).toBe("0")
    expect(n(7.9)).toBe("7")
    expect(n(Number.NaN)).toBe("0")
  })

  it("its box is exactly the marks' footprint, from the count and the size", () => {
    const { getByTestId } = render(<Tally data-testid="t" count={13} size="lg" />)
    const b = tallyBox(13, 34)
    expect(getByTestId("t").style.width).toBe(`${b.w}px`)
    expect(getByTestId("t").style.height).toBe(`${b.h}px`)
    expect(tallyBox(10, 22).w).toBeGreaterThan(tallyBox(5, 22).w)
    expect(tallyBox(0, 22).w).toBe(0)
  })

  it("is drawn on the server (explicit size) and identical twice; kept in forced colors", () => {
    const html = renderToString(<Tally count={7} seed="s" />)
    expect(html).toContain("<svg")
    expect(html).toContain("data-ink-keep")
    expect(html).toBe(renderToString(<Tally count={7} seed="s" />))
  })

  it("count 0 draws nothing; a bigger count draws more", () => {
    const zero = render(<Tally data-testid="z" count={0} />)
    expect(zero.getByTestId("z").querySelector("path")).toBeNull()
    zero.unmount()
    const len = (count: number) => {
      const { getByTestId, unmount } = render(<Tally data-testid="t" count={count} seed="k" />)
      const v = inkSvgs(getByTestId("t"))[0]?.innerHTML.length ?? 0
      unmount()
      return v
    }
    expect(len(12)).toBeGreaterThan(len(3))
  })

  it("the recipe: 1 to 99 stay finite and bounded; rtl mirrors", () => {
    for (const count of [1, 4, 5, 6, 9, 10, 27, 64, 99]) {
      const gh = 22
      const b = tallyBox(count, gh)
      const f = runRecipe(tallyRecipe, { box: { w: b.w, h: b.h }, params: { count, gh, tone: "ink", weight: "regular" }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
      expect(f.parts.rest, String(count)).not.toMatch(/NaN|undefined|Infinity/)
      expect(f.parts.rest?.length ?? 0, String(count)).toBeLessThan(120000)
    }
    const b = tallyBox(7, 22)
    const run = (rtl: boolean) => runRecipe(tallyRecipe, { box: b, params: { count: 7, gh: 22, tone: "ink", weight: "regular", rtl }, seed: "s", tier: "lo", density: "comfortable", dir: "ltr", knobs: DEFAULT_KNOBS })
    expect(run(true).parts.rest).not.toBe(run(false).parts.rest)
    expect(run(true).parts.rest).toContain("scale(-1 1)")
  })

  it("mirrors itself inside an rtl provider", () => {
    const { getByTestId } = render(
      <div dir="rtl">
        <InkProvider dir="rtl">
          <Tally data-testid="t" count={7} seed="m" />
        </InkProvider>
      </div>,
    )
    expect(inkSvgs(getByTestId("t"))[0].innerHTML).toContain("scale(-1 1)")
  })
})
