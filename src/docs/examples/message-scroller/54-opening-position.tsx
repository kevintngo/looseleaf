import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "Opening position",
  description:
    "shadcn's `message-scroller-opening-position`: where a saved transcript opens. `start` shows the first message, `end` the newest, and `last-anchor` puts the last message you sent at the top, which is usually where you stopped. The provider is keyed on the choice so it opens afresh each time. (The original uses Tabs with no panels, which axe flags; a toggle group is the right control for a choice with no content behind it.)",
  layout: "center" as const,
  stage: "desk" as const,
  height: 640,
}

type Position = "start" | "end" | "last-anchor"

const messages = [
  {
    id: "open-1",
    role: "user",
    text: "This is the first message the user sent in the conversation.",
  },
  {
    id: "open-2",
    role: "assistant",
    text: "Workspace creation rose 8%, but first invite completion only rose 2%.",
  },
  {
    id: "open-3",
    role: "user",
    text: "This is the last message the user sent in the conversation.",
  },
  {
    id: "open-4",
    role: "assistant",
    text: "Start with the invite step. Teams are creating workspaces but waiting to add collaborators.\n\nRecommended follow-up:\n\n1. Compare invite drop-off by account size.\n2. Check whether users who skip invites still return within 24 hours.\n3. Review the empty-state copy on the first project screen.\n4. Segment activation by template, since template users may not need invites right away.\n\nIf that pattern holds, the next experiment should make collaboration useful earlier instead of prompting for invites harder.",
  },
] satisfies Array<{ id: string; role: "user" | "assistant"; text: string }>

const positions = ["start", "end", "last-anchor"] as const

export default function Example() {
  const [position, setPosition] = React.useState<Position>("last-anchor")

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
      <Card className="h-140 w-full gap-0">
        <CardHeader className="gap-1 border-b">
          <CardTitle>Opening Position</CardTitle>
          <CardDescription>Choose where a saved transcript opens.</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
          <MessageScrollerProvider key={position} defaultScrollPosition={position}>
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
          </MessageScrollerProvider>
        </CardContent>
        <CardFooter className="flex items-center justify-center border-t">
          <ToggleGroup
            type="single"
            aria-label="Opening position"
            value={position}
            onValueChange={(value) => {
              if (value) setPosition(value as Position)
            }}
            className="w-full"
          >
            {positions.map((option) => (
              <ToggleGroupItem key={option} value={option} className="flex-1">
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardFooter>
      </Card>
      <div className="px-0.5 text-center text-xs text-muted-foreground">Toggle the defaultScrollPosition to see where the transcript starts when you open the thread.</div>
    </div>
  )
}
