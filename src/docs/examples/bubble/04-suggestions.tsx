import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"

export const meta = {
  title: "Bubbles as buttons",
  description: "asChild turns a bubble into a real button: it wobbles on hover (drop-lines), draws a blue ring on keyboard focus, and can be pressed. Good for suggested replies.",
  layout: "stack" as const,
}

const REPLIES = ["Show me the diff", "Run the tests", "Not now, thanks"]

export default function Example() {
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-end gap-3 px-4 pb-6">
      {REPLIES.map((reply) => (
        <Bubble key={reply} variant="outline" align="end" tail={false}>
          <BubbleContent asChild seed={reply}>
            <button type="button" aria-pressed={picked === reply} onClick={() => setPicked(reply)}>
              {reply}
            </button>
          </BubbleContent>
        </Bubble>
      ))}
      <p role="status" className="min-h-6 text-sm text-muted-foreground">
        {picked ? `You picked "${picked}"` : "Pick a reply"}
      </p>
    </div>
  )
}
