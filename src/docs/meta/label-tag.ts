import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "label-tag",
  title: "Label tag",
  category: "Paper",
  description:
    "A hang tag: cut card with clipped corners (or an arched top, or a luggage tag's clipped end), a hole with a reinforcing patch and a brass eyelet, and a loop of twine. The whole silhouette is one drawn sheet, so the string and the eyelet turn and cast their shadow with the card. As a link or a button it swings on its eyelet.",
  status: "new",
  parts: [
    {
      name: "LabelTag",
      description: "A `div` (or your own element with `asChild`) whose content sits on the card below the eyelet. Until it is measured (or given `size`) it wears a plain card; the drawing then replaces it.",
      props: [
        { name: "asChild", type: "boolean", default: "false", description: "Render your link or button as the tag. It swings 2.6 degrees about its eyelet on hover." },
        { name: "stock", type: "StockName", default: '"kraft"', description: "What it is cut from: kraft, paper, index-card, sticky-yellow, sticky-pink ..." },
        { name: "shape", type: '"price" | "round" | "luggage"', default: '"price"', description: "Clipped top corners; an arched top; or a horizontal luggage tag hung from the start (mirrors in RTL)." },
        { name: "string", type: "number", default: "36", description: "How far the loop of twine hangs out, px. The tag gets that much margin on its hanging side (`mt-(--tag-string)`); override it with a margin class." },
        { name: "twine", type: '"natural" | Accent', default: '"natural"', description: "The color of the string." },
        { name: "eyelet", type: '"brass" | "steel" | "none"', default: '"brass"', description: "The metal ring in the hole, or a bare hole." },
        { name: "tilt / seed / size", type: "boolean | number / string | number / [w, h]", description: "A seeded turn under 2 degrees (or degrees, or false); pins the hand; the box in px for server-rendered drawings." },
      ],
    },
    { name: "LabelTagTitle", description: "A script title, 26 px, leading none." },
    { name: "LabelTagDescription", description: "Small ink-soft text under the title." },
    { name: "LabelTagPrice", description: "A price in the type font, red, pushed to the foot of the tag." },
  ],
  a11y: [
    "A tag is a `div`: put text in it. As a link or button (`asChild`) it keeps its native role, focus and keyboard behavior; the drawing is aria-hidden decoration and the swing is a hover-only, reduced-motion-aware nicety (none in calm density).",
    "Information carried by the twine color or the eyelet must also be in text. Ink on kraft, paper and the sticky stocks is at least 9:1; the price is a red darkened with ink and reads at least 4.9:1 on all of them.",
    "The tilt is zero in calm density; Windows high contrast replaces the drawing with a real outline around the box (the string is not shown).",
  ],
  usage: `import { LabelTag, LabelTagDescription, LabelTagPrice, LabelTagTitle } from "@/components/ui/label-tag"

<LabelTag twine="tomato">
  <LabelTagTitle>Sale</LabelTagTitle>
  <LabelTagDescription>while stocks last</LabelTagDescription>
  <LabelTagPrice>12.00</LabelTagPrice>
</LabelTag>

<LabelTag asChild shape="round"><a href="/new"><LabelTagTitle>New</LabelTagTitle></a></LabelTag>`,
  related: ["ticket", "paper", "sticky-note", "bookmark"],
} satisfies ComponentDoc
