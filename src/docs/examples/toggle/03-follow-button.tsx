import * as React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export const meta = {
  title: "A follow button",
  description:
    "A controlled toggle: the state lives in your component, the label says what pressing does, and a status line says what happened, so nothing depends on the highlighter.",
  layout: "stack" as const,
}

export default function Example() {
  const [following, setFollowing] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  return (
    <Card className="mx-auto w-full max-w-sm" seed="follow">
      <CardHeader>
        <CardTitle>Field notes</CardTitle>
        <CardDescription>Sketches, half-thoughts and pressed flowers, twice a month.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle variant="outline" pressed={following} onPressedChange={setFollowing} aria-label="Follow Field notes">
            <Icon name="bell" />
            {following ? "Following" : "Follow"}
          </Toggle>
          <Toggle pressed={muted} onPressedChange={setMuted} disabled={!following} aria-label="Mute new posts">
            <Icon name="eye-off" />
            Mute
          </Toggle>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {!following ? "You will not hear about new notes." : muted ? "Following, with new notes muted." : "You will get an email for every new note."}
        </p>
      </CardContent>
    </Card>
  )
}
