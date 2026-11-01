import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Mascot } from "@/components/ui/mascot"
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message"
import { TypingIndicator } from "@/components/ui/typing-indicator"

export const meta = {
  title: "Who is typing",
  description: "A message row with an avatar, a header and the indicator in blue felt for the person on the other end. The label names them for screen readers.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 pb-4">
      <Message>
        <MessageAvatar>
          <Mascot pose="write" size={40} seed="ti-mascot" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Stubby</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent seed="ti-3">
              <TypingIndicator variant="squiggle" label="Stubby is writing a reply" seed="ti-3" />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <MessageHeader>Lin</MessageHeader>
          <Bubble variant="outline" pen="you">
            <BubbleContent seed="ti-4">
              <TypingIndicator pen="you" label="Lin is typing" seed="ti-4" />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  )
}
