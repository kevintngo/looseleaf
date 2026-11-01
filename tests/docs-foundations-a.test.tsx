import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { build, render as renderData, OUT_FILE } from "../tools/gen-docs-data.mjs"
import ColourPage from "@/docs/content/foundations/colour"
import DensityPage from "@/docs/content/foundations/density"
import MotionPage from "@/docs/content/foundations/motion"
import PaperPage from "@/docs/content/foundations/paper"
import PensPage from "@/docs/content/foundations/pens"
import ThemingPage from "@/docs/content/foundations/theming"
import TypographyPage from "@/docs/content/foundations/typography"
import typographySource from "@/components/ui/typography.tsx?raw"
import { contrast, evalExpr, toHex } from "@/docs/content/foundations/_shared/colour-math"
import { curvePath, curvePoint, overshoot, progressAt } from "@/docs/content/foundations/_shared/easing"
import { EMPTY_THEME, forestAfter, normaliseHex, setColour, setShade, shadeHex, themeCss } from "@/docs/content/foundations/_shared/theme-model"
import { LAB_DEFAULTS, drawLab, drawSample, explodeStroke, labCode, penRows } from "@/docs/content/foundations/_shared/pen-lab"
import { DocsApp } from "@/docs/App"
import { FOUNDATION_BY_SLUG } from "@/docs/core/foundations"
import { createCatalog } from "@/docs/core/catalog"
import { discoverSources } from "@/docs/core/discover"
import { ALIASES, CONTRAST, DURATIONS, EASINGS, FOREST, PALETTE, T0 } from "@/docs/content/foundations/_shared/data.generated"
import { axeCheck, mockBox, renderUI } from "./helpers"
import fs from "node:fs"
import { STOCK_NAMES } from "@/lib/ink/paper/stocks"
import { tiltFor } from "@/lib/ink/paper/shadows"

describe("baked data (tools/gen-docs-data.mjs)", () => {
  it("is up to date with looseleaf.css", () => {
    expect(fs.readFileSync(OUT_FILE, "utf8")).toBe(renderData(build()))
  })

  it("the browser-side colour maths reproduces every baked ratio", () => {
    let live = 0
    for (const row of CONTRAST) {
      expect(Math.abs(contrast(row.fgHex, row.bgHex) - row.ratio)).toBeLessThan(0.006)
      if (!row.live) continue
      live++
      const fg = evalExpr(row.live.fg, T0, ALIASES)
      const bg = evalExpr(row.live.bg, T0, ALIASES)
      expect(fg && toHex(fg), `${row.fg} on ${row.bg}`).toBe(row.fgHex)
      expect(bg && toHex(bg), `${row.fg} on ${row.bg}`).toBe(row.bgHex)
    }
    expect(live).toBeGreaterThan(95)
  })

  it("every Notebook pair passes or is a documented warning", () => {
    expect(CONTRAST.filter((r) => r.status === "fail")).toEqual([])
  })

  it("the forest walkthrough ends green and starts red", () => {
    expect(FOREST.steps[0]!.check.fails.length).toBeGreaterThan(5)
    expect(FOREST.steps.at(-1)!.check.fails).toEqual([])
  })
})

describe("colour page", () => {
  it("draws a chip for every palette token, with its value and contrast", () => {
    renderUI(<ColourPage />)
    for (const e of PALETTE) {
      const chip = screen.getByRole("button", { name: new RegExp(`copy var\\(${e.token}\\)`) })
      expect(chip).toBeInTheDocument()
      expect(chip.closest("li")).toHaveTextContent(e.value)
    }
    const paper = screen.getByRole("button", { name: /Paper: copy var\(--ll-paper\)/ }).closest("li")!
    expect(within(paper).getByText(/14\.06 : 1/)).toBeInTheDocument()
  })

  it("copies a chip's var() to the clipboard", async () => {
    const { user } = renderUI(<ColourPage />)
    await user.click(screen.getByRole("button", { name: /Ink, soft: copy var\(--ll-ink-soft\)/ }))
    expect(await navigator.clipboard.readText()).toBe("var(--ll-ink-soft)")
  })

  it("the checker answers with a ratio and a verdict", async () => {
    const { user } = renderUI(<ColourPage />)
    const checker = within(screen.getByRole("group", { name: "Contrast checker" }))
    expect(checker.getByText("4.28 : 1")).toBeInTheDocument()
    expect(checker.getByText("Large text and marks only.")).toBeInTheDocument()
    await user.selectOptions(checker.getByLabelText("Foreground"), "--ll-ink")
    expect(checker.getByText("8.49 : 1")).toBeInTheDocument()
    expect(checker.getByText("Clears the strictest line.")).toBeInTheDocument()
    await user.click(checker.getByRole("button", { name: "Swap" }))
    expect(checker.getByLabelText("Foreground")).toHaveValue("--ll-desk")
  })

  it("lists the contrast record with results in words, and ends with related links", () => {
    renderUI(<ColourPage />)
    expect(screen.getAllByText("ok").length).toBeGreaterThan(90)
    expect(screen.getAllByText("info", { selector: "td span" }).length).toBe(CONTRAST.filter((r) => r.status === "warn").length)
    const related = screen.getByRole("region", { name: "Related" })
    expect(within(related).getAllByRole("link").map((a) => a.getAttribute("href"))).toContain("#/foundations/theming")
  })

  it("has no accessibility violations", async () => {
    const { container } = renderUI(<ColourPage />)
    await axeCheck(container)
  })
})

