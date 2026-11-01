import { bandFill, wash } from '@/lib/ink/fills'
import { pillPoly, seg } from '@/lib/ink/geom'
import { clamp } from '@/lib/ink/rng'
import { box, chain, dashedBox, focusRing, loop } from '@/lib/ink/shapes'
import { defineRecipe } from '@/lib/ink/recipes'
import type { Ink } from '@/lib/ink/builder'
import type { Pt } from '@/lib/ink/types'

export interface SwitchParams {
  disabled?: boolean
  invalid?: boolean
}

export const switchRecipe = defineRecipe<SwitchParams>({
  id: 'switch',
  kind: 'switch',
  layers: ['rest', 'hover', 'checked', 'focus'],
  lazy: ['focus'],
  pad: 12,
  draw(ink, { w, h }, { disabled, invalid }, ctx) {
    const r = h / 2
    const rtl = ctx.dir === 'rtl'
    const calm = ctx.calm
    const X = (x: number): number => (rtl ? w - x : x)
    const body = pillPoly(0.5, 0.5, w - 1, h - 1)
    const oX = X(w - h * 0.46)
    const barX = X(h * 0.48)

    if (!disabled) ctx.lazy('focus', (f) => focusRing(f, 0, 0, w, h, { r }))
    if (ctx.lazyOnly) return

    const outline = (pen: 'ink' | 'red', width?: number): void =>
      box(ink, 0, 0, w, h, {
        pen: calm ? (pen === 'red' ? 'red.fine' : 'pencil.fine') : pen,
        corner: r,
        ghost: false,
        ...(calm ? { style: 'loop' as const, stubs: false } : {}),
        opts: width ? { width } : undefined,
      })

    ink.layer('rest', () => {
      if (disabled) {
        wash(ink, body, 'pencil-mark', { alpha: 0.35, material: 'wash' })
        dashedBox(ink, 0, 0, w, h, { r, pen: 'pencil', opts: { color: 'pencil', width: 1.2 } })
        loop(ink, oX, h / 2, 2.4, 2.4, { pen: 'pencil.fine', turns: 1.1, opts: { simple: true } })
        return
      }
      ink.poly('under', body, 'slip', 0.85)
      outline(invalid ? 'red' : 'ink', invalid ? 1.2 : undefined)
      loop(ink, oX, h / 2, 2.6, 2.6, { pen: invalid ? 'red.fine' : 'pencil.fine', turns: 1.1, opts: { simple: true } })
    })

    if (!disabled) {
      ink.layer('hover', () => {
        if (calm) {
          box(ink, 1, 1, w - 2, h - 2, { pen: invalid ? 'red.fine' : 'pencil.fine', corner: r, style: 'loop', stubs: false, ghost: false, loose: 0.5, opts: { alpha: 0.75, simple: true } })
          return
        }
        const d = 2 + h / 24
        ink.lines(
          [
            { pts: chain([[r + 1, h + d], [w + d, h + d], [w + d, r + 1]], [0.2, -0.15], Math.max(2.5, r), ink.next('drop')), o: { start: 'soft', end: 'soft', wobble: 0.25, dry: 0 } },
          ],
          'ink.fine',
          { width: 1.1 }
        )
      })
    }

    ink.layer('checked', () => {
      if (disabled) {
        wash(ink, body, 'pencil-mark', { alpha: 0.4, material: 'wash' })
        ink.stroke(seg(barX, h / 2 - 3.4, barX + 0.4, h / 2 + 3.4, 0.3, 3), 'pencil', { width: 1, start: 'soft', end: 'flick', wobble: 0.3, simple: true })
        return
      }
      ink.part('fill', () =>
        bandFill(ink, body, 'marker', { alpha: 0.86, passes: calm ? 1 : 2, ends: 'square', W: clamp(h * 0.34, 5, 9), angle: -0.02 })
      )
      if (false as boolean) {
        const rim: Pt[] = [...pillPoly(3, 3, w - 6, h - 6, 5)]
        rim.push(rim[0], rim[1])
        ink.stroke(rim, 'terracotta', { width: 0.26, alpha: 0.5, start: 'soft', end: 'soft', wobble: 0.5, simple: true })
      }
      if (invalid) outline('red', 1.3)
      ink.stroke(seg(barX, h / 2 - 3.6, barX + 0.5, h / 2 + 3.6, 0.3, 3), 'ink', { width: 1.05, start: 'pool', end: 'flick', wobble: 0.3, simple: true })
    })
  },
})

export interface SwitchThumbParams {
  disabled?: boolean
}

export const switchThumbRecipe = defineRecipe<SwitchThumbParams>({
  id: 'switch-thumb',
  kind: 'thumb',
  layers: ['rest'],
  pad: 6,
  draw(ink: Ink, { w, h }, { disabled }, ctx) {
    const d = Math.min(w, h)
    const cx = w / 2
    const cy = h / 2
    const rad = d / 2 - 0.8
    const rtl = ctx.dir === 'rtl'
    ink.layer('rest', () => {
      if (disabled) {
        dashedBox(ink, 0, 0, w, h, { r: d / 2, pen: 'pencil', opts: { color: 'pencil', width: 1.1 } })
        return
      }
      const disc: Pt[] = []
      for (let i = 0; i < 24; i++) disc.push([cx + Math.cos((i / 24) * Math.PI * 2) * (rad + 0.4), cy + Math.sin((i / 24) * Math.PI * 2) * (rad + 0.4)])
      ink.poly('under', disc, 'slip', 1)
      loop(ink, cx, cy, rad, rad, { pen: ctx.calm ? 'pencil.fine' : d < 14 ? 'ink.fine' : 'ink', clean: true, opts: { simple: d < 14 } })
    })
  },
})
