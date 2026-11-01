export type Route =
  | { name: "home" }
  | { name: "getting-started" }
  | { name: "foundations"; topic: string | null }
  | { name: "components"; slug: string | null }
  | { name: "blocks"; slug: string | null }
  | { name: "playground" }
  | { name: "changelog" }
  | { name: "not-found"; path: string }

export interface ParsedHash {
  path: string
  anchor: string
  search: string
  anchorOnly: boolean
}

function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

export function normalisePath(raw: string): string {
  const segments = raw
    .split("/")
    .map((s) => safeDecode(s).trim().toLowerCase())
    .filter(Boolean)
  return "/" + segments.join("/")
}

export function parseHash(hash: string): ParsedHash {
  const body = hash.startsWith("#") ? hash.slice(1) : hash
  if (body === "") return { path: "/", anchor: "", search: "", anchorOnly: false }
  if (!body.startsWith("/")) return { path: "", anchor: safeDecode(body), search: "", anchorOnly: true }
  const anchorAt = body.indexOf("#")
  let pathPart = anchorAt < 0 ? body : body.slice(0, anchorAt)
  const anchor = anchorAt < 0 ? "" : safeDecode(body.slice(anchorAt + 1))
  const queryAt = pathPart.indexOf("?")
  const search = queryAt < 0 ? "" : pathPart.slice(queryAt)
  if (queryAt >= 0) pathPart = pathPart.slice(0, queryAt)
  return { path: normalisePath(pathPart), anchor, search, anchorOnly: false }
}

export function matchRoute(path: string): Route {
  const segments = path.split("/").filter(Boolean)
  const [first, second, ...rest] = segments
  if (segments.length === 0) return { name: "home" }
  if (rest.length > 0) return { name: "not-found", path }
  switch (first) {
    case "getting-started":
      return second === undefined ? { name: "getting-started" } : { name: "not-found", path }
    case "foundations":
      return { name: "foundations", topic: second ?? null }
    case "components":
      return { name: "components", slug: second ?? null }
    case "blocks":
      return { name: "blocks", slug: second ?? null }
    case "playground":
      return second === undefined ? { name: "playground" } : { name: "not-found", path }
    case "changelog":
      return second === undefined ? { name: "changelog" } : { name: "not-found", path }
    default:
      return { name: "not-found", path }
  }
}

export const paths = {
  home: "/",
  gettingStarted: "/getting-started",
  foundations: (topic?: string) => (topic ? `/foundations/${topic}` : "/foundations"),
  components: (slug?: string) => (slug ? `/components/${slug}` : "/components"),
  blocks: (slug?: string) => (slug ? `/blocks/${slug}` : "/blocks"),
  playground: "/playground",
  changelog: "/changelog",
} as const

export function hrefFor(to: string): string {
  if (to.startsWith("#")) return to
  return "#" + (to.startsWith("/") ? to : "/" + to)
}

export function withAnchor(path: string, anchor: string): string {
  return anchor ? `${path}#${anchor}` : path
}

export function slugifyAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
