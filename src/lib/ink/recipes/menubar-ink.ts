import { wash } from '@/lib/ink/fills'
import { roundRectPoly } from '@/lib/ink/geom'
import { n } from '@/lib/ink/paint'
import { clamp } from '@/lib/ink/rng'
import { box } from '@/lib/ink/shapes'
import { defineRecipe } from '@/lib/ink/recipes'

const MAX_TICKS = 72

export const menubarRecipe = defineRecipe<Record<string, never>>({
  id: 'menubar',
  kind: 'bar',
  layers: ['rest'],
  pad: 12,
  draw(ink, { w, h }, _p, ctx) {
    const r = clamp(h * 0.09, 2.5, 4.4)
    const inset = clamp(h * 0.06, 1.6, 3)
    ink.layer('rest', () => {
      wash(ink, roundRectPoly(inset, inset, w - 2 * inset, h - 2 * inset, r), 'paper-shade', { alpha: 0.85, material: 'wash' })
      if (ctx.calm) {
        box(ink, 0, 0, w, h, { pen: 'pencil.fine', corner: r, style: 'loop', stubs: false, ghost: false, opts: { simple: w > 360 || undefined } })
        return
      }
      const rng = ink.next('ruler')
      const from = 12
      const to = w - 12
      const step = Math.max(6, (to - from) / MAX_TICKS)
      let d = ''
      let i = 0
      for (let x = from + rng.range(0, 3); x < to; x += step * rng.range(0.94, 1.06), i++) {
        const tall = i % 5 === 0
        const hh = (tall ? 5.2 : 3) + rng.gauss(0, 0.35)
        const y = h - inset - 1.4
        const wd = tall ? 1 : 0.8
        const lean = rng.gauss(0, 0.25)
        d += `M${n(x)} ${n(y)}L${n(x + wd)} ${n(y)}L${n(x + wd + lean)} ${n(y - hh)}L${n(x + lean)} ${n(y - hh)}Z`
      }
      ink.flat('pencil', d, 'pencil-mark', 0.7)
      box(ink, 0, 0, w, h, { pen: 'ink.fine', corner: r, opts: w > 360 ? { simple: true } : undefined })
    })
  },
})
