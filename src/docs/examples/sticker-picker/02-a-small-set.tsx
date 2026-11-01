import * as React from "react"

import { Button } from "@/components/ui/button"
import { Sticker } from "@/components/ui/sticker"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger } from "@/components/ui/sticker-picker"

export const meta = {
  title: "Your own set",
  description: "Offer only the stickers you want, under your own names and words. Here a reaction picker: four to a row, it stays open so you can react more than once (choose one again to take it back), and the latest choice is marked.",
  layout: "center" as const,
  height: 340,
}

const REACTIONS = [
  { name: "thumbs-up", label: "Nice", category: "Reactions", tags: ["like", "good"] },
  { name: "party-popper", label: "Celebrate", category: "Reactions", tags: ["party", "yay"] },
  { name: "heart-eyes", label: "Love it", category: "Reactions", tags: ["love", "heart"] },
  { name: "thinking-face", label: "Hmm", category: "Reactions", tags: ["think", "unsure"] },
  { name: "done", label: "Done", category: "Reactions", tags: ["finished", "complete"] },
  { name: "wow", label: "Wow", category: "Reactions", tags: ["surprised"] },
  { name: "ok", label: "OK", category: "Reactions", tags: ["fine", "agree"] },
  { name: "eyes-look", label: "Looking", category: "Reactions", tags: ["watching", "see"] },
]

export default function Example() {
  const [mine, setMine] = React.useState<string[]>([])
  return (
    <div className="flex items-center gap-3">
      <StickerPicker
        stickers={REACTIONS}
        closeOnSelect={false}
        onSelect={(s) => setMine((all) => (all.includes(s.name) ? all.filter((n) => n !== s.name) : [...all, s.name]))}
        value={mine[mine.length - 1]}
      >
        <StickerPickerTrigger asChild>
          <Button variant="secondary" size="sm">
            React
          </Button>
        </StickerPickerTrigger>
        <StickerPickerContent columns={4} size={48} />
      </StickerPicker>
      <ul role="list" className="flex min-h-14 items-center gap-1" aria-label="Your reactions">
        {mine.map((n) => (
          <li key={n}>
            <Sticker name={n} size={48} label={n} />
          </li>
        ))}
      </ul>
    </div>
  )
}
