import type { ComponentProps, ReactNode } from "react"
import { Paper } from "@/components/ui/paper"
import { Link } from "../core/router"
import { cx } from "./cx"

export interface TileProps {
  to: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  className?: string
}

export function Tile({ to, title, description, meta, className }: TileProps) {
  return (
    <Paper
      as="li"
      stock="card"
      rules="none"
      shadow="card"
      tilt
      seed={to}
      className={cx(
        "dk-tile-li group/tile flex min-w-0 list-none transition-transform duration-(--ll-dur-hover) ease-settle hover:-translate-y-0.5 motion-reduce:transition-none",
        className,
      )}
    >
      <Link to={to} className="dk-tile flex min-w-0 flex-1 flex-col gap-1.5 p-4 outline-offset-[-4px]">
        <span className="dk-tile-title font-script text-2xl leading-none font-bold text-ink group-hover/tile:text-ink-you">{title}</span>
        {description ? <span className="dk-tile-desc line-clamp-3 text-[15px] leading-snug text-muted-foreground">{description}</span> : null}
        {meta ? <span className="dk-tile-meta mt-auto flex flex-wrap items-center gap-1.5 pt-1.5">{meta}</span> : null}
      </Link>
    </Paper>
  )
}

export function TileGrid({ className, ...props }: ComponentProps<"ul">) {
  return <ul role="list" className={cx("dk-tiles grid grid-cols-[repeat(auto-fill,minmax(min(15rem,100%),1fr))] gap-x-5 gap-y-6 p-1", className)} {...props} />
}
