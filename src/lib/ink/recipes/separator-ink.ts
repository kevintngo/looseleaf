import { TAU } from '@/lib/ink/geom'
import { line } from '@/lib/ink/shapes'
import { n } from '@/lib/ink/paint'
import { defineRecipe } from '@/lib/ink/recipes'
import { outlinePath, sheetOutline, type Outline } from '@/lib/ink/paper/edges'
import { tape } from '@/lib/ink/paper/props'
import type { Ink } from '@/lib/ink/builder'
import type { Line, Pt } from '@/lib/ink/types'

export const separatorVariantList = ['pencil', 'dashed', 'wavy', 'dotted', 'tape', 'stitched', 'torn'] as const
export type SeparatorVariant = (typeof separatorVariantList)[number]

export interface SeparatorParams {
  variant: SeparatorVariant
  orientation: 'horizontal' | 'vertical'
}

const num = (v: number) => n(v, 10)

export const separatorRecipe = defineRecipe<SeparatorParams>({
  id: 'separator',
  kind: 'rule',
  layers: ['rest'],
  pad: 12,
  draw(ink, { w, h }, { variant, orientation }, ctx) {
    const vertical = orientation === 'vertical'
    const L = vertical ? h : w
    const c = (vertical ? w : h) / 2
    const at = (t: number, u = 0): Pt => (vertical ? [c + u, t] : [t, c + u])
    const kind: SeparatorVariant = ctx.calm && (variant === 'tape' || variant === 'stitched' || variant === 'torn') ? 'pencil' : variant
    ink.layer('rest', () => {
      switch (kind) {
        case 'pencil': {
          const [x1, y1] = at(-1, 0.4)
          const [x2, y2] = at(L + 1, -0.5)
          line(ink, x1, y1, x2, y2, { pen: ctx.calm ? 'pencil.fine' : 'pencil' })
          break
        }
        case 'dashed':
          ink.lines(dashes(ink.next('dash'), L, at), 'pencil', { width: 1.35 })
          break
        case 'wavy':
          ink.lines(wave(ink.next('wave'), L, at), 'ink.fine', { width: 1.1 })
          break
        case 'dotted':
          dots(ink, L, at)
          break
        case 'tape':
          tapeStrip(ink, L, c, vertical, ctx.tier, ctx.calm)
          break
        case 'stitched':
          stitchLine(ink, L, at)
          break
        case 'torn':
          tornStrip(ink, L, c, vertical)
          break
      }
    })
  },
})

function dashes(rng: ReturnType<Ink['next']>, L: number, at: (t: number, u?: number) => Pt): Line[] {
  const out: Line[] = []
  let t = rng.range(0, 3)
  while (t < L - 4) {
    const len = rng.range(10, 15)
    const end = Math.min(L, t + len)
    const u0 = rng.gauss(0, 0.28)
    const u1 = u0 + rng.gauss(0, 0.22)
    out.push({
      pts: [at(t, u0), at((t + end) / 2, (u0 + u1) / 2 + rng.gauss(0, 0.12)), at(end, u1)],
      o: { simple: true, start: 'soft', end: 'flick', speed: 1.1, wobble: 0.35 },
    })
    t = end + rng.range(4, 6)
  }
  return out
}

function wave(rng: ReturnType<Ink['next']>, L: number, at: (t: number, u?: number) => Pt): Line[] {
  const amp = 1.7
  const wl = 13
  const p1 = rng.range(0, TAU),
    p2 = rng.range(0, TAU),
    p3 = rng.range(0, TAU)
  let ph = rng.range(0, TAU)
  const build = (a: number, b: number): Pt[] => {
    const pts: Pt[] = []
    for (let t = a; t <= b; t += 2.3) {
      ph += (2.3 / wl) * TAU * (1 + 0.22 * Math.sin(t / 37 + p1) + 0.1 * Math.sin(t / 11 + p2))
      const k = amp * (0.75 + 0.25 * Math.sin(t / 53 + p3))
      pts.push(at(t, Math.sin(ph) * k))
    }
    return pts
  }
  if (L > 300) {
    const m = L * rng.range(0.46, 0.6)
    return [
      { pts: build(0, m + 3), o: { start: 'soft', end: 'soft', wobble: 0.5, speed: 1.1, simple: true } },
      { pts: build(m - 3, L), o: { start: 'soft', end: 'flick', wobble: 0.5, speed: 1.1, simple: true } },
    ]
  }
  return [{ pts: build(0, L), o: { end: 'flick', wobble: 0.5, speed: 1.1, simple: true } }]
}

