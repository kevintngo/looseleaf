import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export const meta = {
  title: "Group chat",
  description:
    "shadcn's `message-scroller-group-chat`: several speakers and an assistant, and a Marker that is itself the anchor. When Rocky joins, the marker (`scrollAnchor` on its MessageScrollerItem) settles near the top and his reply arrives beneath it. Your own lines are on the right, the assistant is unframed, the others are tinted.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 680,
}

type GroupChatItem =
  | {
      id: string
      type: "event"
      text: string
      scrollAnchor?: boolean
    }
  | {
      id: string
      type: "message"
      sender: string
      role: "assistant" | "participant"
      text: string
      scrollAnchor?: boolean
    }

const currentUser = "Grace"

const initialItems = [
  {
    id: "group-1",
    type: "message",
    sender: "Grace",
    role: "participant",
    text: "@mary, the astrophage line keeps matching Venus energy output. Can you check my math?",
  },
  {
    id: "group-2",
    type: "message",
    sender: "Mary (Agent)",
    role: "assistant",
    text: "Yes. Confirmed. The curve points to a microorganism harvesting stellar energy and breeding near carbon dioxide. If @rocky agrees, this is the clue we need.",
  },
  {
    id: "group-3",
    type: "message",
    sender: "Grace",
    role: "participant",
    text: "ping @rocky",
    scrollAnchor: true,
  },
] satisfies GroupChatItem[]

const rockyMarker = {
  id: "group-4",
  type: "event",
  text: "Rocky has joined the chat",
  scrollAnchor: true,
} satisfies GroupChatItem

const rockyMessage = {
  id: "group-5",
  type: "message",
  sender: "Rocky",
  role: "participant",
  text: "Amaze. Astrophage eats light, makes heat, goes to carbon dioxide. Rocky has fuel model. Grace is smart.",
} satisfies GroupChatItem

export default function Example() {
  const [demoKey, setDemoKey] = React.useState(0)
  const [rockyTurn, setRockyTurn] = React.useState<"idle" | "marker" | "message">("idle")

  const items = rockyTurn === "message" ? [...initialItems, rockyMarker, rockyMessage] : rockyTurn === "marker" ? [...initialItems, rockyMarker] : initialItems

  const buttonLabel = rockyTurn === "idle" ? "Add Rocky" : "Send Message as Rocky"
  const isComplete = rockyTurn === "message"

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
      <Card className="h-140 w-full gap-0">
        <CardHeader className="gap-1 border-b">
          <CardTitle>Group Chat</CardTitle>
          <CardDescription>A group chat with several participants and an assistant. The Marker is marked as a turn.</CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Reset conversation"
              title="Reset"
              disabled={rockyTurn === "idle"}
              onClick={() => {
                setRockyTurn("idle")
                setDemoKey((key) => key + 1)
              }}
            >
              <Icon name="rotate-cw" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
          <MessageScrollerProvider key={demoKey}>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {items.map((item) =>
                    item.type === "message" ? (
                      <GroupChatMessage key={item.id} item={item} />
                    ) : (
                      <GroupChatMarker key={item.id} item={item} scrollAnchor={item.scrollAnchor} />
                    )
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 border-t">
          <Button
            type="button"
            disabled={isComplete}
            onClick={() => setRockyTurn((turn) => (turn === "idle" ? "marker" : "message"))}
            className="w-full"
            variant="secondary"
          >
            {buttonLabel}
          </Button>
          <p className="text-xs text-muted-foreground">
            {rockyTurn === "idle" ? "This will create a marker and make it the anchor" : "Now send Rocky's reply into the conversation"}
          </p>
        </CardFooter>
      </Card>
      <div className="px-0.5 text-center text-xs text-balance text-muted-foreground">When a user joins, a marker is created. scrollAnchor on the marker marks it as the next turn.</div>
    </div>
  )
}

function GroupChatMessage({ item }: { item: Extract<GroupChatItem, { type: "message" }> }) {
  const isCurrentUser = item.sender === currentUser
  const variant = isCurrentUser ? "muted" : item.role === "assistant" ? "ghost" : "tinted"

  return (
    <MessageScrollerItem messageId={item.id} scrollAnchor={item.scrollAnchor}>
      <Message align={isCurrentUser ? "end" : "start"}>
        <MessageContent>
          {!isCurrentUser && <MessageHeader>{item.sender}</MessageHeader>}
          <Bubble variant={variant}>
            <BubbleContent>{item.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}

function GroupChatMarker({ item, scrollAnchor = false }: { item: Extract<GroupChatItem, { type: "event" }>; scrollAnchor?: boolean }) {
  return (
    <MessageScrollerItem scrollAnchor={scrollAnchor}>
      <Marker variant="separator">
        <MarkerContent>{item.text}</MarkerContent>
      </Marker>
    </MessageScrollerItem>
  )
}
