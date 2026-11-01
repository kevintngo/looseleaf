import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { ExampleEntry } from "@/docs/core/catalog"
import type { ExampleMeta } from "@/docs/types"
import { ExampleViewer } from "@/docs/widgets/ExampleViewer"
import { renderUI } from "./helpers"

function entry(meta: ExampleMeta): ExampleEntry {
  const Example = () => <button type="button">A sticker</button>
  return {
    id: "01-thing",
    path: `/x/${meta.title}.tsx`,
    fileName: "01-thing.tsx",
    title: meta.title,
    load: async () => ({ default: Example, meta }),
    source: async () => "export default function Example() {}",
  }
}

const stageOf = async (meta: ExampleMeta) => {
  renderUI(<ExampleViewer entry={entry(meta)} slug="thing" />)
  return screen.findByRole("group", { name: `${meta.title} preview` })
}

describe("ExampleViewer stage", () => {
  it("the default stage is the graph-paper page", async () => {
    const stage = await stageOf({ title: "Plain" })
    expect(stage).toHaveClass("dk-stage")
    expect(stage).not.toHaveClass("ll-desk")
    expect(within(stage).getByRole("button", { name: "A sticker" })).toBeInTheDocument()
  })

  it('stage "paper" is the same page', async () => {
    expect(await stageOf({ title: "Paper stage", stage: "paper" })).not.toHaveClass("ll-desk")
  })

  it('stage "desk" puts the example on the desk and asks for the desk tiles itself', async () => {
    const stage = await stageOf({ title: "Desk stage", stage: "desk", layout: "stack" })
    expect(stage).toHaveClass("dk-stage", "ll-desk")
    expect(stage).toHaveAttribute("data-layout", "stack")
    const tiles = Array.from(document.head.querySelectorAll("style")).map((s) => s.textContent ?? "")
    expect(tiles.some((t) => t.includes("--ll-tex-linen:"))).toBe(true)
    expect(tiles.some((t) => t.includes("--ll-tex-linen:"))).toBe(true)
    expect(tiles.some((t) => t.includes("--ll-tex-relief:"))).toBe(false)
  })
})

describe("Getting started: provider and server rendering", () => {
  it("documents the provider props, the opt-in desk, portals, the SSR weight and the CSP", async () => {
    const { DocsApp } = await import("@/docs/App")
    const { fixtureCatalog } = await import("./docs-fixtures")
    window.location.hash = "#/getting-started"
    window.scrollTo = () => {}
    renderUI(<DocsApp catalog={fixtureCatalog()} />)
    const main = await screen.findByRole("main")
    for (const heading of ["Provider", "The desk", "Portals", "Server rendering"]) expect(within(main).getByRole("heading", { name: new RegExp(heading) })).toBeInTheDocument()
    expect(main).toHaveTextContent('textures={["linen"]}')
    expect(main).toHaveTextContent("useInkScope()")
    expect(main).toHaveTextContent("img-src data:")
    expect(main).toHaveTextContent("about 100 KB")
    expect(main).not.toHaveTextContent("Provider props are being finalised")
  })
})
