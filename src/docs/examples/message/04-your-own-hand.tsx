import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Mascot } from "@/components/ui/mascot"
import { Message, MessageAvatar, MessageContent, MessageGroup, MessageHeader, MessageText } from "@/components/ui/message"

export const meta = {
  title: "In your own hand",
  description:
    "`pen=\"you\"` sets a bubble in blue felt and the script face. MessageText keeps its words plain inline text with a baseline offset and a lighter ink, so the tall last letters of a script face (d, l, e, !) are whole.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <MessageGroup className="mx-auto w-full max-w-lg gap-5 px-3 pb-4">
      <Message align="end">
        <MessageContent>
          <MessageHeader className="justify-end">you</MessageHeader>
          <Bubble variant="tinted" pen="you">
            <BubbleContent seed="hand-1">
              <MessageText seed="hand-words-1">Call me when the old road is closed, and bring the good umbrella!</MessageText>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Mascot pose="write" size={40} seed="hand-mascot" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Stubby</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent seed="hand-2">
              <MessageText seed="hand-words-2">Noted. I will call at six and read you the whole plan aloud.</MessageText>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  )
}
