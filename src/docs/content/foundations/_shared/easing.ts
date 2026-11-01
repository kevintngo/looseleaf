export type Bezier = readonly [x1: number, y1: number, x2: number, y2: number]

const cubic = (a: number, b: number, t: number): number => {
  const u = 1 - t
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t
}

export function progressAt(bezier: Bezier, t: number): number {
  const [x1, y1, x2, y2] = bezier
  if (t <= 0) return 0
  if (t >= 1) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (cubic(x1, x2, mid) < t) lo = mid
    else hi = mid
  }
  return cubic(y1, y2, (lo + hi) / 2)
}

export function overshoot(bezier: Bezier): number {
  let max = 0
  for (let i = 0; i <= 100; i++) max = Math.max(max, progressAt(bezier, i / 100))
  return max
}

export interface CurveBox {
  w: number
  h: number
  pad: number
  headroom: number
}

export function curvePath(bezier: Bezier, box: CurveBox): string {
  const [x1, y1, x2, y2] = bezier
  const { w, h, pad, headroom } = box
  const X = (x: number) => pad + x * w
  const Y = (y: number) => pad + (1 + headroom - y) * (h / (1 + headroom))
  const f = (v: number) => Math.round(v * 100) / 100
  return `M${f(X(0))} ${f(Y(0))} C${f(X(x1))} ${f(Y(y1))} ${f(X(x2))} ${f(Y(y2))} ${f(X(1))} ${f(Y(1))}`
}

export function curvePoint(bezier: Bezier, t: number, box: CurveBox): { x: number; y: number } {
  const { w, h, pad, headroom } = box
  return { x: pad + t * w, y: pad + (1 + headroom - progressAt(bezier, t)) * (h / (1 + headroom)) }
}
