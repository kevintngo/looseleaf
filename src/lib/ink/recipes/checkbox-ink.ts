import { blobFill, wash } from '@/lib/ink/fills'
import { roundRectPoly, seg } from '@/lib/ink/geom'
import { clamp } from '@/lib/ink/rng'
import { checkLines, dashedBox, box, focusRing } from '@/lib/ink/shapes'
import { defineRecipe } from '@/lib/ink/recipes'
import { reveal, revealId } from '@/lib/ink/recipes/draw-on-ink'
import type { PenName } from '@/lib/ink/types'

export interface CheckboxParams {
  disabled?: boolean
  invalid?: boolean
}

export const checkboxRecipe = defineRecipe<CheckboxParams>({
  id: 'checkbox',
  kind: 'checkbox',
  layers: ['rest', 'hover', 'checked', 'indeterminate', 'focus'],
  lazy: ['focus'],
  pad: 12,
  draw(ink, { w, h }, { disabled, invalid }, ctx) {
    const s = Math.min(w, h)
    const r = clamp(s * 0.1, 1.5, 3)
    const body = roundRectPoly(0.5, 0.5, w - 1, h - 1, r)
    const fine = s < 18
    const calm = ctx.calm

    if (!disabled) ctx.lazy('focus', (fink) => focusRing(fink, 0, 0, w, h, { r }))
    if (ctx.lazyOnly) return

    const outline = (): void => {
      const pen: PenName = invalid ? (calm || fine ? 'red.fine' : 'red') : calm ? 'pencil.fine' : fine ? 'ink.fine' : 'ink'
      box(ink, 0, 0, w, h, {
        pen, corner: r, ov: 1.4 + 0.05 * s, ghost: false,
        ...(calm ? { style: 'loop' as const, stubs: false } : {}),
        opts: invalid ? { width: 1.2 } : undefined,
      })
    }

    ink.layer('rest', () => {
      if (disabled) {
        wash(ink, body, 'pencil-mark', { alpha: 0.35, material: 'wash' })
        dashedBox(ink, 0, 0, w, h, { r, pen: 'pencil', opts: { color: 'pencil', width: 1.2 } })
        return
      }
      ink.poly('under', body, 'slip', 0.85)
      outline()
    })

    if (!disabled) {
      ink.layer('hover', () => {
        if (calm) {
          box(ink, 1, 1, w - 2, h - 2, { pen: invalid ? 'red.fine' : 'pencil.fine', corner: r, style: 'loop', stubs: false, ghost: false, loose: 0.5, opts: { alpha: 0.75, simple: true } })
          return
        }
        const d = 2 + s / 24
        ink.lines(
          [
            { pts: seg(r + d + 1, h + d, w + d - 0.5, h + d, 0.3, 4), o: { start: 'soft', end: 'flick' } },
            { pts: seg(w + d, r + d + 1, w + d, h + d - 0.5, 0.3, 3), o: { start: 'soft', end: 'flick' } },
          ],
          'ink.fine',
          { width: 1.1 },
        )
      })
    }

    const markPen: PenName = disabled ? 'pencil' : s < 26 ? 'ink' : 'ink.brush'
    const fillColor = disabled ? 'pencil-mark' : 'marker'
    const fillAlpha = disabled ? 0.4 : 0.86
    const fill = (alpha: number) => ink.part('fill', () => blobFill(ink, body, fillColor, { alpha, mis: clamp(s * 0.08, 1, 2) }))

    const invalidMark = (): void => {
      if (!invalid || disabled) return
      box(ink, 0, 0, w, h, { pen: calm || fine ? 'red.fine' : 'red', corner: r, ov: 1.4 + 0.05 * s, ghost: false, ...(calm ? { style: 'loop' as const, stubs: false } : {}), opts: { width: 1.3 } })
      const a = 4 + s * 0.14
      ink.lines([{ pts: [[w - 1, -a * 0.95], [w + a * 0.3, -a * 0.4], [w + a, 0.4]], o: { start: 'soft', end: 'flick', wobble: 0.3, poly: true } }], 'red.fine', { width: 1.25 })
    }

    ink.layer('checked', () => {
      fill(fillAlpha)
      invalidMark()
      reveal(ink, { id: revealId(ctx.seed, 'c'), lines: checkLines(ink.next('check'), s * 0.12, -s * 0.1, s * 1.02), pen: markPen, box: { w, h } })
    })
    ink.layer('indeterminate', () => {
      fill(fillAlpha * 0.9)
      invalidMark()
      const y = h * 0.52
      reveal(ink, {
        id: revealId(ctx.seed, 'i'),
        lines: [{ pts: seg(w * 0.22, y + 0.6, w * 0.8, y - 0.8, 0.4, 5), o: { start: 'pool', end: 'flick', wobble: 0.4 } }],
        pen: disabled ? 'pencil' : 'ink',
        box: { w, h },
        width: s < 20 ? 1.1 : 1.35,
      })
    })
  },
})
