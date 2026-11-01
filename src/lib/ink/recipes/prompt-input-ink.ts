import { line, underline } from '@/lib/ink/shapes'
import { seg } from '@/lib/ink/geom'
import { defineRecipe } from '@/lib/ink/recipes'

export const promptInputBodyRecipe = defineRecipe<{ disabled?: boolean }>({
  id: 'prompt-input-body',
  kind: 'field',
  layers: ['rest', 'focus', 'disabled'],
  lazy: ['focus'],
  pad: 8,
  draw(ink, { w, h }, { disabled }, ctx) {
    const y = h - 3
    const x0 = 2
    const x1 = w - 2
    if (disabled) {
      if (ctx.lazyOnly) return
      ink.layer('disabled', () => {
        const r = ink.next('dash')
        for (let x = x0 + r.range(0, 2); x < x1 - 7; x += 7 + 5 + r.gauss(0, 0.5)) {
          const yy = y + r.gauss(0, 0.35) - ((x - x0) / Math.max(1, x1 - x0)) * 0.8
          ink.stroke([[x, yy], [x + 7 * r.range(0.85, 1.1), yy + r.gauss(0, 0.25)]], 'pencil', { simple: true, wobble: 0.3, start: 'soft', end: 'soft', width: 0.9, color: 'pencil-mark' })
        }
      })
      return
    }
    ctx.lazy('focus', (f) => {
      underline(f, x0 - 1, y + 0.6, x1 - x0 + 2, { pen: 'blue.brush', kind: 'single' })
      f.lines(
        [
          { pts: seg(x0 - 3, y - 4, x0 - 1, y + 0.5, 0.2, 3), o: { simple: true, end: 'flick', wobble: 0.3, width: 0.8 } },
          { pts: seg(x1 + 3, y - 5, x1 + 1, y - 0.5, 0.2, 3), o: { simple: true, end: 'flick', wobble: 0.3, width: 0.8 } },
        ],
        'blue.fine',
      )
    })
    if (ctx.lazyOnly) return
    ink.layer('rest', () => {
      if (ctx.calm) line(ink, x0, y, x1, y, { pen: 'pencil.fine', single: true, bow: 0, opts: { alpha: 0.7, wobble: 0.2 } })
      else line(ink, x0 - 2, y, x1 + 2, y, { pen: 'pencil', bow: 0.9 })
    })
  },
})
