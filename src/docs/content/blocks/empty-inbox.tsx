import EmptyInbox from "@/blocks/empty-inbox/page"
import { Desk } from "@/components/ui/desk"

export default function EmptyInboxPreview() {
  return (
    <Desk className="min-h-[inherit]" objects={["coffee"]} seed="empty-inbox">
      <EmptyInbox />
    </Desk>
  )
}
