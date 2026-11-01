import * as React from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const meta = {
  title: "In a field",
  description:
    "A group of days inside a Field keeps the width of its buttons, and `aria-invalid` (a Form's FormControl sets it) draws the one shared box in red pencil, like any invalid field. Pick a day and it turns back to ink.",
  layout: "stack" as const,
}

const DAYS = [
  { id: "mon", short: "M", label: "Monday" },
  { id: "tue", short: "T", label: "Tuesday" },
  { id: "wed", short: "W", label: "Wednesday" },
  { id: "thu", short: "T", label: "Thursday" },
  { id: "fri", short: "F", label: "Friday" },
  { id: "sat", short: "S", label: "Saturday" },
  { id: "sun", short: "S", label: "Sunday" },
]

export default function Example() {
  const [days, setDays] = React.useState<string[]>([])
  const invalid = days.length === 0
  return (
    <Field data-invalid={invalid || undefined} className="max-w-sm">
      <FieldLabel id="quiet-days-label">Quiet days</FieldLabel>
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={days}
        onValueChange={setDays}
        aria-labelledby="quiet-days-label"
        aria-describedby="quiet-days-help"
        aria-invalid={invalid}
      >
        {DAYS.map((d) => (
          <ToggleGroupItem key={d.id} value={d.id} aria-label={d.label}>
            {d.short}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription id="quiet-days-help">No notifications on these days.</FieldDescription>
      {invalid ? <FieldError>Choose at least one day.</FieldError> : null}
    </Field>
  )
}
