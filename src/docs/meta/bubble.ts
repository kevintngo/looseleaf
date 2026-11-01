import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "bubble",
  title: "Bubble",
  category: "Chat",
  description:
    "A chat bubble drawn like a person draws one: a single felt-tip stroke round a pillowy box, a solid fill (blue for what you send, gray or highlighter for the rest) and a tail on the sender's side. Also a folded note or a sticky note.",
  status: "new",
  upstream: "bubble",
  parts: [
    {
      name: "BubbleGroup",
      description: "A column of bubbles (gap 2). Only the last bubble of a group keeps its tail.",
    },
    {
      name: "Bubble",
      description: "The row of one message body: aligns itself, carries the variant and the shape, and shares them with its content.",
      props: [
        { name: "variant", type: '"default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"', default: '"default"', description: "The ink: marker, highlighter, paper shade, a marker wash, paper and a line, nothing at all (prose), or red pencil hatching." },
        { name: "align", type: '"start" | "end"', default: '"start" (or the enclosing Message)', description: "Which end of the row it sits on; the tail follows, and flips in right-to-left." },
        { name: "shape", type: '"cloud" | "note" | "sticky"', default: '"cloud"', description: "A hand-drawn speech bubble, a folded slip of paper, or a sticky note (note and sticky are a Paper)." },
        { name: "pen", type: '"ink" | "you"', default: '"ink"', description: "`you` writes the outline in blue felt and the words in the script font: the person typing." },
        { name: "tail", type: "boolean", default: "true", description: "Draw the tail flick. Inside a BubbleGroup the earlier bubbles hide it by themselves." },
      ],
    },
    {
      name: "BubbleContent",
      description: "The body, and the element that is drawn. Text is real DOM text; the outline and fill are an aria-hidden svg behind it. `asChild` turns a bubble into a button or link (hover drop-lines, a drawn focus ring).",
      props: [
        { name: "asChild", type: "boolean", default: "false", description: "Render the child element (a button or an anchor) as the bubble." },
        { name: "paper", type: "Partial<PaperProps>", description: "For `note` and `sticky`: tape, fastener, curl, tilt or edge of the sheet." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same bubble." },
      ],
    },
    {
      name: "BubbleReactions",
      description: "A sticker chip that sits on the edge of a bubble: white vinyl, a cut line, a warm shadow. Put emoji, counts or small buttons inside.",
      props: [
        { name: "side", type: '"top" | "bottom"', default: '"bottom"', description: "Which edge of the bubble it overlaps." },
        { name: "align", type: '"start" | "end"', default: '"end"', description: "Which corner." },
      ],
    },
  ],
  a11y: [
    "A bubble is a plain div (as upstream); the drawing is an aria-hidden svg with pointer-events none, so it never affects selection, find-in-page or screen readers.",
    "Ink on the marker fill is 4.6:1 (the drawn fill is darker), on the highlighter and paper variants 8:1 or more. Muted text on paper is 8.9:1.",
    "An interactive bubble is a real `button` or `a` through asChild; it gets the drawn focus ring on :focus-visible and the hover drop-lines, and keeps native keyboard behavior.",
    "The tail follows the reading direction (it is on the right in right-to-left) and is a separate part, so it can be hidden without redrawing.",
    "Density `calm` draws hairline pencil outlines with a flat wash (the tail included); forced colors replace the drawing with a real outline.",
    "Difference from upstream: the body is drawn, so `bg-*`, `border-*` and `rounded-*` classes on `BubbleContent` (or `*:data-[slot=bubble-content]:bg-*` on `Bubble`) paint a plain CSS box behind the ink instead of restyling it. Choose the look with `variant`, `pen` and `shape`.",
  ],
  usage: `import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"

export function Example() {
  return (
    <BubbleGroup>
      <Bubble variant="muted">
        <BubbleContent>Can you add tags to my notes?</BubbleContent>
      </Bubble>
      <Bubble variant="default" align="end">
        <BubbleContent>Yes, small ones.</BubbleContent>
        <BubbleReactions>+1</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  )
}

<Bubble shape="note"><BubbleContent paper={{ tilt: -1.5 }}>meet me at four</BubbleContent></Bubble>`,
  related: ["message", "message-scroller", "marker", "attachment", "prompt-input", "typing-indicator"],
} satisfies ComponentDoc
