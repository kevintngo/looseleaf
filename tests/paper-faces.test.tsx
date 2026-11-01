import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { act, render } from "@testing-library/react"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Clipboard } from "@/components/ui/clipboard"
import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeTrigger } from "@/components/ui/envelope"
import { Folder, FolderContent, FolderTab, FolderTabs } from "@/components/ui/folder"
import { LabelTag } from "@/components/ui/label-tag"
import { NotebookCover } from "@/components/ui/notebook"
import { Paper } from "@/components/ui/paper"
import { Ticket, TicketBody, TicketStub } from "@/components/ui/ticket"
import { faceClip, faceLook, faceMark, faceSvg, hasFace, pathBox, renderFaces, shadowMark, splitFaces, tilesOf, translatePath, type FaceSpec } from "@/lib/ink/paper/faces"
import { STOCK_NAMES } from "@/lib/ink/paper/stocks"
import { InkProvider } from "@/lib/ink/react"
import { paperFill } from "@/lib/ink/recipes/paper-set-ink"
import { mockBox } from "./helpers"

const NO_TEXTURE = /<pattern|<image|<mask|<filter|<foreignObject|url\(#ll-tex|href="data:/

let restore = () => {}
afterEach(() => {
  restore()
  restore = () => {}
  document.querySelectorAll("[data-ll-defs],[data-ll-paper-defs]").forEach((n) => n.remove())
})

function expectNoTextureInSvg(root: ParentNode) {
  const svgs = Array.from(root.querySelectorAll("svg[data-ink]"))
  expect(svgs.length).toBeGreaterThan(0)
  for (const svg of svgs) {
    expect(svg.innerHTML, svg.getAttribute("data-ink") ?? "").not.toMatch(NO_TEXTURE)
    expect(svg.querySelectorAll("pattern, image, mask, filter, foreignObject")).toHaveLength(0)
  }
}

const faceEls = (root: ParentNode) => Array.from(root.querySelectorAll<HTMLElement>('[data-slot="paper-face"]'))

describe("face marks", () => {
  const spec: FaceSpec = { d: "M0 0L10 0L10 10L0 10Z", stock: "kraft", seed: 42 }

  it("a mark round-trips through the markup and splits it into under, paper and over", () => {
    const markup = `<path d="a"/>${faceMark(spec)}<path d="b"/>`
    expect(hasFace(markup)).toBe(true)
    expect(splitFaces(markup)).toEqual(['<path d="a"/>', spec, '<path d="b"/>'])
    expect(splitFaces(faceMark(spec))).toEqual([spec])
    expect(splitFaces("<path/>")).toEqual(["<path/>"])
    expect(hasFace("<path/>")).toBe(false)
    expect(splitFaces(`${faceMark(spec)}x${faceMark({ ...spec, seed: 43 })}`).map((p) => typeof p)).toEqual(["object", "string", "object"])
  })

  it("a mark is a valid HTML comment whatever the path holds", () => {
    const d = "M0 0L1 1--2 2"
    const m = faceMark({ ...spec, d })
    expect(m.slice(4, -3)).not.toContain("--")
    expect((splitFaces(m)[0] as FaceSpec).d).toBe(d)
  })

  it("translatePath moves absolute coordinates and leaves relative ones alone", () => {
    expect(translatePath("M1 2L3 4Z", 10, 20)).toBe("M11 22L13 24Z")
    expect(translatePath("M1 2H5V9A3 3 0 0 1 8 12z", 1, 1)).toBe("M2 3H6V10A3 3 0 0 1 9 13z")
    expect(translatePath("M.1.5q-.1.5 2.5 1.1 2.5.6 5.9.1z", 6, 6)).toBe("M6.1 6.5q-.1.5 2.5 1.1 2.5.6 5.9.1z")
    expect(translatePath("M0 0h5a2 2 0 0 1 2 2v3z", 4, 4)).toBe("M4 4h5a2 2 0 0 1 2 2v3z")
    expect(translatePath("not a path", 1, 1)).toBe("not a path")
  })

  it("pathBox includes what an arc bulges to, not only its end points", () => {
    expect(pathBox("M0 10L20 10L20 30L0 30Z")).toEqual([0, 10, 20, 30])
    const [x0, y0, x1, y1] = pathBox("M0 64A64 64 0 0 1 128 64V100H0z")
    expect([x0, x1, y1]).toEqual([0, 128, 100])
    expect(y0).toBeLessThan(1)
  })

  it("faceClip is a css path(), evenodd when there are holes", () => {
    expect(faceClip({ d: "M0 0L1 1Z" }, 2, 3)).toBe("path('M2 3L3 4Z')")
    expect(faceClip({ d: "M0 0L1 1Z", evenodd: true })).toBe("path(evenodd, 'M0 0L1 1Z')")
  })

  it("faceLook gives the classes and custom properties a stock wears, sticky notes their veil, a dyed stock its color", () => {
    const paper = faceLook("paper", "s")
    expect(paper.className).toBe("ll-stock-paper ll-tooth-cold")
    expect(paper.vars["--ll-tex-paper-pos"].split(", ")).toHaveLength(3)
    expect(faceLook("paper", "s").vars).toEqual(paper.vars)
    expect(faceLook("paper", "t").vars).not.toEqual(paper.vars)
    expect(faceLook("sticky-pink", "s").vars["--ll-veil"]).toBe("45%")
    expect(faceLook("sticky-pink", "s", false).vars["--ll-veil"]).toBeUndefined()
    expect(faceLook("parchment", "s").vars["--ll-stock"]).toContain("color-mix")
    expect(faceLook("parchment", "s").className).not.toContain("ll-stock-")
    expect(faceLook("receipt", "s").vars["--ll-tex-paper"]).toBe("var(--ll-tex-cloud)")
    expect(tilesOf(["kraft", "paper"]).sort()).toEqual(["cloud", "fibre", "kraft", "relief"])
    for (const name of STOCK_NAMES) expect(faceLook(name, "x").vars["--ll-tex-paper-pos"]).toMatch(/px/)
  })

  it("faceSvg is plain svg: flat by default, the baked tiles as patterns only when look-dev asks", () => {
    const flat = faceSvg(spec)
    expect(flat).toContain("clip-path")
    expect(flat).not.toMatch(NO_TEXTURE)
    expect(faceSvg({ ...spec, evenodd: true })).toContain('clip-rule="evenodd"')
    const tiled = faceSvg({ ...spec, stock: "paper" }, { tiles: true })
    expect(tiled.match(/<pattern/g)).toHaveLength(3)
    expect(tiled.indexOf("t0)")).toBeLessThan(tiled.indexOf("t2)"))
    expect(faceSvg({ ...spec, stock: "sticky-pink" })).toContain('fill-opacity="0.45"')
    expect(faceSvg({ ...spec, stock: "sticky-pink", veil: false })).not.toContain('fill-opacity="0.45"')
    expect(renderFaces(`<i/>${faceMark(spec)}<b/>`)).toMatch(/^<i\/><defs>.*<\/g><b\/>$/)
    expect(renderFaces("<i/>")).toBe("<i/>")
  })

  it("shadowMark is a shadow with no paper: it resolves to nothing in static svg", () => {
    const m = shadowMark("lift", [11, 11, 11, 11])
    const [spec] = splitFaces(m) as [FaceSpec]
    expect(spec.paper).toBe(false)
    expect(spec.cast).toEqual({ kind: "lift", inset: [0, 0, 0, 0], radius: [11, 11, 11, 11] })
    expect(renderFaces(`<i/>${m}<b/>`)).toBe("<i/><b/>")
  })

  it("paperFill puts the outline once in defs, a hairline under the paper, the mark, and the edge over it", () => {
    const m = paperFill(7, "M0 0L9 0L9 9Z", { stock: "kraft", shadow: true })
    const parts = splitFaces(m)
    expect(parts.map((p) => typeof p)).toEqual(["string", "object", "string"])
    expect(parts[0]).toContain("<defs><path")
    expect(parts[0]).toContain("translate(0 1)")
    expect(parts[2]).toContain("<use")
    expect((parts[1] as FaceSpec).cast?.kind).toBe("slip")
    expect((parts[1] as FaceSpec).veil).toBe(false)
    expect(m).not.toMatch(NO_TEXTURE)
    expect(paperFill(7, "M0 0Z", { stock: "kraft" })).not.toContain("translate(0 1)")
    const flap = splitFaces(paperFill(7, "M0 0Z", { stock: "kraft", shadow: true, far: false })).find((p) => typeof p !== "string") as FaceSpec
    expect(flap.cast).toBeUndefined()
  })
})

describe("the consumers of drawn paper", () => {
  beforeEach(() => {
    restore = mockBox(320, 180)
  })

  it("Paper: two svgs of plain paths round one CSS face, for every stock and edge", () => {
    for (const stock of STOCK_NAMES) {
      for (const edge of ["torn", "deckle", "crimp", "zig", "perf", "scallop", { bottom: "torn" }] as const) {
        const { container, unmount } = render(<Paper stock={stock} edge={edge} seed={`${stock}`} />)
        expect(faceEls(container), `${stock} ${JSON.stringify(edge)}`).toHaveLength(1)
        expectNoTextureInSvg(container)
        expect(container.querySelectorAll('svg[data-ink="sheet"]')).toHaveLength(2)
        unmount()
      }
    }
  })

  it("Paper: a sticky note with a curl keeps its veil and its flap", () => {
    const { container } = render(<Paper stock="sticky-pink" curl seed="c" />)
    const face = faceEls(container)[0]
    expect(face.style.getPropertyValue("--ll-veil")).toBe("45%")
    expect(container.querySelector('svg[data-ink="sheet"]')!.parentElement!.innerHTML).toContain("var(--ll-sticky-pink)")
    expectNoTextureInSvg(container)
  })

  it("Ticket: the ticket is one face with the holes cut out of it (evenodd), and casts a shadow", () => {
    const { container } = render(
      <Ticket seed="t" punched>
        <TicketBody>admit</TicketBody>
        <TicketStub>1</TicketStub>
      </Ticket>,
    )
    const face = faceEls(container)[0]
    expect(face).toHaveClass("ll-face", "ll-stock-kraft")
    expect(face.style.getPropertyValue("--ll-face-path")).toMatch(/^path\(evenodd, 'M/)
    expect(container.querySelector('[data-slot="paper-shadow"]')).not.toBeNull()
    expectNoTextureInSvg(container)
  })

  it("Ticket: the stub on the start side, and in right-to-left, moves the face's tear notch", () => {
    const path = (ui: React.ReactElement) => faceEls(render(ui).container)[0].style.getPropertyValue("--ll-face-path")
    const end = path(<Ticket seed="r" stub="end" stubWidth={90} size={[320, 120]} />)
    const start = path(<Ticket seed="r" stub="start" stubWidth={90} size={[320, 120]} />)
    const rtl = path(<div dir="rtl"><Ticket seed="r" stub="end" stubWidth={90} size={[320, 120]} /></div>)
    expect(start).not.toBe(end)
    expect(start).toBe(rtl)
  })

  it("Envelope: the back panel, the flap that lifts and the flap that stands are faces; the front panel is another", () => {
    const { container } = render(
      <Envelope seed="e" size={[400, 250]}>
        <EnvelopeLetter>hello</EnvelopeLetter>
        <EnvelopeFront>
          <EnvelopeAddress>Ada</EnvelopeAddress>
          <EnvelopeTrigger />
        </EnvelopeFront>
      </Envelope>,
    )
    const body = container.querySelector('[data-slot="envelope-body"]') as HTMLElement
    expect(faceEls(body).map((f) => f.getAttribute("data-layer"))).toEqual([null, "open", "hover", null])
    const flaps = faceEls(body).filter((f) => f.hasAttribute("data-layer"))
    for (const f of flaps) expect(f.style.getPropertyValue("--ll-face-path")).toMatch(/^path\('M/)
    expectNoTextureInSvg(container)
  })

  it("Folder: a tab has the paper of the tab behind and the tab in front; a disabled tab has none; the panel is a Paper", () => {
    const { container } = render(
      <Folder defaultValue="a">
        <FolderTabs aria-label="files">
          <FolderTab value="a">A</FolderTab>
          <FolderTab value="b">B</FolderTab>
          <FolderTab value="c" disabled>
            C
          </FolderTab>
        </FolderTabs>
        <FolderContent value="a" edge="torn">
          text
        </FolderContent>
      </Folder>,
    )
    const tabs = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="folder-tab"]'))
    expect(tabs.map((t) => faceEls(t).length)).toEqual([2, 2, 0])
    expect(faceEls(tabs[0]).map((f) => f.getAttribute("data-layer"))).toEqual([null, "checked"])
    expect(faceEls(container.querySelector('[data-slot="folder-content"]')!)).toHaveLength(1)
    expectNoTextureInSvg(container)
  })

  it("LabelTag: the card is a face with a real hole; a round tag's shadow rectangle starts under its arch", () => {
    const { container } = render(<LabelTag seed="l" shape="round" stock="sticky-yellow">tag</LabelTag>)
    const face = faceEls(container)[0]
    expect(face.style.getPropertyValue("--ll-face-path")).toMatch(/^path\(evenodd, '/)
    expect(face.style.getPropertyValue("--ll-veil")).toBe("")
    const shadow = container.querySelector<HTMLElement>('[data-slot="paper-shadow"]')!
    expect(parseFloat(shadow.style.height)).toBeLessThan(170 - 30)
    expectNoTextureInSvg(container)
  })

  it("Clipboard and NotebookCover: no paper, but a board still casts the shadow of a rounded rectangle (no filter on the svg)", () => {
    const { container } = render(
      <>
        <Clipboard seed="cb" />
        <NotebookCover seed="nc" />
      </>,
    )
    expect(faceEls(container)).toHaveLength(0)
    const shadows = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="paper-shadow"]'))
    expect(shadows).toHaveLength(2)
    for (const sh of shadows) expect(sh.style.borderRadius).toMatch(/\d+px/)
    for (const root of [container.querySelector('[data-slot="clipboard"]')!, container.querySelector('[data-slot="notebook-cover"]')!]) {
      expect(root.querySelectorAll(":scope > svg[data-ink='sheet']")).toHaveLength(1)
      expect(root).toHaveAttribute("data-ink-ready")
    }
    expectNoTextureInSvg(container)
  })

  it("the server markup of every consumer carries its faces, its tiles once, and no svg texture", () => {
    const html = renderToString(
      <InkProvider>
        <Paper edge="torn" size={[300, 180]} seed="a" />
        <Ticket seed="b" size={[320, 120]} />
        <LabelTag seed="c" size={[128, 170]}>
          x
        </LabelTag>
        <Envelope seed="d" size={[400, 250]} />
      </InkProvider>,
    )
    const body = html.replace(/<style[\s\S]*?<\/style>/g, "")
    expect(body.match(/data-slot="paper-face"/g)!.length).toBeGreaterThanOrEqual(6)
    const drawings = (body.match(/<svg data-ink[\s\S]*?<\/svg>/g) ?? []).length
    expect(drawings).toBeGreaterThan(8)
    for (const svg of body.match(/<svg data-ink[\s\S]*?<\/svg>/g) ?? []) expect(svg).not.toMatch(NO_TEXTURE)
    expect(html.match(/--ll-tex-cloud:/g)).toHaveLength(1)
  })

  it("hydrates a page of drawn sheets and shaped objects without a warning", () => {
    const ui = (
      <>
        <Paper edge="deckle" size={[300, 180]} seed="h1">
          a
        </Paper>
        <Ticket seed="h2" size={[320, 120]} />
        <LabelTag seed="h3" size={[128, 170]}>
          t
        </LabelTag>
        <Envelope seed="h4" size={[400, 250]} defaultOpen />
      </>
    )
    const root = document.createElement("div")
    root.innerHTML = renderToString(ui)
    document.body.appendChild(root)
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    act(() => {
      hydrateRoot(root, ui)
    })
    expect(err.mock.calls.map((c) => String(c[0]))).toEqual([])
    err.mockRestore()
    expect(faceEls(root).length).toBeGreaterThanOrEqual(6)
    root.remove()
  })
})

describe("the tree", () => {
  const ROOT = resolve(__dirname, "..")
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : []
    })
  const files = walk(join(ROOT, "src")).filter((f) => !/generated/.test(f))

  it("no component or recipe fills an svg with a paper tile: `ll-tex-` patterns live in the static-art helpers only", () => {
    const allowed = new Set(["src/lib/ink/textures.ts", "src/lib/ink/paper/faces.ts", "src/lib/ink/paper/defs.tsx", "src/lib/ink/react/defs.tsx", "src/lib/ink/react/provider.tsx"])
    const offenders = files
      .map((f) => relative(ROOT, f))
      .filter((f) => !allowed.has(f))
      .filter((f) => /url\(#\$?\{?[^)]*ll-tex-|href="#ll-tex-|svgPatternDefs\(/.test(readFileSync(join(ROOT, f), "utf8")))
    expect(offenders.filter((f) => !f.startsWith("src/docs/"))).toEqual([])
  })

  it("nothing on a page calls ensurePaperDefs any more except the docs page of static scene art", () => {
    const users = files.map((f) => relative(ROOT, f)).filter((f) => /ensurePaperDefs\(/.test(readFileSync(join(ROOT, f), "utf8")) && f !== "src/lib/ink/paper/defs.tsx")
    expect(users.filter((f) => !f.startsWith("src/docs/"))).toEqual([])
  })
})
