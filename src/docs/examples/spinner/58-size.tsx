import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Size",
  description:
    "Official `spinner-size`: `size-3`, `size-4`, `size-6` and `size-8`. The scribble is redrawn for each size (fewer, wider turns when it is small) rather than scaled, so the pencil line keeps its weight.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-3" aria-label="Loading, extra small" />
      <Spinner className="size-4" aria-label="Loading, small" />
      <Spinner className="size-6" aria-label="Loading, medium" />
      <Spinner className="size-8" aria-label="Loading, large" />
    </div>
  )
}
