import type { ComponentType } from "react"
import type { Category, ComponentDoc, ExampleModule } from "../types"

export type Loader<T> = () => Promise<T>

export const CATEGORY_ORDER: readonly Category[] = [
  "Actions",
  "Forms",
  "Feedback",
  "Overlays",
  "Navigation",
  "Layout",
  "Data display",
  "Charts",
  "Paper",
  "Marks",
  "Stickers & doodles",
  "Chat",
  "Interactive",
  "Typography",
  "Icons",
]

export interface BlockDoc {
  title: string
  description?: string
  tags?: string[]
  surface?: "paper" | "desk"
}

export interface ContentMeta {
  title?: string
  description?: string
}

export interface ContentModule {
  default: ComponentType
  meta?: ContentMeta
}

export interface ExampleEntry {
  id: string
  path: string
  fileName: string
  title: string
  load: Loader<ExampleModule>
  source: Loader<string>
}

export interface ComponentEntry {
  slug: string
  doc: ComponentDoc
  examples: ExampleEntry[]
  uiPath: string | null
  uiSource: Loader<string> | null
}

export interface BlockFile {
  path: string
  source: Loader<string>
}

export interface BlockEntry {
  slug: string
  title: string
  description: string
  tags: string[]
  surface: "paper" | "desk"
  files: BlockFile[]
  contentKey: string | null
}

export interface CategoryGroup {
  category: string
  items: ComponentEntry[]
}

export interface Catalog {
  components: ComponentEntry[]
  bySlug: Map<string, ComponentEntry>
  groups: CategoryGroup[]
  blocks: BlockEntry[]
  blockBySlug: Map<string, BlockEntry>
  content: Map<string, Loader<ContentModule>>
  registry: Loader<string> | null
  warnings: string[]
  neighbours(slug: string): { prev: ComponentEntry | null; next: ComponentEntry | null }
}

export interface CatalogSources {
  meta?: Record<string, unknown>
  examples?: Record<string, Loader<unknown>>
  exampleSources?: Record<string, Loader<string>>
  ui?: Record<string, Loader<string>>
  blocks?: Record<string, Loader<string>>
  blockMeta?: Record<string, unknown>
  content?: Record<string, Loader<unknown>>
  registry?: Record<string, Loader<string>>
  includeHidden?: boolean
}

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true })

export function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ")
}

export function exampleTitleFromId(id: string): string {
  const words = id.replace(/^\d+[-_.]?/, "").replace(/[-_]+/g, " ").trim()
  return words ? words[0]!.toUpperCase() + words.slice(1) : id
}

const isHidden = (path: string) => path.split("/").some((s) => s.startsWith("_"))

function isComponentDoc(value: unknown): value is ComponentDoc {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return typeof v.slug === "string" && v.slug !== "" && typeof v.title === "string"
}

function normaliseDoc(doc: ComponentDoc): ComponentDoc {
  return {
    ...doc,
    category: doc.category ?? ("Actions" as Category),
    description: doc.description ?? "",
    parts: Array.isArray(doc.parts) ? doc.parts : [],
    usage: doc.usage ?? "",
    a11y: Array.isArray(doc.a11y) ? doc.a11y : undefined,
    related: Array.isArray(doc.related) ? [...new Set(doc.related)] : undefined,
  }
}

