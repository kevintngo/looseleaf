import * as React from "react"

import { StickerBoard, StickerBoardCanvas, StickerBoardToolbar, addSticker, boardPoint, type StickerBoardItem } from "@/components/ui/sticker-board"
import { StickerSheet, StickerSheetItem } from "@/components/ui/sticker-sheet"

export const meta = {
  title: "Sheet to board",
  description: "Peel a sticker off the sheet (click it, or drag it with a mouse and let go over the board) and it lands on the board. Let go anywhere else and it springs back. Delete it on the board and it returns to its outline on the sheet.",
  layout: "full" as const,
  stage: "desk" as const,
  height: 640,
}

const NAMES = ["rocket", "cloud-smile", "sun-shades", "ringed-planet", "done", "rainbow", "first-place", "number-one", "a-plus"]

export default function Example() {
  const [items, setItems] = React.useState<StickerBoardItem[]>([])
  const boardRef = React.useRef<HTMLDivElement | null>(null)
  const onBoard = items.map((s) => s.name)

  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-6 p-4">
      <StickerSheet
        title="Sticker sheet"
        columns={3}
        size={68}
        peeled={onBoard}
        onPeel={({ name, dragged, x, y }) => {
          const at = dragged && x !== undefined && y !== undefined ? boardPoint(boardRef.current, x, y) : null
          if (dragged && !at?.inside) return
          setItems((all) => addSticker(all, name, at ?? { canvas: { width: 460, height: 380 } }))
        }}
        onStick={({ name }) => setItems((all) => all.filter((s) => s.name !== name))}
      >
        {NAMES.map((name) => (
          <StickerSheetItem key={name} name={name} />
        ))}
      </StickerSheet>
      <StickerBoard ref={boardRef} value={items} onValueChange={setItems} size={84} className="h-[30rem] w-full max-w-lg">
        <StickerBoardCanvas className="flex-1" empty="Peel a sticker off the sheet." />
        <StickerBoardToolbar actions={["turn", "size", "layer", "delete"]} />
      </StickerBoard>
    </div>
  )
}
