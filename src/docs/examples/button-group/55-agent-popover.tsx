import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "A button that opens a popover",
  description:
    "The chevron half of a split button can open anything, not only a menu: here a slip with a text area and a few lines of explanation. The popover is named with aria-label (Radix gives it role=dialog), and focus goes back to the chevron when it closes.",
  layout: "stack" as const,
  height: 440,
}

export default function Example() {
  return (
    <ButtonGroup aria-label="Copilot">
      <Button variant="outline">
        <Icon name="bot" /> Copilot
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Open the task popover">
            <Icon name="chevron-down" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0 text-sm" aria-label="Agent tasks" seed="copilot">
          <div className="px-4 py-3">
            <div className="font-bold">Agent tasks</div>
          </div>
          <Separator />
          <div className="grid gap-2 p-4">
            <Textarea placeholder="Describe your task in natural language." aria-label="Task" className="mb-2 resize-none" />
            <p className="font-bold">Start a new task with Copilot</p>
            <p className="text-muted-foreground">
              Describe your task in natural language. Copilot will work in the background and open a pull request for your review.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  )
}
