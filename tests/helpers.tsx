import * as React from "react"
import { render, type RenderOptions, type RenderResult } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import axe from "axe-core"

export interface RenderUIOptions extends RenderOptions {
  user?: Parameters<typeof userEvent.setup>[0]
}

export type RenderUIResult = RenderResult & { user: UserEvent }

export function renderUI(ui: React.ReactElement, { user: userOptions, ...options }: RenderUIOptions = {}): RenderUIResult {
  const user = userEvent.setup(userOptions)
  return { user, ...render(ui, options) }
}

export const AXE_JSDOM_DISABLED_RULES = [
  "color-contrast",
  "color-contrast-enhanced",
  "link-in-text-block",
  "target-size",
  "scrollable-region-focusable",
  "region",
] as const

export interface AxeCheckOptions {
  rules?: Record<string, { enabled: boolean }>
  only?: string[]
}

export class AxeViolationError extends Error {
  violations: axe.Result[]
  constructor(message: string, violations: axe.Result[]) {
    super(message)
    this.name = "AxeViolationError"
    this.violations = violations
  }
}

let axeQueue: Promise<unknown> = Promise.resolve()

export function axeCheck(container: Element | Document = document.body, options: AxeCheckOptions = {}): Promise<void> {
  const run = axeQueue.then(() => runAxe(container, options))
  axeQueue = run.catch(() => undefined)
  return run
}

async function runAxe(container: Element | Document, options: AxeCheckOptions) {
  const rules: Record<string, { enabled: boolean }> = Object.fromEntries(AXE_JSDOM_DISABLED_RULES.map((id) => [id, { enabled: false }]))
  Object.assign(rules, options.rules)
  const runOptions: axe.RunOptions = { resultTypes: ["violations"], rules }
  if (options.only?.length) runOptions.runOnly = { type: "rule", values: options.only }
  const results = await axe.run(container as axe.ElementContext, runOptions)
  if (results.violations.length) throw new AxeViolationError(formatAxeViolations(results.violations), results.violations)
}

export function formatAxeViolations(violations: axe.Result[]): string {
  const lines = [`axe found ${violations.length} accessibility violation${violations.length === 1 ? "" : "s"}:`]
  violations.forEach((v, i) => {
    lines.push("", `${i + 1}. ${v.id} (${v.impact ?? "n/a"}): ${v.help}`, `   ${v.helpUrl}`)
    for (const node of v.nodes.slice(0, 4)) {
      const html = node.html.length > 160 ? `${node.html.slice(0, 157)}...` : node.html
      lines.push(`   - ${html}`, `     target: ${node.target.join(" > ")}`)
      const fix = (node.failureSummary ?? "").split("\n").map((l) => l.trim()).filter(Boolean)
      for (const f of fix) lines.push(`     ${f}`)
    }
    if (v.nodes.length > 4) lines.push(`   ... and ${v.nodes.length - 4} more element${v.nodes.length - 4 === 1 ? "" : "s"}`)
  })
  return lines.join("\n")
}

export const INK_LAYER_NAMES = ["rest", "disabled", "invalid", "checked", "indeterminate", "open", "busy", "hover", "pressed", "focus"] as const
export type InkLayerName = (typeof INK_LAYER_NAMES)[number]
export const INK_INTRINSIC_KINDS = ["icon", "doodle", "sticker", "stamp", "tape", "prop", "mascot", "illustration", "badge"] as const

export function getInkLayers(container: ParentNode = document.body): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-ink]"))
}

export function getInkStateLayers(ink: Element): Element[] {
  return Array.from(ink.querySelectorAll("[data-layer]"))
}

export function inkLayerNames(container: ParentNode = document.body): string[] {
  return [...new Set(getInkLayers(container).flatMap((ink) => getInkStateLayers(ink).map((g) => g.getAttribute("data-layer") ?? "")))]
}

export const getInkHost = (ink: Element): Element | null => ink.parentElement

export interface InkExpectations {
  min?: number
  kinds?: string[]
  absolute?: boolean
  layers?: readonly InkLayerName[]
  onlyLayers?: readonly InkLayerName[]
  host?: boolean
  ready?: boolean
  intrinsic?: boolean
}

const classTokens = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean)

function hasPointerEventsNone(el: Element, root: Element): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const style = node.getAttribute("style") ?? ""
    if (/pointer-events\s*:\s*none/i.test(style) || node.getAttribute("pointer-events") === "none") return true
    for (const token of classTokens(node)) {
      if (token === "pointer-events-none") return true
      const m = /^\[&([_>])(.+)\]:pointer-events-none$/.exec(token)
      if (m && node !== el) {
        try {
          const selector = m[2].replace(/_/g, " ")
          if (m[1] === ">" ? Array.from(node.children).some((ch) => ch === el && el.matches(selector)) : el.matches(selector)) return true
        } catch {
        }
      }
    }
    if (node === root.ownerDocument.documentElement) break
  }
  return false
}

function isPositioned(el: Element): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (classTokens(node).some((t) => t === "absolute" || t === "fixed") || /position\s*:\s*(absolute|fixed)/i.test(node.getAttribute("style") ?? "")) return true
    if (node.hasAttribute("data-slot")) break
  }
  return false
}

const FOCUSABLE = "a[href],button,input,select,textarea,summary,[tabindex],[contenteditable='true']"

