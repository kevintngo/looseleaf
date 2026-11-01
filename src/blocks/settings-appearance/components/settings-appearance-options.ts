export type Density = "comfortable" | "compact" | "calm"
export type Motion = "system" | "reduced"
export type PaperChoice = "plain" | "ruled" | "graph" | "dots" | "kraft"
export type Direction = "ltr" | "rtl"

export type Appearance = {
  theme: string
  density: Density
  motion: Motion
  fine: boolean
  paper: PaperChoice
  dir: Direction
}

export const DEFAULT_APPEARANCE: Appearance = { theme: "notebook", density: "comfortable", motion: "system", fine: false, paper: "ruled", dir: "ltr" }

export const THEMES = [
  { id: "notebook", name: "Notebook", help: "Cream paper, felt tip, terracotta marker.", ready: true },
  { id: "forest", name: "Forest", help: "Sage felt, kraft slips, petrol-teal ink.", ready: false },
  { id: "zine", name: "Zine", help: "Lilac mat, louder stickers, heavier pens.", ready: false },
]

export const DENSITIES: { id: Density; name: string; help: string }[] = [
  { id: "comfortable", name: "Comfortable", help: "Roomy controls, the full hand-drawn wobble." },
  { id: "compact", name: "Compact", help: "Tighter controls for people who like to see more." },
  { id: "calm", name: "Calm", help: "Hairline pencil, no wobble, no tilt. For tables and long forms." },
]

export const MOTIONS: { id: Motion; name: string; help: string }[] = [
  { id: "system", name: "Follow my device", help: "Ink is written on, paper settles. Off when your device asks for less motion." },
  { id: "reduced", name: "Keep it still", help: "Everything just appears, finished." },
]

export const PAPERS: { id: PaperChoice; name: string }[] = [
  { id: "plain", name: "Plain" },
  { id: "ruled", name: "Ruled" },
  { id: "graph", name: "Graph" },
  { id: "dots", name: "Dots" },
  { id: "kraft", name: "Kraft" },
]

export function providerProps(a: Appearance) {
  return {
    density: a.density,
    motion: a.motion,
    tier: a.fine ? ("hi" as const) : ("lo" as const),
    dir: a.dir,
    theme: a.theme === "notebook" ? undefined : a.theme,
  }
}

export function providerSnippet(a: Appearance): string {
  const attrs: string[] = []
  if (a.theme !== "notebook") attrs.push(`theme="${a.theme}"`)
  if (a.density !== "comfortable") attrs.push(`density="${a.density}"`)
  if (a.motion !== "system") attrs.push(`motion="${a.motion}"`)
  if (a.fine) attrs.push(`tier="hi"`)
  if (a.dir !== "ltr") attrs.push(`dir="${a.dir}"`)
  const open = attrs.length ? `<InkProvider ${attrs.join(" ")}>` : "<InkProvider>"
  return `import { InkProvider } from "@/lib/ink/react"\n\n${open}\n  <App />\n</InkProvider>`
}
