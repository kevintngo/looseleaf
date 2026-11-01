import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageText } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export const meta = {
  title: "Streaming and pinning",
  description: "Send a message: it is pinned near the top of the view and the reply grows beneath it (autoScroll). When the reply is taller than the room, the view follows its bottom, until you scroll up.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 460,
}

const REPLY =
  "Tags now sit under each note as small chips. Pick one or two and the list narrows. I kept the count at the top honest, so it always shows what is left. Archived notes no longer count, which was the off-by-one. There is a test for it now, and it fails on the old code. The chips are two pixels tighter, as you asked, and the filter row lives above the list so it does not jump when the list is empty."

type Turn = { id: number; mine: boolean; text: string }

export default function Example() {
  const [turns, setTurns] = React.useState<Turn[]>([
    { id: 1, mine: true, text: "Can you add tags to my notes?" },
    { id: 2, mine: false, text: "Done: a tags array on Note, and a chip row above the list." },
  ])
  const [words, setWords] = React.useState(0)
  const [streaming, setStreaming] = React.useState(false)
  const next = React.useRef(3)
  const all = React.useMemo(() => REPLY.split(" "), [])
  React.useEffect(() => {
    if (!streaming) return
    const id = window.setInterval(() => setWords((w) => w + 1), 110)
    return () => window.clearInterval(id)
  }, [streaming])
  React.useEffect(() => {
    if (words >= all.length) setStreaming(false)
  }, [words, all.length])
  const send = () => {
    setTurns((t) => [...t, { id: next.current++, mine: true, text: "Show me what changed." }])
    setWords(0)
    setStreaming(true)
  }
  const replying = streaming || words > 0
  return (
    <div className="mx-auto flex h-[420px] w-full max-w-md flex-col gap-3">
      <div className="min-h-0 flex-1">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent aria-live={streaming ? "off" : undefined}>
                {turns.map((t) => (
                  <MessageScrollerItem key={t.id} messageId={`t${t.id}`} scrollAnchor={t.mine}>
                    <Message align={t.mine ? "end" : "start"}>
                      <MessageContent>
                        <Bubble variant={t.mine ? "default" : "muted"}>
                          <BubbleContent seed={`turn-${t.id}`}>{t.text}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
                {replying ? (
                  <MessageScrollerItem messageId="reply">
                    <Message>
                      <MessageContent>
                        <Bubble variant="ghost" className="max-w-full">
                          <BubbleContent>
                            <MessageText streaming={streaming} seed="reply">
                              {all.slice(0, words).join(" ")}
                            </MessageText>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <p role="status" className="sr-only">
        {replying && !streaming ? "Stubby replied" : ""}
      </p>
      <Button size="sm" className="self-center" onClick={send} disabled={streaming}>
        Send a message
      </Button>
    </div>
  )
}
