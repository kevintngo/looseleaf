import { StickerBoard, StickerBoardCanvas, type StickerBoardItem } from "@/components/ui/sticker-board"

const START: StickerBoardItem[] = [
  { id: "planet", name: "ringed-planet", x: 78, y: 78, rot: -8, scale: 1.05, z: 0 },
  { id: "rocket", name: "rocket", x: 190, y: 66, rot: 22, scale: 1, z: 1 },
  { id: "cloud", name: "cloud-smile", x: 226, y: 158, rot: -3, scale: 1, z: 2 },
  { id: "sun", name: "sun-shades", x: 116, y: 168, rot: 10, scale: 1.1, z: 3 },
  { id: "done", name: "done", x: 48, y: 226, rot: 6, scale: 0.9, z: 4 },
]

export default function StickerDesk() {
  return (
    <div data-home="stickers" className="w-full">
      <StickerBoard size={72} defaultValue={START} label="Sticker page: drag the stickers around" className="w-full">
        <StickerBoardCanvas tape="both" tapeKind="washi-stripes" className="h-72" />
      </StickerBoard>
      <p className="mt-3 text-center font-script text-3xl leading-none text-ink">drag one. then turn it.</p>
    </div>
  )
}
