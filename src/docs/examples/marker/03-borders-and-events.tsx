import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export const meta = {
  title: "Borders and events",
  description: "A border marker heads a section with one line under it (pencil or a red wavy one). The default variant is small print with an icon: someone joined, a call started.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-4">
      <Marker variant="border" seed="b1">
        <MarkerContent className="text-[15px]">Thursday, 12 March</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon name="user-plus" />
        </MarkerIcon>
        <MarkerContent>Lin joined the conversation</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon name="video" />
        </MarkerIcon>
        <MarkerContent>Ada started a call</MarkerContent>
      </Marker>
      <Marker variant="border" tone="new" rule="wavy" seed="b2">
        <MarkerContent className="text-[15px]">3 unread</MarkerContent>
      </Marker>
    </div>
  )
}
