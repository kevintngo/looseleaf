import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StickyNote, StickyNoteContent, StickyNoteFooter, StickyNoteTitle } from "@/components/ui/sticky-note"

export const meta = {
  title: "A team board",
  description: "A real board: notes you tick off as the week goes, laid on a card. Each note is a labelled group with its own checkbox; the tick is written when you press it.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const start = [
  { id: "a", color: "yellow", title: "design", body: "finish the hero art", who: "Ada", done: true },
  { id: "b", color: "green", title: "docs", body: "write the install page", who: "Lin", done: false },
  { id: "c", color: "pink", title: "ship", body: "tag the release", who: "Sam", done: false },
  { id: "d", color: "blue", title: "later", body: "ask about dark mode", who: "Ada", done: false },
] as const

export default function Example() {
  const [state, setState] = React.useState<Record<string, boolean>>(() => Object.fromEntries(start.map((n) => [n.id, n.done])))
  return (
    <Card stock="kraft" seed="board" className="mx-auto w-full max-w-3xl gap-4">
      <CardHeader>
        <CardTitle>This week</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        {start.map((n) => (
          <StickyNote
            key={n.id}
            color={n.color}
            done={state[n.id]}
            onDoneChange={(d) => setState((s) => ({ ...s, [n.id]: d }))}
            doneLabel={`${n.title}: done`}
            seed={n.id}
            role="group"
            aria-label={`${n.title}: ${n.body}`}
            className="w-full max-w-40 justify-self-center"
          >
            <StickyNoteTitle>{n.title}</StickyNoteTitle>
            <StickyNoteContent>{n.body}</StickyNoteContent>
            <StickyNoteFooter>{n.who}</StickyNoteFooter>
          </StickyNote>
        ))}
      </CardContent>
    </Card>
  )
}
