import { Corkboard, CorkboardNote } from "@/components/ui/corkboard"
import { StickyNote } from "@/components/ui/sticky-note"

export const meta = {
  title: "Any paper",
  description: "A note is a Paper: sticky notes, an index card with a list, a kraft tag, a photo. With bare, any paper object of the library can be the note. Same drag, same keys.",
  layout: "stack" as const,
  height: 420,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Corkboard className="h-[420px] max-w-3xl" label="Ideas">
      <CorkboardNote id="list" x={20} y={24} stock="index-card" className="w-56" label="Ideas list" pinColor="grass">
        <p className="font-bold">ideas</p>
        <p>1. a thing that boils</p>
        <p>2. a thing that tears</p>
      </CorkboardNote>
      <CorkboardNote id="tag" x={270} y={40} stock="kraft" className="w-40" rotate={-4} pinColor="tomato">
        fragile, hand-drawn
      </CorkboardNote>
      <CorkboardNote id="photo" x={24} y={236} stock="photo" className="w-44" rotate={3} pinColor="sky">
        summer, 1987
      </CorkboardNote>
      <CorkboardNote id="sticky" x={270} y={210} bare rotate={1.5} pinColor="grape" label="Sticky note">
        <StickyNote color="orange" curl tilt={false} className="w-40 p-4 font-script text-xl">
          pick me up: a real StickyNote
        </StickyNote>
      </CorkboardNote>
    </Corkboard>
  )
}
