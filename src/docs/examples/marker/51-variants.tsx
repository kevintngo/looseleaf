import { Marker, MarkerContent } from "@/components/ui/marker"

export const meta = {
  title: "Variants",
  description: "shadcn's `marker-variants`: `default` is a line of small print, `separator` writes its words between two pencil lines, `border` draws one line under the row.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker>
        <MarkerContent>A default marker for inline notes.</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>A separator marker</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>A border marker for row boundaries.</MarkerContent>
      </Marker>
    </div>
  )
}
