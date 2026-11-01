import { Icon } from "@/components/ui/icon"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Message, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message"

export const meta = {
  title: "Names, times and receipts",
  description: "Header and footer are quiet hand notes. A reaction chip and a tick make a message look lived in.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <MessageGroup className="mx-auto w-full max-w-lg gap-6 px-3 pb-6">
      <Message>
        <MessageContent>
          <MessageHeader>
            <span className="text-foreground">Lin</span>
            <span className="font-normal">Thursday 9:12</span>
          </MessageHeader>
          <Bubble variant="secondary" className="mb-3">
            <BubbleContent seed="hf-1">The chips look great. Ship it after lunch?</BubbleContent>
            <BubbleReactions side="bottom" align="end">
              <Icon name="check" size={14} /> 2
            </BubbleReactions>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble variant="default">
            <BubbleContent seed="hf-2">After lunch, yes.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <Icon name="check" size={14} /> seen 9:14
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  )
}
