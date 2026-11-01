import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Icon } from "@/components/ui/icon"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export const meta = {
  title: "Where you stopped reading",
  description: "tone=\"new\" pulls the lines in red pencil and lays a highlighter swipe under the words, with a red asterisk in the margin. As a button it jumps to the first unread message.",
  layout: "stack" as const,
}

export default function Example() {
  const [read, setRead] = React.useState(false)
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 pb-4">
      <Bubble variant="muted">
        <BubbleContent seed="un-1">I also drew the chips a little smaller, like you asked.</BubbleContent>
      </Bubble>
      {read ? (
        <Marker variant="separator" seed="read">
          <MarkerContent>Read</MarkerContent>
        </Marker>
      ) : (
        <Marker variant="separator" tone="new" seed="new" asChild>
          <button type="button" onClick={() => setRead(true)} aria-label="Mark as read: 2 new messages">
            <MarkerIcon>
              <Icon name="asterisk" />
            </MarkerIcon>
            <MarkerContent>New messages</MarkerContent>
          </button>
        </Marker>
      )}
      <Bubble variant="muted">
        <BubbleContent seed="un-2">One more thing: the count at the top.</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent seed="un-3">It says 12 but the list has 11.</BubbleContent>
      </Bubble>
    </div>
  )
}