export function expectInkLayers(container: ParentNode = document.body, expectations: InkExpectations = {}): HTMLElement[] {
  const layers = getInkLayers(container)
  const problems: string[] = []
  const min = expectations.min ?? 0
  if (layers.length < min) problems.push(`expected at least ${min} [data-ink] layer${min === 1 ? "" : "s"}, found ${layers.length}`)
  const root = (container instanceof Element ? container : (container as Document).documentElement ?? document.documentElement) as Element
  const intrinsicKinds: readonly string[] = INK_INTRINSIC_KINDS
  const known: readonly string[] = INK_LAYER_NAMES
  const drawn = new Set<string>()
  layers.forEach((el, i) => {
    const kind = el.getAttribute("data-ink") ?? ""
    const label = `layer ${i + 1} <${el.tagName.toLowerCase()} data-ink="${kind}">`
    const validKind = Boolean(kind) && kind !== "true"
    if (!validKind) problems.push(`${label}: data-ink must name a kind (data-ink="underline")`)
    else if (expectations.kinds && !expectations.kinds.includes(kind)) problems.push(`${label}: kind "${kind}" is not one of ${expectations.kinds.join(", ")}`)
    const named = intrinsicKinds.includes(kind) && el.getAttribute("role") === "img" && (el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby"))
    if (el.getAttribute("aria-hidden") !== "true" && !el.closest('[aria-hidden="true"]') && !named) problems.push(`${label}: not aria-hidden="true" (intrinsic art with a name: role="img" + aria-label)`)
    if (el.tagName.toLowerCase() === "svg" && el.getAttribute("focusable") !== "false") problems.push(`${label}: an ink svg carries focusable="false"`)
    if (!hasPointerEventsNone(el, root)) problems.push(`${label}: no pointer-events-none on it or an ancestor`)
    if (expectations.absolute && !isPositioned(el)) problems.push(`${label}: not absolutely positioned (absolute/fixed class)`)
    if (el.querySelector(FOCUSABLE) || el.matches(FOCUSABLE)) problems.push(`${label}: contains or is a focusable element`)

    const intrinsic = intrinsicKinds.includes(kind)
    if (validKind && expectations.intrinsic === true && !intrinsic) problems.push(`${label}: expected intrinsic art (${INK_INTRINSIC_KINDS.join(", ")})`)
    if (validKind && expectations.intrinsic === false && intrinsic) problems.push(`${label}: expected overlay ink, but "${kind}" is intrinsic art`)

    if (validKind && !intrinsic && expectations.host !== false) {
      const host = getInkHost(el)
      if (!host || !host.hasAttribute("data-ink-host")) problems.push(`${label}: overlay ink must be a direct child of a host marked data-ink-host (parent: ${host ? `<${host.tagName.toLowerCase()}>` : "none"})`)
      else if (expectations.ready !== undefined && host.hasAttribute("data-ink-ready") !== expectations.ready) {
        problems.push(`${label}: host ${expectations.ready ? "is not marked" : "is already marked"} data-ink-ready`)
      }
    }
    if (intrinsic && getInkStateLayers(el).length) problems.push(`${label}: intrinsic art has no state layers`)

    const seen = new Set<string>()
    for (const g of getInkStateLayers(el)) {
      const name = g.getAttribute("data-layer") ?? ""
      if (!known.includes(name)) problems.push(`${label}: data-layer="${name}" is not one of ${INK_LAYER_NAMES.join(", ")}`)
      else if (seen.has(name)) problems.push(`${label}: data-layer="${name}" appears twice in one svg`)
      if (g.parentElement?.closest("[data-layer]") && el.contains(g.parentElement.closest("[data-layer]"))) problems.push(`${label}: data-layer="${name}" is nested inside another state layer`)
      seen.add(name)
      drawn.add(name)
    }
  })
  if (expectations.layers) {
    const missing = expectations.layers.filter((l) => !drawn.has(l))
    if (missing.length) problems.push(`state layer${missing.length === 1 ? "" : "s"} not drawn: ${missing.join(", ")} (drawn: ${[...drawn].join(", ") || "none"})`)
  }
  if (expectations.onlyLayers) {
    const want = new Set<string>(expectations.onlyLayers)
    const extra = [...drawn].filter((l) => !want.has(l))
    const absent = [...want].filter((l) => !drawn.has(l))
    if (extra.length || absent.length) problems.push(`expected exactly the state layers ${[...want].join(", ")}; ${extra.length ? `unexpected: ${extra.join(", ")}` : ""}${extra.length && absent.length ? "; " : ""}${absent.length ? `missing: ${absent.join(", ")}` : ""}`)
  }
  if (problems.length) throw new Error(`ink layer check failed:\n  - ${problems.join("\n  - ")}`)
  return layers
}

export function mockBox(w: number, h: number): () => void {
  const proto = HTMLElement.prototype
  const descW = Object.getOwnPropertyDescriptor(proto, "offsetWidth")
  const descH = Object.getOwnPropertyDescriptor(proto, "offsetHeight")
  Object.defineProperty(proto, "offsetWidth", { configurable: true, get: () => w })
  Object.defineProperty(proto, "offsetHeight", { configurable: true, get: () => h })
  return () => {
    if (descW) Object.defineProperty(proto, "offsetWidth", descW)
    else delete (proto as unknown as Record<string, unknown>).offsetWidth
    if (descH) Object.defineProperty(proto, "offsetHeight", descH)
    else delete (proto as unknown as Record<string, unknown>).offsetHeight
  }
}
