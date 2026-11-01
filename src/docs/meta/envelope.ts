import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "envelope",
  title: "Envelope",
  category: "Paper",
  description:
    "An envelope on the desk with a stamp, a postmark and address lines. It opens: the flap, which belongs to the back panel, stands up behind, and a letter slides out from between the panels, the front panel hiding its foot. Built on Collapsible, so it has a real trigger, `aria-expanded`, and content that is not in the page until it is out.",
  status: "new",
  upstream: "collapsible",
  parts: [
    {
      name: "Envelope",
      description: "The outer element (`w-full max-w-sm`, a container for its own measurements) around the body (`aspect-[8/5]`), whose drawing is the back panel: a sheet with the flap that lifts a sliver on hover and stands up when open. When open the envelope makes room above itself for the flap and the letter.",
      props: [
        { name: "stock", type: "StockName", default: '"kraft"', description: "What it is made of: kraft (manila), paper, index-card, a sticky stock ..." },
        { name: "stamp", type: "Accent | false", default: '"tomato"', description: "The postage stamp in the top corner (perforated, with a little picture), in a stationery color, or none. It sits at the end corner and mirrors in RTL." },
        { name: "postmark", type: "boolean", default: "true", description: "Two rings and wavy cancellation lines over the stamp (only with a stamp)." },
        { name: "airmail", type: "boolean", default: "false", description: "A border of slanted red and blue stripes." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open: boolean) => void", description: "As Collapsible: controlled or not." },
        { name: "disabled", type: "boolean", default: "false", description: "Sealed: the trigger is disabled (as Collapsible's `disabled`) and hovering opens nothing." },
        { name: "openOnHover", type: "boolean", default: "false", description: "Also open while a mouse is over it and close when it leaves (unless it was opened by a click). Touch never opens it on hover." },
        { name: "tilt / seed / size", type: "boolean | number / string | number / [w, h]", description: "A seeded turn under 1.1 degrees (front and back turn together); pins the hand; the box in px for server-rendered drawings." },
      ],
    },
    {
      name: "EnvelopeLetter",
      description: "The letter: a Paper (paper stock by default) absolutely placed between the panels. It is not in the page while the envelope is closed; when it opens it slides up (and fades in), rising about a third of the envelope's height above its top edge. Only that upper part shows; the front panel hides the rest.",
      props: [{ name: "stock", type: "StockName", default: '"paper"', description: "The letter's paper." }],
    },
    { name: "EnvelopeFront", description: "The front panel, in front of the letter: the paper, the seams of the bottom flap, the stamp and postmark. Put `EnvelopeAddress`, `EnvelopeSender` and `EnvelopeTrigger` in it, and put it BEFORE `EnvelopeLetter` in the source: z-index (front 20, letter 10) decides what is on top, source order decides the tab order. Nothing inside the front can be clicked or selected, because the trigger covers it." },
    { name: "EnvelopeTrigger", description: "A button over the whole front (Collapsible.Trigger): `aria-expanded`, `aria-controls`, Space and Enter. Its content is its accessible name (default \"Open the letter\")." },
    { name: "EnvelopeAddress", description: "The address block in the script font, 28 px rows on pencil rules, at most 62% of the width, sitting in the lower part of the front." },
    { name: "EnvelopeSender", description: "The return address, small, at the start corner of the top." },
  ],
  a11y: [
    "The trigger is a real button with `aria-expanded` and `aria-controls`, named by its content: make the name say what opening does (\"Read the letter from Ada\"). The letter is not rendered until it is open, so a screen reader never meets it twice. Open and closed are not carried by the drawing alone.",
    "Source order is tab order: put `EnvelopeFront` (with its trigger) before `EnvelopeLetter`, so that Tab from the trigger reaches a link or button inside the letter it just opened. The letter clips to its sheet and most of it sits behind the front: keep it to a few lines, a heading and a link, and put long messages on a page the letter links to. With `openOnHover`, a letter that holds keyboard focus stays open when the mouse leaves.",
    "Hover opening is a mouse nicety (`openOnHover`); touch and keyboard always use the trigger. The slide-in is skipped with reduced motion, and the flap simply appears.",
    "The paper, seams, stamp, postmark and flap are aria-hidden decoration. Ink on the kraft is 9:1, and so is the address; the postmark is decoration only. Windows high contrast replaces the drawing with outlines.",
  ],
  usage: `import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeSender, EnvelopeTrigger } from "@/components/ui/envelope"

<Envelope>
  <EnvelopeFront>
    <EnvelopeSender>The Stationer</EnvelopeSender>
    <EnvelopeAddress><p>Ada Lovelace</p><p>Paris</p></EnvelopeAddress>
    <EnvelopeTrigger>Read the letter from The Stationer</EnvelopeTrigger>
  </EnvelopeFront>
  {/* after the front in the source, behind it on the page: focus goes trigger, then letter */}
  <EnvelopeLetter>
    <p className="font-script text-2xl">Dear Ada,</p>
    <p>the flap is up and the letter comes out.</p>
  </EnvelopeLetter>
</Envelope>`,
  related: ["collapsible", "paper", "ticket", "card"],
} satisfies ComponentDoc
