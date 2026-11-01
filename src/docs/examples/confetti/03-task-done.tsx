import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Confetti } from "@/components/ui/confetti"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Finishing the list",
  description: "A real use: confetti stays inside the card and goes off when the last task is ticked. Untick one and tick it again for another go.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 330,
}

const TASKS = ["Write the docs", "Draw the icons", "Tell someone"]

export default function Example() {
  const [done, setDone] = React.useState<boolean[]>([true, true, false])
  const all = done.every(Boolean)
  return (
    <Paper stock="card" className="relative w-72 p-5" tilt={false}>
      <Confetti active={all} spread={90} count={60} />
      <p className="font-script text-2xl">Launch day</p>
      <ul className="mt-3 flex flex-col gap-3">
        {TASKS.map((t, i) => (
          <li key={t} className="flex items-center gap-2">
            <Checkbox id={`task-${i}`} checked={done[i]} onCheckedChange={(c) => setDone(done.map((d, j) => (j === i ? c === true : d)))} />
            <Label htmlFor={`task-${i}`}>{t}</Label>
          </li>
        ))}
      </ul>
      <p role="status" className="mt-4 min-h-6 font-script text-xl text-ink-you">
        {all ? "All done. Go outside." : `${done.filter(Boolean).length} of ${TASKS.length} done`}
      </p>
    </Paper>
  )
}
