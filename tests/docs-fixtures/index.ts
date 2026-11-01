import { createCatalog, type CatalogSources } from "@/docs/core/catalog"

export function fixtureSources(): CatalogSources {
  return {
    meta: import.meta.glob("/tests/docs-fixtures/meta/*.ts", { eager: true }),
    examples: import.meta.glob("/tests/docs-fixtures/examples/**/*.tsx"),
    exampleSources: import.meta.glob<string>("/tests/docs-fixtures/examples/**/*.tsx", { query: "?raw", import: "default" }),
    ui: import.meta.glob<string>("/tests/docs-fixtures/ui/*.tsx", { query: "?raw", import: "default" }),
    blocks: import.meta.glob<string>("/tests/docs-fixtures/blocks/**/*.{ts,tsx,css}", { query: "?raw", import: "default" }),
    blockMeta: import.meta.glob("/tests/docs-fixtures/content/blocks/*.meta.ts", { eager: true }),
    content: import.meta.glob("/tests/docs-fixtures/content/**/*.tsx"),
    registry: import.meta.glob<string>("/tests/docs-fixtures/registry.json", { query: "?raw", import: "default" }),
  }
}

export const fixtureCatalog = (overrides: Partial<CatalogSources> = {}) => createCatalog({ ...fixtureSources(), ...overrides })
