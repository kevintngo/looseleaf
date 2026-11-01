import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { TypingIndicator } from "@/components/ui/typing-indicator"

export const meta = {
  title: "Inside a bubble",
  description: "Put it in a BubbleContent and the bubble draws itself round it. Keep the region mounted and exposed (hide the bubble with sr-only, never display: none) and toggle `active`, so assistive tech announces it.",
  layout: "stack" as const,
}

export default function Example() {
  const [typing, setTyping] = React.useState(true)
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-start gap-4 px-4 pb-4">
      <Bubble variant="muted">
        <BubbleContent seed="ti-1">Let me look at that...</BubbleContent>
      </Bubble>
      <div className={typing ? undefined : "sr-only"}>
        <Bubble variant="muted">
          <BubbleContent seed="ti-2">
            <TypingIndicator active={typing} label="Stubby is typing" seed="ti" />
          </BubbleContent>
        </Bubble>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setTyping((t) => !t)}>
        {typing ? "Stop typing" : "Start typing"}
      </Button>
    </div>
  )
}
