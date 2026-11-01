import { pen } from '@/lib/ink/pens'
import { defineRecipe } from '@/lib/ink/recipes'
import { seg } from '@/lib/ink/geom'
import type { Pt } from '@/lib/ink/types'

export type ScrollOrientation = 'vertical' | 'horizontal'

function along(o: ScrollOrientation, len: number, mid: number, inset: number, bow: number, n: number): Pt[] {
  const pts = seg(0, 0, 0, Math.max(1, len - 2 * inset), bow, n)
  return pts.map(([x, y]) => (o === 'vertical' ? [mid + x, inset + y] : [inset + y, mid + x]) as Pt)
}

export const scrollTrackRecipe = defineRecipe<{ orientation: ScrollOrientation }>({
  id: 'scroll-track',
  kind: 'track',
  layers: ['rest'],
  pad: 2,
  draw(ink, { w, h }, { orientation }, ctx) {
    const vertical = orientation === 'vertical'
    const len = vertical ? h : w
    const mid = (vertical ? w : h) / 2
    ink.layer('rest', () => {
      ink.stroke(along(orientation, len, mid, 2, ink.next('track')() * 1.2 - 0.6, Math.max(4, Math.ceil(len / 18))), ctx.calm ? 'pencil.fine' : pen('pencil.fine'), {
        start: 'soft',
        end: 'soft',
        wobble: 0.5,
        alpha: 0.4,
      })
    })
  },
})

const LEAD = pen('pencil', { W: 3.6, dryAmt: 0.3, dryWl: 9, dens: 0.9, wob: { amp: 0.5, wl: 80, tr: 0.15 } })

export const scrollThumbRecipe = defineRecipe<{ orientation: ScrollOrientation }>({
  id: 'scroll-thumb',
  kind: 'thumb',
  layers: ['rest', 'hover'],
  pad: 1,
  draw(ink, { w, h }, { orientation }, ctx) {
    const vertical = orientation === 'vertical'
    const len = vertical ? h : w
    const mid = (vertical ? w : h) / 2
    const n = Math.max(3, Math.ceil(len / 16))
    ink.layer('rest', () => {
      ink.stroke(along(orientation, len, mid, 1, ink.next('thumb')() * 1.4 - 0.7, n), ctx.calm ? 'pencil.fine' : LEAD, { start: 'pool', end: 'pool', wobble: 0.35, width: ctx.calm ? 1.5 : 1 })
    })
    if (!ctx.calm && len > 44) {
      ink.layer('rest', () => {
        for (const d of [-3.2, 3.2]) {
          const c = len / 2 + d
          const rng = ink.next('grip')
          const a: Pt = vertical ? [mid - 3.6, c + rng.gauss(0, 0.3)] : [c + rng.gauss(0, 0.3), mid - 3.6]
          const b: Pt = vertical ? [mid + 3.6, c + rng.gauss(0, 0.3) - 0.5] : [c + rng.gauss(0, 0.3) - 0.5, mid + 3.6]
          ink.stroke([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], 'pencil.fine', { start: 'soft', end: 'soft', wobble: 0.3, alpha: 0.85, simple: true })
        }
      })
    }
    ink.layer('hover', () => {
      ink.stroke(along(orientation, len, mid + 0.7, 2, ink.next('again')() * 1 - 0.5, n), pen('pencil', { W: 2, alpha: 0.7 }), { start: 'soft', end: 'soft', wobble: 0.4 })
    })
  },
})
