import * as React from "react"

import { Button } from "@/components/ui/button"
import { Corkboard, CorkboardNote, type CorkboardValue } from "@/components/ui/corkboard"

export const meta = {
  title: "Saved layout",
  description: "Controlled positions: the board is a JSON value, so a layout can be saved, shared and restored. Move things, then reset.",
  layout: "stack" as const,
  height: 470,
  stage: "desk" as const,
}

const TASKS = [
  { id: "design", text: "Design the header", stock: "sticky-yellow", x: 20, y: 24 },
  { id: "review", text: "Review the PR", stock: "sticky-blue", x: 210, y: 44 },
  { id: "ship", text: "Ship it (Friday)", stock: "sticky-green", x: 60, y: 190 },
  { id: "bugs", text: "Squash the 3 bugs", stock: "sticky-pink", x: 250, y: 200 },
] as const

export default function Example() {
  const [layout, setLayout] = React.useState<CorkboardValue>({})
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Corkboard className="h-[340px]" value={layout} onValueChange={setLayout} label="Sprint board">
        {TASKS.map((t) => (
          <CorkboardNote key={t.id} id={t.id} x={t.x} y={t.y} stock={t.stock}>
            {t.text}
          </CorkboardNote>
        ))}
      </Corkboard>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={() => setLayout({})}>
          Reset layout
        </Button>
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{JSON.stringify(layout)}</code>
      </div>
    </div>
  )
}
