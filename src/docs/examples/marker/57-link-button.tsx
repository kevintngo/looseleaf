import { toast } from "sonner"

import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Toaster } from "@/components/ui/sonner"

export const meta = {
  title: "Links and buttons",
  description:
    "shadcn's `marker-link-button`: `asChild` makes the marker a real `<a>` or `<button>`, so it is focusable and announced as one. The button here says so with a toast. `rotate-ccw` is not drawn yet; the revert button wears `undo-2`.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8 py-4">
      <Marker asChild>
        <a href="#links-and-buttons">
          <MarkerIcon>
            <Icon name="git-branch" />
          </MarkerIcon>
          <MarkerContent>View the pull request</MarkerContent>
        </a>
      </Marker>
      <Marker asChild>
        <button type="button" className="transition-colors hover:text-foreground" onClick={() => toast("You clicked the revert button", { toasterId: "marker-link-button" })}>
          <MarkerIcon>
            <Icon name="undo-2" />
          </MarkerIcon>
          <MarkerContent>Revert this change</MarkerContent>
        </button>
      </Marker>
      <Toaster id="marker-link-button" />
    </div>
  )
}