function dots(ink: Ink, L: number, at: (t: number, u?: number) => Pt): void {
  const rng = ink.next('dot')
  let d = ''
  for (let t = 3; t < L - 2; t += rng.range(5.6, 7.4)) {
    const [cx, cy] = at(t, rng.gauss(0, 0.3))
    const r = rng.range(0.95, 1.5)
    const k = [0, 1, 2, 3].map(() => r * rng.range(0.82, 1.15))
    d += `M${num(cx - k[3])} ${num(cy)}Q${num(cx - k[3])} ${num(cy - k[0])} ${num(cx)} ${num(cy - k[0])}Q${num(cx + k[1])} ${num(cy - k[0])} ${num(cx + k[1])} ${num(cy)}Q${num(cx + k[1])} ${num(cy + k[2])} ${num(cx)} ${num(cy + k[2])}Q${num(cx - k[3])} ${num(cy + k[2])} ${num(cx - k[3])} ${num(cy)}Z`
  }
  ink.flat('felt', d, 'ink', 0.86)
  ink.grow([0, -3, L, 3])
}

function tapeStrip(ink: Ink, L: number, c: number, vertical: boolean, tier: 'lo' | 'hi', calm: boolean): void {
  const th = 10
  const rng = ink.next('tape')
  const res = tape(`${ink.seed}|strip`, { kind: 'kraft', length: Math.max(24, L), height: th, ends: 'saw', tier, calm })
  const skew = rng.gauss(0, 0.25)
  const tf = vertical
    ? `translate(${num(c + th / 2)} 0) rotate(${num(90 + skew)} 0 0)`
    : `translate(0 ${num(c - th / 2)}) rotate(${num(skew)} ${num(L / 2)} ${num(th / 2)})`
  ink.group({ transform: tf }, () => {
    ink.raw(`<rect x=".6" y="1.4" width="${num(Math.max(24, L))}" height="${th}" fill="var(--ll-ink)" fill-opacity=".12"/>`, 'under')
    ink.raw(res.svg, 'top')
  })
  ink.grow(vertical ? [c - th, 0, c + th, L] : [0, c - th, L, c + th])
}

function stitchLine(ink: Ink, L: number, at: (t: number, u?: number) => Pt): void {
  const rng = ink.next('stitch')
  let d = ''
  let t = rng.range(0, 3)
  while (t < L - 5) {
    const len = 6.4 * rng.range(0.88, 1.08)
    const off = rng.gauss(0, 0.28)
    const pts: Pt[] = []
    for (let k = 0; k <= 2; k++) pts.push(at(t + (len * k) / 2, off + rng.gauss(0, 0.07)))
    d += 'M' + pts.map((p) => `${num(p[0])} ${num(p[1])}`).join('L')
    t += len + 4.2 + rng.gauss(0, 0.4)
  }
  const id = `ll-sr${ink.seed.toString(36)}`
  const pass = (stroke: string, sw: number, op: number, tf: string) =>
    `<use href="#${id}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"${tf ? ` transform="${tf}"` : ''}/>`
  ink.raw(
    `<defs><path id="${id}" d="${d}"/></defs>` +
      pass('var(--ll-ink)', 2.1, 0.16, 'translate(.4 .8)') +
      pass('var(--ll-marker)', 1.8, 1, '') +
      pass('var(--ll-photo)', 0.55, 0.4, 'translate(-.3 -.35)'),
    'top'
  )
  const [x0, y0] = at(0, -3)
  const [x1, y1] = at(L, 3)
  ink.grow([Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)])
}

function tornStrip(ink: Ink, L: number, c: number, vertical: boolean): void {
  const th = 8
  const rng = ink.next('torn')
  const o = sheetOutline(rng, Math.max(20, L), th, { top: 'torn', bottom: 'torn', left: 'cut', right: 'cut' }, { amp: 0.95 * ink.knobs.wobble })
  const flip = (p: Pt): Pt => (vertical ? [c - th / 2 + p[1], p[0]] : [p[0], c - th / 2 + p[1]])
  const moved: Outline = { ...o, pts: o.pts.map(flip), rim: o.rim.map(flip) }
  const body = outlinePath(moved, 'body', ink.tier)
  const rim = outlinePath(moved, 'rim', ink.tier)
  const id = `ll-tr${ink.seed.toString(36)}`
  const shadow = vertical ? '1 .4' : '.4 1.3'
  ink.raw(
    `<defs><path id="${id}" d="${body}"/></defs>` +
      `<use href="#${id}" fill="var(--ll-ink)" fill-opacity=".13" transform="translate(${shadow})"/>` +
      `<path d="${rim}" fill="var(--ll-photo)" fill-opacity=".8"/>` +
      `<use href="#${id}" fill="var(--ll-paper-shade)"/>` +
      `<use href="#${id}" fill="none" stroke="var(--ll-ink)" stroke-opacity=".16" stroke-width=".6"/>`,
    'top'
  )
  ink.grow(vertical ? [c - th, 0, c + th, L] : [0, c - th, L, c + th])
}
