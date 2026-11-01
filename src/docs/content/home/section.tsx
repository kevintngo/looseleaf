import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function DeskSection({ id, title, lede, className, children }: { id: string; title: ReactNode; lede?: ReactNode; className?: string; children?: ReactNode }) {
  return (
    <section aria-labelledby={id} className={cn("mt-24", className)}>
      <h2 id={id} className="font-script text-5xl leading-[1.02] font-bold text-balance text-ink @xl:text-6xl">
        {title}
      </h2>
      {lede ? <p className="mt-3 max-w-2xl text-lg text-ink-soft">{lede}</p> : null}
      <div className="mt-10">{children}</div>
    </section>
  )
}
