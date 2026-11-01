import { line, underline } from '@/lib/ink/shapes'
import { clamp } from '@/lib/ink/rng'
import { defineRecipe } from '@/lib/ink/recipes'

export type MarkerSide = 'start' | 'end' | 'full'
export type MarkerTone = 'default' | 'new'

export interface MarkerRuleParams {
  side: MarkerSide
  tone: MarkerTone
  style?: 'line' | 'wavy'
}

export const markerRuleRecipe = defineRecipe<MarkerRuleParams>({
  id: 'marker-rule',
  kind: 'rule',
  layers: ['rest'],
  pad: 8,
  draw(ink, { w, h }, { side, tone, style = 'line' }, ctx) {
    const y = h / 2
    const pen = tone === 'new' ? 'red' : 'pencil'
    const rtl = ctx.dir === 'rtl'
    const towardsWords: 'left' | 'right' | 'none' = side === 'full' ? 'none' : (side === 'start') === !rtl ? 'right' : 'left'
    const rng = ink.next('rule')
    const gapEnd = clamp(w * 0.02, 1, 4) + rng.range(0, 2)
    const over = rng.range(0, 3.5)
    const x1 = towardsWords === 'left' ? gapEnd : towardsWords === 'none' ? 1 + over * 0.5 : -over
    const x2 = towardsWords === 'right' ? w - gapEnd : towardsWords === 'none' ? w - 1 + over * 0.5 : w + over
    ink.layer('rest', () => {
      if (ctx.calm) {
        line(ink, x1, y, x2, y, { pen: 'pencil.fine', single: true, bow: 0, opts: { alpha: tone === 'new' ? 0.9 : 0.7, wobble: 0.2, color: tone === 'new' ? 'red' : undefined } })
        return
      }
      if (style === 'wavy' && side === 'full') {
        underline(ink, x1, y, x2 - x1, { kind: 'wavy', pen: tone === 'new' ? 'red' : 'pencil' })
        return
      }
      line(ink, x1, y, x2, y, { pen, bow: rng.range(0.4, 1.2) })
      if (tone === 'new' || w > 140) {
        const a = x1 + (x2 - x1) * rng.range(0.05, 0.3)
        const b = x2 - (x2 - x1) * rng.range(0.05, 0.3)
        line(ink, a, y + 1.4, b, y + 1.9, { pen, single: true, bow: 0.5, opts: { alpha: 0.5, width: 0.8 } })
      }
    })
  },
})
