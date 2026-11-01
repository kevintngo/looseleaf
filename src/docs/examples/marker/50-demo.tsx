import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "In a conversation",
  description:
    "shadcn's `marker-demo`: a note with an icon, a running status with a spinner (`role=\"status\"`, pulsing), a labelled separator and another note. The original's `shimmer` utility is not shipped, so the pulse here is Tailwind's `motion-safe:animate-pulse`.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker>
        <MarkerIcon>
          <Icon name="git-branch" />
        </MarkerIcon>
        <MarkerContent>Switched to a new branch</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent className="motion-safe:animate-pulse">Thinking...</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation compacted</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon name="search" />
        </MarkerIcon>
        <MarkerContent>Explored 4 files</MarkerContent>
      </Marker>
    </div>
  )
}
