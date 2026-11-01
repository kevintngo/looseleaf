import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "toggle",
  title: "Toggle",
  category: "Actions",
  description:
    "A two-state button that stays down: a whisper of pencil box at rest, and a highlighter body that snaps into register when it is on. Same Radix behaviour and variants as shadcn.",
  status: "stable",
  upstream: "toggle",
  parts: [
    {
      name: "Toggle",
      description:
        "A Radix Toggle (a real <button aria-pressed>) with a hand-drawn layer behind its content. Pressed state is data-state=on in CSS, so pressing never redraws anything: the highlighter body fades in, settles from a slight turn and snaps into register while the pointer is down.",
      props: [
        {
          name: "variant",
          type: '"default" | "outline"',
          default: '"default"',
          description:
            "default = a whisper of pencil box that turns into a fine-liner box with a highlighter body when on; outline = an inked box at rest that gets the body inside it.",
        },
        {
          name: "size",
          type: '"default" | "sm" | "lg"',
          default: '"default"',
          description: "36, 32 and 40 px high, with the same minimum widths (icon squares). Compact density is one step tighter, calm two.",
        },
        {
          name: "tone",
          type: '"hi" | "marker"',
          default: '"hi"',
          description: "The colour of the body when on: yellow highlighter, or terracotta marker for a louder switch.",
        },
        { name: "pressed / defaultPressed / onPressedChange", type: "Radix", description: "Controlled and uncontrolled state, exactly as Radix Toggle." },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render your own element with the toggle's classes, state attributes and drawing inside it (Radix Slot).",
        },
        {
          name: "seed",
          type: "string | number",
          description: "Pins the hand: the same seed always draws the same toggle, also across remounts. Default: derived from useId().",
        },
      ],
    },
    {
      name: "toggleVariants",
      description: "The cva function behind Toggle (also used by ToggleGroupItem). Layout and typography classes only: the drawing comes from the component.",
      props: [
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "Same values as Toggle." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "Same values as Toggle." },
        { name: "className", type: "string", description: "Merged last." },
      ],
    },
  ],
  a11y: [
    "Renders a native <button> with aria-pressed: Enter and Space press it, Tab focuses it, disabled removes it from the tab order.",
    'An icon-only toggle needs a name: pass aria-label ("Bold"). Keep the label the same when the state changes, and let aria-pressed say on or off.',
    "On is never told by hue alone: the toggle gains a solid fine-liner box and a filled body, and the drawn body sits under the label at 12:1 (highlighter) or 4.6:1 (marker).",
    "Keyboard focus draws the blue felt ring (3:1 against paper and desk); Windows high contrast swaps the drawing for a real border and the browser's own pressed styling.",
    "aria-invalid draws the box in red pencil (again over the body when the toggle is down), so the cue is a line and not only a colour.",
    "Reduced motion removes the settle, the hover tilt and the snap.",
  ],
  usage: `import { Toggle } from "@/components/ui/toggle"
import { Icon } from "@/components/ui/icon"

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Toggle visibility">
        <Icon name="eye" />
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        <Icon name="bell" />
        Follow
      </Toggle>
    </div>
  )
}`,
  related: ["toggle-group", "button", "checkbox", "switch"],
} satisfies ComponentDoc
