import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "scroll-area",
  title: "Scroll Area",
  category: "Layout",
  description:
    "A scroll container whose bar is a pencil \"scroll mark\": a graphite pull sliding down a faint gutter, gone over once more when a hand is on it. It fades in on hover or scroll, works in both directions, and is Radix underneath.",
  status: "stable",
  upstream: "scroll-area",
  parts: [
    {
      name: "ScrollArea",
      description:
        "The Radix Scroll Area root with its viewport, a vertical mark and the corner. The root clips (that is how scrolling works): use `bleed` when children draw beyond their own box.",
      props: [
        { name: "orientation", type: '"vertical" | "horizontal" | "both"', default: '"vertical"', description: "Which marks to mount. Upstream always mounts the vertical one and lets you add `<ScrollBar orientation=\"horizontal\" />` as a child; that still works. With `vertical` the content wrapper Radix adds is an ordinary block (Radix makes it `display: table`, as wide as the widest unbreakable line, so a `truncate` title in a list of cards pushed the cards out of the box); `horizontal` and `both` keep the table so a row of max-content width overflows and scrolls. A sideways row inside a `vertical` area needs a width of its own (`w-max`)." },
        { name: "bleed", type: "boolean", default: "false", description: "Pad the viewport by 12 px so a child's focus ring, shadow or ink bleed is not cut at the edge of the scroll area." },
        { name: "type", type: '"auto" | "always" | "scroll" | "hover"', default: '"hover"', description: "When the mark shows (Radix): on hover or scroll, whenever there is overflow, only while scrolling, or always." },
        { name: "scrollHideDelay", type: "number", default: "600", description: "How long the mark lingers after the pointer leaves (ms)." },
      ],
    },
    {
      name: "ScrollBar",
      description: "The gutter and its thumb, each its own small drawing. The thumb's length follows the content; a thumb over 44 px gets two short cross-strokes at its middle.",
      props: [
        { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Which edge it lives on." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "Native scrolling: wheel, touch, keyboard (arrows, Space, PageUp/PageDown, Home/End) and scrollbar-less devices all work; the mark is an overlay for pointers and never the only way to scroll.",
    "A scroll region with nothing focusable in it is reachable by keyboard in current browsers; the viewport draws a blue ring inside its edge when focused. If yours is not, give the content `tabIndex={0}` and a name.",
    "The gutter and thumb are aria-hidden drawings; the thumb can be dragged and the gutter clicked, as in Radix.",
    "Windows high contrast draws the thumb in the system text color. Reduced motion removes the fade.",
    "Right-to-left content puts the vertical mark on the left: pass `dir=\"rtl\"` to the root, as Radix asks.",
  ],
  usage: `import { ScrollArea } from "@/components/ui/scroll-area"

export function Example() {
  return (
    <ScrollArea className="h-72 w-48" bleed>
      <div className="p-4">{/* long content */}</div>
    </ScrollArea>
  )
}`,
  related: ["table", "resizable", "card", "tabs"],
} satisfies ComponentDoc
