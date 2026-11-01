import * as React from "react"

import { Button } from "@/components/ui/button"

export const meta = {
  title: "Saving, in three states",
  description: "A real save button: pressing it disables it while the request runs, says what is happening, and confirms. The label is text; nothing here needs an icon.",
  layout: "stack" as const,
}

type Phase = "idle" | "saving" | "saved"

export default function Example() {
  const [phase, setPhase] = React.useState<Phase>("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  function save() {
    setPhase("saving")
    timer.current = setTimeout(() => {
      setPhase("saved")
      timer.current = setTimeout(() => setPhase("idle"), 1600)
    }, 1400)
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={save} disabled={phase === "saving"} aria-busy={phase === "saving"} variant={phase === "saved" ? "secondary" : "default"}>
        {phase === "idle" ? "Save changes" : phase === "saving" ? "Saving..." : "Saved, thanks"}
      </Button>
      <Button variant="ghost" disabled={phase !== "idle"}>
        Cancel
      </Button>
      <span role="status" className="text-muted-foreground">
        {phase === "saving" ? "Writing it down..." : phase === "saved" ? "All changes kept." : ""}
      </span>
    </div>
  )
}
