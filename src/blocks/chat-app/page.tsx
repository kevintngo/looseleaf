"use client"

import * as React from "react"

import { ChatAppConversationList } from "@/blocks/chat-app/components/chat-app-conversation-list"
import { CONVERSATIONS, type ChatFile, type Conversation } from "@/blocks/chat-app/components/chat-app-data"
import { useChatApp } from "@/blocks/chat-app/components/chat-app-state"
import { ChatAppThread } from "@/blocks/chat-app/components/chat-app-thread"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  conversations?: Conversation[]
  onSend?: (conversationId: string, text: string, files: ChatFile[]) => void
}

export default function ChatApp({ className, conversations = CONVERSATIONS, onSend }: Props) {
  const chat = useChatApp(conversations, conversations[0]?.id ?? "", onSend)
  const [view, setView] = React.useState<"list" | "thread">("list")
  const grid = React.useRef<HTMLDivElement>(null)
  const shown = React.useRef(view)
  React.useEffect(() => {
    if (shown.current === view) return
    shown.current = view
    const gone = grid.current?.querySelector<HTMLElement>(view === "thread" ? "[data-slot=chat-app-list]" : "[data-slot=chat-app-thread]")
    if (!gone || getComputedStyle(gone).display !== "none") return
    const pane = view === "thread" ? "[data-slot=chat-app-thread]" : "[data-slot=chat-app-list]"
    const target = (view === "list" ? grid.current?.querySelector<HTMLElement>(`${pane} [aria-current=true]`) : null) ?? grid.current?.querySelector<HTMLElement>(`${pane} h2`)
    target?.focus()
  }, [view])

  return (
    <div className="@container/chat w-full">
      <div
        ref={grid}
        data-slot="chat-app"
        data-view={view}
        className={cn(
          "group/chat grid h-[50rem] max-h-[100svh] min-h-[32rem] w-full grid-cols-1 grid-rows-[minmax(0,1fr)] gap-6 p-4 pt-10 @3xl/chat:grid-cols-[minmax(16rem,21rem)_minmax(0,1fr)] @3xl/chat:p-6 @3xl/chat:pt-12",
          className
        )}
      >
        <ChatAppConversationList
          conversations={chat.conversations}
          activeId={chat.activeId}
          onSelect={(id) => {
            chat.select(id)
            setView("thread")
          }}
          className="group-data-[view=thread]/chat:@max-3xl/chat:hidden"
        />
        {chat.active ? (
          <ChatAppThread
            key={chat.active.id}
            conversation={chat.active}
            status={chat.status}
            announce={chat.announce}
            onSend={chat.send}
            onStop={chat.stop}
            onBack={() => setView("list")}
            className="group-data-[view=list]/chat:@max-3xl/chat:hidden"
          />
        ) : null}
      </div>
    </div>
  )
}
