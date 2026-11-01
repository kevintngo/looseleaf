import * as React from "react"

import { cn } from "@/lib/utils"
import { Ink } from "@/lib/ink/paper"
import { deckle } from "@/lib/ink/paper/edges"
import { hashSeed, mulberry32 } from "@/lib/ink/rng"
import { cardRecipe } from "@/lib/ink/recipes/card-ink"

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <div data-slot="card" className={cn("ll-sheet relative bg-paper text-ink", className)} {...props}>
      <svg data-ink="border" aria-hidden="true" focusable="false" viewBox="0 0 320 200" className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <path d={cardRecipe(id).d} fill="none" stroke="currentColor" strokeWidth={1.2} />
        <path d={deckle(mulberry32(hashSeed(id)), 320)} fill="none" stroke="currentColor" strokeWidth={0.8} />
      </svg>
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-header" className={cn("relative flex flex-col gap-1 p-4", className)} {...props}>
      {props.children}
      <Ink />
    </div>
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-4", className)} {...props} />
}

export { Card, CardHeader, CardContent }
