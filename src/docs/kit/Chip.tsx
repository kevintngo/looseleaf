import type { ComponentProps } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ChipTone = "neutral" | "stable" | "new" | "experimental" | "count" | "outline"

export interface ChipProps extends ComponentProps<"span"> {
  tone?: ChipTone
  plain?: boolean
}

const PLAIN: Record<ChipTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  stable: "bg-grass/45 text-ink",
  new: "bg-marker/55 text-ink",
  experimental: "bg-bubblegum/55 text-ink",
  count: "bg-transparent text-ink-you font-script text-lg leading-none",
  outline: "bg-transparent text-foreground shadow-[inset_0_0_0_1.5px_var(--ll-pencil-mark)]",
}

export function Chip({ tone = "neutral", plain = false, className, ...props }: ChipProps) {
  if (plain) {
    return (
      <span
        data-slot="chip"
        data-tone={tone}
        className={cn("inline-flex h-6 items-center px-2 font-hand text-sm font-bold whitespace-nowrap [border-radius:3px_7px_4px_8px/8px_3px_7px_3px]", PLAIN[tone], className)}
        {...props}
      />
    )
  }
  return (
    <Badge
      data-tone={tone}
      variant={tone === "outline" || tone === "count" ? "outline" : tone === "neutral" ? "secondary" : "default"}
      tone={tone === "stable" ? "grass" : tone === "experimental" ? "bubblegum" : undefined}
      size={tone === "count" ? "sm" : "default"}
      className={cn(tone === "count" && "ll-num", className)}
      {...props}
    />
  )
}

export function StatusChip({ status, plain }: { status: "stable" | "new" | "experimental" | undefined; plain?: boolean }) {
  if (!status) return null
  return (
    <Chip tone={status} plain={plain}>
      {status}
    </Chip>
  )
}
