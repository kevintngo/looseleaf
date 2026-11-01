import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "stamp-button",
  title: "Stamp button",
  category: "Actions",
  description:
    "A button that is a rubber stamp: a wooden knob on an inked die, in the color of the impression it will leave. Press it and APPROVED, PAID or VOID lands on the page with a thump. The stamps on a page are JSON, so they can be state.",
  status: "new",
  upstream: "button",
  parts: [
    {
      name: "StampSurface",
      description:
        "The page that takes stamps: a positioned box holding your document and any number of StampButtons (a footer, a toolbar, anywhere inside). It shows the impressions above its content, gives 2 px under each stamp and announces it politely.",
      props: [
        { name: "value / defaultValue", type: "StampImpression[]", description: "The impressions on the page: { id, press, x, y (fractions of the surface), name or text, shape, ink, turn, seed, … }. Plain JSON; clear it with [] or restore a saved one." },
        { name: "onValueChange", type: "(value: StampImpression[]) => void", description: "Called on every strike." },
        { name: "max", type: "number", description: "Keep only the most recent N impressions." },
      ],
    },
    {
      name: "StampButton",
      description:
        "The tool: pad ink from the preset (or `ink`), a label on the die, a handle on top. Hover lifts the die on a drop-line, press sinks it and inks it heavier. Striking a stamp again replaces its own impression with a new one (own wear, own turn, one in five a double strike).",
      props: [
        { name: "stamp", type: "string", description: "A preset from the sticker sheet: stamp-approved, stamp-paid, stamp-void, stamp-urgent, stamp-received, stamp-draft, stamp-new, stamp-member. Other props override it." },
        { name: "text / shape / ink / sub / ring / w / h / size / ghost / dashed", type: "as on Stamp", description: "The impression, when there is no preset or to change one. `ink` is red, ink-you, green or ink." },
        { name: "impressionId", type: "string", description: "Names the stamp on the page. The same id replaces its impression instead of adding one. Default the preset or the text." },
        { name: "place", type: "{ x: number; y: number }", default: "{ x: .72, y: .6 }", description: "Where to aim, as fractions of the surface. Every strike wanders up to 3 percent from it." },
        { name: "onStamp", type: "(impression: StampImpression) => void", description: "Called with the impression that was made." },
        { name: "asChild", type: "boolean", default: "false", description: "Draw the tool on your own element. With disabled, the element gets aria-disabled and the stamp does nothing." },
        { name: "children", type: "ReactNode", description: "The label; default the stamp's word." },
      ],
    },
    { name: "useStampSurface", description: "The surface's strike() for building your own tool." },
  ],
  a11y: [
    "The tool is a real button named by its label; Enter and Space stamp exactly like a click. Outside a StampSurface it stamps on itself, so it still does something.",
    "Each impression is an image named by its words (role=img, \"Approved\"), so the stamped state is in the reading order; a polite status line says \"Approved stamped.\" once per strike.",
    "Only a stamp struck now lands with the thump: impressions restored from saved JSON, a defaultValue or the server's markup are simply on the page, so a reload does not stamp everything again. The thump is an enter animation on the impression and a 2 px give on the page; with reduced motion (the OS setting, data-motion=\"reduced\", or the provider) the impression simply appears and the page holds still.",
    "The drawn tool is decoration (aria-hidden); its label is DOM text on the die at 4.5:1 or better; focus draws a ring round the whole tool, knob included. Windows high contrast hides the drawing and gives the button a real outline.",
    "Do not carry the decision by color alone: the impression says the word, and the label says what pressing does.",
  ],
  usage: `import { StampButton, StampSurface } from "@/components/ui/stamp-button"

export function Example() {
  return (
    <StampSurface className="relative w-96 p-6">
      <h3>Invoice 2026-031</h3>
      <StampButton stamp="stamp-approved" onStamp={() => approve()}>
        Approve
      </StampButton>
    </StampSurface>
  )
}`,
  related: ["stamp", "button", "sticker", "seal", "receipt"],
} satisfies ComponentDoc
