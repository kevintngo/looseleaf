import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"
import { Mascot } from "@/components/ui/mascot"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message"

export const meta = {
  title: "A conversation",
  description: "Bubbles inside Messages: the tail follows the sender, the earlier bubbles of a run lose theirs, a reaction chip sits on the edge, and the header and footer are hand notes.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <MessageGroup className="mx-auto w-full max-w-lg gap-5 px-3 pb-6">
      <Message>
        <MessageAvatar>
          <Mascot pose="idle" size={36} seed="stubby" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            Stubby <span className="font-normal">9:41</span>
          </MessageHeader>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent seed="a1">I read src/notes/list.tsx first.</BubbleContent>
            </Bubble>
            <Bubble variant="muted" className="mb-2">
              <BubbleContent seed="a2">Tags become a string array on Note, with a chip row above the list. Want me to draw the chips small?</BubbleContent>
              <BubbleReactions align="start">+1</BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader className="justify-end">you</MessageHeader>
          <BubbleGroup>
            <Bubble variant="default">
              <BubbleContent seed="u1">Yes, small. And can you put the filter row above the list?</BubbleContent>
            </Bubble>
            <Bubble variant="default">
              <BubbleContent seed="u2">Thank you!</BubbleContent>
            </Bubble>
          </BubbleGroup>
          <MessageFooter>seen</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  )
}