describe("typography page", () => {
  it("sets the four faces and the whole scale in the real components", () => {
    renderUI(<TypographyPage />)
    const faces = screen.getByRole("list", { name: "The four typefaces" })
    expect(within(faces).getAllByRole("listitem")).toHaveLength(4)
    for (const cls of ["font-hand", "font-script", "font-type", "font-mono"]) expect(faces).toHaveTextContent(cls)
    const scale = screen.getByRole("group", { name: /type scale/ })
    for (const name of ["H1", "H2", "H3", "H4", "Lead", "P", "Large", "Small", "Muted", "InlineCode", "Blockquote"]) expect(within(scale).getByText(name)).toBeInTheDocument()
    expect(within(scale).queryByRole("heading", { level: 1 })).toBeNull()
    expect(within(scale).queryByRole("heading", { level: 2 })).toBeNull()
  })

  it("the scale table describes what typography.tsx really sets", () => {
    const claims: Record<string, string[]> = {
      H1: ["text-5xl", "leading-[1.02]", "font-script", "font-bold"],
      H2: ["text-4xl", "leading-[1.08]", "font-script", "font-bold"],
      H3: ["text-3xl", "leading-tight", "font-script"],
      H4: ["font-hand", "text-xl", "leading-snug", "font-bold"],
      Lead: ["text-xl", "leading-[1.55]", "text-muted-foreground"],
      P: ["text-[17px]", "leading-[1.7]"],
      Large: ["text-lg", "font-bold"],
      Small: ["text-sm", "font-bold"],
      Blockquote: ["font-script", "text-2xl", "leading-[1.35]", "text-ink-soft"],
    }
    const section = (name: string) => {
      const start = typographySource.indexOf(`function ${name}(`)
      return typographySource.slice(start, start + 700)
    }
    for (const [name, classes] of Object.entries(claims)) for (const c of classes) expect(section(name), `${name} ${c}`).toContain(c)
  })

  it("the type tester changes the preview and writes the matching classes", async () => {
    const { user } = renderUI(<TypographyPage />)
    const preview = screen.getByTestId("tester-preview")
    expect(preview).toHaveStyle({ fontSize: "40px", fontWeight: "700" })
    expect(screen.getByText(/font-script text-\[40px\] leading-\[1.25\] font-bold text-ink/)).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Special Elite" }))
    expect(preview).toHaveStyle({ fontFamily: "var(--font-type)", fontWeight: "400" })
    expect(screen.getByText(/one weight \(400\)/)).toBeInTheDocument()
    await user.clear(screen.getByLabelText("Your words"))
    await user.type(screen.getByLabelText("Your words"), "Hello there")
    expect(preview).toHaveTextContent("Hello there")
    await user.click(screen.getByRole("switch", { name: "Riso offset" }))
    expect(screen.getByTestId("tester-preview")).toHaveClass("ll-riso")
    expect(screen.getByText(/ll-riso text-ink/)).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Hand jitter" }))
    expect(screen.getByTestId("tester-preview").querySelectorAll(".ll-w").length).toBeGreaterThan(0)
  })

  it("jitter follows density and reduced motion through the provider", async () => {
    const { user } = renderUI(<TypographyPage />)
    const words = () => screen.getByTestId("jitter-text").querySelectorAll(".ll-w")
    expect(words().length).toBeGreaterThan(5)
    await user.click(screen.getByRole("radio", { name: "calm" }))
    expect(screen.getByTestId("jitter-text").closest("[data-density]")).toHaveAttribute("data-density", "calm")
    await user.click(screen.getByRole("switch", { name: "Reduced motion" }))
    expect(screen.getByTestId("jitter-text").closest("[data-motion]")).toHaveAttribute("data-motion", "reduced")
  })

  it("shows the clipped and the roomy label side by side", () => {
    renderUI(<TypographyPage />)
    expect(screen.getByTestId("ink-room-clipped")).not.toHaveClass("ll-ink-room")
    expect(screen.getByTestId("ink-room-roomy")).toHaveClass("ll-ink-room")
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<TypographyPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(4)
    await axeCheck(container)
  })
})

