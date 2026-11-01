import * as React from "react"

import { Arrow } from "@/components/ui/arrow"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Pointing at an element",
  description: "Give it a ref (or a selector) and the arrow leaves its small box and stops just short of the target, wherever the layout puts it. Resize the window and it follows.",
  layout: "stack" as const,
  height: 260,
}

export default function Example() {
  const target = React.useRef<HTMLButtonElement>(null)
  return (
    <div className="relative grid min-h-52 w-full max-w-xl grid-cols-[1fr_auto] items-center gap-8">
      <div className="flex items-center gap-2 text-[17px]">
        <span className="font-script text-2xl text-ink-you">the important one</span>
        <Arrow pointAt={target} curve="curved" tone="blue" className="size-6" />
      </div>
      <Button ref={target} className="mt-24">
        Publish
      </Button>
    </div>
  )
}
