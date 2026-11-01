import { highlight } from '@/lib/ink/fills'
import { seg } from '@/lib/ink/geom'
import { defineRecipe } from '@/lib/ink/recipes'
import { box } from '@/lib/ink/shapes'
import type { Pt } from '@/lib/ink/types'

export interface SidebarMarkParams {
  active: boolean
  outline: boolean
}

export const sidebarMarkRecipe = defineRecipe<SidebarMarkParams>({
  id: 'sidebar-mark',
  kind: 'mark',
  layers: ['rest'],
  pad: 10,
  draw(ink, { w, h }, { active, outline }, ctx) {
    const rtl = ctx.dir === 'rtl'
    ink.layer('rest', () => {
      if (active) {
        highlight(ink, 3, 3, Math.max(8, w - 8), Math.max(8, h - 6), { pen: 'hi', k: 0.92, opts: { alpha: ctx.calm ? 0.7 : 0.9 } })
        ink.part('bracket', () => {
          const rng = ink.next('bracket')
          const dir = rtl ? -1 : 1
          const x = rtl ? w + 5.5 : -5.5
          const top = 2
          const span = Math.max(10, h - 4)
          const tip = Math.min(7, Math.max(4.5, span * 0.2))
          const pts: Pt[] = [
            [x + dir * tip * rng.range(0.9, 1.1), top + rng.gauss(0, 0.4)],
            [x + dir * 1.4, top + 0.5 + rng.gauss(0, 0.2)],
            [x + rng.gauss(0, 0.25), top + 3],
            ...seg(x + rng.gauss(0, 0.25), top + 3, x + rng.gauss(0, 0.5), top + span - 3, rng.gauss(0, 0.004) * span, 6).slice(1),
            [x + dir * 1.4, top + span - 0.5 + rng.gauss(0, 0.2)],
            [x + dir * tip * rng.range(0.9, 1.15), top + span + rng.gauss(0, 0.5)],
          ]
          ink.stroke(pts, ctx.calm ? 'bluepencil.fine' : 'bluepencil', { end: 'flick', wobble: 0.5, width: ctx.calm ? 1.1 : 1.7 })
        })
      }
      if (outline) {
        if (ctx.calm) box(ink, 0, 0, w, h, { pen: 'pencil.fine', corner: 3, style: 'loop', stubs: false, ghost: false })
        else box(ink, 0, 0, w, h, { pen: 'ink.fine', corner: 3, opts: w > 360 ? { simple: true } : undefined })
      }
    })
  },
})

export const sidebarRuleRecipe = defineRecipe<Record<string, never>>({
  id: 'sidebar-rule',
  kind: 'rule',
  layers: ['rest'],
  pad: 6,
  draw(ink, { w, h }, _p, ctx) {
    const x = ctx.dir === 'rtl' ? w - 0.5 : 0.5
    ink.layer('rest', () => {
      const r = ink.next('rule')
      ink.stroke(
        [
          [x + r.gauss(0, 0.3), -1],
          [x + r.gauss(0, 0.5), h / 2],
          [x + r.gauss(0, 0.3), h + 1],
        ],
        ctx.calm ? 'pencil.fine' : 'pencil',
        { start: 'soft', end: 'flick', wobble: 0.5 }
      )
    })
  },
})
