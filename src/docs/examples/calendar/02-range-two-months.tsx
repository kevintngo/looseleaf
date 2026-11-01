import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

export const meta = {
  title: "A range across two months",
  description: "Pick a first and a last day and each week gets one highlighter swipe with chisel ends; week numbers go in the margin behind a red pencil rule.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 420,
}

export default function Example() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 8, 24), to: new Date(2026, 9, 6) })
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      showWeekNumber
      selected={range}
      onSelect={setRange}
      defaultMonth={new Date(2026, 8)}
      today={new Date(2026, 8, 15)}
      sheet={{ stock: "paper", fastener: "binder-clip", tilt: 0.4 }}
      seed="range"
    />
  )
}
