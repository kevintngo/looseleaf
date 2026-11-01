import { blobFill, hatch, wash } from '@/lib/ink/fills'
import { pillPoly, roundRectPoly } from '@/lib/ink/geom'
import { box, dashedBox, focusRing } from '@/lib/ink/shapes'
import { clamp } from '@/lib/ink/rng'
import { defineRecipe } from '@/lib/ink/recipes'

export const attachmentStateList = ['idle', 'uploading', 'processing', 'error', 'done'] as const
export type AttachmentState = (typeof attachmentStateList)[number]
export type AttachmentOrientation = 'horizontal' | 'vertical'

export interface AttachmentParams {
  state: AttachmentState
  orientation: AttachmentOrientation
  interactive?: boolean
}

export const attachmentRecipe = defineRecipe<AttachmentParams>({
  id: 'attachment',
  kind: 'attachment',
  layers: ['rest', 'hover', 'focus'],
  lazy: ['focus'],
  pad: 12,
  draw(ink, { w, h }, { state, orientation, interactive = false }, ctx) {
    const r = orientation === 'vertical' ? 2.5 : clamp(h * 0.09, 3, 5)
    ctx.lazy('focus', (f) => focusRing(f, 0, 0, w, h, { r }))
    if (ctx.lazyOnly) return
    const body = roundRectPoly(1.5, 1.5, w - 3, h - 3, r)
    ink.layer('rest', () => {
      if (state === 'idle') {
        dashedBox(ink, 0, 0, w, h, { r, pen: 'pencil', opts: { color: 'pencil-mark' } })
        return
      }
      if (state === 'error') {
        wash(ink, body, 'red', { alpha: 0.1, material: 'wash' })
        box(ink, 0, 0, w, h, { pen: 'red', corner: r, style: 'two' })
        return
      }
      const pen = ctx.calm ? 'pencil.fine' : 'pencil'
      box(ink, 0, 0, w, h, { pen, corner: r, opts: { alpha: state === 'done' ? 0.55 : 0.8 } })
      if (state !== 'done' && !ctx.calm) box(ink, 1.2, 1.4, w - 2.4, h - 2.6, { pen: 'pencil.fine', corner: r, style: 'loop', ghost: false, loose: 1.4, opts: { alpha: 0.5 } })
    })
    if (interactive) {
      ink.layer('hover', () => {
        wash(ink, body, 'hi', { alpha: ctx.calm ? 0.3 : 0.4 })
      })
    }
  },
})

export interface AttachmentMediaParams {
  state: AttachmentState
  variant: 'icon' | 'image'
}

export const attachmentMediaRecipe = defineRecipe<AttachmentMediaParams>({
  id: 'attachment-media',
  kind: 'media',
  layers: ['rest'],
  pad: 6,
  draw(ink, { w, h }, { state, variant }, ctx) {
    const err = state === 'error'
    const body = roundRectPoly(1.2, 1.2, w - 2.4, h - 2.4, 2.5)
    ink.layer('rest', () => {
      if (variant === 'icon') ink.part('fill', () => blobFill(ink, body, err ? 'red' : 'paper-shade', { alpha: err ? 0.22 : 0.95, mis: ctx.calm ? false : 1.4, material: 'wash' }))
      box(ink, 0, 0, w, h, { pen: err ? 'red.fine' : 'pencil.fine', corner: 2.5, style: 'loop', ghost: false, opts: { alpha: 0.85 } })
    })
  },
})

export const attachmentProgressRecipe = defineRecipe<{ indeterminate?: boolean }>({
  id: 'attachment-progress',
  kind: 'progress',
  layers: ['rest'],
  pad: 6,
  draw(ink, { w, h }, _p, ctx) {
    ink.layer('rest', () => {
      ink.part('track', () => wash(ink, pillPoly(1.5, 1.5, w - 3, h - 3), 'paper-shade', { alpha: 0.8, material: 'wash' }), 'wash')
      ink.group({ part: 'bar' }, () => {
        hatch(ink, [3, 2.6, w - 6, h - 5.2], { pen: 'pencil', angle: 62, gap: ctx.calm ? 4 : 3.2, tones: 1, alpha: 0.92, width: 1.05 })
      })
      box(ink, 0, 0, w, h, { pen: ctx.calm ? 'pencil.fine' : 'ink.fine', corner: h / 2, style: 'loop', ghost: false })
    })
  },
})
