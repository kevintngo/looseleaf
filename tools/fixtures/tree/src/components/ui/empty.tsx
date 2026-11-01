"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Stickers = typeof import("@/lib/ink/art/stickers")

function Empty({ className, children, ...props }: React.ComponentProps<"div">) {
  const [stickers, setStickers] = React.useState<Stickers | null>(null)
  React.useEffect(() => {
    let live = true
    void import("@/lib/ink/art/stickers").then((m) => live && setStickers(m))
    return () => {
      live = false
    }
  }, [])
  return (
    <div data-slot="empty" data-loaded={stickers ? "" : undefined} className={cn("flex flex-col items-center gap-2 p-6 text-center font-hand", className)} {...props}>
      {children}
    </div>
  )
}

export { Empty }
