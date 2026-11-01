import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AccessibilityBody from "@/docs/content/foundations/accessibility"
import ColourPage from "@/docs/content/foundations/colour"
import DensityPage from "@/docs/content/foundations/density"
import IconsBody from "@/docs/content/foundations/icons"
import MotionPage from "@/docs/content/foundations/motion"
import PaperPage from "@/docs/content/foundations/paper"
import PrinciplesBody from "@/docs/content/foundations/principles"
import StickersDoodlesBody from "@/docs/content/foundations/stickers-doodles"
import ThemingPage from "@/docs/content/foundations/theming"
import TypographyPage from "@/docs/content/foundations/typography"
import { CONTRAST } from "@/docs/content/foundations/_shared/data.generated"
import { measureTarget } from "@/docs/content/foundations/_shared/measure-target"
import { RovingGroup, Tile } from "@/docs/content/foundations/_shared-b/gallery"
import { EDGE_KINDS } from "@/lib/ink/paper/edges"
import buttonSource from "@/components/ui/button.tsx?raw"
import { renderUI } from "./helpers"
import { installIntersectionObserver, revealAll } from "./docs-foundations-b-lib"

beforeEach(() => installIntersectionObserver())
afterEach(() => vi.unstubAllGlobals())

const ROOT = path.resolve(import.meta.dirname, "..")
const foundations = (...p: string[]) => path.join(ROOT, "src/docs/content/foundations", ...p)

function sources(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) sources(full, out)
    else if (/\.tsx?$/.test(e.name) && !/generated/.test(e.name)) out.push(full)
  }
  return out
}

function readWoff(file: string) {
  const b = fs.readFileSync(path.join(ROOT, "node_modules/@fontsource", file))
  const tables: Record<string, Buffer> = {}
  const n = b.readUInt16BE(12)
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20
    const tag = b.toString("latin1", o, o + 4)
    const off = b.readUInt32BE(o + 4)
    const clen = b.readUInt32BE(o + 8)
    const olen = b.readUInt32BE(o + 12)
    tables[tag] = clen < olen ? zlib.inflateSync(b.subarray(off, off + clen)) : b.subarray(off, off + olen)
  }
  const features = new Set<string>()
  const gsub = tables.GSUB
  if (gsub) {
    const list = gsub.readUInt16BE(6)
    const count = gsub.readUInt16BE(list)
    for (let i = 0; i < count; i++) features.add(gsub.toString("latin1", list + 2 + i * 6, list + 6 + i * 6))
  }
  const upm = tables.head!.readUInt16BE(18)
  const hmtx = tables.hmtx!
  const numH = tables.hhea!.readUInt16BE(34)
  const cmap = tables.cmap!
  let sub: { off: number; format: number } | undefined
  for (let i = 0; i < cmap.readUInt16BE(2); i++) {
    const off = cmap.readUInt32BE(8 + i * 8)
    const format = cmap.readUInt16BE(off)
    if (format === 4 || format === 12) sub = sub && format !== 12 ? sub : { off, format }
  }
  const glyph = (cp: number): number => {
    if (!sub) return 0
    const { off } = sub
    if (sub.format === 12) {
      for (let g = 0; g < cmap.readUInt32BE(off + 12); g++) {
        const s = cmap.readUInt32BE(off + 16 + g * 12)
        const e = cmap.readUInt32BE(off + 20 + g * 12)
        if (cp >= s && cp <= e) return cmap.readUInt32BE(off + 24 + g * 12) + cp - s
      }
      return 0
    }
    const segX2 = cmap.readUInt16BE(off + 6)
    const endO = off + 14
    const startO = endO + segX2 + 2
    const deltaO = startO + segX2
    const rangeO = deltaO + segX2
    for (let s = 0; s < segX2 / 2; s++) {
      if (cp > cmap.readUInt16BE(endO + s * 2)) continue
      const start = cmap.readUInt16BE(startO + s * 2)
      if (cp < start) return 0
      const delta = cmap.readInt16BE(deltaO + s * 2)
      const ro = cmap.readUInt16BE(rangeO + s * 2)
      if (ro === 0) return (cp + delta) & 0xffff
      const g = cmap.readUInt16BE(rangeO + s * 2 + ro + (cp - start) * 2)
      return g === 0 ? 0 : (g + delta) & 0xffff
    }
    return 0
  }
  const digits = [..."0123456789"].map((c) => hmtx.readUInt16BE(Math.min(glyph(c.charCodeAt(0)), numH - 1) * 4) / upm)
  return { features, digits }
}

