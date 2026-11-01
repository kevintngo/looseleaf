type Loader<T = unknown> = () => Promise<T>

export interface Discovered {
  path: string
  load: Loader<Record<string, unknown>>
  source: Loader<string>
}

const exampleModules = import.meta.glob<Record<string, unknown>>("/src/docs/examples/**/*.tsx")
const exampleSources = import.meta.glob<string>("/src/docs/examples/**/*.tsx", { query: "?raw", import: "default" })
const uiModules = import.meta.glob<Record<string, unknown>>("/src/components/ui/*.tsx")
const uiSources = import.meta.glob<string>("/src/components/ui/*.tsx", { query: "?raw", import: "default" })

export function discover(modules: Record<string, Loader<Record<string, unknown>>>, sources: Record<string, Loader<string>>): Discovered[] {
  return Object.keys(modules)
    .filter((p) => !/\/_[^/]*$/.test(p))
    .sort()
    .map((path) => ({
      path,
      load: modules[path],
      source: sources[path] ?? (async () => ""),
    }))
}

export const smokeSlug: string | null = (typeof process !== "undefined" ? process.env.SMOKE_SLUG : undefined)?.trim() || null

const onlySlug = (list: Discovered[], prefix: string, exact: (slug: string) => string) =>
  smokeSlug ? list.filter((d) => (prefix ? d.path.startsWith(`${prefix}${smokeSlug}/`) : d.path === exact(smokeSlug))) : list

export const examples = onlySlug(discover(exampleModules, exampleSources), "/src/docs/examples/", () => "")
export const uiComponents = onlySlug(discover(uiModules, uiSources), "", (slug) => `/src/components/ui/${slug}.tsx`)

const providerModules = import.meta.glob<Record<string, unknown>>("/src/lib/ink/react/provider.tsx")

export async function loadInkProvider(): Promise<import("react").ComponentType<{ children?: import("react").ReactNode }> | null> {
  const load = Object.values(providerModules)[0]
  if (!load) return null
  const mod = await load()
  return typeof mod.InkProvider === "function" ? (mod.InkProvider as import("react").ComponentType<{ children?: import("react").ReactNode }>) : null
}
