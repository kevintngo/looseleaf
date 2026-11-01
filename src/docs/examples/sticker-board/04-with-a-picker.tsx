import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { StickerBoard, StickerBoardCanvas, StickerBoardToolbar, addSticker, type StickerBoardItem } from "@/components/ui/sticker-board"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger } from "@/components/ui/sticker-picker"

export const meta = {
  title: "Board and picker",
  description: "The picker chooses, addSticker sticks: the new sticker lands in the middle of the page, already picked, so it can be turned and sized straight away. Export downloads the whole page as one SVG.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 640,
}

export default function Example() {
  const [items, setItems] = React.useState<StickerBoardItem[]>([])
  const [selected, setSelected] = React.useState<string | null>(null)
  const [recent, setRecent] = React.useState<string[]>([])
  const board = React.useRef<HTMLDivElement>(null)
  const page = () => {
    const r = board.current?.querySelector('[data-slot="sticker-board-canvas"]')?.getBoundingClientRect()
    return { width: r?.width || 520, height: r?.height || 380 }
  }

  return (
    <StickerBoard ref={board} value={items} onValueChange={setItems} selectedId={selected} onSelectedIdChange={setSelected} className="h-[34rem] w-full max-w-2xl">
      <div className="flex items-center gap-3">
        <StickerPicker
          recent={recent}
          onSelect={(s) => {
            const next = addSticker(items, s.name, { canvas: page() })
            setItems(next)
            setSelected(next[next.length - 1].id)
            setRecent((r) => [s.name, ...r.filter((n) => n !== s.name)].slice(0, 6))
          }}
        >
          <StickerPickerTrigger asChild>
            <Button>
              <Icon name="plus" />
              Add sticker
            </Button>
          </StickerPickerTrigger>
          <StickerPickerContent />
        </StickerPicker>
        <p className="text-muted-foreground">{items.length === 0 ? "Start with a sticker." : `${items.length} on the page`}</p>
      </div>
      <StickerBoardCanvas className="flex-1" empty="Nothing stuck down yet. Add a sticker." />
      <StickerBoardToolbar />
    </StickerBoard>
  )
}
