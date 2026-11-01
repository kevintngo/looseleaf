import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const meta = {
  title: "In buttons and badges",
  description:
    "A spinner in front of a label is shadcn's pattern. The button is disabled while the request runs and says what is happening; press it to see a save go through.",
  layout: "stack" as const,
}

export default function Example() {
  const [phase, setPhase] = React.useState<"idle" | "saving" | "saved">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  function save() {
    setPhase("saving")
    timer.current = setTimeout(() => {
      setPhase("saved")
      timer.current = setTimeout(() => setPhase("idle"), 1400)
    }, 1800)
  }
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={save} disabled={phase === "saving"} variant={phase === "saved" ? "secondary" : "default"}>
          {phase === "saving" && <Spinner />}
          {phase === "idle" ? "Save changes" : phase === "saving" ? "Saving" : "Saved, thanks"}
        </Button>
        <Button variant="outline" disabled>
          <Spinner />
          Please wait
        </Button>
        <Button variant="outline" size="icon" disabled aria-label="Refreshing">
          <Spinner />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Badge variant="secondary">
          <Spinner className="size-3.5" aria-label="Syncing" />
          Syncing
        </Badge>
        <Badge variant="outline">
          <Spinner className="size-3.5" aria-label="Uploading" />
          Uploading 3 of 7
        </Badge>
      </div>
    </div>
  )
}
