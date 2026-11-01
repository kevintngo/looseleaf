import * as React from "react"
import { arSA, es } from "react-day-picker/locale"

import { Calendar } from "@/components/ui/calendar"

export const meta = {
  title: "Other languages",
  description: "Pass a react-day-picker locale: Spanish starts the week on Monday; Arabic runs right to left, with Eastern Arabic numerals and one-letter weekdays (a `formatWeekdayName`, since the short names of that language do not fit a cell), and the rules, arrows and swipe ends turn around with it.",
  layout: "center" as const,
}

export default function Example() {
  const [a, setA] = React.useState<Date | undefined>(new Date(2026, 8, 17))
  const [b, setB] = React.useState<Date[] | undefined>([new Date(2026, 8, 6), new Date(2026, 8, 13)])
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      <Calendar mode="single" locale={es} weekStartsOn={1} selected={a} onSelect={setA} defaultMonth={new Date(2026, 8)} today={new Date(2026, 8, 15)} sheet seed="es" />
      <Calendar mode="multiple" locale={arSA} dir="rtl" numerals="arab" formatters={{ formatWeekdayName: (d) => d.toLocaleDateString("ar", { weekday: "narrow" }) }} selected={b} onSelect={setB} defaultMonth={new Date(2026, 8)} today={new Date(2026, 8, 15)} sheet seed="ar" />
    </div>
  )
}
