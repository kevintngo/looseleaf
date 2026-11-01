import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export const meta = {
  title: "With icon",
  description:
    "shadcn's `marker-icon`: MarkerIcon in front of the words in a plain marker, in a separator (the icon sits in the middle with the lines on both sides), and stacked above the words with `flex-col`. `book-open-check` is not drawn yet, so the last one uses `book-open`.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-12 py-4">
      <Marker>
        <MarkerIcon>
          <Icon name="git-branch" />
        </MarkerIcon>
        <MarkerContent>Switched to a new branch</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerIcon>
          <Icon name="search" />
        </MarkerIcon>
        <MarkerContent>Explored 4 files</MarkerContent>
      </Marker>
      <Marker className="flex-col">
        <MarkerIcon>
          <Icon name="book-open" />
        </MarkerIcon>
        <MarkerContent>Syncing completed</MarkerContent>
      </Marker>
    </div>
  )
}
