import * as React from "react"

import { cn } from "@/lib/utils"

export function BadRounded({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bad-rounded"
      style={{ borderRadius: 12, fontFamily: "Caveat" }}
      className={cn("rounded-lg border data-[state=open]:rounded-t-md font-['Caveat']", className)}
      {...props}
    />
  )
}
