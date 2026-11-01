import { Sketchpad, type SketchStroke } from "@/components/ui/sketchpad"

export const meta = {
  title: "Every pen",
  description: "Felt, brush, pencil, marker and highlighter on one page. Same points, five materials: the grain and the blend come from the pen, not from the data.",
  layout: "stack" as const,
}

const TOOLS = [
  { tool: "felt", color: "ink" },
  { tool: "brush", color: "ink-you" },
  { tool: "pencil", color: "ink" },
  { tool: "marker", color: "tangerine" },
  { tool: "highlighter", color: "hi" },
] as const

const PAGE: SketchStroke[] = TOOLS.map((t, row) => ({
  id: t.tool,
  tool: t.tool,
  color: t.color,
  size: 1,
  pts: Array.from({ length: 112 }, (_, i): [number, number, number] => {
    const a = i * 0.62
    return [34 + i * 5.2 + 10 * Math.cos(a), 52 + row * 62 + 13 * Math.sin(a) - 4 * Math.sin(i / 9), 0.55 + 0.4 * Math.cos(a)]
  }),
}))

export default function Example() {
  return <Sketchpad readOnly width={640} height={330} className="max-w-2xl" defaultValue={PAGE} />
}