describe("pens page", () => {
  it("draws every named pen live, with its numbers", () => {
    renderUI(<PensPage />)
    const table = screen.getByRole("table", { name: /Every named pen/ })
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(1 + 12)
    const ink = within(table).getAllByRole("row", { name: /Felt tip, brown-black/ })[0]!
    expect(within(ink).getByText("1.7 px")).toBeInTheDocument()
    expect(within(ink).getByText("0.92")).toBeInTheDocument()
    const svgs = table.querySelectorAll("svg[data-ink=illustration]")
    expect(svgs).toHaveLength(12)
    for (const svg of svgs) expect(svg.querySelectorAll("path").length).toBeGreaterThan(0)
  })

  it("the tier toggle redraws the table and the markup gets bigger", async () => {
    const { user } = renderUI(<PensPage />)
    const table = screen.getByRole("table", { name: /Every named pen/ })
    const size = () => [...table.querySelectorAll("svg")].reduce((n, s) => n + s.innerHTML.length, 0)
    const lo = size()
    await user.click(screen.getByRole("radio", { name: "hi: hero art" }))
    expect(size()).toBeGreaterThan(lo)
  })

  it("the same seed draws the same stroke and a new hand draws a different one", async () => {
    const { user, container } = renderUI(<PensPage />)
    const lab = () => within(container.querySelector('[aria-label="A line drawn live by the pen engine"]') as HTMLElement).getByRole("img").innerHTML
    const first = lab()
    await user.click(screen.getByRole("button", { name: /A new hand/ }))
    const second = lab()
    expect(second).not.toBe(first)
    await user.click(screen.getByRole("button", { name: "Reset" }))
    expect(lab()).toBe(first)
  })

  it("a slider redraws the line and the code block follows", async () => {
    const { user, container } = renderUI(<PensPage />)
    const picture = () => (container.querySelector('[aria-label="A line drawn live by the pen engine"] svg') as SVGElement).innerHTML
    const before = picture()
    const wobble = screen.getByRole("slider", { name: "Wobble" })
    wobble.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")
    expect(picture()).not.toBe(before)
    await waitFor(() => expect(container.textContent).toMatch(/wobble: 1\.1/))
    await user.selectOptions(screen.getByLabelText("Pen"), "pencil")
    await waitFor(() => expect(container.textContent).toContain('ink.stroke(points, "pencil"'))
  })

  it("takes a stroke apart into its layers", async () => {
    const { user, container } = renderUI(<PensPage />)
    const layers = () => [...container.querySelectorAll("[data-layer-kind]")].map((li) => li.getAttribute("data-layer-kind"))
    expect(layers()).toContain("body")
    await user.click(screen.getByRole("radio", { name: "Pencil" }))
    expect(layers()).toContain("smear")
    await user.click(screen.getByRole("radio", { name: "Marker" }))
    expect(layers()).toContain("rim")
    expect(layers()).not.toContain("smear")
  })

  it("moves the fill off its outline and switches the blend", async () => {
    const { user } = renderUI(<PensPage />)
    const mis = screen.getByRole("slider", { name: "Misregistration" })
    expect(mis).toHaveAttribute("aria-valuenow", "4.6")
    mis.focus()
    await user.keyboard("{Home}")
    expect(screen.getByText("in register")).toBeInTheDocument()
    expect(screen.getByTestId("crossing")).toHaveStyle({ "--ll-blend": "multiply" })
    await user.click(screen.getByRole("switch", { name: "Multiply (Notebook)" }))
    expect(screen.getByTestId("crossing")).toHaveStyle({ "--ll-blend": "normal" })
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<PensPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(5)
    await axeCheck(container)
  })
})

