import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "Reserve a table",
  description: "In a real form: the date is a named field (the hidden input submits 2026-09-17), Mondays are closed, and the summary reads the submitted FormData.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 560,
}

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null)
  return (
    <Card seed="reserve" tape="corner" className="w-full max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          setSent(`${data.get("date") || "no date"} at ${data.get("time") || "no time"}`)
        }}
      >
        <CardHeader>
          <CardTitle>Reserve a table</CardTitle>
          <CardDescription>We are closed on Mondays.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="res-date">Day</Label>
            <DatePicker
              id="res-date"
              name="date"
              required
              min={new Date(2026, 8, 15)}
              disabledDates={{ dayOfWeek: [1] }}
              calendarProps={{ today: new Date(2026, 8, 15), defaultMonth: new Date(2026, 8) }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="res-time">Time</Label>
            <Select name="time" defaultValue="19:00">
              <SelectTrigger id="res-time" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {["18:00", "19:00", "20:00", "21:00"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <p className="font-hand text-sm text-ink-muted" aria-live="polite">
            {sent ? `Sent: ${sent}` : "Nothing sent yet."}
          </p>
          <Button type="submit">Reserve</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
