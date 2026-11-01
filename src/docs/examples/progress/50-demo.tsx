import * as React from "react"

import { Progress } from "@/components/ui/progress"

export const meta = {
  title: "Demo",
  description:
    "Official `progress-demo`: the bar starts at 13 and jumps to 66 half a second later. The marker is drawn once, full length, and revealed to the value, so the change is a CSS transition. Only addition: an `aria-label`, which a progressbar needs.",
  layout: "center" as const,
}

export default function Example() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return <Progress value={progress} aria-label="Progress" className="w-[60%]" />
}
