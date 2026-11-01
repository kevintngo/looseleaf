import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Sticker } from "@/components/ui/sticker"
import { StickerPicker, StickerPickerContent, StickerPickerTrigger } from "@/components/ui/sticker-picker"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "In a comment box",
  description: "The picker as a composer tool: choose a sticker, it waits beside the text (click it to take it off), and posting sends both. Recent stickers come first next time.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 640,
}

interface Post {
  who: string
  text: string
  sticker?: string
}

export default function Example() {
  const [text, setText] = React.useState("")
  const [sticker, setSticker] = React.useState<string | null>(null)
  const [recent, setRecent] = React.useState<string[]>(["stamp-approved"])
  const [posts, setPosts] = React.useState<Post[]>([{ who: "Maya", text: "The new cover reads much better.", sticker: "stamp-approved" }])

  const post = () => {
    if (!text.trim() && !sticker) return
    setPosts((all) => [...all, { who: "You", text: text.trim(), sticker: sticker ?? undefined }])
    setText("")
    setSticker(null)
  }

  return (
    <Card className="w-full max-w-lg gap-3 p-4">
      <ul role="list" className="flex flex-col gap-3" aria-label="Comments">
        {posts.map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="font-script text-xl leading-tight text-ink-you">{p.who}</span>
            <div className="min-w-0 flex-1">
              {p.text ? <p>{p.text}</p> : null}
              {p.sticker ? <Sticker name={p.sticker} size={p.sticker.startsWith("stamp-") ? 96 : 72} label={p.sticker} className="mt-1" /> : null}
            </div>
          </li>
        ))}
      </ul>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" aria-label="Comment" rows={2} />
      <div className="flex items-center gap-2">
        <StickerPicker
          value={sticker}
          recent={recent}
          onSelect={(s) => {
            setSticker(s.name)
            setRecent((r) => [s.name, ...r.filter((n) => n !== s.name)].slice(0, 5))
          }}
        >
          <StickerPickerTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Add a sticker">
              <Icon name="sparkles" />
            </Button>
          </StickerPickerTrigger>
          <StickerPickerContent />
        </StickerPicker>
        {sticker ? (
          <button type="button" onClick={() => setSticker(null)} aria-label="Remove the sticker" className="rounded-sm outline-offset-2 hover:opacity-70">
            <Sticker name={sticker} size={40} />
          </button>
        ) : null}
        <Button className="ms-auto" onClick={post} disabled={!text.trim() && !sticker}>
          Post
        </Button>
      </div>
    </Card>
  )
}
