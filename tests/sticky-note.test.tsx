import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { StickyNote, StickyNoteContent, StickyNoteFooter, StickyNoteTitle } from "@/components/ui/sticky-note"
import { STICKY_BOX, stickyNoteRecipe } from "@/lib/ink/recipes/sticky-note-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(176, 176)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Note(props: React.ComponentProps<typeof StickyNote>) {
  return (
    <StickyNote {...props}>
      <StickyNoteTitle>todo</StickyNoteTitle>
      <StickyNoteContent>buy more ink</StickyNoteContent>
      <StickyNoteFooter>from Ada</StickyNoteFooter>
    </StickyNote>
  )
}

describe("StickyNote", () => {
  it("renders its parts with their data-slots on a yellow sticky stock", () => {
    const { container } = render(<Note />)
    for (const slot of ["sticky-note", "sticky-note-title", "sticky-note-content", "sticky-note-footer"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    }
    const note = container.firstElementChild as HTMLElement
    expect(note).toHaveClass("ll-paper", "font-script")
    expect(note).toHaveAttribute("data-stock", "sticky-yellow")
    expect(note).toHaveAttribute("data-color", "yellow")
  })

  it.each(["yellow", "green", "orange", "pink", "blue"] as const)("%s is its own pad", (color) => {
    const { container } = render(<Note color={color} />)
    expect(container.firstElementChild).toHaveAttribute("data-stock", `sticky-${color}`)
  })

  it("a plain note is pure CSS: no svg at all, so a wall of them costs nothing", () => {
    const { container } = render(<Note />)
    expect(container.querySelector("svg")).toBeNull()
    expect(container.firstElementChild).not.toHaveAttribute("data-ink-host")
  })

  it("curl draws the sheet with a lifted corner; pin and tape hold it up", () => {
    const { container } = render(<Note curl fastener="pin" tape="top" seed="c" />)
    const note = container.firstElementChild as HTMLElement
    expect(note).toHaveAttribute("data-edge", "curl")
    expect(container.querySelector('svg[data-ink="sheet"]')).not.toBeNull()
    expect(container.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
    expect(container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
  })

  it("passes className, ref, style and props through; the size is yours", () => {
    const ref = React.createRef<HTMLElement>()
    const { getByTestId } = render(<Note ref={ref} className="h-24 w-72" data-testid="n" style={{ minWidth: 100 }} id="n1" />)
    expect(ref.current).toBe(getByTestId("n"))
    expect(getByTestId("n")).toHaveClass("h-24", "w-72", "min-h-40")
    expect(getByTestId("n").style.minWidth).toBe("100px")
  })

  it("done adds a pencil tick box; false leaves it empty, true writes the tick and strikes the text", () => {
    const { container, rerender, getByText } = render(<Note done={false} seed="d" />)
    const note = container.firstElementChild as HTMLElement
    expect(note).toHaveAttribute("data-state", "unchecked")
    const svg = container.querySelector('svg[data-ink="sticky"]')!
    expect(svg.parentElement).toBe(note)
    expect(Array.from(svg.querySelectorAll(":scope > g[data-layer]")).map((g) => g.getAttribute("data-layer"))).toEqual(["rest", "checked"])
    expectInkLayers(container, { min: 1, kinds: ["sticky"], absolute: true, layers: ["rest", "checked"] })
    expect(container.textContent).not.toContain("Done")
    rerender(<Note done seed="d" />)
    expect(note).toHaveAttribute("data-state", "checked")
    expect(note.className).toContain("line-through")
    expect(getByText(/Done\./)).toHaveClass("sr-only")
    expect(note).toHaveAttribute("data-touched")
  })

  it("a note that loads done does not replay its tick", () => {
    const { container } = render(<Note done seed="load" />)
    expect(container.firstElementChild).toHaveAttribute("data-state", "checked")
    expect(container.firstElementChild).not.toHaveAttribute("data-touched")
  })

  it("StrictMode's second mount effect does not arm the tick either; only a change of done does", () => {
    const { container, rerender } = render(
      <React.StrictMode>
        <Note done seed="strict" />
      </React.StrictMode>,
    )
    expect(container.firstElementChild).not.toHaveAttribute("data-touched")
    rerender(
      <React.StrictMode>
        <Note done={false} seed="strict" />
      </React.StrictMode>,
    )
    expect(container.firstElementChild).toHaveAttribute("data-touched")
  })

  it("onDoneChange makes the tick box a real checkbox: click and Space ask for the opposite, the name is the done label", async () => {
    const onDoneChange = vi.fn()
    function Live() {
      const [done, setDone] = React.useState(false)
      return (
        <Note
          done={done}
          seed="live"
          onDoneChange={(d) => {
            onDoneChange(d)
            setDone(d)
          }}
        />
      )
    }
    const { user, getByRole, container } = renderUI(<Live />)
    const box = getByRole("checkbox", { name: "Done" })
    expect(box).toHaveAttribute("aria-checked", "false")
    expect(container.firstElementChild).not.toHaveAttribute("data-touched")
    await user.click(box)
    expect(onDoneChange).toHaveBeenLastCalledWith(true)
    expect(box).toHaveAttribute("aria-checked", "true")
    expect(container.firstElementChild).toHaveAttribute("data-state", "checked")
    expect(container.firstElementChild).toHaveAttribute("data-touched")
    box.focus()
    await user.keyboard(" ")
    expect(onDoneChange).toHaveBeenLastCalledWith(false)
    expect(box).toHaveAttribute("aria-checked", "false")
    await axeCheck(container)
  })

  it("without onDoneChange the tick box is drawing only: no control, and a done note says so in hidden text", () => {
    const { queryByRole, getByText } = render(<Note done />)
    expect(queryByRole("checkbox")).toBeNull()
    expect(getByText(/Done\./)).toHaveClass("sr-only")
  })

  it("the done label is yours to word", () => {
    const { getByText } = render(<Note done doneLabel="Erledigt" />)
    expect(getByText(/Erledigt\./)).toHaveClass("sr-only")
  })

  it("has no axe violations (plain, curled and pinned, done)", async () => {
    const { container } = renderUI(
      <div>
        <Note />
        <Note curl fastener="pin" color="pink" />
        <Note done color="green" />
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Note done seed="s" size={[176, 176]} />)
    expectHydrates(<Note done seed="h" />, 'svg[data-ink="sticky"]', [176, 176])
    expectHydrates(<Note seed="h2" curl />, 'svg[data-ink="sheet"]', [176, 176])
  })
})

describe("stickyNoteRecipe", () => {
  it("draws the empty box in rest and the tick in checked, deterministic, clean, at every size and density", () => {
    const f = run(stickyNoteRecipe, {}, 176, 176)
    expect(f.layers).toEqual(["rest", "checked"])
    expect(f.parts.rest).toBe(run(stickyNoteRecipe, {}, 176, 176).parts.rest)
    expect(f.parts.rest).not.toBe(run(stickyNoteRecipe, {}, 176, 176, { seed: "other" }).parts.rest)
    for (const [w, h] of [[80, 80], [176, 176], [300, 120], [640, 640]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const g = run(stickyNoteRecipe, {}, w, h, { density, tier })
          expectClean(g.parts.rest! + g.parts.checked!)
        }
      }
    }
    expect(nodes(f.parts.rest!)).toBeLessThan(12)
    expect(nodes(f.parts.checked!)).toBeLessThan(14)
  })

  it("puts the box at the end of the top edge and mirrors it for right-to-left", () => {
    expect(STICKY_BOX.inset + STICKY_BOX.size).toBeLessThan(40)
    expect(run(stickyNoteRecipe, {}, 176, 176, { dir: "rtl" }).parts.rest).toContain("scale(-1 1)")
    expect(run(stickyNoteRecipe, {}, 176, 176).parts.rest).not.toContain("scale(-1 1)")
  })
})
