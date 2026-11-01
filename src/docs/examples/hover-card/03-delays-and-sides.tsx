import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { HoverCard, HoverCardCaption, HoverCardContent, HoverCardMedia, HoverCardTrigger } from "@/components/ui/hover-card"

export const meta = {
  title: "Delays and sides",
  description: "openDelay and closeDelay tune how eager the card is (the default 700 / 300 ms is deliberate: a card that pops up on every pass of the pointer is noise). `side` and `align` are Radix's: left and right cards start level with their link, so none rises above the page.",
  layout: "center" as const,
  height: 320,
}

const CARDS = [
  { label: "Instant, left", openDelay: 0, closeDelay: 100, side: "left" as const, doodle: "sun" },
  { label: "Default, bottom", openDelay: 700, closeDelay: 300, side: "bottom" as const, doodle: "mushroom" },
  { label: "Patient, right", openDelay: 1200, closeDelay: 300, side: "right" as const, doodle: "star" },
]

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 self-start">
      {CARDS.map((c) => (
        <HoverCard key={c.label} openDelay={c.openDelay} closeDelay={c.closeDelay}>
          <HoverCardTrigger asChild>
            <Button variant="outline" asChild>
              <a href="#delays">{c.label}</a>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent side={c.side} align="start" seed={c.label} className="w-56">
            <HoverCardMedia className="h-24">
              <Doodle name={c.doodle} size={72} />
            </HoverCardMedia>
            <HoverCardCaption>{c.label}</HoverCardCaption>
            <p className="px-1 text-sm text-muted-foreground">
              open {c.openDelay} ms, close {c.closeDelay} ms
            </p>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  )
}
