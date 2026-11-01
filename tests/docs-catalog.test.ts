import { describe, expect, it } from "vitest"
import { CATEGORY_ORDER, EMPTY_CATALOG, createCatalog, exampleTitleFromId, titleCase } from "@/docs/core/catalog"
import type { ComponentDoc } from "@/docs/types"
import { fixtureCatalog, fixtureSources } from "./docs-fixtures"

const doc = (slug: string, category: string, extra: Partial<ComponentDoc> = {}) =>
  ({ default: { slug, title: titleCase(slug), category, description: "", parts: [], usage: "", ...extra } })

describe("createCatalog from the fixture tree", () => {
  const catalog = fixtureCatalog()

  it("finds components and ignores underscore helpers", () => {
    expect(catalog.components.map((c) => c.slug)).toEqual(["button", "date-picker", "input", "card"])
    expect(catalog.bySlug.has("_hidden")).toBe(false)
  })

  it("groups by category in the documented order, then by title", () => {
    expect(catalog.groups.map((g) => [g.category, g.items.map((i) => i.slug)])).toEqual([
      ["Actions", ["button"]],
      ["Forms", ["date-picker", "input"]],
      ["Layout", ["card"]],
    ])
    const rank = (c: string) => CATEGORY_ORDER.indexOf(c as (typeof CATEGORY_ORDER)[number])
    expect(rank("Actions")).toBeLessThan(rank("Forms"))
    expect(rank("Forms")).toBeLessThan(rank("Layout"))
  })

  it("attaches sorted examples with derived titles and skips helpers", () => {
    const button = catalog.bySlug.get("button")!
    expect(button.examples.map((e) => e.id)).toEqual(["01-basic", "02-tall-overlay", "03-crash"])
    expect(button.examples.map((e) => e.title)).toEqual(["Basic", "Tall overlay", "Crash"])
    expect(catalog.bySlug.get("input")!.examples).toEqual([])
  })

  it("gives the code tab the raw file text, and lazy modules that load", async () => {
    const [basic] = catalog.bySlug.get("button")!.examples
    const text = await basic!.source()
    expect(text).toContain("export default function Example()")
    expect(text).toContain('export const meta: ExampleMeta = { title: "Basic button"')
    const mod = await basic!.load()
    expect(typeof mod.default).toBe("function")
    expect(mod.meta.title).toBe("Basic button")
  })

  it("links ui source, registry, content and blocks", async () => {
    const button = catalog.bySlug.get("button")!
    expect(button.uiPath).toMatch(/ui\/button\.tsx$/)
    expect(await button.uiSource!()).toContain("class-variance-authority")
    expect(catalog.bySlug.get("card")!.uiSource).toBeNull()
    expect(JSON.parse((await catalog.registry!())).items[0].name).toBe("button")
    expect([...catalog.content.keys()].sort()).toEqual(["blocks/login", "foundations/colour"])
    expect(catalog.blocks).toHaveLength(1)
    expect(catalog.blocks[0]).toMatchObject({ slug: "login", title: "Sign in", tags: ["auth"], contentKey: "blocks/login", surface: "paper" })
    expect(catalog.blocks[0]!.files.map((f) => f.path)).toEqual(["index.tsx", "login-form.tsx"])
  })

  it("knows previous and next neighbours in nav order", () => {
    expect(catalog.neighbours("button")).toMatchObject({ prev: null, next: { slug: "date-picker" } })
    expect(catalog.neighbours("card")).toMatchObject({ prev: { slug: "input" }, next: null })
    expect(catalog.neighbours("nope")).toEqual({ prev: null, next: null })
  })

  it("can include hidden entries when asked (tests only)", () => {
    const all = fixtureCatalog({ includeHidden: true })
    expect(all.bySlug.has("_hidden")).toBe(true)
    expect(all.bySlug.get("button")!.examples.map((e) => e.id)).toContain("_helper")
  })
})

describe("createCatalog robustness", () => {
  it("renders an empty tree without complaint", () => {
    const empty = createCatalog({})
    expect(empty.components).toEqual([])
    expect(empty.groups).toEqual([])
    expect(empty.blocks).toEqual([])
    expect(empty.registry).toBeNull()
    expect(EMPTY_CATALOG.warnings).toEqual([])
  })

  it("reports malformed meta and slug mismatches instead of throwing", () => {
    const catalog = createCatalog({
      meta: {
        "/src/docs/meta/broken.ts": { default: { nothing: true } },
        "/src/docs/meta/wrong-name.ts": doc("other-name", "Forms"),
        "/src/docs/meta/dup.ts": doc("dup", "Forms"),
        "/x/other/meta/dup.ts": doc("dup", "Actions"),
      },
      examples: { "/src/docs/examples/ghost/01-a.tsx": async () => ({}) },
    })
    expect(catalog.warnings.join("\n")).toMatch(/broken\.ts.*not a ComponentDoc/)
    expect(catalog.warnings.join("\n")).toMatch(/does not match the file name "wrong-name"/)
    expect(catalog.warnings.join("\n")).toMatch(/duplicate slug "dup"/)
    expect(catalog.warnings.join("\n")).toMatch(/examples\/ghost\//)
    expect(catalog.components.map((c) => c.slug).sort()).toEqual(["dup", "other-name"])
  })

  it("places unknown categories after the known ones and fills missing fields", () => {
    const catalog = createCatalog({
      meta: {
        "/m/meta/a.ts": doc("a", "Zebra stripes"),
        "/m/meta/b.ts": { default: { slug: "b", title: "B", category: "Icons" } },
      },
    })
    expect(catalog.groups.map((g) => g.category)).toEqual(["Icons", "Zebra stripes"])
    const b = catalog.bySlug.get("b")!.doc
    expect(b.parts).toEqual([])
    expect(b.usage).toBe("")
    expect(b.description).toBe("")
  })

  it("derives readable titles", () => {
    expect(exampleTitleFromId("01-basic-usage")).toBe("Basic usage")
    expect(exampleTitleFromId("12")).toBe("12")
    expect(titleCase("date-picker")).toBe("Date Picker")
  })

  it("exposes every fixture source key the docs rely on", () => {
    const s = fixtureSources()
    expect(Object.keys(s.meta!).length).toBeGreaterThan(3)
    expect(Object.keys(s.exampleSources!)).toEqual(Object.keys(s.examples!))
  })
})
