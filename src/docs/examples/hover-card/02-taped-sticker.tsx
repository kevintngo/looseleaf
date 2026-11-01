import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardCaption, HoverCardContent, HoverCardMedia, HoverCardTrigger } from "@/components/ui/hover-card"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "Taped, with a sticker",
  description: "The window holds any art: here a die-cut sticker, and the polaroid is taped down by a strip of washi across the top.",
  layout: "center" as const,
  height: 340,
}

export default function Example() {
  return (
    <div className="flex items-center gap-1 self-start text-base">
      Read the notes for
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="px-1" asChild>
            <a href="https://kevintngo.github.io/looseleaf/changelog">Looseleaf 1.0</a>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent tape="top" tilt={-1.2} seed="release" className="w-72">
          <HoverCardMedia className="h-28">
            <Sticker name="rocket" size={84} />
          </HoverCardMedia>
          <HoverCardCaption>v1.0 is out</HoverCardCaption>
          <p className="px-1 text-sm text-muted-foreground">Forty-odd components, every line drawn by hand.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
