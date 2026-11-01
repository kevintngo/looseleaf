import * as React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export const meta = {
  title: "Steps",
  description: "`max` sets the scale, so value and max can be a step and a step count. The label is the only text; the bar has the same value in aria-valuenow and aria-valuemax.",
  layout: "stack" as const,
}

const steps = ["Name your notebook", "Pick a cover", "Add a first page", "Invite someone", "Done"]

export default function Example() {
  const [step, setStep] = React.useState(2)
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="flex items-baseline justify-between">
        <span className="font-script text-2xl leading-none">{steps[step - 1]}</span>
        <span className="ll-num text-sm text-ink-muted">
          Step {step} of {steps.length}
        </span>
      </div>
      <Progress value={step} max={steps.length} aria-label="Setup progress" aria-valuetext={`Step ${step} of ${steps.length}`} />
      <div className="flex gap-3">
        <Button size="sm" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setStep((s) => Math.min(steps.length, s + 1))}>
          Next
        </Button>
      </div>
    </div>
  )
}
