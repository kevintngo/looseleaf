import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Sides and notes",
  description: "The arrow follows whichever side the note opens on (Radix flips it near the edge of the screen). Any stock makes a note: sticky pads in four colors, or a plain slip.",
  layout: "center" as const,
  height: 300,
}

const NOTES = [
  { side: "top", stock: "sticky-yellow", text: "Yellow, on top" },
  { side: "right", stock: "sticky-blue", text: "Blue, to the right" },
  { side: "bottom", stock: "sticky-pink", text: "Pink, below" },
  { side: "left", stock: "slip", text: "A plain slip, on the left" },
] as const

export default function Example() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {NOTES.map((n) => (
          <Tooltip key={n.side}>
            <TooltipTrigger asChild>
              <Button variant="outline" className="capitalize">
                {n.side}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={n.side} stock={n.stock} seed={n.side}>
              {n.text}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
