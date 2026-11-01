import type { ComponentDoc } from "../types"

export default {
  slug: "chart",
  title: "Chart",
  category: "Data display",
  description: "A hand-drawn line chart. Its geometry lives in lib/ink/charts, which ships inside this item only.",
  parts: [{ name: "Chart" }],
  usage: `<Chart values={[3, 5, 2, 8]} />`,
} satisfies ComponentDoc
