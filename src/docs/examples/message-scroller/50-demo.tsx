import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
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
  title: "Scripted chat",
  description:
    "shadcn's `message-scroller-demo`: a whole chat around the scroller. Send plays the next line of a script; your message settles near the top (`scrollAnchor`), the reply streams in below it and the view follows it (`autoScroll`) until you scroll up. The original drives this with the AI SDK; here a few lines of state and a timer stand in for the model.",
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
    text: "MessageScrollerItem fixes that with turn anchoring. Set scrollAnchor on the turn that should settle near the top instead of snapping to the bottom.\n\nA small peek of the previous exchange stays visible above the anchor, so context isn't lost.",
  },
  { id: "u3", role: "user", text: "Last one: does this work with assistive tech?" },
  {
    id: "a3",
    role: "assistant",
    text: "MessageScrollerContent is a log with aria-relevant additions, so new messages are announced. The jump button is a real button, and it leaves the tab order when you are already at the end.",
  },
]

export default function Example() {
  const [messages, setMessages] = React.useState<Turn[]>([])
  const [streaming, setStreaming] = React.useState(false)
  const [run, setRun] = React.useState(0)
  const timer = React.useRef(0)
  React.useEffect(() => () => window.clearInterval(timer.current), [])

  const next = SCRIPT.find((t) => t.role === "user" && !messages.some((m) => m.id === t.id))

  function send() {
    if (!next || streaming) return
    const reply = SCRIPT[SCRIPT.indexOf(next) + 1]
    const words = reply.text.split(" ")
    let n = 0
    setMessages((m) => [...m, next, { ...reply, text: "" }])
    setStreaming(true)
    timer.current = window.setInterval(() => {
      n += 1
      setMessages((m) => m.map((x) => (x.id === reply.id ? { ...x, text: words.slice(0, n).join(" ") } : x)))
      if (n >= words.length) {
        window.clearInterval(timer.current)
        setStreaming(false)
      }
    }, 45)
  }

  function reset() {
    window.clearInterval(timer.current)
    setStreaming(false)
    setMessages([])
    setRun((r) => r + 1)
  }

  return (
    <div className="relative flex w-full max-w-sm flex-col gap-4">
      <Card className="mx-auto h-140 w-full gap-0">
        <CardHeader className="gap-1 border-b">
          <CardTitle>New Chat</CardTitle>
          <CardDescription>How can I help you today?</CardDescription>
          <CardAction>
            <Button variant="outline" size="icon" aria-label="Reset conversation" title="Reset" onClick={reset} disabled={streaming}>
              <Icon name="rotate-cw" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
          {messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon name="message-circle" />
                </EmptyMedia>
                <EmptyTitle>Morning, Ada!</EmptyTitle>
                <EmptyDescription>What are we working on today? Press send to start a new conversation</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScrollerProvider key={run} autoScroll>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent aria-busy={streaming}>
                    {messages.map((turn, i) => {
                      const mine = turn.role === "user"
                      return (
                        <MessageScrollerItem key={turn.id} messageId={turn.id} scrollAnchor={mine}>
                          <Message align={mine ? "end" : "start"}>
                            <MessageContent>
                              <Bubble variant={mine ? "muted" : "ghost"}>
                                <BubbleContent className="space-y-2">
                                  <MessageText streaming={streaming && i === messages.length - 1} seed={turn.id}>
                                    {turn.text}
                                  </MessageText>
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
            </MessageScrollerProvider>
          )}
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
                <span className="line-clamp-2 opacity-60 data-[busy=false]:opacity-100" data-busy={streaming}>
                  {next ? next.text : <span className="text-muted-foreground">No messages queued. Reset the conversation.</span>}
                </span>
              </div>
              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton aria-label="Add files" type="button" size="icon-sm" variant="outline">
                      <Icon name="plus" />
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-44">
                    <DropdownMenuItem>
                      <Icon name="paperclip" />
                      Add Photos & Files
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Icon name="image" />
                      Create Image
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Icon name="sparkles" />
                      Deep Research
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Icon name="globe" />
                      Web Search
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupButton type="submit" variant="default" size="icon-sm" disabled={!next} aria-disabled={streaming || undefined} className="ms-auto">
                  <Icon name="arrow-up" />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardFooter>
      </Card>
      <div className="px-0.5 text-center text-xs text-muted-foreground">Demo is read only. Press send to send the next message.</div>
    </div>
  )
}
