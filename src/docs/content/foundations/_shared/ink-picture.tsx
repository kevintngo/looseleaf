import { inkViewBox } from "@/lib/ink/builder"
import { useEnsureInkDefs } from "@/lib/ink/react"
import { cn } from "@/lib/utils"

export interface Drawn {
  svg: string
  w: number
  h: number
  pad: number
}

export interface InkPictureProps {
  drawn: Drawn
  label?: string
  className?: string
}

export function InkPicture({ drawn, label, className }: InkPictureProps) {
  useEnsureInkDefs()
  const width = drawn.w + 2 * drawn.pad
  const height = drawn.h + 2 * drawn.pad
  const viewBox = inkViewBox(drawn)
  const cls = cn("pointer-events-none block h-auto max-w-full overflow-visible", className)
  const html = { __html: drawn.svg }
  if (label) return <svg data-ink="illustration" role="img" aria-label={label} focusable="false" viewBox={viewBox} width={width} height={height} className={cls} dangerouslySetInnerHTML={html} />
  return <svg data-ink="illustration" aria-hidden="true" focusable="false" viewBox={viewBox} width={width} height={height} className={cls} dangerouslySetInnerHTML={html} />
}
