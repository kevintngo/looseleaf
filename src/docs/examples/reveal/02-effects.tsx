import { Paper } from "@/components/ui/paper"
import { Reveal, type RevealEffect } from "@/components/ui/reveal"

export const meta = {
  title: "Five arrivals",
  description: "wipe, soak, drop, pop and toss, each one of the theme's keyframes. They play when they are on screen; scroll away and back with once turned off.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const EFFECTS: RevealEffect[] = ["wipe", "soak", "drop", "pop", "toss"]

export default function Example() {
  return (
    <div className="flex flex-wrap gap-4">
      {EFFECTS.map((effect, i) => (
        <Reveal key={effect} effect={effect} once={false} delay={i * 0.08}>
          <Paper stock={i % 2 ? "sticky-yellow" : "index-card"} className="w-32 p-4 text-center font-script text-2xl" tilt={i % 2 ? 2 : -2}>
            {effect}
          </Paper>
        </Reveal>
      ))}
    </div>
  )
}
