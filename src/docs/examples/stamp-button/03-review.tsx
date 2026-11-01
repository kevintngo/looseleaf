import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StampButton, StampSurface, type StampImpression } from "@/components/ui/stamp-button"

export const meta = {
  title: "An approval",
  description: "A real review step: the stamps are the state. Approving or rejecting leaves its impression on the expense report (a second decision replaces the first), the status badge follows it, and Reset clears the page.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  const [marks, setMarks] = React.useState<StampImpression[]>([])
  const tools = React.useRef<HTMLDivElement>(null)
  const last = marks[marks.length - 1]
  const status = !last ? "Waiting for review" : last.name === "stamp-approved" ? "Approved" : "Rejected"

  return (
    <StampSurface value={marks} onValueChange={setMarks} className="w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Expense report 118</CardTitle>
          <CardDescription>Maya Chen, felt tips and washi tape for the March workshop.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="ll-num text-2xl font-bold">$ 148.00</span>
            <Badge variant={last ? "default" : "outline"} aria-live="polite">
              {status}
            </Badge>
          </div>
          <div ref={tools} className="mt-20 flex flex-wrap items-end gap-4">
            <StampButton stamp="stamp-approved" impressionId="decision" place={{ x: 0.68, y: 0.44 }}>
              Approve
            </StampButton>
            <StampButton stamp="stamp-void" text="Rejected" impressionId="decision" place={{ x: 0.46, y: 0.5 }}>
              Reject
            </StampButton>
            <Button
              variant="ghost"
              className="ms-auto"
              onClick={() => {
                setMarks([])
                tools.current?.querySelector("button")?.focus()
              }}
              disabled={marks.length === 0}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </StampSurface>
  )
}
