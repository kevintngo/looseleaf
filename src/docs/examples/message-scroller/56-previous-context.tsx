import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Slider } from "@/components/ui/slider"

export const meta = {
  title: "Keeping context visible",
  description:
    "shadcn's `message-scroller-previous-context`: `scrollPreviousItemPeek` is how much of the previous reply stays in sight above a new anchor, and `scrollMargin` the space kept above it. Drag the slider, send the next line, and see how much of the last answer is left above your message.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 680,
}

type Turn = { id: string; role: "user" | "assistant"; text: string }

const SCRIPT: Turn[] = [
  {
    id: "u1",
    role: "user",
    text: "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.",
  },
  {
    id: "a1",
    role: "assistant",
    text: "That's the classic streaming scroll problem. Wrap your message list in MessageScroller and turn on autoScroll: the viewport pins to the bottom as words arrive, so the reader sees each one land in place.\n\nIt only follows while the reader is already at the bottom. The moment they scroll up, it backs off and their place is kept.",
  },
  {
    id: "u2",
    role: "user",
    text: "Okay, but when someone sends a new message the view still feels jarring, like the whole conversation reloads from the top.",
  },
  {
    id: "a2",
    role: "assistant",
    text: "MessageScrollerItem fixes that with turn anchoring. Set scrollAnchor on the turn that should settle near the top instead of snapping to the bottom.\n\nA small peek of the previous exchange stays visible above the anchor, so context isn't lost. The reply starts in view without that disorienting jump you get from a plain overflow container.",
  },
  { id: "u3", role: "user", text: "And if they've scrolled up to re-read an older answer? I don't want to yank them back down." },
  {
    id: "a3",
    role: "assistant",
    text: "You won't. Auto-scroll only runs when the viewport is already pinned to the bottom, so scrolling up is a deliberate opt-out. Their place stays put even as new words keep arriving below.\n\nWhen there is content they haven't seen yet, the jump button appears at the bottom of the viewport. One tap returns them to the newest message.",
  },
]

const START = SCRIPT.slice(0, 2)
const DEFAULT_PEEK = 64

export default function Example() {
  const [demoKey, setDemoKey] = React.useState(0)
  const [peek, setPeek] = React.useState(DEFAULT_PEEK)
  const [messages, setMessages] = React.useState<Turn[]>(START)
  const next = SCRIPT.find((t) => t.role === "user" && !messages.some((m) => m.id === t.id))

  function send() {
    if (!next) return
    setMessages((m) => [...m, next, SCRIPT[SCRIPT.indexOf(next) + 1]])
  }

  return (
    <MessageScrollerProvider key={demoKey} scrollMargin={24} scrollPreviousItemPeek={peek}>
      <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
        <Card className="h-140 w-full gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle>Keeping Context Visible</CardTitle>
            <CardDescription>New turns keep part of the previous reply in view.</CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="icon"
                aria-label="Reset context example"
                title="Reset"
                onClick={() => {
                  setMessages(START)
                  setPeek(DEFAULT_PEEK)
                  setDemoKey((key) => key + 1)
                }}
              >
                <Icon name="rotate-cw" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {messages.map((message) => {
                    const mine = message.role === "user"
                    return (
                      <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={mine}>
                        <Message align={mine ? "end" : "start"}>
                          <MessageContent>
                            <Bubble variant={mine ? "muted" : "ghost"}>
                              <BubbleContent className="space-y-2">
                                {message.text.split(/\n\s*\n/).map((paragraph, index) => (
                                  <p key={index} className="whitespace-pre-wrap">
                                    {paragraph}
                                  </p>
                                ))}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="w-full"
            >
              <InputGroup>
                <div className="h-14 w-full px-3 py-2.5">
                  <span className="line-clamp-2">{next ? next.text : <span className="text-muted-foreground">No messages queued. Reset the context.</span>}</span>
                </div>
                <InputGroupAddon align="block-end" className="pt-1">
                  <div className="flex w-28 items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{peek}px</span>
                    <Slider aria-label="Previous context peek" value={[peek]} min={64} max={128} step={1} onValueChange={(value) => setPeek(value[0] ?? DEFAULT_PEEK)} />
                  </div>
                  <InputGroupButton type="submit" variant="default" size="icon-sm" disabled={!next} className="ms-auto">
                    <Icon name="arrow-up" />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardFooter>
        </Card>
        <div className="px-0.5 text-center text-xs text-muted-foreground">Adjust the slider and send. Observe the previous message peek.</div>
      </div>
    </MessageScrollerProvider>
  )
}
