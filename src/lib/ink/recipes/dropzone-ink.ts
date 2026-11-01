import { wash } from '@/lib/ink/fills'
import { roundRectPoly, wobblePoly } from '@/lib/ink/geom'
import { Ink } from '@/lib/ink/builder'
import { n } from '@/lib/ink/paint'
import { defineRecipe } from '@/lib/ink/recipes'
import { clamp } from '@/lib/ink/rng'
import { focusRing, line, squiggle } from '@/lib/ink/shapes'
import type { Pt } from '@/lib/ink/types'

export interface DropzoneParams {
  over?: boolean
  invalid?: boolean
  disabled?: boolean
}

const path = (pts: Pt[]): string => `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`

function outline(ink: Ink, w: number, h: number, o: { inset: number; colour: string; width: number; dash?: string; alpha: number; seedName: string }): void {
  const rng = ink.next(o.seedName)
  const r = clamp(Math.min(w, h) * 0.09, 6, 14) - o.inset * 0.5
  const pts = wobblePoly(roundRectPoly(o.inset, o.inset, w - 2 * o.inset, h - 2 * o.inset, Math.max(2, r), 6), rng, 1.1, 34)
  ink.raw(
    `<path d="${path(pts)}" fill="none" stroke="${o.colour}" stroke-width="${o.width}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-opacity="${o.alpha}"/>`,
    'pencil'
  )
}

function stitches(ink: Ink, name: string, [dash, gap]: readonly [number, number], regular?: boolean): string {
  if (regular) return `${dash} ${gap}`
  const rng = ink.next(`${name}-stitches`)
  const out: number[] = []
  for (let i = 0; i < 9; i++) out.push(Math.round(dash * rng.range(0.62, 1.4) * 10) / 10, Math.round(gap * rng.range(0.7, 1.45) * 10) / 10)
  return out.join(' ')
}

function sewn(ink: Ink, w: number, h: number, o: { colour: string; width: number; dash: readonly [number, number]; regular?: boolean; alpha: number; seedName: string; edge?: boolean }): void {
  if (o.edge !== false && Math.min(w, h) > 60) outline(ink, w, h, { inset: 1, colour: 'var(--ll-pencil)', width: 1, alpha: 0.4, seedName: `${o.seedName}-edge` })
  outline(ink, w, h, { inset: Math.min(w, h) > 60 ? 6 : 3, colour: o.colour, width: o.width, dash: stitches(ink, o.seedName, o.dash, o.regular), alpha: o.alpha, seedName: o.seedName })
}

export const dropzoneRecipe = defineRecipe<DropzoneParams>({
  id: 'dropzone',
  kind: 'field',
  layers: ['rest', 'hover', 'focus', 'open', 'invalid', 'disabled'],
  lazy: ['focus', 'hover'],
  pad: 12,
  draw(ink, { w, h }, { over, invalid, disabled }, ctx) {
    const r = clamp(Math.min(w, h) * 0.09, 6, 14)
    const body = roundRectPoly(2, 2, w - 4, h - 4, r, 6)
    if (disabled) {
      if (ctx.lazyOnly) return
      ink.layer('disabled', () => {
        wash(ink, body, 'paper-shade', { alpha: 0.9, material: 'wash' })
        sewn(ink, w, h, { colour: 'var(--ll-pencil-mark)', width: 1.6, dash: [7, 6], alpha: 0.75, seedName: 'thread' })
      })
      return
    }
    ctx.lazy('focus', (f) => focusRing(f, 0, 0, w, h, { r, ...(w > 280 ? { opts: { simple: true } } : {}) }))
    ctx.lazy('hover', (hv) => {
      wash(hv, body, 'hi', { alpha: 0.3, material: 'wash' })
      sewn(hv, w, h, { colour: 'var(--ll-ink-soft)', width: 1.2, dash: [9, 5], alpha: 0.55, seedName: 'thread2', edge: false })
    })
    if (ctx.lazyOnly) return
    if (over) {
      ink.layer('open', () => {
        wash(ink, body, 'paper-shade', { alpha: 0.92, material: 'wash' })
        wash(ink, body, 'hi', { alpha: 0.62, material: 'wash' })
        sewn(ink, w, h, { colour: 'var(--ll-ink-you)', width: 2.4, dash: [11, 6], alpha: 0.95, seedName: 'thread' })
      })
      return
    }
    if (invalid) {
      ink.layer('invalid', () => {
        wash(ink, body, 'paper', { alpha: 0.92, material: 'wash' })
        wash(ink, body, 'red', { alpha: 0.12, material: 'wash' })
        sewn(ink, w, h, { colour: 'var(--ll-red)', width: 2, dash: [9, 6], alpha: 0.9, seedName: 'thread' })
      })
      return
    }
    ink.layer('rest', () => {
      wash(ink, body, 'paper-shade', { alpha: 0.92, material: 'wash' })
      sewn(ink, w, h, { colour: 'var(--ll-pencil)', width: ctx.calm ? 1.2 : 1.9, dash: ctx.calm ? [5, 5] : [9, 6], regular: ctx.calm, alpha: 0.92, seedName: 'thread' })
    })
  },
})

export interface DropzoneItemParams {
  status: 'idle' | 'done' | 'error'
}

export const dropzoneItemRecipe = defineRecipe<DropzoneItemParams>({
  id: 'dropzone-item',
  kind: 'rule',
  layers: ['rest', 'invalid'],
  pad: 12,
  draw(ink, { w, h }, { status }, ctx) {
    if (status === 'error') {
      ink.layer('invalid', () => {
        line(ink, 0, h - 0.5, w, h - 1, { pen: ctx.calm ? 'red.fine' : 'red', single: w < 320, opts: { alpha: 0.85, simple: true } })
        if (!ctx.calm && w > 60) squiggle(ink, 4, h + 3.5, Math.min(w - 8, 120), { pen: 'redfelt.fine', h: 6, amp: 0.7 })
      })
      return
    }
    ink.layer('rest', () => line(ink, 0, h - 0.5, w, h - 1.1, { pen: 'pencil.fine', single: w < 320, opts: { alpha: ctx.calm ? 0.7 : 0.55, simple: true } }))
  },
})
