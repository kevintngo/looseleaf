import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "accordion",
  title: "Accordion",
  category: "Layout",
  description:
    "Ruled rows that open. Each row sits on a hand-pulled pencil rule; a hovered row gets a highlighter swipe, and an opened row turns its chevron over, writes a margin brace beside its text and lets the words soak in. Radix behavior and keyboard support are untouched.",
  status: "stable",
  upstream: "accordion",
  parts: [
    {
      name: "Accordion",
      description: "The Radix Accordion root.",
      props: [
        { name: "type", type: '"single" | "multiple"', required: true, description: "One open row at a time, or as many as you like." },
        { name: "collapsible", type: "boolean", default: "false", description: "Single mode only: allow the open row to be closed again." },
        { name: "value / defaultValue / onValueChange", type: "string | string[]", description: "Controlled and uncontrolled state (an array in multiple mode)." },
        { name: "bracket", type: '"curly" | "square" | false', default: '"curly"', description: "The mark drawn in the margin of an opened row." },
        { name: "disabled / dir / orientation", type: "boolean / \"ltr\" | \"rtl\" / \"vertical\" | \"horizontal\"", description: "As Radix." },
      ],
    },
    {
      name: "AccordionItem",
      description: "A row: `relative`, with a drawn rule at its foot (not on the last row). Its `value` ties trigger and content together.",
      props: [
        { name: "value", type: "string", required: true, description: "Identifies the row." },
        { name: "disabled", type: "boolean", default: "false", description: "The trigger is skipped by the arrow keys and cannot be opened." },
      ],
    },
    {
      name: "AccordionTrigger",
      description:
        "The row's button, inside the Radix header (an h3). Bold hand text, a chevron doodle that turns over when open, a highlighter swipe wiped in on hover and a blue ring on keyboard focus. It is 8 px wider than its text on each side so the swipe has room, and pulled back by the same amount.",
      props: [{ name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." }],
    },
    {
      name: "AccordionContent",
      description:
        "The panel (`role=\"region\"`, labeled by its trigger). It slides open with a height animation that clips the text only while it moves (at rest nothing is clipped, so a focus ring inside stays whole), and soaks its text in. `className` reaches the box that holds your children, as upstream's does, so `grid gap-3` or `flex flex-col gap-4` space them (the brace's wrapper sits between; vertical padding classes such as `pb-0` stay on the outer div, where the brace's height is measured).",
    },
  ],
  a11y: [
    "The WAI-ARIA accordion pattern from Radix: each trigger is a button with `aria-expanded` and `aria-controls` inside a heading; Enter and Space toggle; ArrowDown, ArrowUp, Home and End move between triggers.",
    "The panel is a `region` labeled by its trigger. Closed panels are removed from the accessibility tree.",
    "The chevron, the rules, the swipe and the brace are aria-hidden and pointer-events: none. State is told by aria-expanded and the turned chevron, not by color.",
    "Keyboard focus draws a blue felt ring round the row; hover-only decoration never carries meaning. Windows high contrast hides the drawings and uses the browser's own focus ring.",
    "Reduced motion (the OS setting or data-motion=\"reduced\") opens rows at once and shows the brace finished.",
    "Right-to-left layouts mirror the brace and text indent; the chevron is symmetric.",
  ],
  usage: `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function Example() {
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It follows the WAI-ARIA pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it drawn by hand?</AccordionTrigger>
        <AccordionContent>Every line.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`,
  related: ["collapsible", "tabs", "card"],
} satisfies ComponentDoc
