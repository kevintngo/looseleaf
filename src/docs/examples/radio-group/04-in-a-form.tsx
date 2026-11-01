import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const meta = {
  title: "In a form",
  description: "`name` on the group puts the chosen value in FormData (Radix keeps hidden native radios in sync) and `required` blocks the submit until one is picked.",
  layout: "stack" as const,
}

export default function Example() {
  const [sent, setSent] = React.useState("")
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(`Ink of the month: ${new FormData(e.currentTarget).get("ink")}`)
      }}
    >
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-[15px] font-bold">Ink of the month</legend>
        <RadioGroup name="ink" required aria-label="Ink of the month">
          {["Black", "Blue", "Sepia"].map((v) => (
            <div key={v} className="flex items-center gap-3">
              <RadioGroupItem value={v.toLowerCase()} id={`ink-${v}`} />
              <Label htmlFor={`ink-${v}`}>{v}</Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>
      <div className="flex items-center gap-3">
        <Button type="submit">Vote</Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </div>
    </form>
  )
}
