import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

export const meta = {
  title: "Buttons and states",
  description: "Buttons go inside an addon (ghost, xs by default). The control's own state paints the group: aria-invalid draws the red box, disabled the dashed one, and `data-disabled` on the group disables it as a whole.",
  layout: "stack" as const,
}

export default function Example() {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput defaultValue="https://looseleaf.dev/r/field-notes" readOnly aria-label="Share link" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copy link" title="Copy" size="icon-xs" onClick={() => setCopied(true)}>
            <Icon name={copied ? "check" : "copy"} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Icon name="mail" />
        </InputGroupAddon>
        <InputGroupInput type="email" defaultValue="not-an-email" aria-invalid="true" aria-label="Email" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Icon name="lock" />
        </InputGroupAddon>
        <InputGroupInput defaultValue="locked by your admin" disabled aria-label="Locked" />
      </InputGroup>
      <InputGroup data-disabled="true">
        <InputGroupInput placeholder="A group can be disabled as a whole" disabled aria-label="Disabled group" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton disabled variant="secondary">
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
