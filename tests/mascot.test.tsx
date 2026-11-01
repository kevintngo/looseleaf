import { describe, expect, it } from "vitest"
import { renderToString } from "react-dom/server"
import { Mascot } from "@/components/ui/mascot"
import { mascot } from "@/lib/ink/art/mascots"
import { axeCheck, expectInkLayers, renderUI } from "./helpers"

describe("Mascot (Stubby)", () => {
  it("is intrinsic ink, decorative unless labeled", async () => {
    const { container, rerender, getByRole } = renderUI(<Mascot pose="wave" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("data-slot", "mascot")
    expect(svg).toHaveAttribute("data-ink", "mascot")
    expect(svg).toHaveAttribute("data-pose", "wave")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expectInkLayers(container, { min: 1, kinds: ["mascot"], intrinsic: true })
    rerender(<Mascot pose="wave" label="Stubby waves hello" />)
    expect(getByRole("img", { name: "Stubby waves hello" })).toBeInTheDocument()
    await axeCheck(container)
  })

  it("has the four poses, each redrawn per size (24 a face on a silhouette, 48 small, 96 master, 160 hero)", () => {
    for (const pose of ["idle", "wave", "think", "sleep"]) {
      const at = (size: number) => renderToString(<Mascot pose={pose} size={size} />)
      expect(at(48), pose).not.toBe(at(96))
      expect(at(96), pose).toBe(at(96))
      expect(at(96), pose).not.toMatch(/NaN|undefined|Infinity/)
      expect((mascot as Record<string, { small?: unknown }>)[pose].small, pose).toBeDefined()
    }
    expect(renderToString(<Mascot pose="idle" size={32} />)).not.toBe(renderToString(<Mascot pose="idle" size={48} />))
    expect(renderToString(<Mascot pose="idle" size={24} />)).not.toBe(renderToString(<Mascot pose="idle" size={32} />))
  })

  it("is a die-cut sticker: the whole box, white border included, is `size` tall, with the sticker shadow class", () => {
    for (const size of [16, 24, 32, 48, 96, 160]) {
      const { container } = renderUI(<Mascot pose="idle" size={size} />)
      const svg = container.querySelector("svg")!
      expect(Number(svg.getAttribute("height")), String(size)).toBeCloseTo(size, 0)
      expect(svg.getAttribute("viewBox")).toBe(`0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`)
      expect(svg).toHaveClass("ll-drop-sticker")
      expect(svg.innerHTML).toContain("<defs>")
      expect(svg.innerHTML).toContain("var(--ll-photo)")
    }
    expect(renderUI(<Mascot pose="idle" shadow={false} />).container.querySelector("svg")).not.toHaveClass("ll-drop-sticker")
    expect(renderToString(<Mascot pose="idle" size={4} />)).toBe(renderToString(<Mascot pose="idle" size={16} />))
  })

  it("two Stubbys on one page define their own silhouette ids", () => {
    const { container } = renderUI(
      <>
        <Mascot pose="idle" size={96} />
        <Mascot pose="idle" size={96} />
      </>
    )
    const ids = Array.from(container.querySelectorAll("svg [id^='ll-']")).map((e) => e.id)
    expect(ids.length).toBeGreaterThanOrEqual(4)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("his palette is fixed: lemon body, kraft cone, bubblegum eraser; props in another medium", () => {
    const html = renderToString(<Mascot pose="sleep" size={96} />)
    for (const c of ["lemon", "kraft", "bubblegum", "ink-you"]) expect(html).toContain(`var(--ll-${c})`)
    expect(renderToString(<Mascot pose="think" size={96} />)).toContain("var(--ll-pencil")
  })

  it("is drawn light: the engine's lo tier at every size, so a 160 px hero is not twice the markup of a 120 px one (hi is opt-in)", () => {
    const at = (size: number, extra: { tier?: "lo" | "hi" } = {}) => renderToString(<Mascot pose="idle" size={size} {...extra} />).length
    expect(at(160)).toBeLessThan(60_000)
    expect(at(236)).toBeLessThan(75_000)
    expect(at(139) / at(120)).toBeLessThan(1.3)
    expect(at(160) / at(96)).toBeLessThan(1.8)
    expect(at(160, { tier: "hi" })).toBeGreaterThanOrEqual(at(160))
    expect(renderToString(<Mascot pose="idle" size={160} tier="hi" />)).toContain('data-pose="idle"')
  })

  it("a pose that is a flip book draws the frame asked for; anything else is the still pose", () => {
    const at = (pose: string, frame?: number) => renderToString(<Mascot pose={pose} size={96} frame={frame} />)
    expect(at("write", 1)).not.toBe(at("write", 2))
    expect(at("write", 2)).not.toBe(at("write", 3))
    expect(at("wave", 3)).toContain('data-frame="3"')
    expect(at("celebrate", 2)).toContain('data-pose="celebrate"')
    expect(at("write")).not.toContain("data-frame")
    expect(at("celebrate", 3)).toBe(at("celebrate"))
    expect(at("idle", 1)).toBe(at("idle"))
    expect(at("write", 2)).toBe(at("write", 2))
  })

  it("an unknown pose renders nothing; the default is idle", () => {
    expect(renderUI(<Mascot pose="nope" />).container.querySelector("svg")).toBeNull()
    expect(renderUI(<Mascot />).container.querySelector("svg")).toHaveAttribute("data-pose", "idle")
  })
})
