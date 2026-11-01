import * as React from "react"
import { addDays, addMonths } from "date-fns"

import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "With presets",
  description: "A column of shortcuts beside the calendar. A preset can be a function, so 'in a week' is worked out when you choose it, not when the page was drawn.",
  layout: "center" as const,
  height: 470,
}

const handleToday = () => new Date()
const handleTomorrow = () => addDays(new Date(), 1)
const handleInAWeek = () => addDays(new Date(), 7)
const handleNextMonth = () => addMonths(new Date(), 1)

export default function Example() {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="remind">Remind me</Label>
      <DatePicker
        id="remind"
        value={date}
        onValueChange={setDate}
        placeholder="Pick a day"
        presets={[
          { label: "Today", value: handleToday },
          { label: "Tomorrow", value: handleTomorrow },
          { label: "In a week", value: handleInAWeek },
          { label: "Next month", value: handleNextMonth },
        ]}
      />
    </div>
  )
}
