import * as React from "react"

import { Button } from "@/components/ui/button"
import { Underline } from "@/components/ui/underline"

export const meta = {
  title: "Wraps, and draws on",
  description: "An underline that wraps onto several lines is one pull per line. Press replay to watch it being drawn.",
  layout: "stack" as const,
  height: 220,
}

export default function Example() {
  const [on, setOn] = React.useState(true)
  return (
    <div className="grid max-w-sm gap-4">
      <p className="text-[17px] leading-[1.55]">
        A book is a conversation with someone who cannot answer back, so{" "}
        <Underline animate show={on} kind="wavy" tone="blue">
          talk back in the margin, argue with the author, and write down where you stopped believing them
        </Underline>
        , then close it.
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
