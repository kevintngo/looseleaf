import * as React from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { POLAROID_SCENES, crescent, polaroidPhotoRecipe } from "@/lib/ink/recipes/polaroid-ink"
import { axeCheck, expectInkLayers, mockBox, renderUI } from "./helpers"
import { expectClean, expectHydrates, expectSsrStable, nodes, run } from "./_paper-set"

let restore = () => {}
beforeEach(() => {
  restore = mockBox(228, 228)
})
afterEach(() => {
  restore()
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function Photo(props: React.ComponentProps<typeof Polaroid> & { scene?: React.ComponentProps<typeof PolaroidImage>["scene"]; date?: string; develop?: boolean; label?: string }) {
  const { scene, date, develop, label, ...rest } = props
  return (
    <Polaroid {...rest}>
      <PolaroidImage scene={scene} date={date} develop={develop} label={label} seed="img">
        {scene ? null : <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="A hill in August" />}
      </PolaroidImage>
      <PolaroidCaption>august, finally</PolaroidCaption>
    </Polaroid>
  )
}

describe("Polaroid", () => {
  it("is a figure with a photo window and a figcaption, on photo stock", () => {
    const { container, getByRole, getByText } = render(<Photo />)
    for (const slot of ["polaroid", "polaroid-image", "polaroid-caption"]) expect(container.querySelector(`[data-slot="${slot}"]`), slot).not.toBeNull()
    const p = container.firstElementChild as HTMLElement
    expect(p.tagName).toBe("FIGURE")
    expect(p).toHaveAttribute("data-stock", "photo")
    expect(p).toHaveClass("ll-paper", "w-64", "flex", "flex-col")
    expect(getByText("august, finally").tagName).toBe("FIGCAPTION")
    expect(getByRole("img", { name: "A hill in August" })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="paper-rules"]')).toBeNull()
  })

  it("the window is square, recessed and clips; an img fills it", () => {
    const { container } = render(<Photo />)
    const win = container.querySelector('[data-slot="polaroid-image"]') as HTMLElement
    expect(win).toHaveClass("aspect-square", "overflow-hidden", "relative")
    expect(win.className).toContain("[&_img]:object-cover")
    expect(win.className).toContain("after:shadow-[inset_0_2px_4px")
    expect(container.querySelector('[data-slot="polaroid-image"] svg')).toBeNull()
  })

  it("a scene is drawn into the window once it is measured, as the window's own ink", () => {
    const { container } = render(<Photo scene="sea" />)
    const win = container.querySelector('[data-slot="polaroid-image"]') as HTMLElement
    const svg = win.querySelector(':scope > svg[data-ink="photo"]')!
    expect(svg).not.toBeNull()
    expect(win).toHaveAttribute("data-ink-host")
    expect(win).toHaveAttribute("data-ink-ready")
    expectInkLayers(container, { min: 1, kinds: ["photo"], absolute: true, layers: ["rest"] })
  })

  it("each scene is its own drawing", () => {
    const html = (scene: (typeof POLAROID_SCENES)[number]) => {
      const { container, unmount } = render(<Photo scene={scene} />)
      const out = container.querySelector('svg[data-ink="photo"]')!.innerHTML
      unmount()
      return out
    }
    expect(new Set(POLAROID_SCENES.map(html)).size).toBe(POLAROID_SCENES.length)
  })

  it("a drawn scene is decoration unless it is named", () => {
    const { container, rerender, getByRole } = render(<Photo scene="hills" />)
    expect(container.querySelector('[role="img"]')).toBeNull()
    rerender(<Photo scene="hills" label="Hills with a sun" />)
    expect(getByRole("img", { name: "Hills with a sun" })).toHaveAttribute("data-slot", "polaroid-image")
  })

  it("date stamps the corner and develop fades a milky veil; both are decoration", () => {
    const { container } = render(<Photo scene="night" date="'25 9 24" develop />)
    const win = container.querySelector('[data-slot="polaroid-image"]') as HTMLElement
    const date = win.querySelector("span.font-mono") as HTMLElement
    expect(date).toHaveTextContent("'25 9 24")
    expect(date).toHaveAttribute("aria-hidden", "true")
    const veil = win.querySelector("span.animate-out") as HTMLElement
    expect(veil).toHaveAttribute("aria-hidden", "true")
    expect(veil.className).toContain("duration-(--ll-dur-soak)")
  })

  it("takes tape, fasteners, tilt, className, ref and props like any sheet", () => {
    const ref = React.createRef<HTMLElement>()
    const { container, getByTestId } = render(<Photo ref={ref} className="w-72" tape="top" fastener="pin" tilt={1.2} data-testid="p" id="p1" />)
    expect(ref.current).toBe(getByTestId("p"))
    expect(getByTestId("p")).toHaveClass("w-72")
    expect(getByTestId("p").style.getPropertyValue("--ll-tilt")).toBe("1.2deg")
    expect(container.querySelectorAll('svg[data-slot="tape"]')).toHaveLength(1)
    expect(container.querySelector('svg[data-slot="fastener"]')).toHaveAttribute("data-kind", "pin")
  })

  it("has no axe violations (real photo with alt text, drawn scene, drawn scene with a label)", async () => {
    const { container } = renderUI(
      <div>
        <Photo />
        <Photo scene="house" />
        <Photo scene="night" label="Roofs at night" />
      </div>,
    )
    await axeCheck(container)
  })

  it("server markup is stable and hydrates cleanly, bare and inside the provider", () => {
    expectSsrStable(<Photo scene="hills" seed="s" />)
    expectHydrates(<Photo scene="sea" seed="h" />, 'svg[data-ink="photo"]', [228, 228])
    expectHydrates(<Photo seed="real" />)
  })
})

describe("polaroidPhotoRecipe", () => {
  it.each(POLAROID_SCENES)("%s: deterministic, clean, at every size, density and tier", (scene) => {
    const a = run(polaroidPhotoRecipe, { scene }, 228, 228).parts.rest!
    expect(a).toBe(run(polaroidPhotoRecipe, { scene }, 228, 228).parts.rest)
    expect(a).not.toBe(run(polaroidPhotoRecipe, { scene }, 228, 228, { seed: "other" }).parts.rest)
    for (const [w, h] of [[60, 60], [120, 120], [228, 228], [420, 420], [300, 200]]) {
      for (const density of ["comfortable", "calm"] as const) {
        for (const tier of ["lo", "hi"] as const) {
          const f = run(polaroidPhotoRecipe, { scene }, w, h, { density, tier })
          expect(f.layers).toEqual(["rest"])
          expectClean(f.parts.rest!)
        }
      }
    }
  })

  it("stays inside the hero-art budget in the lo tier (about 20 KB, a few dozen shapes)", () => {
    for (const scene of POLAROID_SCENES) {
      const f = run(polaroidPhotoRecipe, { scene }, 228, 228).parts.rest!
      expect(f.length, scene).toBeLessThan(24000)
      expect(nodes(f), scene).toBeLessThan(60)
    }
  })

  it("the moon is one crescent outline (the sky shows through the bite), not a lighter disc laid on top", () => {
    const [cx, cy, R, bx, by, r2] = [100, 60, 23, 11.5, -7, 20]
    const pts = crescent(cx, cy, R, bx, by, r2)
    expect(pts.length).toBe(30)
    for (const [x, y] of pts) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      const dOuter = Math.hypot(x - cx, (y - cy) / 0.97)
      const dBite = Math.hypot(x - (cx + bx), (y - (cy + by)) / 0.97)
      expect(Math.abs(dOuter - R) < 0.6 || Math.abs(dBite - r2) < 0.6).toBe(true)
      expect(dBite).toBeGreaterThan(r2 - 0.6)
      expect(dOuter).toBeLessThan(R + 0.6)
    }
    const night = run(polaroidPhotoRecipe, { scene: "night" }, 228, 228).parts.rest!
    expect(night).not.toContain('fill="var(--ll-grape)" fill-opacity=".95"')
  })
})
