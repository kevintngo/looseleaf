import type { ComponentProps, ReactNode } from "react"
import { Icon } from "@/components/ui/icon"
import { H2, H3, H4, Prose as TypedProse } from "@/components/ui/typography"
import { useAnchorHref } from "../core/router"
import { cx } from "./cx"

export interface AnchorHeadingProps extends Omit<ComponentProps<"h2">, "id"> {
  id: string
  level?: 2 | 3 | 4
}

const HEADING = { 2: H2, 3: H3, 4: H4 } as const
const SIZE = { 2: "text-3xl sm:text-[2rem]", 3: "text-2xl sm:text-[1.65rem]", 4: "text-lg" } as const

export function AnchorHeading({ id, level = 2, className, children, ...props }: AnchorHeadingProps) {
  const href = useAnchorHref(id)
  const Heading = HEADING[level]
  return (
    <Heading id={id} tabIndex={-1} data-level={level} className={cx("dk-heading group/heading outline-offset-4", SIZE[level], className)} {...props}>
      <a href={href} className="dk-anchor decoration-marker decoration-2 underline-offset-4 hover:underline">
        {children}
        <Icon name="link" size={16} className="ms-2 inline-block align-baseline opacity-0 transition-opacity duration-(--ll-dur-hover) group-focus-within/heading:opacity-60 group-hover/heading:opacity-60" />
      </a>
    </Heading>
  )
}

export interface SectionProps {
  id: string
  title: string
  level?: 2 | 3
  description?: ReactNode
  actions?: ReactNode
  className?: string
  children?: ReactNode
}

export function Section({ id, title, level = 2, description, actions, className, children }: SectionProps) {
  return (
    <section className={cx("dk-section flex min-w-0 flex-col gap-4", className)} aria-labelledby={id} data-level={level}>
      <div className="dk-section-head flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <AnchorHeading id={id} level={level}>
          {title}
        </AnchorHeading>
        {actions}
      </div>
      {description ? <p className="dk-section-desc max-w-prose text-muted-foreground">{description}</p> : null}
      {children}
    </section>
  )
}

export function Prose({ className, ...props }: ComponentProps<"div">) {
  return <TypedProse className={cx("dk-prose", className)} {...props} />
}
