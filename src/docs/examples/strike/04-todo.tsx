import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Strike } from "@/components/ui/strike"

export const meta = {
  title: "A to-do list",
  description: "Tick a box and the task is struck through in red pencil, drawn on as you tick it.",
  layout: "stack" as const,
}

const TASKS = ["Buy oat milk", "Book the train", "Reply to Sam", "Water the ferns"]

export default function Example() {
  const [done, setDone] = React.useState<string[]>(["Buy oat milk"])
  return (
    <div className="grid w-full max-w-xs gap-3">
      {TASKS.map((t) => (
        <div key={t} className="flex items-center gap-2.5">
          <Checkbox
            id={t}
            checked={done.includes(t)}
            onCheckedChange={(c) => setDone((d) => (c ? [...d, t] : d.filter((x) => x !== t)))}
          />
          <Label htmlFor={t} className="text-base font-normal">
            <Strike asChild animate show={done.includes(t)}>
              <span className={done.includes(t) ? "text-muted-foreground" : undefined}>{t}</span>
            </Strike>
          </Label>
        </div>
      ))}
    </div>
  )
}
