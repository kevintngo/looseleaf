import * as React from "react"

import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"

export const meta = {
  title: "Done",
  description: "Pass `done` and the note gets a pencil tick box. Add `onDoneChange` and the box can be pressed: the tick is written with a felt pen and the text struck through. A note that loads done just shows it.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [done, setDone] = React.useState(false)
  return (
    <div className="flex flex-wrap items-start justify-center gap-10 p-6">
      <StickyNote color="green" done={done} onDoneChange={setDone} seed="live">
        <StickyNoteTitle>post the parcel</StickyNoteTitle>
        <StickyNoteContent>before the office shuts. Press the box.</StickyNoteContent>
      </StickyNote>
      <StickyNote color="yellow" done seed="loaded">
        <StickyNoteTitle>ink pens</StickyNoteTitle>
        <StickyNoteContent>two fine, one brush</StickyNoteContent>
      </StickyNote>
    </div>
  )
}
