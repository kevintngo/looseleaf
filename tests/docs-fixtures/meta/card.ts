import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "card",
  title: "Card",
  category: "Layout",
  description: "A sheet of paper that groups related content.",
  status: "new",
  parts: [
    { name: "Card", props: [{ name: "tilt", type: "number", description: "Degrees of tilt on the paper." }] },
    { name: "CardHeader", description: "Title and description row." },
  ],
  usage: 'import { Card, CardHeader } from "@/components/ui/card"',
  related: ["button"],
} satisfies ComponentDoc