export function createCatalog(sources: CatalogSources = {}): Catalog {
  const includeHidden = sources.includeHidden ?? false
  const warnings: string[] = []
  const visible = (path: string) => includeHidden || !isHidden(path)

  const docs = new Map<string, { doc: ComponentDoc; path: string }>()
  for (const path of Object.keys(sources.meta ?? {}).sort()) {
    const m = /(?:^|\/)meta\/([^/]+)\.ts$/.exec(path)
    if (!m || !visible(path)) continue
    const mod = sources.meta![path] as { default?: unknown } | undefined
    const doc = mod?.default
    if (!isComponentDoc(doc)) {
      warnings.push(`${path}: default export is not a ComponentDoc (needs at least slug and title)`)
      continue
    }
    if (doc.slug !== m[1]) warnings.push(`${path}: slug "${doc.slug}" does not match the file name "${m[1]}"`)
    if (docs.has(doc.slug)) warnings.push(`${path}: duplicate slug "${doc.slug}" (kept the first, from ${docs.get(doc.slug)!.path})`)
    else docs.set(doc.slug, { doc: normaliseDoc(doc), path })
  }

  const examplesBySlug = new Map<string, ExampleEntry[]>()
  for (const path of Object.keys(sources.examples ?? {}).sort()) {
    const m = /(?:^|\/)examples\/([^/]+)\/([^/]+)\.tsx$/.exec(path)
    if (!m || !visible(path)) continue
    const [, slug, id] = m as unknown as [string, string, string]
    const entry: ExampleEntry = {
      id,
      path,
      fileName: `${id}.tsx`,
      title: exampleTitleFromId(id),
      load: sources.examples![path] as Loader<ExampleModule>,
      source: sources.exampleSources?.[path] ?? (async () => ""),
    }
    const list = examplesBySlug.get(slug)
    if (list) list.push(entry)
    else examplesBySlug.set(slug, [entry])
  }

  const uiBySlug = new Map<string, { path: string; source: Loader<string> }>()
  for (const [path, source] of Object.entries(sources.ui ?? {})) {
    const m = /(?:^|\/)ui\/([^/]+)\.tsx$/.exec(path)
    if (m && visible(path)) uiBySlug.set(m[1]!, { path, source })
  }

  for (const slug of examplesBySlug.keys()) {
    if (!docs.has(slug)) warnings.push(`examples/${slug}/: no meta/${slug}.ts, so these examples are not shown`)
  }

  const components: ComponentEntry[] = [...docs.values()].map(({ doc }) => {
    const ui = uiBySlug.get(doc.slug)
    return {
      slug: doc.slug,
      doc,
      examples: examplesBySlug.get(doc.slug) ?? [],
      uiPath: ui?.path ?? null,
      uiSource: ui?.source ?? null,
    }
  })

  const categoryRank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c as Category)
    return i < 0 ? CATEGORY_ORDER.length : i
  }
  components.sort(
    (a, b) =>
      categoryRank(a.doc.category) - categoryRank(b.doc.category) ||
      collator.compare(a.doc.category, b.doc.category) ||
      collator.compare(a.doc.title, b.doc.title),
  )

  const groups: CategoryGroup[] = []
  for (const entry of components) {
    const last = groups[groups.length - 1]
    if (last && last.category === entry.doc.category) last.items.push(entry)
    else groups.push({ category: entry.doc.category, items: [entry] })
  }

  const bySlug = new Map(components.map((c) => [c.slug, c]))

  const content = new Map<string, Loader<ContentModule>>()
  for (const [path, load] of Object.entries(sources.content ?? {})) {
    const m = /(?:^|\/)content\/(.+)\.tsx$/.exec(path)
    if (m && visible(path)) content.set(m[1]!, load as Loader<ContentModule>)
  }

  const blockFiles = new Map<string, BlockFile[]>()
  for (const [path, source] of Object.entries(sources.blocks ?? {})) {
    const m = /(?:^|\/)blocks\/([^/]+)\/(.+)$/.exec(path)
    if (!m || !visible(path)) continue
    const list = blockFiles.get(m[1]!)
    const file = { path: m[2]!, source }
    if (list) list.push(file)
    else blockFiles.set(m[1]!, [file])
  }
  const blockDocs = new Map<string, BlockDoc>()
  for (const [path, mod] of Object.entries(sources.blockMeta ?? {})) {
    const m = /(?:^|\/)content\/blocks\/([^/]+)\.meta\.ts$/.exec(path)
    const doc = (mod as { default?: BlockDoc } | undefined)?.default
    if (m && visible(path) && doc && typeof doc.title === "string") blockDocs.set(m[1]!, doc)
  }
  const blockSlugs = new Set<string>([...blockFiles.keys(), ...blockDocs.keys()])
  for (const key of content.keys()) {
    const m = /^blocks\/([^/]+)$/.exec(key)
    if (m) blockSlugs.add(m[1]!)
  }
  const blocks: BlockEntry[] = [...blockSlugs].sort(collator.compare).map((slug) => {
    const doc = blockDocs.get(slug)
    const files = (blockFiles.get(slug) ?? []).sort((a, b) => {
      const ai = /^index\./.test(a.path) ? 0 : 1
      const bi = /^index\./.test(b.path) ? 0 : 1
      return ai - bi || collator.compare(a.path, b.path)
    })
    return {
      slug,
      title: doc?.title ?? titleCase(slug),
      description: doc?.description ?? "",
      tags: doc?.tags ?? [],
      surface: doc?.surface === "desk" ? "desk" : "paper",
      files,
      contentKey: content.has(`blocks/${slug}`) ? `blocks/${slug}` : null,
    }
  })

  const registryLoaders = Object.values(sources.registry ?? {})

  return {
    components,
    bySlug,
    groups,
    blocks,
    blockBySlug: new Map(blocks.map((b) => [b.slug, b])),
    content,
    registry: registryLoaders[0] ?? null,
    warnings,
    neighbours(slug) {
      const i = components.findIndex((c) => c.slug === slug)
      if (i < 0) return { prev: null, next: null }
      return { prev: components[i - 1] ?? null, next: components[i + 1] ?? null }
    },
  }
}

export const EMPTY_CATALOG: Catalog = createCatalog()
