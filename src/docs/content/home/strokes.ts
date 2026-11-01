import type { SketchStroke } from "@/components/ui/sketchpad"

type Pt = [number, number]
const STEP = 9

function along(...corners: Pt[]): Pt[] {
  const out: Pt[] = [corners[0]]
  for (let i = 1; i < corners.length; i++) {
    const [x0, y0] = corners[i - 1]
    const [x1, y1] = corners[i]
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / STEP))
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n])
  }
  return out.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10])
}

function arc(cx: number, cy: number, r: number, from: number, to: number, drift = 0): Pt[] {
  const n = Math.max(6, Math.round((r * Math.abs(to - from)) / STEP))
  const pts: Pt[] = []
  for (let k = 0; k <= n; k++) {
    const t = k / n
    const a = from + (to - from) * t
    const rr = r + drift * t
    pts.push([Math.round((cx + Math.cos(a) * rr) * 10) / 10, Math.round((cy + Math.sin(a) * rr) * 10) / 10])
  }
  return pts
}

function hill(x0: number, x1: number, y: number, amp: number, waves: number): Pt[] {
  const n = Math.round((x1 - x0) / STEP)
  const pts: Pt[] = []
  for (let k = 0; k <= n; k++) {
    const t = k / n
    pts.push([Math.round((x0 + (x1 - x0) * t) * 10) / 10, Math.round((y - Math.sin(t * Math.PI * waves) * amp) * 10) / 10])
  }
  return pts
}

const PI = Math.PI

function rays(cx: number, cy: number, r0: number, r1: number, count: number): SketchStroke[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * PI * 2 + 0.2
    return {
      id: `ray${i}`,
      tool: "felt" as const,
      color: "tangerine" as const,
      size: 1,
      pts: along([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]),
    }
  })
}

export const HOME_SKETCH: SketchStroke[] = [
  { id: "sun", tool: "felt", color: "ink", size: 1, pts: arc(288, 58, 24, -1.2, PI * 2 - 1.05, 2) },
  ...rays(288, 58, 32, 46, 8),
  { id: "sun-fill", tool: "marker", color: "hi", size: 0.9, pts: along([274, 50], [302, 47], [275, 58], [301, 60], [278, 68], [298, 71]) },
  { id: "cloud", tool: "pencil", color: "ink", size: 1, pts: [...arc(84, 60, 14, PI, PI * 1.9), ...arc(108, 52, 19, PI * 1.05, PI * 1.98), ...arc(132, 62, 13, PI * 1.25, PI * 2.4), ...along([143, 70], [76, 72], [72, 62])] },
  { id: "hill", tool: "felt", color: "green", size: 1, pts: hill(14, 346, 196, 9, 1.6) },
  { id: "wall", tool: "felt", color: "ink", size: 1, pts: along([118, 196], [118, 132], [196, 132], [197, 197]) },
  { id: "roof", tool: "brush", color: "ink", size: 1, pts: along([106, 136], [157, 92], [208, 136]) },
  { id: "door", tool: "felt", color: "ink-you", size: 0.9, pts: along([144, 196], [144, 160], [166, 160], [166, 196]) },
  { id: "window", tool: "felt", color: "ink-you", size: 0.9, pts: along([176, 146], [190, 146], [190, 160], [176, 160], [176, 146]) },
  { id: "paint", tool: "marker", color: "marker", size: 0.9, pts: along([124, 142], [190, 140], [124, 152], [140, 156], [124, 164], [138, 168], [124, 178], [140, 182], [124, 190]) },
  { id: "smoke", tool: "pencil", color: "ink", size: 1, pts: [...arc(180, 100, 8, PI * 0.5, PI * 1.9), ...arc(186, 84, 9, PI * 0.5, PI * 1.9)] },
  { id: "flower", tool: "felt", color: "red", size: 1, pts: arc(262, 176, 8, 0, PI * 2.1, 1) },
  { id: "stem", tool: "felt", color: "green", size: 1, pts: along([262, 184], [261, 202]) },
]
