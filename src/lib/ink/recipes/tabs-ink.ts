import { blobFill, wash } from '@/lib/ink/fills'
import { roundRectPoly } from '@/lib/ink/geom'
import { defineRecipe } from '@/lib/ink/recipes'
import { chain, dashedBox, focusRing, line, underline } from '@/lib/ink/shapes'
import type { Ink } from '@/lib/ink/builder'
import type { PenName, Pt } from '@/lib/ink/types'

export interface TabsParams {
  variant: 'default' | 'line'
  orientation: 'horizontal' | 'vertical'
  disabled?: boolean
}

const R = 5.5

function tabVertices(w: number, h: number, vertical: boolean, rtl: boolean, grow = 0): Pt[] {
  let vs: Pt[] = vertical
    ? [[w + grow, 0.6], [0.6, 0.6], [0.6, h - 0.6], [w + grow, h - 0.6]]
    : [[0.6, h + grow], [0.6, 0.6], [w - 0.6, 0.6], [w - 0.6, h + grow]]
  if (rtl) vs = vs.map(([x, y]) => [w - x, y] as Pt)
  return vs
}

function tabOutline(ink: Ink, w: number, h: number, vertical: boolean, rtl: boolean, pen: PenName, opts: { grow?: number; alpha?: number; width?: number; name: string }) {
  const rng = ink.next(opts.name)
  const vs = tabVertices(w, h, vertical, rtl, opts.grow ?? 0)
  const jit = (): Pt => [rng.gauss(0, 0.18), rng.gauss(0, 0.18)]
  const jv = vs.map(([x, y]) => {
    const [a, b] = jit()
    return [x + a, y + b] as Pt
  })
  const pts = chain(jv, [rng.gauss(0, 0.6), -rng.range(0.3, 1), rng.gauss(0, 0.6)], R, rng)
  ink.stroke(pts, pen, { start: 'soft', end: 'soft', wobble: 0.28, dry: 0, alpha: opts.alpha, width: opts.width })
}

export const tabsRecipe = defineRecipe<TabsParams>({
  id: 'tabs',
  kind: 'tab',
  layers: ['rest', 'hover', 'checked', 'focus', 'disabled'],
  lazy: ['focus'],
  pad: 12,
  draw(ink, { w, h }, { variant, orientation, disabled }, ctx) {
    const vertical = orientation === 'vertical'
    const rtl = ctx.dir === 'rtl'
    const calm = ctx.calm
    const base = (pen: PenName, alpha = 1) => {
      if (vertical) {
        const x = rtl ? 0 : w
        ink.stroke([[x, -4], [x + 0.4, h / 2], [x - 0.2, h + 4]], pen, { start: 'soft', end: 'soft', wobble: 0.4, alpha })
      } else line(ink, -4, h, w + 4, h + 0.4, { pen, single: true, opts: { alpha, dry: 0, wobble: 0.3 } })
    }

    if (!disabled) ctx.lazy('focus', (f) => focusRing(f, 0, 0, w, h, { r: R }))
    if (ctx.lazyOnly) return

    if (disabled) {
      ink.layer('disabled', () => {
        base('pencil.fine', 0.6)
        if (variant === 'default') dashedBox(ink, 0.5, 0.5, w - 1, h - 1, { r: R, pen: 'pencil.fine', opts: { alpha: 0.5 } })
      })
      return
    }

    if (variant === 'line') {
      ink.layer('rest', () => base('pencil.fine', 0.5))
      ink.layer('hover', () => base('pencil', 0.9))
      ink.layer('checked', () => {
        ink.part(
          'swipe',
          () => {
            if (vertical) {
              const x = rtl ? 2 : w - 2
              ink.stroke([[x, 3], [x + 0.5, h / 2], [x, h - 3]], 'blue', { start: 'soft', end: 'flick', wobble: 0.5, width: 1.5 })
            } else underline(ink, 3, h - 2, w - 6, { pen: 'blue', kind: 'single', opts: { width: 1.5 } })
          },
          'top',
        )
      })
      return
    }

    const body = vertical ? roundRectPoly(rtl ? -2 : 0.6, 0.6, w + 1.4, h - 1.2, R) : roundRectPoly(0.6, 0.6, w - 1.2, h + 2, R)
    ink.layer('rest', () => {
      ink.group({ hideOn: 'checked' }, () => base(calm ? 'pencil.fine' : 'pencil'), 'pencil')
      if (!calm) ink.group({ hideOn: 'checked' }, () => tabOutline(ink, w, h - (vertical ? 0 : 5), vertical, rtl, 'pencil.fine', { name: 'sk', alpha: 0.4, width: 0.9 }), 'pencil')
    })
    ink.layer('hover', () => {
      wash(ink, body, 'hi', { alpha: 0.4 })
      if (!calm) tabOutline(ink, w, h, vertical, rtl, 'ink.fine', { name: 'hv', alpha: 0.55, width: 0.9, grow: 0 })
    })
    ink.layer('checked', () => {
      ink.part('fill', () => (calm ? wash(ink, body, 'hi', { alpha: 0.7 }) : blobFill(ink, body, 'hi', { alpha: 0.9 })))
      tabOutline(ink, w, h, vertical, rtl, calm ? 'ink.fine' : 'ink', { name: 'ck', grow: 1.5 })
    })
  },
})
