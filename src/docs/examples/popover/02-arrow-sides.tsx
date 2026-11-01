import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Arrow and sides",
  description: "A felt-tip arrow points at the trigger, whichever side the popover opens on (Radix flips it near the edge of the screen). The arrow's height is added to sideOffset for you.",
  layout: "center" as const,
  height: 380,
}

const SIDES = ["top", "right", "bottom", "left"] as const

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SIDES.map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent arrow side={side} sideOffset={4} stock="sticky-yellow" seed={`arrow-${side}`} className="w-56 text-sm">
            <PopoverHeader>
              <PopoverTitle>Margin note</PopoverTitle>
              <PopoverDescription className="text-foreground/80">Opened on the {side} side of its trigger.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
