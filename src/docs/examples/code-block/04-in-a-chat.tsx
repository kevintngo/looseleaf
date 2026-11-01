import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { CodeBlock } from "@/components/ui/code-block"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"

export const meta = {
  title: "In a reply",
  description: "A code slip inside a message: it takes the width of the column and scrolls sideways when a line is long.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <Message className="mx-auto max-w-lg px-3 pt-4 pb-4">
      <MessageContent>
        <MessageHeader>Stubby</MessageHeader>
        <Bubble variant="ghost" className="max-w-full">
          <BubbleContent>Here is the one-line fix:</BubbleContent>
        </Bubble>
        <CodeBlock
          diff
          language="ts"
          filename="filter.ts"
          seed="chat"
          code={`-export const label = "all";
+export const label = picked.size ? "filtered" : "all";`}
        />
      </MessageContent>
    </Message>
  )
}
