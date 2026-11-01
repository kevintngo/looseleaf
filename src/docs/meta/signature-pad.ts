import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "signature-pad",
  title: "Signature pad",
  category: "Forms",
  description:
    "Sign on the screen. One brush pen with real pressure, a pencil baseline with its x, a clear button, and a typed-name fallback that is set in hand lettering. It carries the image in a hidden field, so it works in a plain form and can be required.",
  status: "new",
  parts: [
    {
      name: "SignaturePad",
      description:
        "The root: a Sketchpad with one pen, plus the value. The value is a data URL (svg by default, png on request) that is empty until the person has signed; the detail argument carries the strokes, so a signature can be stored as JSON and drawn again later.",
      props: [
        { name: "name", type: "string", description: "Form field name. A hidden input carries the data URL, so FormData and native submit just work." },
        { name: "value / defaultValue / onValueChange", type: "string / (value: string, detail: { mode, strokes, text }) => void", description: "The signature image as a data URL, or \"\". Controlled, the value is the truth: a value the pad did not produce (a saved signature loaded from a server, or \"\" from a reset) replaces whatever was drawn or typed and is shown as an image until the person signs again. A brush signature is about 40 KB as an svg data URL (22 KB of it is the embedded pen grain); store the strokes from `detail` if that matters." },
        { name: "required", type: "boolean", description: "An empty pad blocks the form's submit with the native validation, focuses the canvas (the name field in type mode) and shows the message. A form reset clears the pad and calls onValueChange(\"\")." },
        { name: "invalid / message", type: "boolean / string", default: '"Please sign in the box."', description: "A red baseline and a polite alert. Set automatically when a required form is submitted empty." },
        { name: "disabled / readOnly", type: "boolean", description: "Draw nothing. Read-only hides the buttons and shows the signature." },
        { name: "mode / defaultMode / onModeChange", type: '"draw" | "type"', default: '"draw"', description: "Draw with a pointer or type the name." },
        { name: "typedFallback", type: "boolean", default: "true", description: "Offer \"Type instead\": the name is hand-lettered as outlines (no font needed in the exported image). Also the way in for people who cannot draw." },
        { name: "penColor / pen", type: 'SketchColor / "brush" | "felt"', default: '"ink-you" / "brush"', description: "The brush swells on down-strokes like a fountain pen; the felt keeps an even line." },
        { name: "format", type: '"svg" | "png"', default: '"svg"', description: "png is rasterised in the browser through a canvas; where that is not possible the svg is kept." },
        { name: "width / height", type: "number", default: "480 / 180", description: "Canvas units; the pad scales to its container." },
      ],
    },
    { name: "SignaturePadCanvas", description: "The sheet: baseline, \"Sign here\" hint, the strokes or the typed name. Put it where you want it when you compose your own layout.", props: [] },
    { name: "SignaturePadClear", description: "A ghost Button that clears the drawn strokes, or the typed name in type mode.", props: [] },
    { name: "SignaturePadModeToggle", description: "A link Button with aria-pressed that switches between drawing and typing.", props: [] },
    { name: "SignaturePadTyped", description: "The name field, shown only in type mode (autocomplete name).", props: [] },
  ],
  a11y: [
    "The canvas is a named application (\"Signature\"); the same keyboard drawing as Sketchpad works: arrows move a cursor, Space puts the pen down and lifts it. Typing the name is the accessible alternative and is one button away.",
    "Type mode replaces the canvas by an image named \"Signature, typed: Ada Lovelace\" and a text field labelled \"Type your full name\".",
    "Required: a visually hidden text input holds the value so the browser's own validation and message apply; the failure also shows a role=\"alert\" line and moves focus to the canvas (the name field in type mode).",
    "The baseline turns red pencil when invalid, and the message says why (colour is never the only cue).",
    "Windows high contrast keeps the ink colours of the strokes; the sheet gets a real border.",
  ],
  usage: `import { SignaturePad } from "@/components/ui/signature-pad"

export function Example() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); console.log(new FormData(e.currentTarget).get("signature")) }}>
      <SignaturePad name="signature" required />
      <button type="submit">Sign</button>
    </form>
  )
}`,
  related: ["sketchpad", "input", "label", "button"],
} satisfies ComponentDoc
