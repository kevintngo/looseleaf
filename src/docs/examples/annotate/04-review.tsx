import * as React from "react"

import { Annotate } from "@/components/ui/annotate"
import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "An editor's pass",
  description: "Turn the review on and the draft is marked up in sequence: words crossed out, a phrase scribbled, another bracketed. Nothing is removed from the text.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 320,
}

export default function Example() {
  const [review, setReview] = React.useState(false)
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Button className="w-fit" size="sm" variant={review ? "default" : "outline"} aria-pressed={review} onClick={() => setReview((r) => !r)}>
        {review ? "Clear the marks" : "Review the draft"}
      </Button>
      <Paper stock="paper" tilt className="p-7">
        <p className="text-[17px] leading-[1.9]">
          The garden was{" "}
          <Annotate type="scribble" weight="fine" show={review} animate>
            very extremely
          </Annotate>{" "}
          overgrown, and the gate, which had been{" "}
          <Annotate type="crossed-off" show={review} animate delay={500}>
            painted green
          </Annotate>{" "}
          left open for years,{" "}
          <Annotate type="brackets" color="blue" show={review} animate delay={1000}>
            no longer closed properly at all
          </Annotate>{" "}
          closed.
        </p>
      </Paper>
    </div>
  )
}
