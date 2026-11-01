import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "Peeled corner",
  description: "`peel` folds the lower-right corner over along a line perpendicular to the diagonal, whatever the silhouette. A number is the fold in px.",
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Sticker name="done" peel />
      <Sticker name="sale" peel={22} />
      <Sticker name="cursor-click" peel rotate={-5} />
      <Sticker name="hand-point-right" peel={16} rotate={4} />
    </div>
  )
}
