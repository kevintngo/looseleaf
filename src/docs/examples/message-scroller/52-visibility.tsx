import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const meta = {
  title: "Transcript outline",
  description:
    "shadcn's `message-scroller-visibility`: `useMessageScrollerVisibility` reports the anchor (the last user turn scrolled past the top) and `scrollToMessage` jumps to a turn. The ticks in the header are the outline; open them (click, Enter or Space) for the list. The original opens it on hover beside the card, which a keyboard cannot; a popover can be tabbed into.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 680,
}

const messages = [
  { id: "vis-brief", role: "user", text: "Review the incident handoff and tell me what to read first." },
  {
    id: "vis-brief-reply",
    role: "assistant",
    text: "Start with the summary and the impact section. The regression affected the upload queue, but the recovery path completed for every queued job.",
  },
  { id: "vis-impact", role: "user", text: "What was the customer impact?" },
  {
    id: "vis-impact-reply",
    role: "assistant",
    text: "Impact was limited to delayed processing.\n\nNo records were dropped, and the reconciliation worker confirmed each retry batch. Support saw confusion from two customers, but there were no checkout or billing errors.",
  },
  { id: "vis-actions", role: "user", text: "What actions are open?" },
  {
    id: "vis-actions-reply",
    role: "assistant",
    text: "Keep the retry window enabled until the next deploy, then add a queue-depth alert as the long-term fix.\n\nThe alert should fire on sustained queue growth, not a single short spike.",
  },
  { id: "vis-checklist", role: "user", text: "Give me the follow-up checklist." },
  {
    id: "vis-checklist-reply",
    role: "assistant",
    text: "Compare the queue recovery graph with the deploy timeline so the handoff shows exactly when processing returned to baseline.\n\nAdd a short owner note beside each follow-up item, so the retry-window decision, alert tuning and support macro do not drift into separate conversations.\n\nKeep the retry window enabled until the next deploy, then add a queue-depth alert as the long-term fix.",
  },
] satisfies Array<{ id: string; role: "user" | "assistant"; text: string }>

const userMessages = messages.filter((message) => message.role === "user")

export default function Example() {
  return (
    <MessageScrollerProvider scrollMargin={12}>
      <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
        <Card className="h-140 w-full gap-0">
          <CardHeader className="gap-1 border-b">
            <CardTitle>Transcript Outline</CardTitle>
            <CardDescription>Track the current anchored turn.</CardDescription>
            <CardAction>
              <TranscriptOutline />
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
        </Card>
        <div className="px-0.5 text-center text-xs text-muted-foreground">Open the outline to jump between anchored turns as you read.</div>
      </div>
    </MessageScrollerProvider>
  )
}

function TranscriptOutline() {
  const { scrollToMessage } = useMessageScroller()
  const { currentAnchorId } = useMessageScrollerVisibility()
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open transcript outline"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1 outline-offset-2 focus-visible:outline-2 focus-visible:outline-focus"
        >
          {userMessages.map((message, i) => (
            <span
              key={message.id}
              data-current={message.id === currentAnchorId}
              style={{ rotate: `${((i * 7) % 5) - 2}deg` }}
              className="h-0.5 w-3.5 rounded-full bg-pencil/60 data-[current=true]:h-[3px] data-[current=true]:w-5 data-[current=true]:bg-foreground"
            />
          ))}
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" side="left" aria-label="Transcript outline" className="flex w-64 flex-col gap-1 p-1">
        {userMessages.map((message) => (
          <button
            key={message.id}
            type="button"
            aria-current={currentAnchorId === message.id ? "location" : undefined}
            className="flex min-h-7 items-center px-2 py-1.5 text-start text-sm outline-none hover:ll-swipe focus-visible:ll-swipe aria-current:ll-swipe aria-current:font-bold"
            onClick={() => {
              scrollToMessage(message.id, { align: "start", behavior: "smooth" })
              setOpen(false)
            }}
          >
            <span className="line-clamp-1 min-w-0">{message.text.length > 42 ? `${message.text.slice(0, 39)}...` : message.text}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
