import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function Planner() {
  const [today] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  })
  const [date, setDate] = useState<Date | undefined>(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3))
  return (
    <div data-home="planner" className="flex w-full justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        today={today}
        defaultMonth={today}
        disabled={{ before: today }}
        sheet={{ stock: "card", tape: "corner", seed: "home-planner" }}
        seed="home-planner"
      />
    </div>
  )
}
