import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageHeader, MessageText } from "@/components/ui/message"

export const meta = {
  title: "Streaming text",
  description: "MessageText keeps the words already on the page and soaks each new word in as it arrives: dark and blurred at first, then dry. A felt-tip caret rides after the last word.",
  layout: "stack" as const,
}

const REPLY =
  "Tags now sit under each note as small chips. Pick one or two and the list narrows. I kept the count at the top honest, so it always shows what is left."

export default function Example() {
  const words = React.useMemo(() => REPLY.split(" "), [])
  const [count, setCount] = React.useState(0)
  const [run, setRun] = React.useState(0)
  React.useEffect(() => {
    setCount(0)
    const id = window.setInterval(() => setCount((c) => (c >= words.length ? c : c + 1)), 140)
    return () => window.clearInterval(id)
  }, [run, words.length])
  const streaming = count < words.length
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-3 pb-4">
      <Message>
        <MessageContent>
          <MessageHeader>Stubby</MessageHeader>
          <Bubble variant="muted" className="max-w-full">
            <BubbleContent seed="stream">
              <MessageText streaming={streaming} seed="stream-words">
                {words.slice(0, count).join(" ")}
              </MessageText>
              {count === 0 ? <span className="text-muted-foreground">...</span> : null}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  )
}
