import * as React from "react"

import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "As a button",
  description: "typeable={false} makes the whole field a button that shows the date, like a Select. Below it: invalid, disabled and a dropdown caption for far-away dates such as birthdays.",
  layout: "stack" as const,
  height: 480,
}

export default function Example() {
  const [born, setBorn] = React.useState<Date | undefined>()
  return (
    <div className="mx-auto grid w-72 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="born">Date of birth</Label>
        <DatePicker
          id="born"
          typeable={false}
          value={born}
          onValueChange={setBorn}
          placeholder="Pick your birthday"
          max={new Date(2026, 8, 15)}
          calendarProps={{ captionLayout: "dropdown", startMonth: new Date(1930, 0), endMonth: new Date(2026, 8), defaultMonth: born ?? new Date(1990, 5), today: new Date(2026, 8, 15) }}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ship">Ship by</Label>
        <DatePicker id="ship" typeable={false} invalid defaultValue={new Date(2026, 8, 30)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="closed">Closed on</Label>
        <DatePicker id="closed" disabled defaultValue={new Date(2026, 11, 25)} />
      </div>
    </div>
  )
}
