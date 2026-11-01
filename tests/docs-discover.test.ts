import { describe, expect, it } from "vitest"
import { createCatalog } from "@/docs/core/catalog"
import { discoverSources } from "@/docs/core/discover"

describe("the real docs tree", () => {
  const catalog = createCatalog(discoverSources())

  it("reads without warnings", () => {
    expect(catalog.warnings).toEqual([])
  })

  it("has unique slugs and a category for every component", () => {
    const slugs = catalog.components.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const c of catalog.components) expect(c.doc.category).toBeTruthy()
  })

  it("gives every example a loader and non-empty source", async () => {
    for (const c of catalog.components) {
      for (const example of c.examples) {
        expect(typeof example.load).toBe("function")
        expect(await example.source(), example.path).not.toBe("")
      }
    }
  })
})
