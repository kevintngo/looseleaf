import { wash } from '@/lib/ink/fills'
import { roundRectPoly, seg } from '@/lib/ink/geom'
import { clamp } from '@/lib/ink/rng'
import { box } from '@/lib/ink/shapes'
import { defineRecipe } from '@/lib/ink/recipes'

export const KEY_DEPTH = 2.4

export const kbdRecipe = defineRecipe<Record<string, never>>({
  id: 'kbd',
  kind: 'keycap',
  layers: ['rest'],
  pad: 12,
  draw(ink, { w, h }, _p, ctx) {
    const calm = ctx.calm
    const d = calm ? 0 : KEY_DEPTH
    const fw = w - d
    const fh = h - d
    const r = clamp(Math.min(fw, fh) * 0.16, 2, 3.4)
    const color = { color: 'current' as const }
    ink.layer('rest', () => {
      wash(ink, roundRectPoly(1.4, 1.4, fw - 2.8, fh - 2.8, r), 'current', { alpha: 0.09, material: 'wash' })
      box(ink, 0, 0, fw, fh, { pen: 'pencil', corner: r, ghost: false, loose: 0.7, opts: { ...color, width: 1, alpha: 0.85 } })
      if (calm) return
      ink.group(
        { part: 'depth', hideOn: 'pressed' },
        () => {
          ink.poly(
            'wash',
            [
              [d + 0.4, fh - 0.6],
              [fw - 0.6, fh - 0.6],
              [fw - 0.6, d + 0.4],
              [fw + d, d],
              [fw + d, fh + d],
              [d, fh + d],
            ],
            'current',
            0.3
          )
          ink.lines(
            [
              {
                pts: [
                  ...seg(d * 0.6, fh + d * 0.9, fw + d * 0.9, fh + d * 0.9, 0.3, 5),
                  ...seg(fw + d * 0.9, fh + d * 0.9, fw + d * 0.9, d * 0.6, 0.3, 3).slice(1),
                ],
                o: { start: 'soft', end: 'flick', speed: 1.1, wobble: 0.5, simple: true },
              },
            ],
            'pencil',
            { ...color, width: 1.15, alpha: 0.85 }
          )
        },
        'top'
      )
    })
  },
})
