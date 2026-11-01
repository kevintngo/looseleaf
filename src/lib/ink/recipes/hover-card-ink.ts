import { seg } from '@/lib/ink/geom'
import { defineRecipe } from '@/lib/ink/recipes'
import { box } from '@/lib/ink/shapes'

export const hoverCardMediaRecipe = defineRecipe<Record<string, never>>({
  id: 'hover-card-media',
  kind: 'frame',
  layers: ['rest'],
  pad: 6,
  draw(ink, { w, h }, _params, ctx) {
    ink.layer('rest', () => {
      box(ink, 1, 1, w - 2, h - 2, { pen: ctx.calm ? 'pencil.fine' : 'pencil', style: 'four', corner: 2 })
      if (ctx.calm) return
      ink.stroke(seg(4, 4.6, w - 5, 4.2, 0.4, Math.max(4, Math.round(w / 40))), 'pencil', { simple: true, width: 1.7, alpha: 0.32, start: 'soft', end: 'soft', wobble: 0.5 })
      ink.stroke(seg(4.4, 4, 4.2, h - 5, 0.4, Math.max(4, Math.round(h / 40))), 'pencil', { simple: true, width: 1.7, alpha: 0.32, start: 'soft', end: 'soft', wobble: 0.5 })
    })
  },
})
