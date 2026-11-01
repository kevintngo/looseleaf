"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Paper } from "@/components/ui/paper"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChatAppFace } from "@/blocks/chat-app/components/chat-app-face"
import { snippet, type Conversation } from "@/blocks/chat-app/components/chat-app-data"
import { cn } from "@/lib/utils"

type Props = {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export function ChatAppConversationList({ conversations, activeId, onSelect, className }: Props) {
  const [query, setQuery] = React.useState("")
  const [show, setShow] = React.useState<"all" | "unread">("all")
  const heading = React.useId()

  const q = query.trim().toLowerCase()
  const rows = conversations.filter((c) => (show === "all" || c.unread > 0) && (!q || `${c.name} ${snippet(c)}`.toLowerCase().includes(q)))
  const unreadTotal = conversations.reduce((n, c) => n + c.unread, 0)

  return (
    <Paper
      as="aside"
      stock="pad"
      rules="none"
      tilt={-0.3}
      fastener="binder-clip"
      seed="chat-list"
      aria-labelledby={heading}
      data-slot="chat-app-list"
      className={cn("flex min-h-0 flex-col gap-3 pt-6 pb-3", className)}
    >
      <div className="flex items-center justify-between gap-3 px-4">
        <h2 id={heading} tabIndex={-1} className="font-script text-[1.7rem] leading-none font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-focus">
          Chats
        </h2>
        {unreadTotal > 0 ? (
          <Badge variant="secondary">{unreadTotal} new</Badge>
        ) : null}
      </div>

      <div className="grid gap-2.5 px-4">
        <InputGroup>
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupInput type="search" placeholder="Search chats" aria-label="Search chats" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
        <ToggleGroup type="single" size="sm" variant="outline" value={show} onValueChange={(v) => setShow(v === "unread" ? "unread" : "all")} aria-label="Show" className="w-fit">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1" bleed>
        {rows.length === 0 ? (
          <Empty seed="chat-none" className="p-2 md:p-4">
            <EmptyHeader>
              <EmptyMedia pose="search" size={88} />
              <EmptyTitle>No chats match</EmptyTitle>
              <EmptyDescription>{q ? `Nothing says “${query.trim()}”. Try a shorter word.` : "You are all caught up."}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup ruled aria-label="Conversations">
            {rows.map((c) => {
              const active = c.id === activeId
              return (
                <Item key={c.id} asChild size="sm" seed={c.id}>
                  <button type="button" aria-current={active ? "true" : undefined} onClick={() => onSelect(c.id)} className="w-full text-start aria-[current=true]:ll-swipe">
                    <ItemMedia>
                      <ChatAppFace conversation={c} />
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle className={cn(c.unread > 0 && "font-extrabold")}>{c.name}</ItemTitle>
                      <ItemDescription className="line-clamp-1">{snippet(c)}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="flex-col items-end gap-1 self-start">
                      <span className="ll-num text-sm text-muted-foreground">{c.time}</span>
                      {c.unread > 0 ? (
                        <Badge size="sm" className="ll-num">
                          {c.unread}
                          <span className="sr-only"> unread</span>
                        </Badge>
                      ) : null}
                    </ItemActions>
                  </button>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </ScrollArea>
    </Paper>
  )
}
