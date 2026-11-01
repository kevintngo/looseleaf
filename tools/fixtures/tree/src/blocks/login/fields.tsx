import * as React from "react"

import { cn } from "@/lib/utils"

export function Field({ label, className, ...props }: React.ComponentProps<"input"> & { label: string }) {
  const id = React.useId()
  return (
    <label htmlFor={id} className={cn("flex flex-col gap-1 font-type text-sm", className)}>
      {label}
      <input id={id} className="border-b border-pencil bg-transparent font-hand text-base outline-none" {...props} />
    </label>
  )
}
