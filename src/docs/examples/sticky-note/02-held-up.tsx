import { StickyNote, StickyNoteContent, StickyNoteFooter, StickyNoteTitle } from "@/components/ui/sticky-note"

export const meta = {
  title: "Curled, pinned, taped",
  description: "`curl` lifts the bottom-right corner; `fastener` and `tape` hold a note up. Any size works: the text wraps and the sheet follows.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-10 p-6">
      <StickyNote curl fastener="pin" seed="a">
        <StickyNoteTitle>pinned</StickyNoteTitle>
        <StickyNoteContent>a curl, and a tomato pin</StickyNoteContent>
      </StickyNote>
      <StickyNote color="blue" tape="top" tapeKind="masking" seed="b" className="w-56">
        <StickyNoteTitle>taped</StickyNoteTitle>
        <StickyNoteContent>a strip of masking tape across the top</StickyNoteContent>
        <StickyNoteFooter>from Ada</StickyNoteFooter>
      </StickyNote>
      <StickyNote color="green" seed="c" className="h-28 w-32 min-h-0">
        <StickyNoteContent>small</StickyNoteContent>
      </StickyNote>
      <StickyNote color="pink" seed="d" className="w-72 min-h-28">
        <StickyNoteContent>a wide one, because notes can be any size you cut them to</StickyNoteContent>
      </StickyNote>
    </div>
  )
}
