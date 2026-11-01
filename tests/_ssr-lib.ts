import * as React from "react"
import { renderToString } from "react-dom/server"

import type { Discovered } from "./_glob"

export interface Problem {
  check: string
  message: string
}
const problem = (check: string, message: string): Problem => ({ check, message })

export function formatProblems(problems: Problem[]): string {
  return problems.length ? `\n${problems.map((p) => `  [${p.check}] ${p.message}`).join("\n")}\n` : ""
}

const DOM_GLOBALS = [
  "window", "self", "document", "location", "history", "localStorage", "sessionStorage", "screen", "customElements",
  "HTMLElement", "Element", "Node", "SVGElement", "MutationObserver", "ResizeObserver", "IntersectionObserver",
  "matchMedia", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "innerWidth", "innerHeight", "devicePixelRatio",
]

export async function withServerGlobals<T>(fn: () => T | Promise<T>): Promise<T> {
  const g = globalThis as Record<string, unknown>
  const saved: [string, PropertyDescriptor][] = []
  for (const key of DOM_GLOBALS) {
    const d = Object.getOwnPropertyDescriptor(globalThis, key)
    if (d?.configurable) {
      saved.push([key, d])
      delete g[key]
    }
  }
  try {
    return await fn()
  } finally {
    for (const [key, d] of saved) Object.defineProperty(globalThis, key, d)
  }
}

