import { StickerSheet } from "@/components/ui/sticker-sheet"

export const meta = {
  title: "Backing paper and size",
  description: "The backing is release paper with a sheen (glassine, the default), kraft or plain paper. Columns and size set the grid; shorthand `stickers` skips the items when you do not need labels or ids.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <StickerSheet title="Badges" columns={3} size={64} stickers={["wip", "new", "beta", "pro", "ok", "wow"]} defaultPeeled={["beta"]} />
      <StickerSheet title="Kraft" backing="kraft" columns={3} size={64} stickers={["rocket", "cloud-smile", "sun-shades", "done", "rainbow", "sale"]} />
      <StickerSheet title="Plain" backing="paper" columns={2} size={80} stickers={["first-place", "number-one", "a-plus", "hundred"]} />
    </div>
  )
}
