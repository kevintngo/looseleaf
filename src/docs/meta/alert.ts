import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "alert",
  title: "Alert",
  category: "Feedback",
  description:
    "A message on a slip of paper, drawn in felt tip. Default and destructive as upstream, plus info, success, warning and a sticky-note variant. Each tone has its own pattern in the margin as well as its own colour, and a 16 px icon put first is circled in the tone's marker.",
  status: "stable",
  upstream: "alert",
  parts: [
    {
      name: "Alert",
      description:
        "A `role=\"alert\"` grid: an optional icon in the first column, title and description in the second. The box, margin pattern and icon circle are the host's drawing; there is no border, background or radius of its own.",
      props: [
        {
          name: "variant",
          type: '"default" | "destructive" | "info" | "success" | "warning" | "note"',
          default: '"default"',
          description:
            "destructive = red felt box, red-pencil hatching in the margin, pale red wash. info = blue felt, double blue-pencil rule. success = green felt, strip of green marker. warning = ink box on a highlighter panel. note = a sticky note with a taped corner (a Paper).",
        },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box. Default: derived from useId()." },
      ],
    },
    { name: "AlertTitle", description: "One line of bold hand text (clamped to one line), in the second grid column." },
    { name: "AlertDescription", description: "Muted text, in the second grid column; paragraphs get relaxed leading." },
  ],
  a11y: [
    "`role=\"alert\"`: assertive live region, announced when it appears. For content that is on the page from the start, override with `role=\"status\"` or `role=\"note\"`.",
    "Tone is told by pattern and icon as well as colour: hatching (destructive), a double rule (info), a marker strip (success), a highlighter panel (warning). Destructive text is red on a paper slip with the faintest red wash, 4.6:1 (the description is not dimmed as upstream's is).",
    "The box, the margin marks and the circle round the icon are aria-hidden and pointer-events: none. The icon is decorative unless you give it a `label`.",
    "Buttons and links inside an alert are their own hosts with their own focus rings.",
    "Calm density draws a single pencil loop and one rule in the tone's colour; Windows high contrast replaces the drawing with a real border.",
  ],
  usage: `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icon } from "@/components/ui/icon"

export function Example() {
  return (
    <Alert variant="destructive">
      <Icon name="circle-alert" />
      <AlertTitle>Unable to process your payment.</AlertTitle>
      <AlertDescription>Please verify your billing information and try again.</AlertDescription>
    </Alert>
  )
}`,
  related: ["card", "button", "sticker", "paper"],
} satisfies ComponentDoc
