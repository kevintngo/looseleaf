import type { CSSProperties, MouseEvent, ReactNode } from "react"
import { Paper } from "@/components/ui/paper"
import { InkTiles } from "@/lib/ink/react"
import type { ExampleMeta } from "../types"
import { cx } from "./cx"

export interface StageProps {
  layout?: ExampleMeta["layout"]
  height?: number
  label?: string
  surface?: "paper" | "desk"
  contain?: boolean
  className?: string
  children: ReactNode
}

const INNER: Record<NonNullable<ExampleMeta["layout"]>, string> = {
  center: "flex w-full min-h-[inherit] flex-wrap items-center justify-center gap-4 px-6 py-10",
  stack: "mx-auto flex w-full min-h-[inherit] max-w-xl flex-col items-start gap-4 px-6 py-8",
  full: "block w-full min-h-[inherit]",
}

const DESK_TILES = ["linen"] as const

function swallowPlaceholderLinks(event: MouseEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return
  const link = event.target.closest("a[href]")
  const href = link?.getAttribute("href")
  if (href === "#" || href === "") event.preventDefault()
}

export function Stage({ layout = "center", height, label = "Preview", surface = "paper", contain = false, className, children }: StageProps) {
  const style: CSSProperties | undefined = height ? { minHeight: height } : undefined
  const scroll = cx("min-w-0 max-w-full overflow-auto", contain && "[transform:translateZ(0)]")
  const inner = (
    <div data-slot="stage-inner" className={cx("dk-stage-inner", INNER[layout])}>
      {children}
    </div>
  )
  const shared = {
    role: "group",
    "aria-label": label,
    "data-layout": layout,
    "data-slot": "stage",
    onClickCapture: swallowPlaceholderLinks,
    style,
  } as const
  const minHeight = layout === "center" && "min-h-44"

  if (surface === "desk") {
    return (
      <>
        <InkTiles tiles={DESK_TILES} />
        <div {...shared} className={cx("dk-stage ll-desk relative isolate shadow-[inset_0_0_18px_-2px_rgb(var(--ll-shade)/0.4)]", scroll, minHeight, className)}>
          {inner}
        </div>
      </>
    )
  }
  return (
    <Paper {...shared} stock={layout === "full" ? "paper" : "dot-grid"} tilt={false} shadow="slip" className={cx("dk-stage min-w-0 max-w-full", minHeight, className)}>
      <div data-slot="stage-scroll" className={cx("min-h-[inherit]", scroll)}>
        {inner}
      </div>
    </Paper>
  )
}
