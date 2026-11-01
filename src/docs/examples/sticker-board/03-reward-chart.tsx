import { StickerBoard, StickerBoardCanvas, type StickerBoardItem } from "@/components/ui/sticker-board"

export const meta = {
  title: "A reward chart",
  description: "A read-only board is a display: the stickers a student has earned, lying where the teacher stuck them. No handles, no tab stops, no toolbar.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 420,
}

const EARNED: StickerBoardItem[] = [
  { id: "a", name: "a-plus", x: 96, y: 90, rot: -6, scale: 0.9, z: 0 },
  { id: "b", name: "hundred", x: 236, y: 84, rot: 8, scale: 0.9, z: 1 },
  { id: "c", name: "first-place", x: 376, y: 96, rot: -4, scale: 0.9, z: 2 },
  { id: "d", name: "rating-five", x: 130, y: 210, rot: 3, scale: 0.9, z: 3 },
  { id: "e", name: "number-one", x: 300, y: 216, rot: -9, scale: 0.9, z: 4 },
]

export default function Example() {
  return (
    <div className="w-full max-w-xl">
      <h3 className="mb-2 font-script text-3xl text-foreground">Maya's stickers, week 12</h3>
      <StickerBoard readOnly value={EARNED} size={84} label="Maya's earned stickers" className="h-72">
        <StickerBoardCanvas className="flex-1" stock="ledger" />
      </StickerBoard>
    </div>
  )
}
