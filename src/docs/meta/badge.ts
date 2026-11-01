import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "badge",
  title: "Badge",
  category: "Data display",
  description:
    "A small mark that sits next to a word: a marker stamp, a highlighter swipe, a red-hatched warning, a circled word, and a count that can be written as tally marks. Same variants and asChild as shadcn.",
  status: "stable",
  upstream: "badge",
  parts: [
    {
      name: "Badge",
      description:
        "A span (or, with asChild, the element you hand it) with a hand-drawn layer behind its label. The label is DOM text in the hand font; the drawing is measured from the element and centred on it. Unlike shadcn's it has no overflow-hidden (the drawing bleeds a few px outside the box, and clipping would cut it), so to truncate a long label put a truncating span inside it. It draws no aria-invalid state. Each badge is one small ink host (about 2 to 6 KB of svg, drawn at 0.3 to 0.8 ms): fine for a screenful, and for a status column of a few hundred rows if you page it; the ghost variant draws nothing until it is a hovered link.",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
          default: '"default"',
          description:
            "default = a terracotta marker blot that misses a felt-tip pill; secondary = one highlighter swipe; destructive = red-pencil hatch in a red pill (a pattern, not only a hue); outline = the label circled once; ghost and link draw nothing until they are hovered as links.",
        },
        {
          name: "size",
          type: '"sm" | "default" | "lg"',
          default: '"default"',
          description: "20, 24 and 28 px high. sm sets its label at 13 px: keep it for dense tables, use default anywhere a badge stands alone.",
        },
        {
          name: "tone",
          type: '"marker" | "hi" | "tangerine" | "lemon" | "grass" | "teal" | "sky" | "bubblegum"',
          default: '"marker"',
          description: "The stationery accent of the default variant's fill. Tomato and grape are left out on purpose: ink on them is 3.95:1.",
        },
        {
          name: "count",
          type: "number",
          description: "A number shown when there are no children, in tabular figures and a min-width, so a column of counts lines up.",
        },
        { name: "max", type: "number", default: "99", description: "Largest count written in digits; a bigger one shows as `${max}+`." },
        {
          name: "tally",
          type: "boolean",
          default: "false",
          description:
            "Write `count` (1 to 20) as tally marks instead of digits: four uprights and a slash per five. The number stays in the DOM, visually hidden, so screen readers still read it.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the child element (a link, a button) with the badge's classes and drawing, drawn inside it (Radix Slot). A badge that is a link or has an onClick also gets a hover layer. count and tally are ignored.",
        },
        {
          name: "seed",
          type: "string | number",
          description: "Pins the hand: the same seed always draws the same badge, also across remounts. Default: derived from useId().",
        },
      ],
    },
    {
      name: "badgeVariants",
      description: "The cva function behind Badge, for styling another element like a badge. Layout and typography classes only: the drawing comes from Badge.",
      props: [
        { name: "variant", type: "BadgeVariant", default: '"default"', description: "Same values as Badge." },
        { name: "size", type: "BadgeSize", default: '"default"', description: "Same values as Badge." },
        { name: "className", type: "string", description: "Merged last." },
      ],
    },
  ],
  a11y: [
    'A badge is plain inline text in a span: it is read in reading order with what is around it. Give a status badge words ("Beta"), never only a colour or a mark.',
    'A tally is decoration for the eye; the number is real text in the DOM (visually hidden), so `<Badge tally count={7}>` reads as "7".',
    "Ink on the marker fill is 4.6:1, on the highlighter 12:1; destructive is told apart by its hatch and its word as well as its red.",
    "As a link (asChild), the badge keeps the link's role and href, takes keyboard focus and draws the blue felt ring; hover adds a drop-line, a swipe or an underline and is off on touch screens.",
    "Windows high contrast replaces the drawing with a real 1 px outline. Reduced motion removes the hover tilt and the fill nudge.",
  ],
  usage: `import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/ui/icon"

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="destructive">Overdue</Badge>
      <Badge variant="outline">v2.4</Badge>
      <Badge variant="secondary">
        <Icon name="badge-check" />
        Verified
      </Badge>
      <Badge tally count={7} variant="outline" />
      <Badge asChild variant="link">
        <a href="/changelog">Changelog</a>
      </Badge>
    </div>
  )
}`,
  related: ["button", "sticker", "stamp", "tabs", "table"],
} satisfies ComponentDoc
