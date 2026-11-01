import * as React from "react"

import { Button } from "@/components/ui/button"
import { Sketchpad, type SketchStroke, type SketchpadHandle } from "@/components/ui/sketchpad"

export const meta = {
  title: "Replay",
  description: "A read-only sketchpad that draws itself on again, stroke after stroke, along each center line. Reduced motion shows the finished picture.",
  layout: "stack" as const,
}

const STEP = (n: number, f: (t: number) => [number, number]) => Array.from({ length: n + 1 }, (_, i) => f(i / n))

const HEART: SketchStroke[] = [
  {
    id: "heart",
    tool: "marker",
    color: "bubblegum",
    size: 1.2,
    pts: STEP(40, (t) => {
      const a = t * Math.PI * 2 - Math.PI / 2
      return [220 + 16 * Math.pow(Math.sin(a), 3) * 6.4, 150 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 6.4]
    }),
  },
  { id: "arrow", tool: "felt", color: "ink", size: 1, pts: STEP(12, (t) => [70 + t * 300, 240 - t * 170]) },
  { id: "head", tool: "felt", color: "ink", size: 1, pts: [[336, 70], [372, 68], [366, 102]] },
  { id: "note", tool: "brush", color: "ink-you", size: 0.9, pts: STEP(30, (t) => [90 + t * 250, 268 + Math.sin(t * 16) * 9 * (1 - t / 2)]) },
]

export default function Example() {
  const api = React.useRef<SketchpadHandle>(null)
  return (
    <div className="flex w-full max-w-lg flex-col items-start gap-3">
      <Sketchpad readOnly replay apiRef={api} width={440} height={320} defaultValue={HEART} />
      <Button variant="outline" size="sm" onClick={() => api.current?.replay()}>
        Draw it again
      </Button>
    </div>
  )
}
