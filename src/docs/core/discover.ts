import { createCatalog, type Catalog, type CatalogSources } from "./catalog"

export function discoverSources(): CatalogSources {
  return {
    meta: import.meta.glob(["/src/docs/meta/*.ts", "!/src/docs/meta/_*"], { eager: true }),
    examples: import.meta.glob(["/src/docs/examples/**/*.tsx", "!/src/docs/examples/**/_*", "!/src/docs/examples/**/_*/**"]),
    exampleSources: import.meta.glob<string>(["/src/docs/examples/**/*.tsx", "!/src/docs/examples/**/_*", "!/src/docs/examples/**/_*/**"], { query: "?raw", import: "default" }),
    ui: import.meta.glob<string>("/src/components/ui/*.tsx", { query: "?raw", import: "default" }),
    blocks: import.meta.glob<string>(["/src/blocks/**/*.{ts,tsx,css}", "!/src/blocks/**/_*", "!/src/blocks/**/_*/**"], { query: "?raw", import: "default" }),
    blockMeta: import.meta.glob(["/src/docs/content/blocks/*.meta.ts", "!/src/docs/content/**/_*", "!/src/docs/content/**/_*/**"], { eager: true }),
    content: import.meta.glob(["/src/docs/content/**/*.tsx", "!/src/docs/content/**/_*", "!/src/docs/content/**/_*/**"]),
    registry: import.meta.glob<string>("/registry.json", { query: "?raw", import: "default" }),
  }
}

export function discoverCatalog(): Catalog {
  const catalog = createCatalog(discoverSources())
  if (import.meta.env.DEV) {
    for (const w of catalog.warnings) console.warn(`[docs] ${w}`)
  }
  return catalog
}
