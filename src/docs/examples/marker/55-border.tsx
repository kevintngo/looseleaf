import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export const meta = {
  title: "Border",
  description: "shadcn's `marker-border`: a row with an icon that keeps the default alignment and closes with a line under it, to set it off from the row below.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 py-4">
      <Marker variant="border">
        <MarkerIcon>
          <Icon name="git-branch" />
        </MarkerIcon>
        <MarkerContent>Switched to release-candidate</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Icon name="search" />
        </MarkerIcon>
        <MarkerContent>Reviewed 8 related files</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Icon name="file-text" />
        </MarkerIcon>
        <MarkerContent>Opened implementation notes</MarkerContent>
      </Marker>
    </div>
  )
}