describe("the Numbers section says only what the fonts do", () => {
  const kalam = readWoff("kalam/files/kalam-latin-400-normal.woff")
  const caveatRegular = readWoff("caveat/files/caveat-latin-400-normal.woff")
  const caveatBold = readWoff("caveat/files/caveat-latin-700-normal.woff")
  const plex = readWoff("ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff")
  const elite = readWoff("special-elite/files/special-elite-latin-400-normal.woff")

  it("none of the four faces has tabular or lining figures, so ll-num cannot change them", () => {
    for (const f of [kalam, caveatRegular, caveatBold, plex, elite]) {
      expect(f.features.has("tnum")).toBe(false)
      expect(f.features.has("lnum")).toBe(false)
    }
  })

  it("Kalam is proportional, Caveat regular is exactly tabular, bold within five percent, Plex Mono monospaced", () => {
    expect(Math.min(...kalam.digits) / Math.max(...kalam.digits)).toBeLessThan(0.55)
    expect(new Set(caveatRegular.digits).size).toBe(1)
    expect(Math.min(...caveatBold.digits) / Math.max(...caveatBold.digits)).toBeGreaterThan(0.9)
    for (const d of caveatBold.digits) expect(Math.abs(d - 0.45) / 0.45).toBeLessThan(0.05)
    expect(new Set(plex.digits).size).toBe(1)
  })

  it("shows the same amounts in four faces, each with ll-num", () => {
    renderUI(<TypographyPage />)
    const demo = screen.getByRole("group", { name: /same column of amounts in four faces/ })
    const lists = within(demo).getAllByRole("list")
    expect(lists).toHaveLength(4)
    for (const list of lists) expect(list).toHaveClass("ll-num")
    expect(lists.map((l) => l.className.match(/font-(hand|script|mono)/)![1])).toEqual(["hand", "script", "script", "mono"])
    expect(screen.getByText(/none of the four we ship does/)).toBeInTheDocument()
  })

  it("puts words with braces or angle brackets in an expression, so the copied line is valid JSX", async () => {
    const { user } = renderUI(<TypographyPage />)
    const box = screen.getByRole("textbox", { name: "Your words" })
    const code = () => Array.from(document.querySelectorAll("pre")).find((p) => p.textContent!.includes('className="font-script'))!.textContent!
    await user.clear(box)
    await user.type(box, "a < b")
    expect(code()).toContain('{"a < b"}')
    await user.clear(box)
    await user.type(box, "plain words")
    expect(code()).toContain("plain words")
    expect(code()).not.toContain('{"plain')
  })
})

