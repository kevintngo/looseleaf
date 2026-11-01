import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mascot } from "@/components/ui/mascot"
import type { Conversation } from "@/blocks/chat-app/components/chat-app-data"

export function ChatAppFace({ conversation, size = 36, name }: { conversation: Pick<Conversation, "id" | "kind" | "name">; size?: number; name?: string }) {
  if (conversation.kind === "assistant") {
    const draw = Math.round(size * 1.25)
    return <Mascot pose="idle" size={draw} seed={`${conversation.id}-face`} style={{ margin: -(draw - size) / 2 }} />
  }
  return (
    <Avatar size={size > 36 ? "lg" : "default"} seed={`${conversation.id}-${name ?? ""}`}>
      <AvatarFallback name={name ?? conversation.name} />
    </Avatar>
  )
}
