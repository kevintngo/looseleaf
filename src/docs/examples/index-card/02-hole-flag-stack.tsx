import { IndexCard, IndexCardContent, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"

export const meta = {
  title: "Rod hole, flag, pile",
  description: "The details of a card that lived in a card box: a hole punched for the rod, a flag stuck over the edge, more cards behind it.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid gap-10 p-2 lg:grid-cols-2">
      <IndexCard hole flag="tomato" stack={3} seed="sources">
        <IndexCardHeader>
          <IndexCardTitle>Sources</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>
          <p>sketchbook, dip pen, ink</p>
          <p>sage green, ochre, madder</p>
        </IndexCardContent>
      </IndexCard>
      <IndexCard hole flag="sky" seed="words" className="min-h-[194px]">
        <IndexCardHeader>
          <IndexCardTitle>Words</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>
          <p>petrichor</p>
          <p>the smell of rain on dry earth</p>
        </IndexCardContent>
      </IndexCard>
    </div>
  )
}
