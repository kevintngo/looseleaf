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
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller"

export const meta = {
  title: "Scroll status",
  description:
    "shadcn's `message-scroller-scrollable`: `useMessageScrollerScrollable` says whether there is more to scroll toward the start and toward the end, so the footer can tell the reader where they can go. The transcript opens at the start (`defaultScrollPosition=\"start\"`).",
  layout: "center" as const,
  stage: "desk" as const,
  height: 640,
}

const messages = Array.from({ length: 12 }, (_, index) => ({
  id: `scrollable-${index + 1}`,
  role: index % 2 === 0 ? "user" : "assistant",
  text:
    index % 2 === 0
      ? `Review scroll checkpoint ${index + 1}.`
      : `Checkpoint ${index + 1} is synced. The scrollable hook updates as the viewport moves.\n\nWhen the reader is at the first message, the footer should only point them down. Once they move into the middle of the transcript, it should explain that both directions are available.\n\nAt the latest message, the footer should switch again and only point them back up.`,
})) satisfies Array<{
  id: string
  role: "user" | "assistant"
  text: string
}>

export default function Example() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <Card className="h-140 w-full gap-0 overflow-hidden">
        <CardHeader className="gap-1 border-b">
          <CardTitle>Scroll Status</CardTitle>
          <CardDescription>Where the reader can go scroll to based on current scroll position.</CardDescription>
        </CardHeader>
        <MessageScrollerProvider defaultScrollPosition="start">
          <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-4">
                  <Transcript />
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </CardContent>
          <ScrollStateFooter />
        </MessageScrollerProvider>
      </Card>
      <div className="px-0.5 text-center text-xs text-muted-foreground">Scroll the transcript to see the footer update.</div>
    </div>
  )
}

function Transcript() {
  return messages.map((message) => {
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
  })
}

function ScrollStateFooter() {
  const { start, end } = useMessageScrollerScrollable()

  return (
    <CardFooter className="justify-center border-t text-center text-sm text-muted-foreground" role="status">
      {getScrollStatus({ start, end })}
    </CardFooter>
  )
}

function getScrollStatus({ start, end }: { start: boolean; end: boolean }) {
  if (start && end) {
    return "You can scroll both ways."
  }

  if (end) {
    return "You are at the top. You can only scroll down."
  }

  if (start) {
    return "You are at the bottom. You can only scroll up."
  }

  return "All messages fit in the viewport."
}
