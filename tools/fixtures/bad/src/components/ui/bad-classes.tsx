import * as React from "react"

import { cn } from "@/lib/utils"

const tones = {
  ink: "text-ink font-script",
  broken: "px-4 py-2 gapp-2 border",
}

export function BadClasses({ active, className, ...props }: React.ComponentProps<"div"> & { active?: boolean }) {
  return (
    <div data-slot="bad-classes" className={cn("group/ink flex items-cneter gap-2", active && "gapp-3", className)} {...props}>
      <span className="group-data-[state=checked]/inkk:opacity-100" />
      <span className="text-hand font-hand" />
      <span className="bg-primry hover:bg-accnt text-brand" />
      <span className="tex-sm" />
      <span className="focus-visibel:ring-2 data-[state=open]:anmate-in" />
      <span className="w-[calc(100%-2rem] h-[calc(100%-2rem)]" />
      <span className={tones.broken} />
      <span className="toaster ll-paper-grain ll-tilt not-prose group peer sr-only" />
      <span className="group-hover/ink:opacity-80 peer-checked:bg-primary w-[calc(100%-2rem)] bg-(--ll-ink) text-ink" />
      <span className={`bg-${active ? "ink" : "card"} text-foreground/80`} />
    </div>
  )
}
