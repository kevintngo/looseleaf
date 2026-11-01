import { Button } from "@/components/ui/button"
import { FlipCard, FlipCardBack, FlipCardFront, FlipCardTrigger } from "@/components/ui/flip-card"

export const meta = {
  title: "Buttons on the faces",
  description: "trigger={false} leaves the card free of the overlay, so a face can hold real buttons. The flip button is your own.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 300,
}

export default function Example() {
  return (
    <FlipCard trigger={false} className="h-52 w-72">
      <FlipCardFront className="gap-3">
        <span className="text-3xl">Studio pass</span>
        <Button size="sm">Book a desk</Button>
      </FlipCardFront>
      <FlipCardBack className="gap-2 text-xl">
        <span>Mon to Fri, 9 to 5</span>
        <span className="font-hand text-sm text-pencil-text">bring your own kettle</span>
      </FlipCardBack>
      <FlipCardTrigger overlay={false} asChild>
        <Button variant="link" size="sm" className="absolute end-2 bottom-1 z-(--ll-z-raised)">
          Details
        </Button>
      </FlipCardTrigger>
    </FlipCard>
  )
}
