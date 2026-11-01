"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Paper } from "@/components/ui/paper"
import { Sticker } from "@/components/ui/sticker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { FOLDERS, mails as sample, type Folder, type Mail } from "@/blocks/inbox/components/inbox-data"
import { MailList } from "@/blocks/inbox/components/inbox-list"
import { NothingOpen, ReadingPane } from "@/blocks/inbox/components/inbox-reading-pane"

const EMPTY: Record<Folder, { pose: "celebrate" | "sleep" | "shrug"; title: string; text: string }> = {
  inbox: { pose: "celebrate", title: "Inbox zero", text: "Every letter answered or filed. Put the kettle on." },
  archive: { pose: "sleep", title: "Nothing filed away", text: "Letters you archive wait here, out of the way." },
  trash: { pose: "shrug", title: "The bin is empty", text: "Nothing to throw away, for once." },
}

export default function Inbox({ as: Root = "main" }: { as?: "main" | "div" } = {}) {
  const [all, setAll] = React.useState<Mail[]>(sample)
  const [folder, setFolder] = React.useState<Folder>("inbox")
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const phone = useIsMobile()
  const root = React.useRef<HTMLDivElement>(null)
  const landing = React.useRef<"letter" | { row: string | undefined } | null>(null)
  React.useEffect(() => {
    const to = landing.current
    if (!to) return
    landing.current = null
    if (to === "letter") return void root.current?.querySelector<HTMLElement>("[data-mail-subject]")?.focus()
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-mail-row]") ?? [])
    ;(rows.find((r) => r.dataset.mailId === to.row) ?? rows[0] ?? root.current?.querySelector<HTMLElement>('[role="tab"][data-state="active"]'))?.focus()
  })

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((m) => m.folder === folder && (!unreadOnly || m.unread) && (!q || `${m.from} ${m.subject} ${m.body.join(" ")}`.toLowerCase().includes(q)))
  }, [all, folder, unreadOnly, query])
  const open = all.find((m) => m.id === openId && visible.some((v) => v.id === m.id)) ?? null
  const unreadCount = all.filter((m) => m.folder === "inbox" && m.unread).length

  const patch = (id: string, change: Partial<Mail>) => setAll((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)))

  function openMail(id: string) {
    setOpenId(id)
    patch(id, { unread: false })
    if (phone) landing.current = "letter"
  }

  function file(mail: Mail, to: Folder, verb: string) {
    const at = visible.findIndex((m) => m.id === mail.id)
    const next = visible[at + 1] ?? visible[at - 1]
    patch(mail.id, { folder: to })
    setMessage(`${verb} “${mail.subject}”.`)
    if (next && !phone) {
      setOpenId(next.id)
      patch(next.id, { unread: false })
      landing.current = "letter"
    } else {
      setOpenId(null)
      landing.current = { row: next?.id }
    }
  }

  const empty = EMPTY[folder]
  return (
    <Root ref={root} className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-type text-sm tracking-wide text-ink-muted">Marigold Paper Co.</p>
            <h1 className="font-script text-4xl leading-none font-bold sm:text-5xl">The post</h1>
          </div>
          <Sticker name="envelope-heart" size={68} seed="inbox-envelope" className="hidden shrink-0 sm:block" />
        </div>
        <p className="text-muted-foreground">
          {unreadCount === 0 ? "All read." : unreadCount === 1 ? "One letter is waiting." : `${unreadCount} letters are waiting.`}
        </p>
      </header>

      <div className="grid gap-4 md:h-[38rem] md:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <Paper stock="slip" tilt={false} seed="inbox-tray" className={cn("flex min-h-96 flex-col md:min-h-0", open && "max-md:hidden")}>
          <Tabs
            value={folder}
            onValueChange={(v) => {
              setFolder(v as Folder)
              setOpenId(null)
            }}
            className="min-h-0 flex-1 gap-0"
          >
            <div className="flex flex-col gap-3 p-3 pb-0">
              <TabsList className="w-full" aria-label="Folders">
                {FOLDERS.map((f) => (
                  <TabsTrigger key={f.id} value={f.id} className="max-[26rem]:px-2.5">
                    <Icon name={f.icon} className="max-[22rem]:hidden" />
                    {f.label}
                    {f.id === "inbox" && unreadCount ? <Badge variant="secondary" size="sm" count={unreadCount} /> : null}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center gap-2">
                <Input type="search" aria-label="Search letters" placeholder="Search letters" className="min-w-0 flex-1" value={query} onChange={(e) => setQuery(e.target.value)} />
                <ToggleGroup type="single" variant="outline" size="sm" value={unreadOnly ? "unread" : "all"} onValueChange={(v) => v && setUnreadOnly(v === "unread")} aria-label="Show">
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            {FOLDERS.map((f) => (
              <TabsContent key={f.id} value={f.id} className="flex min-h-0 flex-1 flex-col">
                {visible.length ? (
                  <MailList list={visible} selectedId={open?.id ?? null} onOpen={openMail} label={`${f.label}, newest first`} />
                ) : (
                  <Empty className="flex-1">
                    <EmptyHeader>
                      <EmptyMedia pose={query || unreadOnly ? "search" : empty.pose} size={80} />
                      <EmptyTitle>{query || unreadOnly ? "No letters like that" : empty.title}</EmptyTitle>
                      <EmptyDescription>{query || unreadOnly ? "Try another word, or show everything." : empty.text}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Paper>

        <div className={cn("min-h-96 min-w-0 overflow-y-auto p-3 md:-m-3 md:min-h-0", !open && "max-md:hidden")}>
          {open ? (
            <ReadingPane
              key={open.id}
              mail={open}
              onBack={() => {
                landing.current = { row: open.id }
                setOpenId(null)
              }}
              onArchive={() => file(open, "archive", "Archived")}
              onRestore={() => file(open, "inbox", "Moved to the inbox:")}
              onTrash={() => file(open, "trash", "Deleted")}
              onUnread={(unread) => {
                patch(open.id, { unread })
                setMessage(`Marked “${open.subject}” as ${unread ? "unread" : "read"}.`)
              }}
              onStar={(starred) => patch(open.id, { starred })}
              onReply={(text) => {
                patch(open.id, { replies: [...open.replies, text] })
                setMessage(`Reply sent to ${open.from.split(" ")[0]}.`)
              }}
            />
          ) : (
            <Paper stock="paper" tilt={false} seed="inbox-empty" className="hidden h-full md:block">
              <NothingOpen />
            </Paper>
          )}
        </div>
      </div>

      <p role="status" aria-label="Inbox updates" className="sr-only">
        {message}
      </p>
    </Root>
  )
}
