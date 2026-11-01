import { iconBatches, ICON_ALIASES, icons, resolveIconName } from "@/lib/ink/art/icons"
import { doodleBatches, doodles } from "@/lib/ink/art/doodles"
import { stickerBatches, stickers } from "@/lib/ink/art/stickers"
import { mascot } from "@/lib/ink/art/mascots"
import { scenes } from "@/lib/ink/art/scenes"
import type { ArtAccent, ArtDef, StampGen, StickerDef } from "@/lib/ink/art/types"
import { ICON_DEMAND } from "./icon-demand"

const humanize = (key: string): string => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase())

const label = (labels: Readonly<Record<string, string>>, key: string): string => labels[key] ?? humanize(key)

export interface Family {
  key: string
  label: string
  ids: readonly string[]
}

function families(batches: Readonly<Record<string, Readonly<Record<string, unknown>>>>, labels: Readonly<Record<string, string>>): Family[] {
  return Object.entries(batches).map(([key, batch]) => ({ key, label: label(labels, key), ids: Object.keys(batch) }))
}

const ICON_FAMILY_LABELS: Readonly<Record<string, string>> = {
  arrows: "Arrows and chevrons",
  marks: "Marks",
  status: "Status and alerts",
  layout: "Layout and navigation",
  files: "Files and folders",
  comms: "People and messages",
  devData: "Code, data and settings",
  textNatureMisc: "Text, nature and odds and ends",
  media: "Media",
  commerceTime: "Commerce and time",
}

export interface IconEntry {
  id: string
  family: string
  aliases: readonly string[]
  tags: readonly string[]
  micro: boolean
  hi: boolean
  accent: ArtAccent | undefined
  rtl: boolean
}

export const ICON_FAMILIES: readonly Family[] = families(iconBatches, ICON_FAMILY_LABELS)

const familyOfIcon = new Map<string, string>()
for (const f of ICON_FAMILIES) for (const id of f.ids) familyOfIcon.set(id, f.key)

export const ICON_ENTRIES: readonly IconEntry[] = ICON_FAMILIES.flatMap((f) =>
  f.ids.map((id): IconEntry => {
    const def = (icons as Record<string, ArtDef>)[id]!
    return {
      id,
      family: f.key,
      aliases: ICON_ALIASES[id] ?? [],
      tags: def.tags ?? [],
      micro: !!def.micro,
      hi: !!def.hi,
      accent: def.accent,
      rtl: def.rtl === "flip",
    }
  }),
)

export const ICON_BY_ID: ReadonlyMap<string, IconEntry> = new Map(ICON_ENTRIES.map((e) => [e.id, e]))

export function isDrawnIcon(name: string): boolean {
  return ICON_BY_ID.has(resolveIconName(name))
}

export interface UndrawnIcon {
  name: string
  uses: number
}

const SHORTLIST: readonly string[] = [
  "refresh-cw", "refresh-ccw", "telescope", "forward", "app-window", "scissors", "rotate-ccw", "monitor", "clipboard-paste", "link-2", "keyboard", "message-circle-question-mark",
  "corner-down-left", "funnel", "activity", "text-align-start", "zoom-in", "zoom-out", "thumbs-up", "thumbs-down", "palette", "smartphone", "languages", "text-align-center",
  "code-xml", "heading-1", "list-ordered", "strikethrough", "type", "wifi", "wifi-off", "zap", "rocket", "trophy", "at-sign", "share-2", "database", "wrench", "plug", "printer",
  "shopping-bag", "leaf", "map-pin", "bell-off", "columns-2", "panel-right", "maximize-2", "check-check", "alarm-clock", "clipboard-check", "phone", "laptop", "cloud-upload",
]

export function undrawnIcons(): UndrawnIcon[] {
  const out = new Map<string, UndrawnIcon>()
  for (const [name, uses] of ICON_DEMAND) if (!isDrawnIcon(name)) out.set(resolveIconName(name), { name, uses })
  for (const name of SHORTLIST) if (!isDrawnIcon(name) && !out.has(resolveIconName(name))) out.set(resolveIconName(name), { name, uses: 0 })
  return [...out.values()].sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name))
}

