import { wash } from '@/lib/ink/fills'
import { roundRectPoly, seg } from '@/lib/ink/geom'
import { defineRecipe } from '@/lib/ink/recipes'
import { box, focusRing } from '@/lib/ink/shapes'
import { clamp, type Rng } from '@/lib/ink/rng'
import type { Line, Pt } from '@/lib/ink/types'

export interface ResizableParams {
  line: 'vertical' | 'horizontal'
  grip: boolean
  disabled?: boolean
}

const TAB_LONG = 32
const TAB_SHORT = 18

function stitches(rng: Rng, len: number, across: number, vertical: boolean, gap: Pt | null): Line[] {
  const lines: Line[] = []
  const cx = across / 2
  let y = 3 + rng.range(0, 4)
  while (y < len - 6) {
    const dash = rng.range(7.5, 10.5)
    const y1 = Math.min(len - 3, y + dash)
    if (!gap || y1 < gap[0] || y > gap[1]) {
      const slant = rng.gauss(0, 0.35)
      const a: Pt = vertical ? [cx - slant + rng.gauss(0, 0.25), y] : [y, cx - slant + rng.gauss(0, 0.25)]
      const b: Pt = vertical ? [cx + slant + rng.gauss(0, 0.25), y1] : [y1, cx + slant + rng.gauss(0, 0.25)]
      lines.push({ pts: seg(a[0], a[1], b[0], b[1], rng.gauss(0, 0.15), 3), o: { start: 'soft', end: 'soft', wobble: 0.3, simple: true } })
    }
    y = y1 + rng.range(4.2, 6.4)
  }
  return lines
}

export const resizableRecipe = defineRecipe<ResizableParams>({
  id: 'resizable',
  kind: 'seam',
  layers: ['rest', 'hover', 'pressed', 'focus', 'disabled'],
  lazy: ['focus'],
  pad: 12,
  draw(ink, { w, h }, { line, grip, disabled }, ctx) {
    const vertical = line === 'vertical'
    const len = vertical ? h : w
    const across = vertical ? w : h
    const mid = len / 2
    const tabLen = grip ? TAB_LONG : 0
    const gap: Pt | null = grip ? [mid - tabLen / 2 - 2, mid + tabLen / 2 + 2] : null
    const cx = w / 2, cy = h / 2
    const tabW = vertical ? TAB_SHORT : TAB_LONG
    const tabH = vertical ? TAB_LONG : TAB_SHORT

    if (disabled) {
      if (ctx.lazyOnly) return
      ink.layer('disabled', () => ink.lines(stitches(ink.next('stitch'), len, across, vertical, null), 'pencil.fine', { alpha: 0.4 }))
      return
    }

    const ringW = vertical ? Math.max(across, TAB_SHORT) : TAB_LONG + 4
    const ringH = vertical ? TAB_LONG + 4 : Math.max(across, TAB_SHORT)
    ctx.lazy('focus', (f) => focusRing(f, cx - ringW / 2, cy - ringH / 2, ringW, ringH, { r: 4 }))
    if (ctx.lazyOnly) return

    const geometry = stitches(ink.next('stitch'), len, across, vertical, gap)
    const tab = (): void => {
      const x = cx - tabW / 2, y = cy - tabH / 2
      ink.poly('under', roundRectPoly(x + 0.8, y + 0.8, tabW - 1.6, tabH - 1.6, 3), 'slip', 0.98)
      box(ink, x, y, tabW, tabH, { pen: ctx.calm ? 'pencil.fine' : 'ink.fine', corner: 3, style: 'loop', stubs: false, ghost: false })
    }

    ink.layer('rest', () => {
      ink.lines(geometry, ctx.calm ? 'pencil.fine' : 'pencil', { alpha: 1, width: ctx.calm ? 1.25 : 1.3 })
      if (grip) tab()
    })
    ink.layer('hover', () => {
      ink.lines(geometry, 'ink.fine', { alpha: 0.85, width: 1.3 })
      if (grip && !ctx.calm) wash(ink, roundRectPoly(cx - tabW / 2, cy - tabH / 2, tabW, tabH, 3), 'hi', { alpha: 0.6 })
    })
    ink.layer('pressed', () => {
      const a: Pt = vertical ? [cx, 1] : [1, cy]
      const b: Pt = vertical ? [cx + 0.4, len - 1] : [len - 1, cy + 0.4]
      ink.stroke(seg(a[0], a[1], b[0], b[1], clamp(len * 0.002, 0, 1.5), Math.max(4, Math.ceil(len / 24))), 'blue', { start: 'soft', end: 'soft', wobble: 0.4, width: 1.15 })
    })
  },
})
