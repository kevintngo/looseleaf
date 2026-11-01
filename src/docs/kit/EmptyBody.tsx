import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cx } from "./cx"
import type { EmptyStateProps } from "./Misc"

export default function EmptyBody({ title, children, className }: EmptyStateProps) {
  return (
    <Empty className={cx("dk-empty border", className)}>
      <EmptyHeader>
        <EmptyMedia pose="think" size={88} />
        <EmptyTitle className="dk-empty-title">{title}</EmptyTitle>
        {children ? <EmptyDescription className="dk-empty-body">{children}</EmptyDescription> : null}
      </EmptyHeader>
    </Empty>
  )
}
