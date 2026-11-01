import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "Status",
  description: "shadcn's `marker-status`: `role=\"status\"` makes a marker a live region, so a screen reader hears \"Compacting conversation\" when it appears. A Spinner in MarkerIcon shows that something is running.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Compacting conversation</MarkerContent>
      </Marker>
      <Marker variant="separator" role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent>Running tests</MarkerContent>
      </Marker>
    </div>
  )
}
