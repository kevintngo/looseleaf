import { FlipCard, FlipCardBack, FlipCardFront } from "@/components/ui/flip-card"

export const meta = {
  title: "Notepad flip",
  description: "axis=\"x\" turns it like a page of a top-bound pad. Any paper works for either face.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 280,
}

export default function Example() {
  return (
    <FlipCard axis="x" className="h-52 w-64" label="Turn the page">
      <FlipCardFront stock="sticky-yellow">
        <span className="text-3xl">pancakes</span>
        <span className="font-hand text-sm">turn me over for the recipe</span>
      </FlipCardFront>
      <FlipCardBack stock="index-card" className="items-start text-left text-xl">
        <span>2 eggs, 200 g flour,</span>
        <span>300 ml milk. Whisk, rest,</span>
        <span>fry until it smells right.</span>
      </FlipCardBack>
    </FlipCard>
  )
}
