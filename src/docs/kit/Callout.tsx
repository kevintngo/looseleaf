import type { ComponentProps, ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export type CalloutTone = "note" | "tip" | "warn" | "error" | "todo"

export interface CalloutProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: CalloutTone
  title?: ReactNode
}

const LABELS: Record<CalloutTone, string> = { note: "Note", tip: "Tip", warn: "Careful", error: "Problem", todo: "Still drawing" }

const VARIANT = { note: "note", tip: "success", warn: "warning", error: "destructive", todo: "info" } as const
const GLYPH = { note: null, tip: "lightbulb", warn: "triangle-alert", error: "circle-alert", todo: "pencil" } as const

export function Callout({ tone = "note", title, className, children, ...props }: CalloutProps) {
  const glyph = GLYPH[tone]
  return (
    <Alert
      variant={VARIANT[tone]}
      data-tone={tone}
      role={tone === "error" ? "alert" : "note"}
      aria-label={typeof title === "string" ? undefined : LABELS[tone]}
      className={cn("my-2 text-[15px] [&_p+p]:mt-2 [&_pre]:max-w-full", className)}
      {...props}
    >
      {glyph ? <Icon name={glyph} size={16} /> : null}
      {title ? <AlertTitle className="line-clamp-none font-script text-xl leading-tight">{title}</AlertTitle> : null}
      <AlertDescription className="text-foreground">{children}</AlertDescription>
    </Alert>
  )
}
