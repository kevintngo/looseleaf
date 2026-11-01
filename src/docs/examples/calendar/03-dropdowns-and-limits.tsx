import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export const meta = {
  title: "Dropdowns and limits",
  description: "Month and year are native selects in pencil boxes, so jumping to a birthday takes two taps. Weekends and the past are hatched out and cannot be chosen; the arrows stop at the ends of the range.",
  layout: "center" as const,
  height: 430,
}

export default function Example() {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 8)}
      startMonth={new Date(2024, 0)}
      endMonth={new Date(2028, 11)}
      today={new Date(2026, 8, 15)}
      disabled={[{ dayOfWeek: [0, 6] }, { before: new Date(2026, 8, 15) }]}
      sheet
      seed="limits"
      footer={date ? `You picked ${date.toDateString()}.` : "Pick a weekday from the 15th on."}
    />
  )
}
