import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Buttons",
  description:
    "shadcn's `input-group-button`: a copy button that turns into a tick, a popover from the button in the leading addon (the button is the trigger, so it is the thing that says it is expanded), a star that toggles, and a text button that ends the box. The original's `useCopyToClipboard` hook is a few lines of state here.",
  layout: "center" as const,
  height: 340,
}

export default function Example() {
  const [isCopied, setIsCopied] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(false)

  function copyToClipboard(text: string) {
    void navigator.clipboard?.writeText(text)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="https://x.com/shadcn" readOnly aria-label="Profile link" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copy" title="Copy" size="icon-xs" onClick={() => copyToClipboard("https://x.com/shadcn")}>
            {isCopied ? <Icon name="check" /> : <Icon name="copy" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Popover>
            <PopoverTrigger asChild>
              <InputGroupButton variant="secondary" size="icon-xs" aria-label="Connection details">
                <Icon name="info" />
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent align="start" aria-label="Connection details" className="flex flex-col gap-1 text-sm">
              <p className="font-medium">Your connection is not secure.</p>
              <p>You should not enter any sensitive information on this site.</p>
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
        <InputGroupAddon className="ps-1.5 text-muted-foreground">https://</InputGroupAddon>
        <InputGroupInput id="input-group-button-secure" aria-label="Address" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setIsFavorite(!isFavorite)} size="icon-xs" aria-label="Favorite" aria-pressed={isFavorite}>
            <Icon name="star" data-favorite={isFavorite} className="data-[favorite=true]:text-link" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Type to search..." aria-label="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
