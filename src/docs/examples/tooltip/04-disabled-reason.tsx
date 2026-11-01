import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Why is it disabled?",
  description: "A disabled button gets no pointer or focus events, so it cannot show a tooltip. Wrap it in a focusable span and point aria-describedby at a reason that is always in the page (the note only exists while open): keyboard, mouse and screen-reader users all learn why.",
  layout: "center" as const,
  height: 240,
}

export default function Example() {
  return (
    <TooltipProvider>
      <div className="pt-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-block rounded-none" aria-describedby="why-disabled">
              <Button disabled className="pointer-events-none">
                Publish notebook
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent stock="sticky-pink" side="top">
            Add a title first, then you can publish.
          </TooltipContent>
        </Tooltip>
        <span id="why-disabled" className="sr-only">
          Add a title first, then you can publish.
        </span>
      </div>
    </TooltipProvider>
  )
}
