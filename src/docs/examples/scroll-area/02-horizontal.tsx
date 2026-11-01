import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"

export const meta = {
  title: "Horizontal strip",
  description: "`orientation=\"horizontal\"` shows only the horizontal mark. `bleed` pads the viewport by 12 px so the notes' shadows and any focus ring are not cut at the edge of the strip.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const notes = [
  ["yellow", "Buy pens"],
  ["green", "Call mum"],
  ["orange", "Water the fern"],
  ["pink", "Sharpen pencils"],
  ["blue", "Read chapter 4"],
  ["yellow", "Post the parcel"],
  ["green", "Tidy the desk"],
  ["orange", "Practise lettering"],
] as const

const stock = {
  yellow: "sticky-yellow",
  green: "sticky-green",
  orange: "sticky-orange",
  pink: "sticky-pink",
  blue: "sticky-blue",
} as const

export default function Example() {
  return (
    <ScrollArea orientation="horizontal" type="always" bleed className="mx-auto w-full max-w-lg whitespace-nowrap">
      <div className="flex w-max gap-4 pb-3">
        {notes.map(([color, text], i) => (
          <Paper key={i} seed={`note-${i}`} stock={stock[color]} className="grid h-28 w-36 place-items-center px-3 text-center font-script text-2xl leading-tight whitespace-normal">
            {text}
          </Paper>
        ))}
      </div>
    </ScrollArea>
  )
}
