import * as React from "react"

import { Button } from "@/components/ui/button"
import { Highlight } from "@/components/ui/highlight"

export const meta = {
  title: "Wraps, and draws on",
  description: "A phrase that runs onto three lines gets three swipes, one per line, that start and stop where the words do. Press replay to watch it being drawn.",
  layout: "stack" as const,
  height: 220,
}

export default function Example() {
  const [on, setOn] = React.useState(true)
  return (
    <div className="grid max-w-sm gap-4">
      <p className="text-[17px] leading-[1.55]">
        If you only remember one thing from this page, remember{" "}
        <Highlight animate show={on} tone="pink">
          that the margin is where the reading happens, and the page is only where it starts
        </Highlight>
        . Everything else is decoration.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          setOn(false)
          setTimeout(() => setOn(true), 60)
        }}
      >
        Replay
      </Button>
    </div>
  )
}
