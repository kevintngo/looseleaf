import * as React from "react"

import { Button } from "@/components/ui/button"
import { Paper } from "@/components/ui/paper"
import { StickerBoard, StickerBoardCanvas, addSticker, type StickerBoardItem } from "@/components/ui/sticker-board"

export const meta = {
  title: "The value is JSON",
  description: "The board keeps no secrets: every sticker is { id, name, x, y, rot, scale, z }. Store it, send it, restore it. addSticker puts a new one on top of the pile.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 520,
}

export default function Example() {
  const [items, setItems] = React.useState<StickerBoardItem[]>(() => addSticker([], "rocket", { x: 120, y: 110, rot: -10 }))
  const wrap = React.useRef<HTMLDivElement>(null)
  const row = React.useRef<HTMLDivElement>(null)
  const middle = () => {
    const r = wrap.current?.querySelector('[data-slot="sticker-board-canvas"]')?.getBoundingClientRect()
    return { width: r?.width || 250, height: r?.height || 300 }
  }
  return (
    <div className="grid w-full items-start gap-4 md:grid-cols-[1fr_16rem]">
      <div ref={wrap} className="flex min-w-0 flex-col gap-3">
        <StickerBoard value={items} onValueChange={setItems} className="h-[22rem]" size={88}>
          <StickerBoardCanvas className="flex-1" empty="Press a button to stick something down." />
        </StickerBoard>
        <div ref={row} className="flex flex-wrap gap-2">
          {(["rocket", "cloud-smile", "first-place", "stamp-approved"] as const).map((name) => (
            <Button key={name} size="sm" variant="outline" onClick={() => {
                const canvas = middle()
                setItems((all) => addSticker(all, name, { canvas }))
              }}>
              Add {name.replace("-", " ")}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setItems([])
              row.current?.querySelector("button")?.focus()
            }}
            disabled={items.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>
      <Paper stock="slip" tilt={false} className="p-3">
        <pre className="max-h-[22rem] overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink" aria-label="Board value">
          {JSON.stringify(items, null, 1)}
        </pre>
      </Paper>
    </div>
  )
}
