import * as React from "react"

import { Button } from "@/components/ui/button"
import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card"

export const meta = {
  title: "Vocabulary deck",
  description: "A real use: a controlled flip card as a study deck. Turning is the answer; Next shows the front of the following card.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 340,
}

const DECK = [
  ["la maison", "the house"],
  ["le chat", "the cat"],
  ["l'encre", "the ink"],
  ["le crayon", "the pencil"],
] as const

export default function Example() {
  const [i, setI] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const go = (d: number) => {
    setFlipped(false)
    setI((i + d + DECK.length) % DECK.length)
  }
  const [word, meaning] = DECK[i]
  return (
    <div className="flex flex-col items-center gap-4">
      <FlipCard flipped={flipped} onFlippedChange={setFlipped} label={flipped ? "Show the word" : "Show the answer"}>
        <FlipCardFront>
          <span className="relative -top-[9px] text-4xl">{word}</span>
        </FlipCardFront>
        <FlipCardBack>
          <span className="text-4xl">{meaning}</span>
        </FlipCardBack>
      </FlipCard>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => go(-1)}>
          Back
        </Button>
        <span className="font-hand text-sm tabular-nums">
          {i + 1} of {DECK.length}
        </span>
        <Button size="sm" onClick={() => go(1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
