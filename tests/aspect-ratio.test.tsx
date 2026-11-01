import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { axeCheck } from "./helpers"

describe("AspectRatio", () => {
  it("is Radix's aspect ratio: a padded wrapper and an absolutely positioned inner div that carries the slot and the content", () => {
    const { container, getByText } = render(
      <AspectRatio ratio={16 / 9} className="grid place-items-center">
        <span>picture</span>
      </AspectRatio>
    )
    const inner = container.querySelector("[data-slot=aspect-ratio]") as HTMLElement
    const wrapper = inner.parentElement as HTMLElement
    expect(wrapper).toHaveAttribute("data-radix-aspect-ratio-wrapper")
    expect(wrapper.style.position).toBe("relative")
    expect(wrapper.style.paddingBottom).toBe(`${100 / (16 / 9)}%`)
    expect(inner.style.position).toBe("absolute")
    expect(inner).toHaveClass("grid", "place-items-center")
    expect(getByText("picture").parentElement).toBe(inner)
  })

  it("defaults to a square and keeps other ratios exact", () => {
    for (const [ratio, pad] of [
      [undefined, 100],
      [1, 100],
      [4 / 3, 75],
      [3 / 4, (100 * 4) / 3],
      [2, 50],
    ] as const) {
      const { container, unmount } = render(<AspectRatio ratio={ratio} />)
      const wrapper = container.querySelector("[data-radix-aspect-ratio-wrapper]") as HTMLElement
      expect(Number.parseFloat(wrapper.style.paddingBottom)).toBeCloseTo(pad, 6)
      unmount()
    }
  })

  it("forwards ref, id and data attributes to the inner div", () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<AspectRatio ref={ref} id="a" data-testid="ar" />)
    expect(ref.current).toBe(container.querySelector("[data-slot=aspect-ratio]"))
    expect(ref.current).toHaveAttribute("id", "a")
    expect(ref.current).toHaveAttribute("data-testid", "ar")
  })

  it("has no axe violations with an image inside", async () => {
    const { container } = render(
      <div style={{ width: 200 }}>
        <AspectRatio ratio={16 / 9}>
          <img src="data:," alt="A heron on one leg" className="h-full w-full object-cover" />
        </AspectRatio>
      </div>
    )
    await axeCheck(container)
  })

  it("renders on the server and hydrates without warnings", () => {
    const tree = () => (
      <AspectRatio ratio={4 / 3}>
        <span>x</span>
      </AspectRatio>
    )
    const html = renderToString(tree())
    expect(html).toContain('data-slot="aspect-ratio"')
    expect(renderToString(tree())).toBe(html)
    const container = document.createElement("div")
    document.body.appendChild(container)
    container.innerHTML = html
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    let root: ReturnType<typeof hydrateRoot> | undefined
    act(() => {
      root = hydrateRoot(container, tree())
    })
    expect(errors.mock.calls.map((c) => String(c[0]))).toEqual([])
    errors.mockRestore()
    act(() => root?.unmount())
    container.remove()
  })
})
