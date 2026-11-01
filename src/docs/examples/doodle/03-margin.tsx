import { Doodle } from "@/components/ui/doodle"

export const meta = {
  title: "In the margin",
  description: "Doodles live in the decoration layer: turned a few degrees, tucked in the corner of a card, next to a title.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="ll-paper ll-stock-slip ll-sheet-slip ll-tilt-2 relative w-full max-w-sm p-6 text-ink">
      <Doodle name="star" size={48} rotate={14} className="absolute -top-3 -right-2" />
      <h3 className="font-script text-3xl">Weekend list</h3>
      <p className="mt-2 text-pencil-text">Pick flowers, find the good mushrooms, call it a day.</p>
      <div className="mt-3 flex items-end gap-3">
        <Doodle name="flower" size={48} rotate={-6} />
        <Doodle name="mushroom" size={48} rotate={5} flip />
        <Doodle name="sun" size={48} />
      </div>
    </div>
  )
}
