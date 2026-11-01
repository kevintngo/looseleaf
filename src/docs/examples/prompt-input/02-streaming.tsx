import * as React from "react"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHint,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { TypingIndicator } from "@/components/ui/typing-indicator"

export const meta = {
  title: "While a reply streams",
  description: "With status streaming the send button is a stop button and sending waits; you can keep typing the next message. `lockWhileStreaming` makes the text read-only instead.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [status, setStatus] = React.useState<"ready" | "submitted" | "streaming">("ready")
  const timers = React.useRef<number[]>([])
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  React.useEffect(() => clear, [])
  const send = () => {
    clear()
    setStatus("submitted")
    timers.current.push(window.setTimeout(() => setStatus("streaming"), 700))
    timers.current.push(window.setTimeout(() => setStatus("ready"), 4200))
  }
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-2 pb-3">
      <div className="min-h-8">
        <TypingIndicator active={status !== "ready"} label={status === "submitted" ? "Sent, waiting for a reply" : "Stubby is writing"} variant="squiggle" seed="stream" />
      </div>
      <PromptInput seed="stream" status={status} onSubmit={send} onStop={() => { clear(); setStatus("ready") }}>
        <PromptInputBody>
          <PromptInputTextarea aria-label="Message" placeholder="Ask something..." />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputHint>{status === "ready" ? "Enter to send" : "Press stop to interrupt"}</PromptInputHint>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
