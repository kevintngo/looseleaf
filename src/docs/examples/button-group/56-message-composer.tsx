import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = {
  title: "A message composer (with an input group)",
  description:
    "A plain add button, then an InputGroup with a toggle inside it: the group's own box holds the field and the voice button. Turning voice mode on disables the field and changes its prompt; the toggle is `aria-pressed` and lights up as a highlighter.",
  layout: "stack" as const,
  height: 200,
}

export default function Example() {
  const [voice, setVoice] = React.useState(false)
  return (
    <TooltipProvider>
      <ButtonGroup className="w-full max-w-md" aria-label="New message">
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Attach">
            <Icon name="plus" />
          </Button>
        </ButtonGroup>
        <ButtonGroup className="flex-1">
          <InputGroup>
            <InputGroupInput placeholder={voice ? "Record and send audio..." : "Send a message..."} aria-label="Message" disabled={voice} />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton size="icon-xs" variant={voice ? "secondary" : "ghost"} aria-pressed={voice} aria-label="Voice mode" onClick={() => setVoice(!voice)}>
                    <Icon name="audio-lines" />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Voice mode</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
        </ButtonGroup>
      </ButtonGroup>
    </TooltipProvider>
  )
}