describe("paper page", () => {
  let restore = () => {}
  beforeEach(() => {
    restore = mockBox(200, 128)
  })
  afterEach(() => restore())

  const cards = () => within(screen.getByRole("list", { name: "All nineteen paper stocks" })).getAllByRole("listitem")

  it("lays out every stock, each on the edge it is sold with", () => {
    renderUI(<PaperPage />)
    expect(cards()).toHaveLength(19)
    expect(STOCK_NAMES).toHaveLength(19)
    const edge = (stock: string) => cards().find((c) => c.getAttribute("data-stock") === stock)!.getAttribute("data-edge")
    expect(edge("receipt")).toBe("zig")
    expect(edge("parchment")).toBe("deckle")
    expect(edge("pad")).toBe("torn")
    expect(edge("paper")).toBe("cut")
  })

  it("cuts every stock the way the toggle says, and says what that edge is", async () => {
    const { user } = renderUI(<PaperPage />)
    await user.click(screen.getByRole("radio", { name: "scallop" }))
    for (const c of cards()) expect(c).toHaveAttribute("data-edge", "scallop")
    expect(screen.getByTestId("edge-info")).toHaveTextContent(/Round tabs/)
    await user.click(screen.getByRole("radio", { name: "cut" }))
    for (const c of cards()) expect(c).toHaveAttribute("data-edge", "cut")
    await user.click(screen.getByRole("radio", { name: "per side" }))
    for (const c of cards()) expect(c).toHaveAttribute("data-edge", "torn")
  })

  it("the sheet builder writes the code for what it shows", async () => {
    const { user, container } = renderUI(<PaperPage />)
    const text = () => container.textContent ?? ""
    expect(text()).toContain('<Paper stock="index-card" edge="torn" tape="corner"')
    await user.selectOptions(screen.getByLabelText("stock"), "kraft")
    await user.selectOptions(screen.getByLabelText("tape"), "both")
    await user.selectOptions(screen.getByLabelText("fastener"), "clip")
    await user.click(screen.getByRole("switch", { name: "tilt (seeded)" }))
    await waitFor(() => expect(text()).toContain('<Paper stock="kraft" edge="torn" tilt={false} tape="both" tapeKind="washi-dots" fastener="clip"'))
    const sheet = screen.getByTestId("built-sheet")
    expect(sheet).toHaveAttribute("data-stock", "kraft")
    expect(sheet.querySelectorAll('[data-slot="fastener"]')).toHaveLength(1)
  })

  it("draws nine shadow stacks and moves them with the lift", async () => {
    const { user } = renderUI(<PaperPage />)
    const sample = () => screen.getByTestId("shadow-card") as HTMLElement
    expect(sample().style.boxShadow).toBe("var(--ll-shadow-card)")
    const lift = screen.getByRole("slider", { name: "Lift" })
    lift.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(sample().style.boxShadow).not.toBe("var(--ll-shadow-card)")
    expect(sample().style.boxShadow).toContain("rgb(var(--ll-shade)")
    expect(within(screen.getByRole("list", { name: "The nine shadow stacks" })).getAllByRole("listitem")).toHaveLength(9)
  })

  it("tilts the sheet, not the words, and flattens it in calm density", async () => {
    const { user } = renderUI(<PaperPage />)
    const sheet = screen.getByTestId("tilt-sheet")
    expect(sheet.style.getPropertyValue("--ll-tilt")).toBe("1.2deg")
    await user.click(screen.getByRole("switch", { name: "Calm density" }))
    expect(sheet.closest("[data-density]")).toHaveAttribute("data-density", "calm")
    const label = () => screen.getByTestId("seeded-tilt").textContent
    expect(label()).toBe(`${tiltFor("my-card", 0.5) > 0 ? "+" : ""}${tiltFor("my-card", 0.5).toFixed(2)}°`)
    await user.clear(screen.getByLabelText("Any seed gets its own angle"))
    await user.type(screen.getByLabelText("Any seed gets its own angle"), "other")
    expect(label()).toBe(`${tiltFor("other", 0.5) > 0 ? "+" : ""}${tiltFor("other", 0.5).toFixed(2)}°`)
  })

  it("shows the tapes, the fasteners and the baked tiles", async () => {
    const { user } = renderUI(<PaperPage />)
    expect(within(screen.getByRole("list", { name: "The seven kinds of tape" })).getAllByRole("listitem")).toHaveLength(7)
    expect(screen.getAllByText(/^(clip|pin) ·/)).toHaveLength(8)
    const tiles = within(screen.getByRole("list", { name: /seven baked tiles/ })).getAllByRole("listitem")
    expect(tiles).toHaveLength(7)
    const swatch = () => tiles[0]!.querySelector("div") as HTMLElement
    expect(swatch().style.filter).toContain("contrast")
    await user.click(screen.getByRole("switch", { name: "Stretch the contrast" }))
    expect(swatch().style.filter).toBe("")
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<PaperPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(5)
    await axeCheck(container)
  })
})

