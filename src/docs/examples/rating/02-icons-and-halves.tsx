import { Rating } from "@/components/ui/rating"

export const meta = {
  title: "Glyphs, halves and sizes",
  description: "Stars, hearts and suns; `allowHalf` steps by 0.5 (two radios per glyph, one over each half); `max` sets how many; three sizes.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Rating icon="star" defaultValue={3.5} allowHalf aria-label="Stars, halves allowed" />
        <Rating icon="heart" defaultValue={4} aria-label="Hearts" />
        <Rating icon="sun" defaultValue={2} aria-label="Suns" />
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Rating size="sm" defaultValue={4} aria-label="Small" />
        <Rating size="lg" defaultValue={4} aria-label="Large" />
        <Rating max={10} defaultValue={7} size="sm" aria-label="Out of ten" />
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Rating defaultValue={3} clearable aria-label="Clearable: click the chosen glyph again" />
        <Rating defaultValue={3} disabled aria-label="Disabled" />
      </div>
    </div>
  )
}
