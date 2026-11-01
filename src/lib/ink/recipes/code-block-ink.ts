import { focusRing, line } from '@/lib/ink/shapes'
import { defineRecipe } from '@/lib/ink/recipes'

export const codeRuleRecipe = defineRecipe<Record<string, never>>({
  id: 'code-block-rule',
  kind: 'rule',
  layers: ['rest'],
  pad: 6,
  draw(ink, { w, h }, _params, ctx) {
    const y = h - 1.5
    const x0 = Math.min(14, w * 0.04)
    const x1 = w - x0
    ink.layer('rest', () => {
      if (ctx.calm) {
        line(ink, x0, y, x1, y, { pen: 'pencil.fine', single: true, bow: 0, opts: { alpha: 0.7, wobble: 0.2 } })
        return
      }
      const r = ink.next('dash')
      const dash = 7
      const gap = 4.5
      for (let x = x0 + r.range(0, 2); x < x1 - dash; x += dash + gap + r.gauss(0, 0.5)) {
        const yy = y + r.gauss(0, 0.4) - ((x - x0) / Math.max(1, x1 - x0)) * 0.9
        ink.stroke([[x, yy], [x + dash * r.range(0.85, 1.12), yy + r.gauss(0, 0.3)]], 'pencil', { simple: true, wobble: 0.3, start: 'soft', end: 'soft', width: 0.9 })
      }
    })
  },
})

export const codeBodyRecipe = defineRecipe<Record<string, never>>({
  id: 'code-block-body',
  kind: 'code',
  layers: ['focus'],
  lazy: ['focus'],
  pad: 12,
  draw(_ink, { w, h }, _params, ctx) {
    ctx.lazy('focus', (f) => focusRing(f, 2, 2, w - 4, h - 4, { r: 3 }))
  },
})