describe("motion page", () => {
  it("lists the ten duration tokens with their milliseconds and runs the bars", async () => {
    const { user } = renderUI(<MotionPage />)
    const table = screen.getByRole("table", { name: /Duration tokens/ })
    expect(within(table).getAllByRole("row")).toHaveLength(1 + DURATIONS.length)
    for (const d of DURATIONS) {
      const row = within(table).getByRole("row", { name: new RegExp(`${d.token.replace(/-/g, "\\-")} ${d.ms} ms`) })
      expect(row).toBeInTheDocument()
    }
    const bars = () => [...table.querySelectorAll("tbody td div div")] as HTMLElement[]
    expect(bars().every((b) => b.style.width === "0%")).toBe(true)
    expect(bars()[0]!.style.transition).toContain("var(--ll-dur-press)")
    await user.click(screen.getByRole("button", { name: "Run all ten at once" }))
    expect(bars().every((b) => b.style.width === "100%")).toBe(true)
  })

  it("draws the five easings, scrubs them and says which overshoot", async () => {
    const { user } = renderUI(<MotionPage />)
    const list = screen.getByRole("list", { name: "The five easings" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(EASINGS.length)
    expect(within(list).getAllByText(/^overshoots to 1\.\d\d$/)).toHaveLength(3)
    expect(within(list).getAllByText("no overshoot")).toHaveLength(2)
    const time = screen.getByRole("slider", { name: "Time" })
    time.focus()
    await user.keyboard("{End}")
    expect(within(list).getAllByText("1.00 at 1.00")).toHaveLength(EASINGS.length)
    await user.click(screen.getByRole("button", { name: /Race them/ }))
    const lanes = within(screen.getByRole("list", { name: "Easing lanes" })).getAllByRole("listitem")
    const chip = lanes[2]!.querySelector("span[aria-hidden]") as HTMLElement
    expect(chip.style.left).toBe("calc(100% - 1.5rem)")
    expect(chip.style.transition).toContain("var(--ll-ease-settle)")
  })

  it("the reduced-motion switches share one state and set data-motion on the demos", async () => {
    const { user, container } = renderUI(<MotionPage />)
    const wrapper = () => container.querySelector("[data-ll-scope]") as HTMLElement
    expect(wrapper()).not.toHaveAttribute("data-motion")
    const [top, lower] = screen.getAllByRole("switch", { name: /less motion/i })
    await user.click(top!)
    expect(wrapper()).toHaveAttribute("data-motion", "reduced")
    expect(lower).toBeChecked()
    await user.click(lower!)
    expect(wrapper()).not.toHaveAttribute("data-motion")
  })

  it("replays the six effects and the draw-on", async () => {
    const { user, container } = renderUI(<MotionPage />)
    const effects = within(screen.getByRole("list", { name: "Six effects" }))
    expect(effects.getAllByRole("listitem")).toHaveLength(6)
    const soak = container.querySelector(".animate-soak") as HTMLElement
    await user.click(screen.getByRole("button", { name: "Replay all six" }))
    expect(container.querySelector(".animate-soak")).not.toBe(soak)
    const stroke = () => container.querySelector("svg[aria-label^='A hand-drawn stroke']")
    const first = stroke()
    await user.click(screen.getByRole("button", { name: "Redraw the stroke" }))
    expect(stroke()).not.toBe(first)
    expect(stroke()!.querySelector("path")).toHaveClass("ll-draw")
    await user.click(screen.getByRole("switch", { name: "Marked up" }))
    expect(screen.getByRole("switch", { name: "Marked up" })).not.toBeChecked()
  })

  it("boils until it is paused or motion is reduced", async () => {
    const { user } = renderUI(<MotionPage />)
    const boil = screen.getByTestId("boil")
    await waitFor(() => expect(boil).toHaveAttribute("data-state", "boiling"))
    await user.click(screen.getByRole("switch", { name: "Boiling" }))
    await waitFor(() => expect(boil).toHaveAttribute("data-state", "still"))
    await user.click(screen.getByRole("switch", { name: "Boiling" }))
    await waitFor(() => expect(boil).toHaveAttribute("data-state", "boiling"))
    await user.click(screen.getAllByRole("switch", { name: /less motion/i })[0]!)
    await waitFor(() => expect(boil).toHaveAttribute("data-state", "still"))
  })

  it("streams a sentence one soaking word at a time", () => {
    vi.useFakeTimers()
    try {
      renderUI(<MotionPage />)
      const text = screen.getByTestId("soak-text")
      expect(text.querySelectorAll(".animate-soak")).toHaveLength(0)
      fireEvent.click(screen.getByRole("button", { name: "Stream a sentence" }))
      for (let i = 0; i < 4; i++) act(() => void vi.advanceTimersByTime(131))
      expect(text.querySelectorAll(".animate-soak").length).toBeGreaterThanOrEqual(3)
      for (let i = 0; i < 40; i++) act(() => void vi.advanceTimersByTime(131))
      expect(text.textContent).toContain("streaming chat.")
      expect(screen.getByRole("button", { name: "Stream it again" })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it("forces a button into its hover, pressed and focus layers with attributes", () => {
    renderUI(<MotionPage />)
    const buttons = screen.getAllByRole("button", { name: "Save changes" })
    const attrs = ["data-hover", "data-pressed", "data-focus-visible"]
    for (const a of attrs) expect(buttons.some((b) => b.hasAttribute(a))).toBe(true)
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<MotionPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(5)
    await axeCheck(container)
  })
})

describe("density page", () => {
  it("draws the same card under three providers", () => {
    renderUI(<DensityPage />)
    for (const d of ["comfortable", "compact", "calm"]) {
      const card = screen.getByTestId(`card-${d}`)
      expect(card.closest("[data-density]")).toHaveAttribute("data-density", d)
      expect(within(card).getByRole("button", { name: "Save" })).toBeInTheDocument()
      expect(within(card).getByRole("textbox")).toHaveValue("Ada Lovelace")
    }
  })

  it("prints the numbers each density sets, read from the stylesheet", () => {
    renderUI(<DensityPage />)
    const table = screen.getByRole("table", { name: /knobs each density sets/ })
    const hit = within(table).getByRole("row", { name: /Hit size/ })
    expect(within(hit).getAllByRole("cell").map((c) => c.textContent)).toEqual(["40px", "32px", "28px", "a token for your own controls (h-hit, size-hit); the library's controls set their own heights, see the table below. The floor, --ll-hit-min, is 24"])
    const jitter = within(table).getByRole("row", { name: /Word jitter/ })
    expect(within(jitter).getAllByRole("cell").slice(0, 3).map((c) => c.textContent)).toEqual(["1", "1", "0"])
    const engine = within(table).getByRole("row", { name: /Engine multipliers/ })
    expect(engine).toHaveTextContent("misreg ×0.85, width ×0.94")
    expect(engine).toHaveTextContent("own calm flag")
  })

  it("measures the hit boxes it outlines", () => {
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ width: 96, height: 36, x: 0, y: 0, top: 0, left: 0, right: 96, bottom: 36, toJSON: () => ({}) })
    try {
      renderUI(<DensityPage />)
      expect(within(screen.getByTestId("hits-calm")).getAllByText("96 × 36").length).toBe(5)
    } finally {
      spy.mockRestore()
    }
  })

  it("says n/a where nothing can be measured", () => {
    renderUI(<DensityPage />)
    expect(within(screen.getByTestId("hits-compact")).getAllByText("n/a").length).toBe(5)
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<DensityPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(5)
    await axeCheck(container)
  })
})

describe("theming page", () => {
  const scope = () => screen.getByRole("group", { name: "Live preview of the edited theme" })

  it("starts as Notebook: every live pair holds and nothing is overridden", () => {
    renderUI(<ThemingPage />)
    expect(screen.getByTestId("contrast-summary")).toHaveTextContent(/^All \d+ pairs hold\./)
    expect(screen.getByTestId("changed-count")).toHaveTextContent("Notebook, untouched.")
    expect(scope().getAttribute("style") ?? "").not.toContain("--ll-")
  })

  it("editing a colour re-themes the preview scope and the contrast table answers", async () => {
    const { user } = renderUI(<ThemingPage />)
    const marker = screen.getByRole("textbox", { name: /^Marker/ })
    await user.clear(marker)
    await user.type(marker, "#f8f5ee")
    expect(scope().style.getPropertyValue("--ll-marker")).toBe("#f8f5ee")
    expect(screen.getByTestId("changed-count")).toHaveTextContent("1 value changed.")
    expect(screen.getByTestId("contrast-summary")).toHaveTextContent(/\d+ of \d+ pairs fail\./)
    expect(screen.getByTestId("problems---ll-marker")).toBeInTheDocument()
    expect(screen.getByTestId("problems---chart-1")).toBeInTheDocument()
    expect((document.body.textContent ?? "").replace(/\s+/g, " ")).toContain('[data-theme="my-theme"] { --ll-marker: #f8f5ee; }')
    await user.click(screen.getByRole("button", { name: "Back to Notebook" }))
    expect(screen.getByTestId("changed-count")).toHaveTextContent("Notebook, untouched.")
    expect(scope().style.getPropertyValue("--ll-marker")).toBe("")
  })

  it("flags a hex that is not a colour without changing the theme", async () => {
    const { user } = renderUI(<ThemingPage />)
    const ink = screen.getByRole("textbox", { name: "Ink" })
    await user.clear(ink)
    await user.type(ink, "#zzz")
    expect(ink).toHaveAttribute("aria-invalid", "true")
    expect(scope().style.getPropertyValue("--ll-ink")).toBe("")
  })

  it("a knob slider writes its custom property", async () => {
    const { user } = renderUI(<ThemingPage />)
    const wobble = screen.getByRole("slider", { name: "Wobble" })
    wobble.focus()
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(scope().style.getPropertyValue("--ll-wobble")).toBe("0.9")
  })

  it("loads the finished forest, which holds every pair", async () => {
    const { user } = renderUI(<ThemingPage />)
    await user.click(screen.getByRole("button", { name: "Load the finished forest" }))
    expect(scope().style.getPropertyValue("--ll-desk")).toBe("#cdd2bb")
    expect(scope().style.getPropertyValue("--chart-1")).toBe(FOREST.final["--chart-1"])
    expect(screen.getByTestId("contrast-summary")).toHaveTextContent(/^All \d+ pairs hold\./)
    expect(scope().style.getPropertyValue("--ll-wobble")).toBe("0.8")
  })

  it("names the theme in the block and follows the name", async () => {
    const { user } = renderUI(<ThemingPage />)
    await user.click(screen.getByRole("button", { name: "Load the finished forest" }))
    await user.clear(screen.getByLabelText("Theme name"))
    await user.type(screen.getByLabelText("Theme name"), "Pond Life")
    expect(document.body.textContent).toContain('[data-theme="pond-life"]')
  })

  it("the walkthrough reports what the real checker said at every step", async () => {
    Element.prototype.scrollIntoView = vi.fn()
    const { user } = renderUI(<ThemingPage />)
    for (const step of FOREST.steps) {
      const line = screen.getByTestId(`check-${step.id}`)
      if (step.check.fails.length) expect(line).toHaveTextContent(`${step.check.fails.length} of ${step.check.pairs} pairs fail.`)
      else expect(line).toHaveTextContent(`all ${step.check.pairs} pairs hold.`)
    }
    expect(screen.getByTestId("check-surfaces")).toHaveTextContent(/1\d of 105 pairs fail/)
    await user.click(screen.getByRole("button", { name: /Show steps 1–3 in the editor/ }))
    expect(scope().style.getPropertyValue("--ll-ink")).toBe("#262c24")
    expect(scope().style.getPropertyValue("--ll-marker")).toBe("")
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it("compares Notebook with the finished forest", () => {
    renderUI(<ThemingPage />)
    const notebook = screen.getByRole("group", { name: "The preview in Notebook" })
    const forest = screen.getByRole("group", { name: "The preview in the finished forest theme" })
    expect(notebook.style.getPropertyValue("--ll-paper")).toBe("")
    expect(forest.style.getPropertyValue("--ll-paper")).toBe("#f3eee0")
  })

  it("ends with related links and has no accessibility violations", async () => {
    const { container } = renderUI(<ThemingPage />)
    expect(within(screen.getByRole("region", { name: "Related" })).getAllByRole("link").length).toBeGreaterThanOrEqual(5)
    await axeCheck(container)
  })
})

describe("easing maths", () => {
  it("linear is the identity, the baked easings end where they should and three of them overshoot", () => {
    expect(progressAt([0, 0, 1, 1], 0.37)).toBeCloseTo(0.37, 4)
    for (const e of EASINGS) {
      expect(progressAt(e.bezier, 0)).toBe(0)
      expect(progressAt(e.bezier, 1)).toBe(1)
      expect(Number.isFinite(progressAt(e.bezier, 0.5))).toBe(true)
    }
    expect(EASINGS.filter((e) => overshoot(e.bezier) > 1.001).map((e) => e.name)).toEqual(["settle", "pop", "dialog"])
    const box = { w: 100, h: 80, pad: 8, headroom: 0.25 }
    for (const e of EASINGS) {
      expect(curvePath(e.bezier, box)).not.toMatch(/NaN|undefined/)
      const end = curvePoint(e.bezier, 1, box)
      expect(end.x).toBe(108)
    }
  })
})

describe("pen lab", () => {
  it("draws every named pen, the same way twice", () => {
    for (const row of penRows()) {
      const a = drawSample(row.name)
      expect(a.svg.length, row.name).toBeGreaterThan(100)
      expect(a.svg).not.toMatch(/NaN|undefined/)
      expect(drawSample(row.name).svg).toBe(a.svg)
    }
    expect(penRows()).toHaveLength(12 + 16)
  })

  it("the lab is deterministic per seed and its code only names what changed", () => {
    expect(drawLab(LAB_DEFAULTS).svg).toBe(drawLab(LAB_DEFAULTS).svg)
    expect(drawLab({ ...LAB_DEFAULTS, seed: 4 }).svg).not.toBe(drawLab(LAB_DEFAULTS).svg)
    expect(labCode(LAB_DEFAULTS)).toContain('ink.stroke(points, "ink.brush")')
    expect(labCode({ ...LAB_DEFAULTS, speed: 1.5, end: "soft" })).toContain('{ speed: 1.5, end: "soft" }')
  })

  it("takes a stroke apart into finite polygons", () => {
    const ex = explodeStroke({ pen: "ink.brush", seed: "t", tier: "hi" })
    expect(ex.layers.map((l) => l.kind)).toContain("body")
    expect(ex.points.length).toBeGreaterThan(4)
    for (const l of ex.layers) expect(l.d).not.toMatch(/NaN|undefined/)
  })
})

describe("theme model", () => {
  it("normalises hex, records only what differs from Notebook, and writes the block", () => {
    expect(normaliseHex("F8F5EE")).toBe("#f8f5ee")
    expect(normaliseHex("#abc")).toBe("#aabbcc")
    expect(normaliseHex("#zzz")).toBeNull()
    let s = setColour(EMPTY_THEME, "--ll-paper", "#f3eee0")
    expect(s.colours).toEqual({ "--ll-paper": "#f3eee0" })
    s = setColour(s, "--ll-paper", "#f8f5ee")
    expect(s.colours).toEqual({})
    expect(themeCss("x", EMPTY_THEME)).toContain("this is Notebook")
    s = setShade(EMPTY_THEME, "#222a1c")
    expect(s.colours["--ll-shade"]).toBe("34 42 28")
    expect(shadeHex(s)).toBe("#222a1c")
    expect(themeCss("x", s)).toBe('[data-theme="x"] {\n  --ll-shade: 34 42 28;\n}')
  })

  it("forestAfter accumulates the steps and the last one is the finished theme", () => {
    expect(forestAfter(0)).toEqual(EMPTY_THEME)
    expect(Object.keys(forestAfter(1).colours)).toEqual(Object.keys(FOREST.steps[0]!.decls))
    expect(forestAfter(FOREST.steps.length).colours).toEqual(FOREST.final)
    expect(forestAfter(FOREST.steps.length).knobs["--ll-wobble"]).toBe(FOREST.knobs.wobble)
  })
})

describe("in the docs shell", () => {
  it("discovers the seven bodies and ignores the helpers", () => {
    const keys = [...createCatalog(discoverSources()).content.keys()]
    for (const topic of ["colour", "typography", "pens", "paper", "motion", "density", "theming"]) expect(keys).toContain(`foundations/${topic}`)
    expect(keys.filter((k) => k.includes("_shared"))).toEqual([])
  })

  it("every related link on every page goes somewhere that exists", () => {
    const catalog = createCatalog(discoverSources())
    const slugs = new Set(catalog.components.map((c) => c.slug))
    const pages = [ColourPage, TypographyPage, PensPage, PaperPage, MotionPage, DensityPage, ThemingPage]
    for (const Page of pages) {
      const { unmount } = renderUI(<Page />)
      const links = [...screen.getByRole("region", { name: "Related" }).querySelectorAll("ul a")]
      expect(links.length).toBeGreaterThanOrEqual(4)
      for (const a of links) {
        const [, kind, slug] = /^#\/(foundations|components)\/([\w-]+)$/.exec(a.getAttribute("href") ?? "") ?? []
        expect(kind, a.outerHTML).toBeTruthy()
        if (kind === "foundations") expect(FOUNDATION_BY_SLUG.has(slug!), `${slug} is a foundation topic`).toBe(true)
        else expect(slugs.has(slug!), `${slug} is a component`).toBe(true)
      }
      unmount()
    }
  })

  it("renders a page body inside the page frame, with its sections and the pager", async () => {
    window.location.hash = "#/foundations/density"
    window.scrollTo = vi.fn()
    renderUI(<DocsApp catalog={createCatalog(discoverSources())} />)
    expect(await screen.findByRole("heading", { level: 2, name: "The same card, three densities" }, { timeout: 15000 })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "Density" })).toBeInTheDocument()
    const pager = screen.getByRole("navigation", { name: "Previous and next foundation" })
    expect(pager).toHaveTextContent("Motion")
    window.location.hash = ""
  }, 30000)
})