const TAG_RE = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'<>/=]+(?:="[^"]*")?)*)\s*(\/?)>/g
const ATTR_RE = /([^\s"'<>/=]+)(?:="([^"]*)")?/g
const RAW_TEXT_RE = /<(style|script)\b[^>]*>([\s\S]*?)<\/\1>/g
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"])

export const INK_LAYERS = ["rest", "hover", "pressed", "focus", "disabled", "invalid", "checked", "indeterminate", "open", "busy"] as const
export const INK_INTRINSIC_KINDS = ["icon", "doodle", "sticker", "stamp", "tape", "prop", "mascot", "illustration", "badge"] as const

const BAD_VALUE_RE = /\[object Object\]|(?<![A-Za-z0-9_])(?:NaN|-?Infinity|undefined)(?:(?:px|rem|em|%|deg|ms|s|vh|vw|pt)(?![A-Za-z])|(?![A-Za-z0-9_]))/
const BAD_TEXT_RE = /\[object Object\]|(?<![A-Za-z0-9_])(?:NaN|-?Infinity|undefined)(?:px|rem|em|%|deg|ms|vh|vw|pt)(?![A-Za-z])/

const excerpt = (s: string, at: number, radius = 36) => `…${s.slice(Math.max(0, at - radius), at + radius).replace(/\s+/g, " ")}…`

interface OpenTag {
  name: string
  attrs: Map<string, string>
  ink: { kind: string; layers: Set<string> } | null
}

export function checkMarkup(markup: string, { allowEmpty = false }: { allowEmpty?: boolean } = {}): Problem[] {
  const problems: Problem[] = []
  if (!allowEmpty && !markup.trim()) problems.push(problem("empty", "renders nothing on the server"))

  let stripped = markup
  for (const m of markup.matchAll(RAW_TEXT_RE)) {
    const hit = BAD_VALUE_RE.exec(m[2])
    if (hit) problems.push(problem("leaked-value", `<${m[1]}> contains "${hit[0]}" ${excerpt(m[2], hit.index)}`))
  }
  stripped = stripped.replace(RAW_TEXT_RE, "<$1></$1>")

  const ids = new Map<string, number>()
  const stack: OpenTag[] = []
  for (const tag of stripped.matchAll(TAG_RE)) {
    const closing = tag[1] === "/"
    const name = tag[2].toLowerCase()
    if (closing) {
      const at = stack.map((t) => t.name).lastIndexOf(name)
      if (at >= 0) stack.length = at
      continue
    }
    const attrs = new Map<string, string>()
    for (const a of tag[3].matchAll(ATTR_RE)) attrs.set(a[1], a[2] ?? "")
    for (const [attr, value] of attrs) {
      const hit = BAD_VALUE_RE.exec(value)
      if (hit) problems.push(problem("leaked-value", `<${name} ${attr}="…"> contains "${hit[0]}" ${excerpt(value, hit.index)}`))
    }
    const parent = stack[stack.length - 1]
    let ink = parent?.ink ?? null
    if (attrs.has("data-ink")) {
      const kind = attrs.get("data-ink") ?? ""
      const named = (INK_INTRINSIC_KINDS as readonly string[]).includes(kind) && attrs.get("role") === "img" && (attrs.has("aria-label") || attrs.has("aria-labelledby"))
      if (attrs.get("aria-hidden") !== "true" && !named) problems.push(problem("ink-aria-hidden", `<${name} data-ink="${kind}"> is missing aria-hidden="true" (intrinsic art with a name: role="img" + aria-label)`))
      if (["", "true", "undefined", "null"].includes(kind)) problems.push(problem("ink-kind", `<${name} data-ink> needs a kind name (data-ink="underline"), got "${kind}"`))
      else if (name === "svg") {
        if (attrs.get("focusable") !== "false") problems.push(problem("ink-focusable", `<svg data-ink="${kind}"> is missing focusable="false"`))
        const overlay = !(INK_INTRINSIC_KINDS as readonly string[]).includes(kind)
        if (overlay && parent && !parent.attrs.has("data-ink-host") && !parent.ink) problems.push(problem("ink-host", `overlay <svg data-ink="${kind}"> sits in <${parent.name}>, which lacks data-ink-host (the server-side marker of an ink host)`))
      }
      ink = name === "svg" ? { kind, layers: new Set() } : ink
    }
    const layer = attrs.get("data-layer")
    if (layer !== undefined) {
      if (!(INK_LAYERS as readonly string[]).includes(layer)) problems.push(problem("ink-layer-name", `<${name} data-layer="${layer}"> is not one of ${INK_LAYERS.join(", ")}`))
      if (!ink) problems.push(problem("ink-layer-name", `<${name} data-layer="${layer}"> is not inside an <svg data-ink>`))
      else if (ink.layers.has(layer)) problems.push(problem("ink-layer-name", `data-layer="${layer}" appears twice in one <svg data-ink="${ink.kind}">`))
      else ink.layers.add(layer)
    }
    const id = attrs.get("id")
    if (id) ids.set(id, (ids.get(id) ?? 0) + 1)
    const selfClosed = tag[4] === "/" || VOID_TAGS.has(name)
    if (!selfClosed) stack.push({ name, attrs, ink })
  }
  for (const [id, n] of ids) if (n > 1) problems.push(problem("duplicate-id", `id="${id}" appears ${n} times`))

  const texts = stripped.split(/<[^>]*>/)
  for (const text of texts) {
    const hit = BAD_TEXT_RE.exec(text)
    if (hit) problems.push(problem("leaked-value", `text contains "${hit[0]}" ${excerpt(text, hit.index)}`))
    else if (/^\s*(?:NaN|undefined|Infinity|-Infinity)\s*$/.test(text)) problems.push(problem("leaked-value", `a text node is exactly "${text.trim()}"`))
  }
  return problems
}

export function checkSource(source: string): Problem[] {
  const problems: Problem[] = []
  if (/from\s+["']lucide(?:-react)?(?:\/[^"']*)?["']|["']@lucide\/|require\(\s*["']lucide/.test(source)) problems.push(problem("lucide", "imports lucide-react — use the doodle icon set"))
  return problems
}

const isComponentType = (x: unknown): x is React.ComponentType => typeof x === "function" || (typeof x === "object" && x !== null && "$$typeof" in x)

// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "")

export function short(e: unknown): string {
  const err = e instanceof Error ? e : new Error(String(e))
  const first = stripAnsi(err.message).split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 2).join(" ")
  const frame = (err.stack ?? "").split("\n").find((l) => l.includes("/looseleaf/") && !l.includes("node_modules") && !l.includes("/tests/_ssr-lib"))
  const where = frame ? /\(?([^()\s]+:\d+:\d+)\)?\s*$/.exec(frame.trim())?.[1] : undefined
  return `${err.name}: ${first}${where ? ` (at ${where.replace(/^.*\/looseleaf\//, "")})` : ""}`
}

function diffMessage(a: string, b: string): string {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return `two renders of the same element differ at char ${i}: ${excerpt(a, i)} vs ${excerpt(b, i)} — a random/time/module-counter value in render; seed from useId()/props`
}

export function smokeRender(make: () => React.ReactElement, { allowEmpty = false }: { allowEmpty?: boolean } = {}): { problems: Problem[]; markup: string | null } {
  let first: string
  try {
    first = renderToString(make())
  } catch (e) {
    return { problems: [problem("render", short(e))], markup: null }
  }
  const problems = checkMarkup(first, { allowEmpty })
  try {
    const second = renderToString(make())
    if (second !== first) problems.push(problem("deterministic", diffMessage(first, second)))
  } catch (e) {
    problems.push(problem("render", `second render threw: ${short(e)}`))
  }
  return { problems, markup: first }
}

export async function smokeExample(item: Discovered): Promise<Problem[]> {
  const problems = checkSource(await item.source())
  if (problems.some((p) => p.check === "lucide")) return problems
  let mod: Record<string, unknown>
  try {
    mod = await withServerGlobals(() => item.load())
  } catch (e) {
    return [...problems, problem("import", short(e))]
  }
  const Example = mod.default
  const meta = mod.meta as { title?: unknown } | undefined
  if (!meta || typeof meta.title !== "string" || !meta.title.trim()) problems.push(problem("meta", "missing `export const meta = { title: \"…\" }`"))
  if (!isComponentType(Example)) return [...problems, problem("export", "no default-exported component")]
  const { problems: renderProblems } = await withServerGlobals(() => smokeRender(() => React.createElement(Example)))
  return [...problems, ...renderProblems]
}

export interface UiResult {
  problems: Problem[]
  rendered: string[]
  skipped: string[]
}

export async function smokeUiModule(item: Discovered): Promise<UiResult> {
  const result: UiResult = { problems: checkSource(await item.source()), rendered: [], skipped: [] }
  if (result.problems.length) return result
  let mod: Record<string, unknown>
  try {
    mod = await withServerGlobals(() => item.load())
  } catch (e) {
    result.problems.push(problem("import", `cannot be imported in a server-like environment (no window/document): ${short(e)}`))
    return result
  }
  if ("default" in mod) result.problems.push(problem("default-export", "ui files use named exports only"))
  const names = Object.keys(mod).filter((n) => /^[A-Z]/.test(n) && isComponentType(mod[n]))
  if (!names.length && !Object.keys(mod).length) result.problems.push(problem("exports", "exports nothing"))
  for (const name of names) {
    const Component = mod[name] as React.ComponentType
    const { markup, problems } = await withServerGlobals(() => smokeRender(() => React.createElement(Component), { allowEmpty: true }))
    if (markup === null) result.skipped.push(name)
    else {
      result.rendered.push(name)
      for (const p of problems) result.problems.push({ check: p.check, message: `<${name}/> ${p.message}` })
    }
  }
  return result
}
