import Inbox from "@/blocks/inbox/page"
import { Desk } from "@/components/ui/desk"

export default function InboxPreview() {
  return (
    <Desk>
      <Inbox as="div" />
    </Desk>
  )
}