export function drawnShareOfUses(): number {
  let all = 0
  let drawn = 0
  for (const [name, uses] of ICON_DEMAND) {
    all += uses
    if (isDrawnIcon(name)) drawn += uses
  }
  return all ? drawn / all : 0
}

const DOODLE_FAMILY_LABELS: Readonly<Record<string, string>> = {
  nature: "Sky, weather and plants",
  things: "Everyday things",
  marks: "Flourishes and marks",
}

export interface ArtEntry {
  id: string
  family: string
  tags: readonly string[]
  accent: ArtAccent | undefined
  hi: boolean
}

export const DOODLE_FAMILIES: readonly Family[] = families(doodleBatches, DOODLE_FAMILY_LABELS)

export const DOODLE_ENTRIES: readonly ArtEntry[] = DOODLE_FAMILIES.flatMap((f) =>
  f.ids.map((id): ArtEntry => {
    const def = (doodles as Record<string, ArtDef>)[id]!
    return { id, family: f.key, tags: def.tags ?? [], accent: def.accent, hi: !!def.hi }
  }),
)

const STICKER_FAMILY_LABELS: Readonly<Record<string, string>> = {
  statusPointers: "Status and pointers",
  spaceWeather: "Space and weather",
  foodDrink: "Food and drink",
  officeDesk: "Office and desk",
  natureAnimals: "Nature and animals",
  facesCelebrate: "Faces and celebrations",
  badgesStamps: "Badges and stamps",
}

const BADGE_IDS: readonly string[] = ["done", "wip", "new", "sale", "beta", "pro", "ok", "wow", "rating-five", "first-place", "number-one", "a-plus", "hundred", "twenty-four-seven", "question-badge", "exclamation-badge"]

export interface StickerEntry extends ArtEntry {
  kind: "sticker" | "stamp"
  badge: boolean
  text?: string
}

export const STICKER_FAMILIES: readonly Family[] = families(stickerBatches, STICKER_FAMILY_LABELS)

export const STICKER_ENTRIES: readonly StickerEntry[] = STICKER_FAMILIES.flatMap((f) =>
  f.ids.map((id): StickerEntry => {
    const def = (stickers as Record<string, StickerDef>)[id]!
    const stamp = "gen" in def && def.gen === "stamp"
    return {
      id,
      family: f.key,
      tags: def.tags ?? [],
      accent: "accent" in def ? def.accent : undefined,
      hi: "hi" in def && !!def.hi,
      kind: stamp ? "stamp" : "sticker",
      badge: BADGE_IDS.includes(id),
      text: stamp ? (def as StampGen).text : undefined,
    }
  }),
)

export const STAMP_ENTRIES: readonly StickerEntry[] = STICKER_ENTRIES.filter((e) => e.kind === "stamp")
export const BADGE_ENTRIES: readonly StickerEntry[] = STICKER_ENTRIES.filter((e) => e.badge)
export const PEELABLE_ENTRIES: readonly StickerEntry[] = STICKER_ENTRIES.filter((e) => e.kind === "sticker")

export const PEELABLE_FAMILIES: readonly Family[] = STICKER_FAMILIES.map((f) => ({
  ...f,
  label: f.key === "badgesStamps" ? "Badges" : f.label,
  ids: f.ids.filter((id) => PEELABLE_ENTRIES.some((e) => e.id === id)),
})).filter((f) => f.ids.length)

export interface PoseNote {
  does: string
  serves: string
}

