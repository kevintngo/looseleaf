import { Marker, MarkerContent } from "@/components/ui/marker"

export const meta = {
  title: "Shimmer",
  description:
    "shadcn's `marker-shimmer`: a status line that breathes while it is streaming. shadcn ships a `shimmer` utility for this; Looseleaf does not have one yet, so the example uses `motion-safe:animate-pulse`, which stops for readers who ask for less motion.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker role="status">
        <MarkerContent className="motion-safe:animate-pulse">Thinking...</MarkerContent>
      </Marker>
      <Marker variant="separator" role="status">
        <MarkerContent className="motion-safe:animate-pulse">Reading 4 files</MarkerContent>
      </Marker>
    </div>
  )
}
