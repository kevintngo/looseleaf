import { Ink } from '@/lib/ink/builder'
import { pen } from '@/lib/ink/pens'
import { makeRng, type Rng } from '@/lib/ink/rng'
import type { PenName, PenSpec, Pt } from '@/lib/ink/types'

export const TABLE_TILE_W = 960
export const TABLE_RULE_H = 8
export const TABLE_HEAD_H = 12

export interface TableTiles {
  rule: string
  head: string
  capStart: string
  capEnd: string
}

interface Pull {
  y: number
  pen: PenName | PenSpec
  amp: number
  width?: number
  alpha?: number
  span?: readonly [number, number]
}

function periodic(rng: Rng, W: number, y: number, amp: number, from = -24, to = W + 24): Pt[] {
  const k1 = rng.pick([1, 2, 2, 3]), k2 = rng.pick([5, 7, 9, 11])
  const p1 = rng.range(0, Math.PI * 2), p2 = rng.range(0, Math.PI * 2)
  const a1 = amp * rng.range(0.55, 1), a2 = amp * rng.range(0.15, 0.4)
  const pts: Pt[] = []
  for (let x = from; x <= to; x += 6) {
    const t = (x / W) * Math.PI * 2
    pts.push([x, y + a1 * Math.sin(k1 * t + p1) + a2 * Math.sin(k2 * t + p2)])
  }
  return pts
}

function tileSvg(seed: string, W: number, H: number, pulls: readonly Pull[], extra?: (ink: Ink) => void): string {
  const ink = new Ink(seed, { tier: 'lo', grain: false })
  const rng = makeRng(`${seed}|tile`)
  ink.layer('rest', () => {
    for (const p of pulls) {
      const [a, b] = p.span ?? [0, 1]
      const from = a === 0 ? -24 : a * W, to = b === 1 ? W + 24 : b * W
      ink.stroke(periodic(rng.fork(`${p.y}|${a}`), W, p.y, p.amp, from, to), p.pen, { wobble: 0.5, speed: 1.02, start: 'soft', end: 'soft', width: p.width, alpha: p.alpha })
    }
    extra?.(ink)
  })
  const res = ink.toSvg({ w: W, h: H, pad: 0 })
  const body = res.svg.replace(/(fill|stroke)="var\(--ll-[a-z-]+\)"/g, '$1="black"')
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'>${body.replace(/"/g, "'")}</svg>`
}

export function svgUrl(svg: string): string {
  const enc = svg.replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\s+/g, ' ')
  return `url("data:image/svg+xml,${enc}")`
}

let cache: TableTiles | undefined

export function tableTiles(): TableTiles {
  if (cache) return cache
  const W = TABLE_TILE_W
  const lead = pen('pencil', { W: 1.35, dryAmt: 0.35, dryWl: 9, dens: 0.9, wob: { amp: 0.9, wl: 90, tr: 0.2 } })
  const light = pen('pencil', { W: 1.1, alpha: 0.6, dryAmt: 0.45, dryWl: 7, dens: 0.9, wob: { amp: 0.8, wl: 70, tr: 0.2 } })
  const rule = tileSvg('table-rule', W, TABLE_RULE_H, [
    { y: 4, pen: lead, amp: 0.6 },
    { y: 4.4, pen: light, amp: 0.5, span: [0.1, 0.36] },
    { y: 3.6, pen: light, amp: 0.45, span: [0.56, 0.85] },
  ])
  const felt = pen('ink', { W: 2.5, halo: 0.08, skip: 0.45, dryAmt: 0.2, dryWl: 8 })
  const head = tileSvg('table-head', W, TABLE_HEAD_H, [
    { y: 3.3, pen: felt, amp: 0.55 },
    { y: 8.5, pen: 'ink.fine', amp: 0.7 },
  ])
  cache = { rule: svgUrl(rule), head: svgUrl(head), capStart: svgUrl(capSvg(false)), capEnd: svgUrl(capSvg(true)) }
  return cache
}

export const TABLE_CAP_W = 18

function capSvg(end: boolean): string {
  const start = 'M18 0 L9.6 0.5 Q6.5 0.3 4.4 3.1 L5.6 6 L2.3 8.6 L3.6 12.2 L0.9 15.4 L2.6 19.6 L0.6 23.4 L2.9 27.1 L1.4 31.2 L4.2 34 L3.8 37.4 Q6.4 40 9.6 39.6 L18 40 Z'
  const stop = 'M0 0 L7.4 0.6 Q11.2 0 13.2 2.4 L12.4 5.8 L15.9 8.1 L14.4 12.9 L17.2 15.8 L15.1 20.2 L17.5 24 L15.2 27.6 L16.6 31.9 L13.1 35.1 L14.2 38.4 Q10.5 40 7.3 39.5 L0 40 Z'
  return `<svg xmlns='http://www.w3.org/2000/svg' width='18' height='40' viewBox='0 0 18 40'><path fill='black' d='${end ? stop : start}'/></svg>`
}
