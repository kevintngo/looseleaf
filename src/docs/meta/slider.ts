import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "slider",
  title: "Slider",
  category: "Forms",
  description:
    "Pick a number, or two, by dragging a paper knob along a hand-ruled groove. The range is one marker pass drawn full length and revealed by a CSS clip, so nothing is redrawn while you drag. Ticks, a highlighter or blue-felt range, vertical, and range sliders. Radix Slider underneath.",
  status: "stable",
  upstream: "slider",
  parts: [
    {
      name: "Slider",
      description:
        "Radix Slider.Root with the track, range and one thumb per value already inside. Give it one value for a plain slider, two or more for a range slider. The three drawings are separate hosts, and the range host is clipped to the values (the drawing never sees them).",
      props: [
        { name: "value / defaultValue / onValueChange / onValueCommit", type: "number[]", description: "Controlled or uncontrolled values. The number of values is the number of thumbs. Without either, one thumb at `min`." },
        { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "The span and its granularity. Thumbs snap to `step`." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical grows from the bottom (from the top when `inverted`)." },
        { name: "minStepsBetweenThumbs", type: "number", default: "0", description: "Range sliders: keep the thumbs this many steps apart." },
        { name: "ticks", type: "boolean | number", description: "Pencil tick marks hanging under the groove: `true` marks every step when there are 20 or fewer, else ten intervals; a number is that many intervals. The end marks are longer." },
        { name: "getValueText", type: "(value: number, index: number) => string", description: "aria-valuetext of each thumb: what a screen reader says instead of the bare number (\"12 px\", \"72 %\", \"Soft\"). Use it whenever you show the value with a unit next to the slider." },
        { name: "tone", type: '"marker" | "hi" | "blue"', default: '"marker"', description: "What colours the range: terracotta marker, highlighter or blue felt." },
        { name: "inverted / dir", type: "boolean / \"ltr\" | \"rtl\"", description: "Reverse the direction the values grow in; right-to-left starts at the right." },
        { name: "disabled", type: "boolean", description: "Dashed pencil groove, graphite range and a dashed knob. Not focusable." },
        { name: "name / form", type: "string", description: "Names the hidden inputs Radix adds inside a form (one per thumb, `name[]` for a range)." },
        { name: "aria-label / aria-labelledby / aria-describedby", type: "string", description: "Names and describes the slider: on the thumb for one value, on a role=group Root for several (thumbs keep Radix's Minimum / Maximum)." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "On every thumb (that is where the role=slider is), and the groove's two pulls and the knob's loop are drawn in red pencil. FormControl sets it for you." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same slider. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "Each thumb is a role=\"slider\" with aria-valuemin, aria-valuemax, aria-valuenow and aria-orientation. Arrow keys move by one step, Page Up / Page Down and Shift+Arrows by ten, Home and End go to the ends (Radix; the arrows follow the reading direction in RTL).",
    "Name it. With one value put aria-label or aria-labelledby on the Slider and it lands on the thumb (the Root is a plain span, so a name there would name nothing). With several values the Root becomes a role=group carrying that name, and the thumbs keep Radix's \"Minimum\" and \"Maximum\".",
    "Pointer: dragging the thumb or pressing anywhere on the groove works, on touch too (touch-action: none on the slider); the thumb's hit area is larger than the drawing.",
    "The drawing is aria-hidden, pointer-events: none and never focusable. Keyboard focus draws a blue felt ring around the knob. Windows high contrast replaces the ink by real boxes (a bordered groove, a Highlight range, a solid knob).",
    "The value is not shown by the slider: pair it with an <output> or text next to it, as the examples do.",
    "In a react-hook-form Form, FormLabel's htmlFor cannot name a slider (a span with role=slider is not a labelable element): give the FormLabel an `id` and the Slider `aria-labelledby` with it, as the Form \"Every control\" example does. FormControl's aria-describedby and aria-invalid do reach the thumb.",
    "A non-finite value (NaN) is held at `min`. Form reset: a name'd slider goes back to its defaultValue and the range follows.",
  ],
  usage: `import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function Example() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Label id="pressure-label">Pencil pressure</Label>
      <Slider defaultValue={[60]} max={100} step={1} aria-labelledby="pressure-label" />
    </div>
  )
}`,
  related: ["progress", "input", "field", "switch", "toggle"],
} satisfies ComponentDoc
