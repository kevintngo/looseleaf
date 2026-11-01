import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"

export const meta = {
  title: "Rich replies",
  description:
    "shadcn's `message-markdown`: the user's message stays plain text in a bubble; the assistant's reply goes in a `ghost` bubble, which has no frame, so rendered markdown (a list, bold, inline code) reads as a page. shadcn's docs render it with their own Markdown component, which is not part of the registry; the markup below is what such a renderer produces.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>How do I render markdown in a message?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>
              <p>Here&apos;s how to render markdown in a message:</p>
              <ol className="my-2 list-decimal ps-5">
                <li>
                  Render assistant text through <strong>Markdown</strong>.
                </li>
                <li>Keep user messages as plain text.</li>
                <li>
                  Use a <code className="font-mono text-sm">ghost</code> bubble so the response is unframed.
                </li>
              </ol>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  )
}
