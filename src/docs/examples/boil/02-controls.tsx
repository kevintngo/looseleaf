import * as React from "react"

import { Boil } from "@/components/ui/boil"
import { Button } from "@/components/ui/button"
import { Doodle } from "@/components/ui/doodle"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "Calm, normal, restless",
  description: "fps and strength tune the shiver. Drawn controls inside a Boil feel it too (through the ink knobs), so a call to action can be alive without any doodle.",
  layout: "stack" as const,
  height: 240,
}

const MODES = {
  calm: { fps: 3, strength: 0.6 },
  normal: { fps: 6, strength: 1 },
  restless: { fps: 12, strength: 2.2 },
} as const

export default function Example() {
  const [mode, setMode] = React.useState<keyof typeof MODES>("normal")
  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <Boil {...MODES[mode]} className="self-start">
        <div className="flex items-center gap-4">
          <Doodle name="mushroom" size={72} />
          <Button size="lg">Join the club</Button>
          <Input aria-label="Email" placeholder="you@example.com" className="w-48" />
        </div>
      </Boil>
      <div className="flex items-center gap-4" role="group" aria-label="How nervous">
        {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
          <Button key={m} size="sm" variant={m === mode ? "secondary" : "outline"} aria-pressed={m === mode} onClick={() => setMode(m)}>
            {m}
          </Button>
        ))}
      </div>
    </div>
  )
}
