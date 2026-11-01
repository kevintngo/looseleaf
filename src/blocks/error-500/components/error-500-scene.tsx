import { Doodle } from "@/components/ui/doodle"
import { Mascot } from "@/components/ui/mascot"
import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"

function Error500Scene() {
  return (
    <div data-slot="error-scene" aria-hidden="true" className="relative flex flex-wrap items-end justify-center gap-x-8 gap-y-8 pt-6">
      <div className="relative">
        <Doodle name="exclaim-burst" size={52} seed="e500-burst" className="absolute -start-9 -top-3" />
        <Mascot pose="oops" size={196} className="h-[196px] w-auto" />
      </div>
      <div className="relative">
        <Doodle name="lightning" size={72} seed="e500-bolt" className="absolute -top-14 -end-4" />
        <StickyNote color="pink" tape="top" tapeKind="masking" seed="e500-note" className="w-44">
          <StickyNoteTitle>sorry!</StickyNoteTitle>
          <StickyNoteContent className="text-xl">that one is on us</StickyNoteContent>
        </StickyNote>
      </div>
    </div>
  )
}

export { Error500Scene }
