import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "stepper",
  title: "Stepper",
  category: "Forms",
  description:
    "A number you can nudge: minus, the value, plus. One hand-drawn box with a tick before each button, the number in script, buttons that repeat while you hold them, arrow keys and PageUp / PageDown for the keyboard, and a rattle of the box when there is nowhere left to go. The value is a real text input, so it types, pastes and submits with a form.",
  status: "new",
  parts: [
    {
      name: "Stepper",
      description:
        "The control (`role=\"group\"`, the drawn box). Without children it is `StepperDecrement`, `StepperInput` and `StepperIncrement`; compose your own to add a `StepperTally` or other parts. Uncontrolled (`defaultValue`) or controlled (`value` + `onValueChange`; `value={undefined}` is a controlled, empty field). The value is a number, or `undefined` while the field is empty (NaN and Infinity count as empty, never the text \"NaN\").",
      props: [
        { name: "value / defaultValue / onValueChange", type: "number | undefined", description: "The value. `onValueChange` fires when a button, key, wheel step or typed number (read on Enter or blur) changes it." },
        { name: "min / max", type: "number", description: "Bounds. Steps and typed numbers are clamped; a button with nothing left is `aria-disabled` (not `disabled`, so focus is not lost) and rattles the box when pressed." },
        { name: "step", type: "number", default: "1", description: "The size of a button press or an arrow key. Zero, negative or not a number falls back to 1." },
        { name: "largeStep", type: "number", default: "10 x step", description: "Shift + arrows and PageUp / PageDown." },
        { name: "snap", type: "boolean", default: "false", description: "Round typed and stepped values to multiples of `step` counted from `min` (or 0)." },
        { name: "precision", type: "number", description: "Decimal places to show and round to. Default: the most places the step, the minimum and the current value have, so 0.1 steps do not drift." },
        { name: "format / parse", type: "(n: number) => string  /  (text: string) => number | undefined", description: "How the number is shown and read back: currency, units. The default reader takes a dot or a comma as the point, both together (\"1,234.5\", \"1.234,5\" are 1234.5), a repeated separator as thousands (\"1,234,567\"), and Eastern Arabic and Persian digits. A lone \"1,234\" is 1.234: with one separator there is no telling a decimal comma from a thousands comma, so pass `parse` for your locale. A `parse` that answers NaN puts the last good value back." },
        { name: "wheel", type: "boolean", default: "false", description: "The mouse wheel steps the number while it has focus (and stops the page scrolling). Off by default: a wheel that changes values under a scrolling page is a trap." },
        { name: "id / name / form / required", type: "", description: "Go to the number's input: `id` for a Label, `name` and `form` for forms (with a `format`, a hidden input carries the plain number and the shown text is only the display), `required` forbids an empty field." },
        { name: "aria-label / aria-labelledby / aria-describedby", type: "string", description: "Names for the number (the spinbutton), not for the group." },
        { name: "disabled / readOnly / invalid", type: "boolean", description: "Dashed pencil on a wash / a value that is shown but not changed / the red pencil box." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box." },
      ],
    },
    { name: "StepperDecrement", description: "The minus: a plain button with a hand-drawn `minus`, highlighter under it on hover and while held. It steps on press and keeps stepping after a pause while the pointer stays down. Not a tab stop (the number takes the keyboard). Set an `aria-label` that names the number (\"Decrease quantity\")." },
    { name: "StepperIncrement", description: "The plus, the same." },
    { name: "StepperInput", description: "The number: a text input with `role=\"spinbutton\"`, `inputmode=\"decimal\"`, `aria-valuenow / min / max / valuetext`. It ticks a few pixels in the direction of a change. Arrows step, Shift + arrows and PageUp / PageDown take the large step, Home and End go to min and max, Enter or leaving reads what was typed (a non-number is put back), Escape drops the edit." },
    { name: "StepperTally", description: "The value as tally marks (four strokes and a slash to a group), a companion for a quantity you count on your fingers. Decorative (`aria-hidden`).", props: [{ name: "max", type: "number", default: "20", description: "How many marks to draw at most." }] },
  ],
  a11y: [
    "The number is a text input with `role=\"spinbutton\"` and `aria-valuenow / valuemin / valuemax / valuetext` (the APG pattern), so screen readers announce it as a number field; ArrowUp / ArrowDown, PageUp / PageDown, Home and End work as the pattern says. Give it a name (a Label with `htmlFor`, or `aria-label`).",
    "The buttons are not in the tab order (as in the APG spinbutton: the input takes the keyboard) but they are real buttons, so a pointer, a switch and a screen reader's activate (a click with no pointer) step once each. Name them for what they change.",
    "A button with nothing left is `aria-disabled`, not `disabled`; pressing it rattles the box (a visual cue that goes with the state, not instead of it) and the number's `aria-valuenow` stays.",
    "Holding a button repeats; releasing (or leaving, or blur) stops, and so does reaching a bound. No motion depends on it: reduced motion turns the number's tick and the box's rattle off.",
    "The wheel is opt-in, and only acts while the number has focus.",
    "Hit areas are the whole cell (36 px, 32 compact, 28 calm), the drawn ticks and box are `aria-hidden`; in Windows high contrast the box gets a real border.",
  ],
  usage: `import * as React from "react"
import { Stepper } from "@/components/ui/stepper"

export function Example() {
  const [qty, setQty] = React.useState<number | undefined>(1)
  return <Stepper aria-label="Quantity" value={qty} onValueChange={setQty} min={1} max={10} name="qty" />
}`,
  related: ["input", "slider", "button", "field"],
} satisfies ComponentDoc
