import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "button",
  title: "Button",
  category: "Actions",
  description:
    "The thing you press. A marker-filled primary, a highlighter secondary, an inked outline, a whisper-box ghost, a solid red destructive and a hand-underlined link, in every shadcn size.",
  status: "stable",
  upstream: "button",
  parts: [
    {
      name: "Button",
      description:
        "A real <button> (or, with asChild, any element you hand it) with a hand-drawn layer behind its label. The label stays DOM text in the hand font; the drawing is measured from the element, never from the text.",
      props: [
        {
          name: "variant",
          type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
          default: '"default"',
          description:
            "default = terracotta marker fill and an ink box; destructive = a solid red fill with paper lettering and a red box; outline = an inked box on paper; secondary = highlighter; ghost = a whisper of pencil that lights up under a highlighter swipe on hover; link = a blue felt underline that gets a second, heavier stroke on hover.",
        },
        {
          name: "size",
          type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
          default: '"default"',
          description: "36, 24, 32 and 40 px high (the shadcn sizes); the icon sizes are squares of 36, 24, 32 and 40. Compact density is one step tighter, calm two (and calm is hairline: a pencil.fine outline, a single-pass fill). In the xs sizes an Icon inside is drawn at the 12 px tier.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the child element instead of a <button> and give it the button's classes, data attributes and drawing (Radix Slot). The drawing is inserted inside the child. A disabled asChild element gets aria-disabled, tabIndex -1 and a swallowed click.",
        },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same button, also across remounts. Default: derived from useId()." },
        {
          name: "className",
          type: "string",
          description:
            'Merged last. `rounded-full`, as in upstream, makes a pill: the box is drawn with half-height corners (a hand-drawn circle on a square icon button) and `data-shape="pill"` is set. Other rounded-* classes do nothing, because the box is a drawing, not a border.',
        },
        { name: "disabled", type: "boolean", default: "false", description: "Dashed pencil box on a pale wash. A real disabled attribute on buttons, aria-disabled on asChild elements." },
      ],
    },
    {
      name: "buttonVariants",
      description: "The cva function behind Button, for styling a link or trigger like a button. Layout and typography classes only: the drawing comes from Button.",
      props: [
        { name: "variant", type: "ButtonVariant", default: '"default"', description: "Same values as Button." },
        { name: "size", type: "ButtonSize", default: '"default"', description: "Same values as Button." },
        { name: "className", type: "string", description: "Merged last." },
      ],
    },
  ],
  a11y: [
    "Renders a native <button>: Enter and Space activate, Tab focuses, disabled removes it from the tab order.",
    "Keyboard focus draws a blue felt ring (3:1 against paper and desk); a plain outline is used until the drawing exists and in Windows high contrast, where the drawn layer is replaced by a real border.",
    "The drawing is aria-hidden, pointer-events: none and never focusable. Labels are ink on paper, marker or highlighter (4.6:1 or better).",
    "With asChild on a link, the element keeps its own role and href; disabled links are announced with aria-disabled.",
    "Reduced motion removes the hover tilt, the fill nudge and the underline swipe.",
  ],
  usage: `import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <div className="flex gap-3">
      <Button>Save changes</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive" size="sm">Delete</Button>
      <Button asChild variant="link">
        <a href="/docs">Read the docs</a>
      </Button>
    </div>
  )
}`,
  related: ["button-group", "toggle", "dropdown-menu", "spinner"],
} satisfies ComponentDoc
