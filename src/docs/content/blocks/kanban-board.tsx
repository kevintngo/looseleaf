import KanbanBoard from "@/blocks/kanban-board/page"
import { Desk } from "@/components/ui/desk"

export default function KanbanBoardPreview() {
  return (
    <Desk>
      <KanbanBoard as="div" />
    </Desk>
  )
}
