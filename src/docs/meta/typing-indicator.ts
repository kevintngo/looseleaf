import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "typing-indicator",
  title: "Typing indicator",
  category: "Chat",
  description:
    "\"Somebody is writing\": a small pencil that draws three dots one after another, or scrawls a line of cursive. A polite live region with a screen-reader label, at home inside a bubble.",
  status: "new",
  parts: [
    {
      name: "TypingIndicator",
      description: "A `role=\"status\"` region 56 x 24 px (80 x 24 for the scrawl) holding the drawing and a visually hidden label. Every CSS animation ends on the fully drawn frame, so reduced motion shows the dots, the line and the pencil at rest.",
      props: [
        { name: "variant", type: '"dots" | "squiggle"', default: '"dots"', description: "Three dots, or a line of cursive scrawl." },
        { name: "pen", type: '"ink" | "you"', default: '"ink"', description: "`you` writes in blue felt." },
        { name: "pencil", type: "boolean", default: "true", description: "Draw the pencil that does the writing." },
        { name: "active", type: "boolean", default: "true", description: "False leaves an empty live region mounted, so a screen reader announces the label when it turns on." },
        { name: "label", type: "string", default: '"Typing"', description: "What assistive technology announces." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
  ],
  a11y: [
    "`role=\"status\"` with `aria-live=\"polite\"`: it never interrupts. The label is visually hidden text; the drawing is an aria-hidden svg.",
    "A live region announces changes, not arrivals: keep the indicator mounted and toggle `active` (the examples do) instead of mounting it when someone starts typing. Keep it exposed too: `hidden`, `display: none` or `visibility: hidden` on an ancestor removes the region from the accessibility tree, so collapse the bubble around it with `sr-only`.",
    "The animation is decoration. With `prefers-reduced-motion` (or the app's calm setting) every animation ends on its last frame, which is the complete drawing; nothing blinks or loops.",
    "Ink on paper is 14:1 (blue felt 7.1:1); the marks are not the only carrier of meaning, the label is.",
  ],
  usage: `import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { TypingIndicator } from "@/components/ui/typing-indicator"

export function Example({ typing }: { typing: boolean }) {
  return (
    <div className={typing ? undefined : "sr-only"}>
      <Bubble variant="muted">
        <BubbleContent>
          <TypingIndicator active={typing} label="Stubby is typing" />
        </BubbleContent>
      </Bubble>
    </div>
  )
}`,
  related: ["bubble", "message", "spinner", "prompt-input"],
} satisfies ComponentDoc
