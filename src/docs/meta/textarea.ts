import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "textarea",
  title: "Textarea",
  category: "Forms",
  description:
    "A multi-line text field on paper: a pencil box around a real <textarea> that grows with its text, with optional hand-ruled lines on the baselines, a drawn resize handle and a character counter.",
  status: "stable",
  upstream: "textarea",
  parts: [
    {
      name: "Textarea",
      description:
        "A <span data-slot=\"textarea-frame\"> (the drawn box) around <textarea data-slot=\"textarea\">. As with Input, every prop and ref go to the <textarea>; className and style go to the frame, and padding, resize-* and control variants (placeholder:, focus:, ...) are moved onto the textarea.",
      props: [
        { name: "className", type: "string", description: "Classes for the frame (width, min/max height, margins, font, text colour). Padding, resize-*, field-sizing-* and control-only variants are applied to the <textarea>." },
        { name: "inputClassName", type: "string", description: "Classes appended to the <textarea> itself." },
        { name: "ruled", type: "boolean", default: "false", description: "Hand-ruled paper: pencilled rules on the text's baselines. It fixes the rhythm (28 px lines, the first 8 px from the top, min height of three lines) and always grows with its text, so lines and text never drift apart." },
        { name: "autoGrow", type: "boolean", default: "true", description: "Grow with the text using field-sizing: content, as upstream does. false keeps rows and a fixed height." },
        { name: "showCount", type: "boolean | (info: { length: number; max?: number }) => ReactNode", default: "false", description: "A counter in the bottom corner (12 or 12/280 with maxLength), or your own render function. It is the field's aria-describedby, so a screen reader hears it on focus, not on every keystroke." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same box. Default: derived from useId()." },
        { name: "aria-invalid", type: 'boolean | "true" | "false"', description: "true draws the red-pencil box, the wavy underline and a ! in the corner." },
        { name: "disabled / readOnly", type: "boolean", description: "Dashed pencil on a pale wash / a printed field." },
      ],
    },
    {
      name: "TextareaControl",
      description: "The bare <textarea> (data-slot=\"textarea\"): typography and reset, no drawing. For composites that draw the box themselves (InputGroup).",
    },
  ],
  a11y: [
    "A native <textarea>: Enter adds a line, Tab moves on, and label / aria-describedby / required work as usual.",
    "aria-invalid, disabled and readOnly are the real attributes; the drawing follows them.",
    "Focus draws the blue felt ring; the browser's outline is used before the drawing exists and in Windows high contrast.",
    "The counter is aria-describedby text (\"12 characters of 280\"), never a live region.",
    "Resizing uses the browser's own handle (made transparent and redrawn by hand), so it keeps working with the mouse and touch.",
    "field-sizing: content needs a current browser; elsewhere the textarea keeps its rows and scrolls.",
  ],
  usage: `import { Textarea } from "@/components/ui/textarea"

export function Example() {
  return (
    <>
      <Textarea placeholder="Tell us what happened..." />
      <Textarea ruled showCount maxLength={280} aria-label="Diary" />
    </>
  )
}`,
  related: ["input", "label", "field"],
} satisfies ComponentDoc
