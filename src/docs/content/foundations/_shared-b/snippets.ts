import { variantFor, type Variant } from "@/lib/ink/art-draw"
import { mascotVariant } from "@/lib/ink/art/mascot-draw"
import { ICON_BY_ID } from "./catalog"

export const ICON_DEFAULT_SIZE = 16
export const DOODLE_DEFAULT_SIZE = 96
export const STICKER_DEFAULT_SIZE = 96
export const MASCOT_DEFAULT_SIZE = 96

const attr = (name: string, value: string | number | undefined, fallback?: string | number): string =>
  value === undefined || value === fallback ? "" : ` ${name}=${typeof value === "number" ? `{${value}}` : `"${value}"`}`

export function iconSnippet(id: string, o: { size?: number; tone?: "ui" | "doodle" } = {}): string {
  return `<Icon name="${id}"${attr("size", o.size, ICON_DEFAULT_SIZE)}${attr("tone", o.tone, "ui")} />`
}

export function doodleSnippet(id: string, o: { size?: number } = {}): string {
  return `<Doodle name="${id}"${attr("size", o.size, DOODLE_DEFAULT_SIZE)} />`
}

export function stickerSnippet(id: string, o: { size?: number; peel?: boolean; rotate?: number | "auto" } = {}): string {
  return `<Sticker name="${id}"${attr("size", o.size, STICKER_DEFAULT_SIZE)}${o.peel ? " peel" : ""}${attr("rotate", o.rotate, "auto")} />`
}

export function stampSnippet(id: string): string {
  return `<Stamp name="${id}" />`
}

export function mascotSnippet(pose: string, o: { size?: number } = {}): string {
  return `<Mascot pose="${pose}"${attr("size", o.size, MASCOT_DEFAULT_SIZE)} />`
}

function stringAttr(name: string, value: string): string {
  return /^[\x20-\x7e]*$/.test(value) && !/["\\]/.test(value) ? ` ${name}="${value}"` : ` ${name}={${JSON.stringify(value)}}`
}

export interface CustomStamp {
  text: string
  sub?: string
  ring?: string
  shape: string
  ink: string
  tilt?: number
  ghost?: boolean
  dashed?: boolean
}

export function customStampSnippet(o: CustomStamp): string {
  return `<Stamp${stringAttr("text", o.text)}${o.sub ? stringAttr("sub", o.sub) : ""}${o.shape === "round" && o.ring ? stringAttr("ring", o.ring) : ""}${stringAttr("shape", o.shape)}${stringAttr("ink", o.ink)}${attr("tilt", o.tilt)}${o.ghost ? " ghost" : ""}${o.dashed ? " dashed" : ""} />`
}

export function sealSnippet(o: { variant: string; text?: string; mark?: string; tone: string; size?: number }): string {
  return `<Seal${stringAttr("variant", o.variant)}${o.text ? stringAttr("text", o.text) : ""}${o.mark ? stringAttr("mark", o.mark) : ""}${stringAttr("tone", o.tone)}${attr("size", o.size, 96)} />`
}

export function importLine(component: "Icon" | "Doodle" | "Sticker" | "Stamp" | "Mascot" | "Seal"): string {
  return `import { ${component} } from "@/components/ui/${component.toLowerCase()}"`
}

export function iconVariant(id: string, px: number): Variant {
  const v = variantFor("icon", px)
  const e = ICON_BY_ID.get(id)
  if (!e) return v
  if (v === "micro" && !e.micro) return "small"
  if (v === "hi" && !e.hi) return "master"
  return v
}

const ICON_TIER_WORDS: Readonly<Record<Variant, string>> = {
  micro: "micro redraw, 8 to 13 px",
  small: "16 px redraw",
  master: "24 px master",
  hi: "master plus extra detail, 41 px and up",
}

export function iconTierLabel(id: string, px: number): string {
  return ICON_TIER_WORDS[iconVariant(id, px)]
}

export function iconTierWord(px: number): "micro" | "small" | "master" | "hi" {
  return variantFor("icon", px)
}

const MASCOT_TIER_WORDS: Readonly<Record<Variant, string>> = {
  micro: "a face on the silhouette: two dots and a smile",
  small: "the small redraw: adds blush, the wood and the graphite tip",
  master: "master",
  hi: "hero: adds a shine and the ferrule line",
}

export function mascotTierLabel(px: number): string {
  return MASCOT_TIER_WORDS[mascotVariant(px)]
}

const DOODLE_TIER_WORDS: Readonly<Record<Variant, string>> = {
  micro: "48 px redraw",
  small: "48 px redraw",
  master: "master",
  hi: "master plus extra detail",
}

export function doodleTierLabel(px: number): string {
  return DOODLE_TIER_WORDS[variantFor("doodle", px)]
}

const STICKER_TIER_WORDS: Readonly<Record<Variant, string>> = {
  micro: "64 px redraw",
  small: "64 px redraw",
  master: "master",
  hi: "master plus extra detail",
}

export function stickerTierLabel(px: number): string {
  return STICKER_TIER_WORDS[variantFor("sticker", px)]
}

export function emptySceneSnippet(pose: string, title: string): string {
  return `<Empty>
  <EmptyHeader>
    <EmptyMedia pose="${pose}" size={96} />
    <EmptyTitle>${title}</EmptyTitle>
    <EmptyDescription>Say what happened and what to do next.</EmptyDescription>
  </EmptyHeader>
</Empty>`
}
