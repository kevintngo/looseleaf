import * as React from "react"
import { addDays, endOfMonth, startOfMonth, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { DateRangePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "A date range",
  description: "Two ends in one field. Type 'Sep 9, 2026 to Sep 24, 2026' or open the two-month calendar: each week of the range gets one highlighter swipe, and the slip puts itself away when the second end is chosen.",
  layout: "center" as const,
  height: 500,
}

const handleLast7 = (): DateRange => ({ from: subDays(new Date(), 6), to: new Date() })
const handleThisMonth = (): DateRange => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
const handleNext14 = (): DateRange => ({ from: new Date(), to: addDays(new Date(), 13) })

export default function Example() {
  const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 8, 9), to: new Date(2026, 8, 24) })
  return (
    <div className="grid w-80 gap-2">
      <Label htmlFor="stay">Dates</Label>
      <DateRangePicker
        id="stay"
        value={range}
        onValueChange={setRange}
        presets={[
          { label: "Last 7 days", value: handleLast7 },
          { label: "This month", value: handleThisMonth },
          { label: "Next 14 days", value: handleNext14 },
        ]}
        calendarProps={{ today: new Date(2026, 8, 15), defaultMonth: new Date(2026, 8) }}
      />
    </div>
  )
}
