import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "message",
  title: "Message",
  category: "Chat",
  description:
    "The row of a chat message: an avatar, a column with a header, the bubbles and a footer, aligned to the start or the end. Also MessageText, which sets a reply word by word so streaming text soaks in like wet ink.",
  status: "new",
  upstream: "message",
  parts: [
    { name: "MessageGroup", description: "A column of messages (gap 2)." },
    {
      name: "Message",
      description: "One message row. `align=\"end\"` reverses it and tells the bubbles inside to put their tail on that side.",
      props: [{ name: "align", type: '"start" | "end"', default: '"start"', description: "Which end of the row the message sits on." }],
    },
    { name: "MessageAvatar", description: "Sits at the bottom of the row, beside the last bubble. Put an avatar, a mascot or a doodle in it." },
    { name: "MessageContent", description: "The column: header, bubbles, footer. Everything with a data-slot inside it follows the alignment." },
    { name: "MessageHeader", description: "The name and time above the bubbles, in the hand font." },
    { name: "MessageFooter", description: "Delivery notes under the bubbles (seen, edited, sent)." },
    {
      name: "MessageText",
      description: "The words of a message as real text, set like a person wrote them: each word sits a hair off the baseline, some a shade lighter. While `streaming`, every word that arrives after the first render soaks in (dark and blurred, then dry in half a second) and a felt-tip caret rides after the last word.",
      props: [
        { name: "children", type: "string", description: "The text so far. Newlines are kept." },
        { name: "streaming", type: "boolean", default: "false", description: "Soak new words in and show the caret." },
        { name: "jitter", type: "boolean", default: "true", description: "The per-word wobble (zero in calm density and with reduced motion)." },
        { name: "seed", type: "string | number", description: "Pins the wobble." },
      ],
    },
  ],
  a11y: [
    "All parts are plain divs (as upstream). Put the transcript in a `role=\"log\"` region, which MessageScrollerContent does for you.",
    "MessageText renders one span per word with normal spaces between them, so copy, paste, find-in-page and screen readers read it as ordinary text. The animation is a CSS one that reduced motion turns off; the words and the caret stay.",
    "Text in a right-to-left script (Hebrew, Arabic...) is not split into words. Such text is one plain span with `dir=\"auto\"`, so the browser orders, joins and shapes it itself (no per-word wobble or soak; the caret stays).",
    "Header and footer are 14 px muted text (8.9:1 on paper).",
  ],
  usage: `import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent, MessageFooter, MessageHeader, MessageText } from "@/components/ui/message"

export function Example({ reply, streaming }: { reply: string; streaming: boolean }) {
  return (
    <Message>
      <MessageContent>
        <MessageHeader>Stubby</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>
            <MessageText streaming={streaming}>{reply}</MessageText>
          </BubbleContent>
        </Bubble>
        <MessageFooter>9:41</MessageFooter>
      </MessageContent>
    </Message>
  )
}`,
  related: ["bubble", "message-scroller", "marker", "typing-indicator", "prompt-input"],
} satisfies ComponentDoc
