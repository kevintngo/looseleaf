import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller"

export const meta = {
  title: "Earlier messages, and jumping to one",
  description: "Load older messages and the one you were reading stays exactly where it was (preserveScrollOnPrepend). useMessageScroller jumps to a message by id, useMessageScrollerVisibility says which are in view.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 460,
}

const make = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => ({ id: from + i, text: `Message number ${from + i}` }))

function Toolbar({ onEarlier }: { onEarlier: () => void }) {
  const { scrollToMessage } = useMessageScroller()
  const { visibleMessageIds } = useMessageScrollerVisibility()
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button variant="secondary" size="sm" onClick={onEarlier}>
        Load 10 earlier
      </Button>
      <Button variant="ghost" size="sm" onClick={() => scrollToMessage("m20", { align: "center" })}>
        Jump to 20
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="off">
        in view: {visibleMessageIds.length ? visibleMessageIds.map((id) => id.slice(1)).join(", ") : "none"}
      </span>
    </div>
  )
}

export default function Example() {
  const [messages, setMessages] = React.useState(() => make(20, 40))
  return (
    <div className="mx-auto flex h-[420px] w-full max-w-md flex-col gap-3">
      <MessageScrollerProvider>
        <Toolbar onEarlier={() => setMessages((m) => [...make(Math.max(0, m[0].id - 10), m[0].id), ...m])} />
        <div className="min-h-0 flex-1">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {messages[0].id > 0 ? null : (
                  <Marker variant="separator">
                    <MarkerContent>The beginning</MarkerContent>
                  </Marker>
                )}
                {messages.map((m) => (
                  <MessageScrollerItem key={m.id} messageId={`m${m.id}`}>
                    <Message align={m.id % 3 === 0 ? "end" : "start"}>
                      <MessageContent>
                        <Bubble variant={m.id % 3 === 0 ? "default" : "muted"}>
                          <BubbleContent seed={`n-${m.id}`}>{m.text}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </div>
      </MessageScrollerProvider>
    </div>
  )
}
