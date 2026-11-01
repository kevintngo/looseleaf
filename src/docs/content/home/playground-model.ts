export const DENSITIES = ["comfortable", "compact", "calm"] as const
export const TIERS = ["lo", "hi"] as const
export const TILTS = ["flat", "natural", "lively"] as const

export type PlaygroundDensity = (typeof DENSITIES)[number]
export type PlaygroundTier = (typeof TIERS)[number]
export type PlaygroundTilt = (typeof TILTS)[number]

export interface PlaygroundState {
  density: PlaygroundDensity
  tier: PlaygroundTier
  reduced: boolean
  tilt: PlaygroundTilt
  take: number
}

export const DEFAULT_STATE: PlaygroundState = { density: "comfortable", tier: "lo", reduced: false, tilt: "natural", take: 1 }

export const seedOf = (state: Pick<PlaygroundState, "take">) => `take-${state.take}`

export const TILT_MAX = { flat: "0deg", natural: "2deg", lively: "4deg" } as const

export const LIVELY_DEGREES = [2.8, -2.2, 1.6] as const

export const isDefault = (s: PlaygroundState) => s.density === DEFAULT_STATE.density && s.tier === DEFAULT_STATE.tier && s.reduced === DEFAULT_STATE.reduced && s.tilt === DEFAULT_STATE.tilt

export interface Snippets {
  provider: string
  component: string | null
  css: string | null
  attributes: string | null
}

export function snippets(state: PlaygroundState): Snippets {
  const props: string[] = []
  if (state.tier !== DEFAULT_STATE.tier) props.push(`tier="${state.tier}"`)
  if (state.density !== DEFAULT_STATE.density) props.push(`density="${state.density}"`)
  if (state.reduced) props.push(`motion="reduced"`)
  const open = props.length ? `<InkProvider ${props.join(" ")}>` : "<InkProvider>"
  const provider = `import { InkProvider } from "@/lib/ink/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    ${open}
      {children}
    </InkProvider>
  )
}`

  const seed = seedOf(state)
  const tiltProp = state.tilt === "flat" ? " tilt={false}" : state.tilt === "lively" ? ` tilt={${LIVELY_DEGREES[0]}}` : ""
  const component = state.take !== DEFAULT_STATE.take || state.tilt !== "natural" ? `<Card seed="${seed}"${tiltProp}>...</Card>   // the same seed always draws the same sheet` : null

  const css = state.tilt === "lively" ? `:root {\n  --ll-tilt-max: ${TILT_MAX.lively}; /* how far any sheet may turn (Notebook: ${TILT_MAX.natural}) */\n}` : null

  const attrs: string[] = []
  if (state.density !== DEFAULT_STATE.density) attrs.push(`data-density="${state.density}"`)
  if (state.reduced) attrs.push(`data-motion="reduced"`)
  const attributes = attrs.length ? `<html lang="en" ${attrs.join(" ")}>` : null

  return { provider, component, css, attributes }
}
