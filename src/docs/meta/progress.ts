import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "progress",
  title: "Progress",
  category: "Feedback",
  description:
    "A bar somebody hatched in pencil and is colouring in with a marker. The marker is one full-length pass revealed by a CSS clip up to the value, so changing the value is a transition, not a redraw. Without a value it becomes a scribble sliding across. Radix Progress underneath.",
  status: "stable",
  upstream: "progress",
  parts: [
    {
      name: "Progress",
      description:
        "Radix Progress.Root (role=progressbar with aria-valuenow / min / max, data-state loading | complete | indeterminate) and its Indicator, both drawn hosts. The Indicator (data-slot=\"progress-indicator\") is stretched over the whole bar and clipped to the value.",
      props: [
        { name: "value", type: "number | null", description: "How far along, out of `max`; clamped to 0..max (an upload that reports 100.4 is a full bar; Radix alone would call that invalid and start the waiting animation). Leave it out, pass null or NaN for an indeterminate bar (no aria-valuenow)." },
        { name: "max", type: "number", default: "100", description: "The scale: value 3 of max 5 is 60 %." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "12, 16 or 20 px tall. Any h-* class in `className` wins; the drawing follows the box." },
        { name: "tone", type: '"marker" | "hi" | "green" | "blue"', default: '"marker"', description: "The ink: terracotta marker, highlighter, grass marker or sky marker." },
        { name: "getValueLabel", type: "(value: number, max: number) => string", description: "Radix: builds aria-valuetext. Or pass aria-valuetext yourself." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same bar. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "role=\"progressbar\" with aria-valuemin, aria-valuemax and aria-valuenow (omitted while indeterminate); Radix also sets data-state, data-value and data-max. Give it a name with aria-label or aria-labelledby; use aria-valuetext for \"Step 2 of 5\" style text.",
    "It is a status display, not a control: not focusable. Put the percentage in text next to it if people need the number; screen readers get it from aria-valuenow.",
    "The drawing is aria-hidden and pointer-events: none. The hatch shows how much is left even when the marker's hue is hard to tell; in Windows high contrast the ink is replaced by a real border and a Highlight fill.",
    "Reduced motion (the OS setting or data-motion=\"reduced\"): value changes jump instead of gliding and the indeterminate scribble stops, sitting still in the middle of the bar.",
    "Right-to-left: the marker grows from the right and the indeterminate window slides right to left.",
  ],
  usage: `import { Progress } from "@/components/ui/progress"

export function Example() {
  return <Progress value={66} className="w-[60%]" aria-label="Chapter progress" />
}`,
  related: ["slider", "spinner", "skeleton", "field"],
} satisfies ComponentDoc
