import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Demo",
  description:
    "Official `tooltip-demo`: a Hover button with the note \"Add to library\". The note is a sticky with a felt-tip arrow, opened by hover and keyboard focus. Radix needs a `TooltipProvider` above every tooltip (shadcn's docs site supplies it at the root), so the example wraps its own.",
  layout: "center" as const,
  height: 200,
}

export default function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
