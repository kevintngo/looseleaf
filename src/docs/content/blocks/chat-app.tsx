import ChatApp from "@/blocks/chat-app/page"
import { Desk } from "@/components/ui/desk"

export default function ChatAppPreview() {
  return (
    <Desk objects={["pencil"]} seed="chat-app-desk">
      <ChatApp />
    </Desk>
  )
}
