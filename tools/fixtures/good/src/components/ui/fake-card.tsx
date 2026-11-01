import * as React from "react"

import { cn } from "@/lib/utils"

function FakeCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="fake-card" className={cn("relative flex flex-col gap-4 bg-card p-6 text-card-foreground", className)} {...props} />
}

function FakeCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="fake-card-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function FakeCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="fake-card-title" className={cn("font-hand text-2xl leading-none", className)} {...props} />
}

function FakeCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="fake-card-content" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { FakeCard, FakeCardHeader, FakeCardTitle, FakeCardContent }
