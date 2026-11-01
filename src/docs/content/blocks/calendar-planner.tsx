import CalendarPlanner from "@/blocks/calendar-planner/page"
import { Desk } from "@/components/ui/desk"

export default function CalendarPlannerPreview() {
  return (
    <Desk>
      <CalendarPlanner as="div" />
    </Desk>
  )
}
