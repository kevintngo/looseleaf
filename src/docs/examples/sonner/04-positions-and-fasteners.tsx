import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"

export const meta = {
  title: "Positions, tape and pin",
  description: "Six places to stack toasts (slips not on the right are dropped from above instead of tossed from the corner), and two ways to hold them down: masking tape or a push-pin.",
  layout: "center" as const,
}

const ID = "sonner-positions"
const POSITIONS = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"] as const
const DECORATIONS = ["none", "tape", "pin"] as const

export default function Example() {
  const [position, setPosition] = React.useState<(typeof POSITIONS)[number]>("bottom-right")
  const [decoration, setDecoration] = React.useState<(typeof DECORATIONS)[number]>("tape")

  return (
    <div className="grid justify-items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Position">
        {POSITIONS.map((p) => (
          <Button key={p} size="sm" variant={p === position ? "secondary" : "outline"} aria-pressed={p === position} onClick={() => setPosition(p)}>
            {p}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Decoration">
        {DECORATIONS.map((d) => (
          <Button key={d} size="sm" variant={d === decoration ? "secondary" : "outline"} aria-pressed={d === decoration} onClick={() => setDecoration(d)}>
            {d}
          </Button>
        ))}
      </div>
      <Button onClick={() => toast.success("Copied to clipboard", { toasterId: ID, description: `${position}, ${decoration}` })}>Toast</Button>
      <Toaster id={ID} position={position} decoration={decoration} />
    </div>
  )
}
