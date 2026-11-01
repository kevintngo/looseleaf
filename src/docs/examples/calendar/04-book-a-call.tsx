import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const meta = {
  title: "Book a call",
  description: "A calendar on a card with time slots beside it: the chosen day drives the slots, the chosen slot drives the button. Weekends are closed, so they are hatched.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 520,
}

const SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:30", "16:00"]

export default function Example() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 17))
  const [slot, setSlot] = React.useState<string | undefined>("10:30")
  return (
    <Card seed="book" tape="top" className="w-fit max-w-full">
      <CardHeader>
        <CardTitle>Book a call</CardTitle>
        <CardDescription>Thirty minutes, on the phone or in the studio.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d)
            setSlot(undefined)
          }}
          defaultMonth={new Date(2026, 8)}
          today={new Date(2026, 8, 15)}
          disabled={[{ dayOfWeek: [0, 6] }, { before: new Date(2026, 8, 15) }]}
          className="p-0"
          seed="book"
        />
        <div role="group" aria-label="Available times" className="grid w-full grid-cols-2 content-start gap-2 md:w-36">
          {SLOTS.map((t) => (
            <Button key={t} size="sm" variant={slot === t ? "default" : "outline"} aria-pressed={slot === t} disabled={!date} onClick={() => setSlot(t)}>
              {t}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <p className="font-hand text-sm text-ink-muted">{date && slot ? `${date.toDateString()} at ${slot}` : "Choose a day and a time."}</p>
        <Button disabled={!date || !slot}>Confirm</Button>
      </CardFooter>
    </Card>
  )
}
