import { Marker, MarkerContent } from "@/components/ui/marker"

export const meta = {
  title: "Separator",
  description: "shadcn's `marker-separator`: a labeled divider for a date or a turn of the conversation. The words are ordinary content (no `role=\"separator\"`), so they are read out.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Worked for 42s</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation compacted</MarkerContent>
      </Marker>
    </div>
  )
}
