import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export const meta = {
  title: "Custom",
  description:
    "Official `spinner-custom`: a spinner is nothing more than a status role around an icon that turns, so you can build one from any glyph. Here the hand-drawn `loader-circle` spins with `animate-spin` (and stops for reduced motion, which Tailwind's utility alone does not do). A drawn icon must stay decorative, so the role and the name sit on a span around it instead of on the icon, as they do on the original's lucide svg.",
  layout: "center" as const,
}

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span role="status" aria-label="Loading" className="inline-flex" {...props}>
      <Icon name="loader-circle" className={cn("size-4 animate-spin motion-reduce:animate-none", className)} />
    </span>
  )
}

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  )
}
