import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "Delays and shortcut hints",
  description: "A per-tooltip delayDuration overrides the provider's: instant for a quick label, patient for an explanation. A shortcut hint sits in the note in the mono font.",
  layout: "center" as const,
  height: 240,
}

export default function Example() {
  return (
    <TooltipProvider delayDuration={500}>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-10">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Search">
              <Icon name="search" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Instant: Search</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Copy">
              <Icon name="copy" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Copy
            <span className="font-mono text-xs opacity-70">⌘C</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button variant="outline">Sync now</Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">Patient: sends every unsaved page to the cloud and waits for the answer.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