describe("touch targets", () => {
  it("the button heights the pages quote are the ones button.tsx sets", () => {
    expect(buttonSource).toMatch(/default: "h-9 [^"]*compact:h-8 calm:h-7"/)
    renderUI(<AccessibilityBody />)
    const table = screen.getByRole("region", { name: "Hit areas by density" })
    expect(within(table).getByRole("row", { name: /comfortable 36 px tall/ })).toBeInTheDocument()
    expect(within(table).getByRole("row", { name: /compact 32 px tall/ })).toBeInTheDocument()
    expect(within(table).getByRole("row", { name: /calm 28 px tall/ })).toBeInTheDocument()
  })

  it("the library's controls do not read --ll-hit, as the pages say", () => {
    const readers: string[] = []
    const ui = path.join(ROOT, "src/components/ui")
    for (const f of fs.readdirSync(ui)) if (/(^|[\s"'`:])(h|size|min-h|min-w|w)-hit\b/.test(fs.readFileSync(path.join(ui, f), "utf8"))) readers.push(f)
    expect(readers).toEqual([])
  })

  it("measures the ::after that grows a small control's target, and reports how far it reaches", () => {
    const box = document.createElement("span")
    const control = document.createElement("button")
    box.append(control)
    document.body.append(box)
    box.getBoundingClientRect = () => ({ width: 16, height: 16, x: 0, y: 0, top: 0, left: 0, right: 16, bottom: 16, toJSON: () => ({}) })
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 Chrome/140")
    const real = window.getComputedStyle.bind(window)
    vi.spyOn(window, "getComputedStyle").mockImplementation(((el: Element, pseudo?: string | null) =>
      pseudo === "::after" ? ({ position: "absolute", width: "28px", height: "28px" } as CSSStyleDeclaration) : real(el)) as typeof window.getComputedStyle)
    expect(measureTarget(box)).toEqual({ w: 28, h: 28, grow: 6 })
    box.remove()
    vi.restoreAllMocks()
  })

  it("keeps the plain box where nothing reaches further", () => {
    const box = document.createElement("span")
    box.append(document.createElement("button"))
    box.getBoundingClientRect = () => ({ width: 96, height: 36, x: 0, y: 0, top: 0, left: 0, right: 96, bottom: 36, toJSON: () => ({}) })
    expect(measureTarget(box)).toEqual({ w: 96, h: 36, grow: 0 })
  })

  it("the density page's hit note no longer says the components read h-hit", () => {
    renderUI(<DensityPage />)
    expect(screen.getByText(/a token for your own controls/)).toBeInTheDocument()
    expect(screen.queryByText(/the height components take from h-hit/)).toBeNull()
  })

  it("admits that target size is by construction and names the exception", () => {
    renderUI(<AccessibilityBody />)
    expect(screen.getByText(/Target size is by construction, not by a test/)).toBeInTheDocument()
  })
})

describe("claims that were checked against the code", () => {
  it("the paper page counts the edge kinds it really has", () => {
    renderUI(<PaperPage />)
    expect(EDGE_KINDS).toHaveLength(7)
    expect(screen.getByRole("heading", { level: 2, name: "Nineteen stocks, seven edges" })).toBeInTheDocument()
  })

  it("the tilt specimen turns as far as the CSS lets any sheet turn, not further", () => {
    renderUI(<PrinciplesBody />)
    expect(screen.getByText(/the sheet turns 2 degrees, the most any sheet may/)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/turns 3 degrees/)
  })

  it("the primary-button note does not claim a darker fill helps a dark label", () => {
    renderUI(<ColourPage />)
    const note = screen.getByText(/that flat colour is what the token check measures/)
    expect(note.textContent).toMatch(/less than 4\.60 : 1 there/)
    expect(note.textContent).not.toMatch(/room to spare/)
  })

  it("the cost of a control is quoted as measured, not as 'at most a dozen elements and 8 KB'", () => {
    renderUI(<PrinciplesBody />)
    expect(document.body.textContent).not.toContain("at most about a dozen elements and 8 KB")
    expect(document.body.textContent).toContain("about 3 to 16 KB")
  })

  it("the contrast panel says which pairs it cannot recompute", () => {
    renderUI(<ThemingPage />)
    const live = Number(screen.getByTestId("contrast-summary").textContent!.match(/All (\d+) pairs hold/)![1])
    expect(live).toBeLessThan(CONTRAST.length)
    expect(screen.getByText(new RegExp(`${CONTRAST.length - live} of the build's ${CONTRAST.length} pairs are not recomputed here`))).toBeInTheDocument()
  })

  it("the colour checker names its number for a screen reader", () => {
    renderUI(<ColourPage />)
    const live = document.querySelector('[aria-live="polite"][aria-atomic="true"]')!
    expect(live.textContent).toMatch(/^Contrast ratio \d+\.\d\d : 1$/)
  })
})

describe("layout", () => {
  it("the easing race keeps each label beside its lane, not under the chip", async () => {
    const { user } = renderUI(<MotionPage />)
    await user.click(screen.getByRole("button", { name: /Race them/ }))
    const lanes = within(screen.getByRole("list", { name: "Easing lanes" })).getAllByRole("listitem")
    expect(screen.getByRole("list", { name: "Easing lanes" })).toHaveAttribute("dir", "ltr")
    for (const lane of lanes) {
      const [label, track] = Array.from(lane.children) as HTMLElement[]
      expect(label!.textContent).toMatch(/^(out|in|settle|pop|dialog)$/)
      expect(track!.contains(lane.querySelector("span[aria-hidden]"))).toBe(true)
      expect(label!.contains(lane.querySelector("span[aria-hidden]"))).toBe(false)
      expect(track!.className).toContain("me-[15%]")
    }
  })

  it("a button whose label changes is not also announced as a toggle", () => {
    renderUI(<MotionPage />)
    for (const name of ["Run all ten at once", /Race them/]) expect(screen.getByRole("button", { name })).not.toHaveAttribute("aria-pressed")
  })

  it("the token editor rows wrap their notes and keep a 24 px reset target", async () => {
    const { user } = renderUI(<ThemingPage />)
    const hex = screen.getByRole("textbox", { name: /^Marker/ })
    await user.clear(hex)
    await user.type(hex, "#aa5522")
    const reset = await screen.findByRole("button", { name: /^reset Marker$/ })
    expect(reset.className).toContain("min-h-6")
    expect(hex.closest("li")!.innerHTML).not.toContain("truncate")
  })

  it("the sticky preview only sticks in a window tall enough to hold it", () => {
    const html = fs.readFileSync(foundations("theming.tsx"), "utf8")
    expect(html).toContain("@2xl:[@media(min-height:52rem)]:sticky")
    expect(html).not.toMatch(/@2xl:sticky/)
  })

  it("the icon dock is pinned only from the medium breakpoint up", () => {
    renderUI(<IconsBody />)
    const dock = document.querySelector<HTMLElement>("[data-dock]")!
    expect(dock.className).toContain("md:sticky")
    expect(dock.className.split(/\s+/)).not.toContain("sticky")
  })

  it("tiles scroll clear of the docs bar and the dock when they take focus", () => {
    renderUI(<IconsBody />)
    const tile = document.querySelector<HTMLElement>("[data-tile]")!
    expect(tile.className).toContain("scroll-mt-28")
    expect(tile.className).toContain("scroll-mb-44")
  })

  it("every nested InkProvider leaves the grain masks to the page's own", () => {
    for (const file of sources(foundations()).filter((f) => f.endsWith(".tsx"))) {
      const code = fs
        .readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .join("\n")
      const mounted = code.replace(/`[^`]*`/g, "``")
      for (const m of mounted.matchAll(/<InkProvider\b[^>]*>/g)) expect(m[0], `${path.relative(ROOT, file)}: ${m[0]}`).toContain("defs={false}")
    }
  })

  it("Kalam is never set below the 14 px the typography page says is its floor; only mono and typewriter go to 12", () => {
    const small: string[] = []
    for (const file of sources(foundations()).filter((f) => f.endsWith(".tsx"))) {
      for (const line of fs.readFileSync(file, "utf8").split("\n")) {
        for (const m of line.matchAll(/text-\[(\d+(?:\.\d+)?)px\]|(?<![\w-])text-xs\b/g)) {
          const px = m[1] ? Number(m[1]) : 12
          if (px < 14 && !/font-(mono|type|script)/.test(line)) small.push(`${path.relative(ROOT, file)}: ${line.trim().slice(0, 110)}`)
        }
      }
    }
    expect(small).toEqual([])
  })

  it("no text on these pages is set below 12 px", () => {
    const small: string[] = []
    for (const file of sources(foundations())) {
      const text = fs.readFileSync(file, "utf8")
      for (const m of text.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) if (Number(m[1]) < 12) small.push(`${path.relative(ROOT, file)}: ${m[0]}`)
    }
    expect(small).toEqual([])
  })
})

describe("galleries", () => {
  it("a gallery whose remembered tile is not on the page still has a tab stop", () => {
    renderUI(
      <RovingGroup label="Things" ids={["a", "b", "c"]}>
        <Tile id="b" name="b" onPress={() => {}}>
          <span />
        </Tile>
        <Tile id="c" name="c" onPress={() => {}}>
          <span />
        </Tile>
      </RovingGroup>,
    )
    expect(screen.getByRole("button", { name: "b" })).toHaveAttribute("tabindex", "0")
    expect(screen.getByRole("button", { name: "c" })).toHaveAttribute("tabindex", "-1")
  })

  it("draws only the first shelf of the art page when it mounts; the rest wait until they scroll near", () => {
    renderUI(<StickersDoodlesBody />)
    const count = (slug: string) => document.querySelectorAll(`[data-slot="${slug}-shelf"] [data-tile]`).length
    expect(count("doodle")).toBeGreaterThan(0)
    for (const slug of ["sticker", "badge", "stamp", "pose"]) expect(count(slug)).toBe(0)
    revealAll()
    for (const slug of ["sticker", "badge", "stamp", "pose"]) expect(count(slug)).toBeGreaterThan(0)
  })

  it("a search draws its answer at once", async () => {
    const { user } = renderUI(<StickersDoodlesBody />)
    const shelf = document.querySelector<HTMLElement>('[data-slot="badge-shelf"]')!
    expect(shelf.querySelectorAll("[data-tile]")).toHaveLength(0)
    await user.type(within(shelf).getByRole("searchbox", { name: "Search badges" }), "new")
    await waitFor(() => expect(shelf.querySelectorAll("[data-tile]").length).toBeGreaterThan(0))
  })

  it("a colour-wash filter does not outlive its switch", async () => {
    const { user } = renderUI(<IconsBody />)
    const browser = document.querySelector<HTMLElement>('[data-slot="icon-browser"]')!
    const counts = () => within(browser).getAllByRole("status").map((s) => s.textContent).find((t) => /icons$/.test(t ?? ""))
    expect(counts()).toBe("160 icons")
    await user.click(within(browser).getByRole("radio", { name: "doodle: with colour" }))
    await user.click(within(browser).getByRole("switch", { name: /Only icons that carry a colour wash/ }))
    await waitFor(() => expect(counts()).toMatch(/^\d+ of 160 icons$/))
    await user.click(within(browser).getByRole("radio", { name: "ui: ink only" }))
    await waitFor(() => expect(counts()).toBe("160 icons"))
  })

  it("the scene shelf no longer injects the paper pattern tiles", () => {
    const text = fs.readFileSync(foundations("_shared-b", "mascot-sections.tsx"), "utf8")
    expect(text).not.toContain("ensurePaperDefs")
  })
})

void act
