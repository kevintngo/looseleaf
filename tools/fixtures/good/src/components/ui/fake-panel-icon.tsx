import * as React from "react"

import { cn } from "@/lib/utils"

function FakeIcon({ label, className, ...props }: React.ComponentProps<"svg"> & { label?: string }) {
  return (
    <svg
      data-slot="fake-icon"
      data-ink="icon"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      viewBox="0 0 24 24"
      className={cn("pointer-events-none size-4 shrink-0", className)}
      {...props}
    >
      <path d="M5 12l4 5 10-10" fill="none" stroke="currentColor" />
    </svg>
  )
}

function NamedIcon(props: React.ComponentProps<"svg">) {
  return <svg data-slot="named-icon" data-ink="icon" role="img" aria-label="Done" focusable="false" viewBox="0 0 24 24" className="pointer-events-none" {...props} />
}

export { FakeIcon, NamedIcon }
