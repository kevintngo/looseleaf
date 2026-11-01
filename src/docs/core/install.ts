export type PackageManager = "npm" | "pnpm" | "yarn" | "bun"
export const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn", "bun"]

export const NAMESPACE = "@looseleaf"
export const DEFAULT_REGISTRY_URL = "https://kevintngo.github.io/looseleaf/r"

export function registryBase(env: Record<string, unknown> = import.meta.env): string {
  const url = typeof env.VITE_REGISTRY_URL === "string" && env.VITE_REGISTRY_URL ? env.VITE_REGISTRY_URL : DEFAULT_REGISTRY_URL
  return url.replace(/\/+$/, "")
}

export function itemUrl(name: string, base = registryBase()): string {
  return `${base}/${name}.json`
}

export function shadcnRunner(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npx shadcn@latest"
    case "pnpm":
      return "pnpm dlx shadcn@latest"
    case "yarn":
      return "yarn dlx shadcn@latest"
    case "bun":
      return "bunx --bun shadcn@latest"
  }
}

export type AddMode = "namespace" | "url"

export function addCommand(pm: PackageManager, item: string, mode: AddMode = "namespace", base = registryBase()): string {
  const target = mode === "namespace" ? `${NAMESPACE}/${item}` : itemUrl(item, base)
  return `${shadcnRunner(pm)} add ${target}`
}

export function initCommand(pm: PackageManager): string {
  return `${shadcnRunner(pm)} init`
}

export function registerNamespaceCommand(pm: PackageManager, base = registryBase()): string {
  return `${shadcnRunner(pm)} registry add "${NAMESPACE}=${base}/{name}.json"`
}

export function componentsJsonSnippet(base = registryBase()): string {
  return JSON.stringify({ registries: { [NAMESPACE]: `${base}/{name}.json` } }, null, 2)
}

export function packagesCommand(pm: PackageManager, packages: readonly string[]): string {
  const list = packages.join(" ")
  switch (pm) {
    case "npm":
      return `npm install ${list}`
    case "pnpm":
      return `pnpm add ${list}`
    case "yarn":
      return `yarn add ${list}`
    case "bun":
      return `bun add ${list}`
  }
}

export interface InferredDeps {
  dependencies: string[]
  registryDependencies: string[]
}

const IMPORT_RE = /(?:^|[\n;])\s*(?:import|export)\b[^"'`;]*?\bfrom\s*["']([^"']+)["']|(?:^|[\n;])\s*import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1")
}

export function packageName(specifier: string): string {
  const parts = specifier.split("/")
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!
}

const ART_KINDS = new Set(["doodles", "icons", "mascots", "props", "scenes", "stickers"])

export function inferDependencies(source: string): InferredDeps {
  const deps = new Set<string>()
  const items = new Set<string>()
  const code = stripComments(source)
  for (const m of code.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3]
    if (!spec || spec.startsWith(".")) continue
    if (spec.startsWith("@/")) {
      const parts = spec.slice(2).split("/")
      const [area, name] = parts
      if (area === "components" && parts[1] === "ui" && parts[2]) items.add(parts[2])
      else if (area === "hooks" && name) items.add(name.replace(/\.tsx?$/, ""))
      else if (area === "lib" && name && name !== "utils") {
        items.add(name.replace(/\.tsx?$/, ""))
        const kind = name === "ink" && parts[2] === "art" ? parts[3]?.replace(/\.tsx?$/, "") : undefined
        if (kind && ART_KINDS.has(kind)) items.add(`ink-${kind}`)
      }
      else if (area === "blocks" && name) items.add(name)
      continue
    }
    if (spec.startsWith("node:")) continue
    const pkg = packageName(spec)
    if (pkg === "react" || pkg === "react-dom") continue
    deps.add(pkg)
  }
  return { dependencies: [...deps].sort(), registryDependencies: [...items].sort() }
}

interface RegistryItemLike {
  name?: unknown
  dependencies?: unknown
  registryDependencies?: unknown
  files?: unknown
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [])

export function registryItemName(ref: string): string {
  const last = ref.split("/").pop() ?? ref
  return last.replace(/\.json$/, "")
}

export interface RegistryInfo extends InferredDeps {
  files: string[]
}

export function registryInfo(registryText: string, name: string): RegistryInfo | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(registryText)
  } catch {
    return null
  }
  const items = (parsed as { items?: unknown })?.items
  if (!Array.isArray(items)) return null
  const item = items.find((i: RegistryItemLike) => i && i.name === name) as RegistryItemLike | undefined
  if (!item) return null
  const files = Array.isArray(item.files)
    ? item.files.map((f: unknown) => (f && typeof f === "object" ? (f as { path?: unknown }).path : null)).filter((p): p is string => typeof p === "string")
    : []
  return {
    dependencies: strings(item.dependencies),
    registryDependencies: strings(item.registryDependencies).map(registryItemName),
    files,
  }
}
