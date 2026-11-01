import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export const meta = {
  title: "Message log",
  description: "A real screen: a fixed-height log inside a card, with the newest line kept in view, `bleed` so the edge buttons keep their rings, and an input below. The scroll mark shows while the log is being scrolled.",
  layout: "center" as const,
  height: 480,
}

const first = [
  ["Ada", "Did the tabs land?"],
  ["Jo", "Yes, and the binder ones too."],
  ["Ada", "Lovely. Can you look at the table rules?"],
  ["Jo", "Pencil, by hand. They wander a little."],
  ["Ada", "Good. That is the point."],
  ["Mika", "I redrew the checkbox tick again."],
  ["Jo", "Which of the four?"],
  ["Mika", "The one that overshoots."],
]

export default function Example() {
  const [lines, setLines] = React.useState<string[][]>(first)
  const [draft, setDraft] = React.useState("")
  const end = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (lines.length > first.length) end.current?.scrollIntoView({ block: "nearest" })
  }, [lines])
  return (
    <Card seed="messages" className="w-full max-w-sm gap-4">
      <CardHeader>
        <CardTitle>Studio</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea type="always" bleed className="-m-3 h-56" aria-label="Messages">
          <ol className="grid gap-3 text-sm">
            {lines.map(([who, text], i) => (
              <li key={i} className="grid">
                <span className="font-bold">{who}</span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
          <div ref={end} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="gap-2">
        <Input aria-label="Your message" placeholder="Say something" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button
          size="sm"
          disabled={!draft.trim()}
          onClick={() => {
            setLines((l) => [...l, ["You", draft.trim()]])
            setDraft("")
          }}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  )
}
