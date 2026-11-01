"use client"

import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import type { Mail } from "@/blocks/inbox/components/inbox-data"

export function MailList({ list, selectedId, onOpen, label }: { list: readonly Mail[]; selectedId: string | null; onOpen: (id: string) => void; label: string }) {
  const root = React.useRef<HTMLDivElement>(null)
  const stop = list.some((m) => m.id === selectedId) ? selectedId : list[0]?.id

  function onKeyDown(e: React.KeyboardEvent) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
    if (!keys.includes(e.key)) return
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-mail-row]") ?? [])
    const at = rows.findIndex((r) => r === document.activeElement)
    if (at < 0) return
    e.preventDefault()
    const to = e.key === "Home" ? 0 : e.key === "End" ? rows.length - 1 : Math.min(rows.length - 1, Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1)))
    rows[to]?.focus()
  }

  return (
    <div ref={root} onKeyDown={onKeyDown} className="min-h-0 flex-1 overflow-y-auto p-3">
      <ItemGroup ruled aria-label={label}>
        {list.map((m) => {
          const selected = m.id === selectedId
          return (
            <Item key={m.id} asChild size="sm" className={cn("flex-nowrap items-start text-start", selected && "ll-swipe")}>
              <button type="button" data-mail-row="" data-mail-id={m.id} data-selected={selected || undefined} aria-current={selected ? "true" : undefined} tabIndex={m.id === stop ? 0 : -1} onClick={() => onOpen(m.id)}>
                <ItemMedia variant="icon">
                  <Icon name={m.unread ? "mail" : "mail-check"} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="w-full justify-between gap-3">
                    <span className={cn("min-w-0 truncate", m.unread ? "font-bold" : "font-normal")}>
                      {m.unread ? <span className="sr-only">Unread. </span> : null}
                      {m.from}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-normal text-muted-foreground">
                      {m.starred ? <Icon name="star" size={14} label="Starred" className="text-hi-deep" /> : null}
                      {m.date}
                    </span>
                  </ItemTitle>
                  <span className={cn("block truncate text-[15px]", m.unread && "font-bold")}>{m.subject}</span>
                  <ItemDescription className="line-clamp-1">{m.body[0]}</ItemDescription>
                </ItemContent>
                {m.unread ? <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ink-you" /> : null}
              </button>
            </Item>
          )
        })}
      </ItemGroup>
    </div>
  )
}
