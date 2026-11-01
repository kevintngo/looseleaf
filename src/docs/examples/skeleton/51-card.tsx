import { Skeleton } from "@/components/ui/skeleton"

export const meta = {
  title: "Card",
  description:
    "Official `skeleton-card`: a picture-sized block over two lines of text. The same one-line classes, no props; hundreds of these on a page cost about what one does, because the drawing is CSS masks from a few shared tiles.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
