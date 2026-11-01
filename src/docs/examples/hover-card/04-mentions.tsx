import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { HoverCard, HoverCardCaption, HoverCardContent, HoverCardMedia, HoverCardTrigger } from "@/components/ui/hover-card"

export const meta = {
  title: "Mentions in prose",
  description: "The real use: names in a paragraph that unfold into a card. Every mention is a real link that works without the card (touch, keyboard, no JS), and the card is a bonus for the pointer.",
  layout: "center" as const,
  height: 340,
}

const PEOPLE = [
  { handle: "ada", name: "Ada Lovelace", bio: "Wrote the first program. Notes longer than the paper they annotate.", doodle: "star" },
  { handle: "grace", name: "Grace Hopper", bio: "Found the first bug, taped it in the log, kept the nanosecond wire.", doodle: "sun" },
  { handle: "margaret", name: "Margaret Hamilton", bio: "Flew the software that flew to the Moon.", doodle: "flower" },
]

export default function Example() {
  return (
    <p className="max-w-md self-start text-base/7">
      Today&apos;s notebook was started by{" "}
      {PEOPLE.map((p, i) => (
        <span key={p.handle}>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="h-auto p-0 align-baseline text-base" asChild>
                <a href={`#${p.handle}`}>@{p.handle}</a>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent tape={i === 1 ? "top" : false} seed={p.handle}>
              <HoverCardMedia>
                <Doodle name={p.doodle} size={80} />
              </HoverCardMedia>
              <HoverCardCaption>{p.name}</HoverCardCaption>
              <p className="px-1 text-sm text-muted-foreground">{p.bio}</p>
            </HoverCardContent>
          </HoverCard>
          {i < PEOPLE.length - 2 ? ", " : i === PEOPLE.length - 2 ? " and " : ""}
        </span>
      ))}
      , and finished by nobody yet.
    </p>
  )
}