const POSE_NOTES: Readonly<Record<string, PoseNote>> = {
  idle: { does: "Stands there with a small smile and two blush ovals: the whole character, nothing else.", serves: "The default: empty states, avatars, a sidebar footer." },
  wave: { does: "Happy eyes, a big grin, a rock to one side and two swishes of sky marker. Has three frames to play.", serves: "Welcome screens, first run, a greeting in a popover." },
  think: { does: "One eyebrow up, eyes glancing away, a graphite thought cloud of three dots.", serves: "An empty command list, a search that is still thinking, a long wait." },
  write: { does: "Leans into it, squints with his tongue out, and the tip leaves a pencil scribble. Has three frames to play.", serves: "Busy states: spinner, indeterminate progress, streaming text." },
  sketch: { does: "One eye shut to measure, while the tip draws an unfinished dashed frame in the air.", serves: "Nothing here yet: no data, skeleton pages, an empty chart." },
  celebrate: { does: "Hops (squash and stretch, no legs needed) with a big grin and confetti. Has two frames to play.", serves: "Success toasts, inbox zero, progress at 100 percent." },
  oops: { does: "Wide eyes, worried brows, a sweat drop and a snapped point.", serves: "Errors: a failed save, a 500 page, a destructive alert." },
  shrug: { does: "Both eyebrows worried (one arched), a wavy mouth, a lean and a squash, two question marks floating.", serves: "404, and a search with no results." },
  sleep: { does: "Leans left, eyes shut, blue z z Z climbing into the corner.", serves: "Nothing new, a quiet inbox, an idle timeout." },
  peek: { does: "Only the top of his head over a strip of tape, eyes glancing sideways.", serves: "A cameo on a card or sheet edge, a coming-soon page." },
  point: { does: "Eyebrows up, eyes on a small tangerine arrow.", serves: "Tours, hints, empty states with a call to action." },
  carry: { does: "Gritted teeth, effort brows, a kraft parcel beside him.", serves: "Upload and drop zones." },
  halt: { does: "Stern brows, a flat mouth, a red stop sign.", serves: "Permission denied, a confirm before something destructive." },
  search: { does: "A magnifier floats over one eye and shows it big.", serves: "Search before typing, no results (hero size)." },
  unplug: { does: "Droopy eyes, a frown, a torn cable with a spark and its plug on the floor.", serves: "Offline, connection lost, a failed network save." },
}

export function poseNote(pose: string): PoseNote {
  return POSE_NOTES[pose] ?? { does: "One of Stubby's poses.", serves: "See the Mascot component." }
}

export const POSES: readonly string[] = Object.keys(mascot)

interface SceneShape {
  layers?: readonly { ref: string }[]
  layersSmall?: readonly { ref: string }[]
}

const SCENE_NOTES: Readonly<Record<string, { title: string; use: string }>> = {
  "empty-no-results": { title: "No results", use: "A search or a filter found nothing. Ghost rows show what would have been there." },
  "empty-no-data": { title: "No data yet", use: "Nothing to list or chart. A dashed chart on graph paper waits for numbers." },
  "empty-inbox-zero": { title: "Inbox zero", use: "Everything is done. The zero is circled in red pencil." },
  "error-404": { title: "Page not found", use: "A 404 page: riso lettering, footprints that lead to Stubby." },
  "error-500": { title: "Something broke", use: "A server error or a failed save: a sweat drop, a snapped point and a lightning bolt." },
  offline: { title: "Offline", use: "The connection is gone. An outlet with a face, and a dashed line where the plug should go." },
  success: { title: "Done", use: "A saved form, a sent message, a finished checkout." },
  permission: { title: "No access", use: "A locked page or feature (403). Stubby holds up a stop sign." },
  "first-run": { title: "First run", use: "A welcome with a checklist whose first box is already ticked." },
  loading: { title: "Loading", use: "A long wait: cursive scribbles growing under a highlighter swipe." },
  "search-start": { title: "Search before typing", use: "An empty search page: a field with a caret and a dashed placeholder." },
  upload: { title: "Drop files here", use: "A dashed drop zone with sky corner ticks." },
  "no-notifications": { title: "All quiet", use: "No notifications, nothing new." },
  "coming-soon": { title: "Coming soon", use: "A feature that is not ready: a torn kraft curtain, taped at both corners." },
}

export interface SceneEntry {
  id: string
  title: string
  use: string
  pose: string | undefined
  compact: boolean
}

export const SCENE_ENTRIES: readonly SceneEntry[] = Object.entries(scenes as Record<string, ArtDef>).map(([id, def]) => {
  const shape = def as unknown as SceneShape
  const note = SCENE_NOTES[id] ?? { title: humanize(id), use: "An empty-state scene." }
  return {
    id,
    title: note.title,
    use: note.use,
    pose: shape.layers?.find((l) => l.ref.startsWith("mascot:"))?.ref.slice("mascot:".length),
    compact: !!shape.layersSmall,
  }
})
