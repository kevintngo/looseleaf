import * as React from "react"

import { Button } from "@/components/ui/button"
import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"

export const meta = {
  title: "Flashcards",
  description: "A real use: a pile of flashcards. Press a button to flip the top card between the question and the answer; the pile behind it shows how many are left.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const cards = [
  { q: "petrichor", a: "the smell of rain on dry earth" },
  { q: "sonder", a: "the realisation that everyone has a life as vivid as yours" },
  { q: "komorebi", a: "sunlight filtering through leaves" },
]

export default function Example() {
  const [i, setI] = React.useState(0)
  const [shown, setShown] = React.useState(false)
  const left = cards.length - i - 1
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8">
      <IndexCard hole flag={shown ? "grass" : false} stack={Math.min(3, left) as 0 | 1 | 2 | 3} seed={`card-${i}`} aria-live="polite" className="min-h-[254px]">
        <IndexCardHeader>
          <IndexCardTitle>{cards[i].q}</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>{shown ? cards[i].a : <span className="text-muted-foreground">what does it mean?</span>}</IndexCardContent>
        <IndexCardFooter>
          <span className="ll-num">
            {i + 1} of {cards.length}
          </span>
        </IndexCardFooter>
      </IndexCard>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setShown((s) => !s)}>
          {shown ? "Hide" : "Show the answer"}
        </Button>
        <Button
          disabled={i === cards.length - 1}
          onClick={() => {
            setI((n) => n + 1)
            setShown(false)
          }}
        >
          Next card
        </Button>
      </div>
    </div>
  )
}
