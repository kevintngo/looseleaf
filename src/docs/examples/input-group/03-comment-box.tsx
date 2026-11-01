import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"

export const meta = {
  title: "Comment box",
  description: "Block addons stack above or below a textarea inside the same drawn box: a header line on top, a counter and a send button underneath. The box grows with the text and is redrawn to fit.",
  layout: "stack" as const,
}

const MAX = 140

export default function Example() {
  const [text, setText] = React.useState("")
  return (
    <InputGroup className="max-w-md">
      <InputGroupAddon align="block-start">
        <Icon name="message-square" />
        <InputGroupText>Reply to Ada</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Write something kind..." aria-label="Reply" rows={3} maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} />
      <InputGroupAddon align="block-end">
        <InputGroupText className="ll-num">
          {text.length}/{MAX}
        </InputGroupText>
        <InputGroupButton variant="default" size="sm" className="ms-auto" disabled={!text.trim()}>
          <Icon name="send" />
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
