import {
  type SketchStroke,
  Sketchpad,
  SketchpadCanvas,
  SketchpadClear,
  SketchpadColors,
  SketchpadRedo,
  SketchpadSizes,
  SketchpadToolbar,
  SketchpadTools,
  SketchpadUndo,
} from "@/components/ui/sketchpad"

export const meta = {
  title: "Your own toolbar",
  description: "The parts compose. A pencil-and-eraser sketchbook on graph paper, four colours, taped to the desk, with a plot already begun.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const along = (n: number, f: (t: number) => [number, number]): [number, number][] => Array.from({ length: n + 1 }, (_, i) => f(i / n)).map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10])
const dot = (id: string, cx: number, cy: number): SketchStroke => ({ id, tool: "felt", color: "red", size: 1.9, pts: along(10, (t) => [cx + 2.6 * Math.cos(t * Math.PI * 2), cy + 2.6 * Math.sin(t * Math.PI * 2)]) })

const PLOT: SketchStroke[] = [
  { id: "axis-y", tool: "pencil", color: "ink", size: 1, pts: [[58, 36], [58, 168], [59, 300]] },
  { id: "axis-x", tool: "pencil", color: "ink", size: 1, pts: [[58, 300], [270, 301], [486, 300]] },
  { id: "arrow-y", tool: "pencil", color: "ink", size: 1, pts: [[49, 50], [58, 34], [67, 50]] },
  { id: "arrow-x", tool: "pencil", color: "ink", size: 1, pts: [[470, 291], [488, 300], [470, 309]] },
  { id: "curve", tool: "felt", color: "ink-you", size: 1, pts: along(48, (t) => [58 + t * 400, 300 - 232 * (1 - Math.pow(1 - t, 2.2)) - Math.sin(t * 19) * 3]) },
  dot("d1", 98, 252),
  dot("d2", 178, 174),
  dot("d3", 298, 99),
  dot("d4", 418, 70),
]

export default function Example() {
  return (
    <Sketchpad className="max-w-2xl" tools={["pencil", "felt", "eraser"]} defaultTool="pencil" width={520} height={340} defaultValue={PLOT}>
      <SketchpadToolbar className="justify-between">
        <SketchpadTools />
        <SketchpadColors colors={["ink", "ink-you", "red", "green"]} />
        <SketchpadSizes />
        <span className="flex items-center gap-2">
          <SketchpadUndo />
          <SketchpadRedo />
          <SketchpadClear>Wipe</SketchpadClear>
        </span>
      </SketchpadToolbar>
      <SketchpadCanvas paper="graph" label="Sketchbook page" paperProps={{ tape: "both", tapeKind: "washi-dots" }} />
    </Sketchpad>
  )
}
