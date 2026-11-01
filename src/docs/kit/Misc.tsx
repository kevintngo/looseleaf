import { lazy, Suspense, type ComponentProps, type ReactNode } from "react"
import { Skeleton as Sketch } from "@/components/ui/skeleton"
import { cx } from "./cx"

const EmptyBody = lazy(() => import("./EmptyBody"))

export interface EmptyStateProps {
  title: string
  children?: ReactNode
  className?: string
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <Suspense fallback={null}>
      <EmptyBody {...props} />
    </Suspense>
  )
}

export function Skeleton({ height = 120, label = "Loading", quiet = false }: { height?: number; label?: string; quiet?: boolean }) {
  if (quiet) {
    return (
      <div className="dk-skeleton" style={{ minHeight: height }} aria-hidden="true">
        <Sketch className="w-full" style={{ height }} />
      </div>
    )
  }
  return (
    <div className="dk-skeleton" style={{ minHeight: height }} role="status" aria-live="polite">
      <Sketch className="w-full" style={{ height }} />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function VisuallyHidden({ className, ...props }: ComponentProps<"span">) {
  return <span className={cx("sr-only", className)} {...props} />
}
