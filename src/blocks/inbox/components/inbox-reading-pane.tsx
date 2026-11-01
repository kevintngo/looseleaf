"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Paper } from "@/components/ui/paper"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import type { Mail } from "@/blocks/inbox/components/inbox-data"

export function NothingOpen() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia doodle="paper-plane" size={88} />
        <EmptyTitle>Pick a letter to read</EmptyTitle>
        <EmptyDescription>It opens here, on a sheet of its own.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function ReadingPane({
  mail,
  onBack,
  onArchive,
  onRestore,
  onTrash,
  onUnread,
  onStar,
  onReply,
}: {
  mail: Mail
  onBack: () => void
  onArchive: () => void
  onRestore: () => void
  onTrash: () => void
  onUnread: (unread: boolean) => void
  onStar: (starred: boolean) => void
  onReply: (text: string) => void
}) {
  const uid = React.useId()
  const [draft, setDraft] = React.useState("")
  const reply = React.useRef<HTMLTextAreaElement>(null)
  const inInbox = mail.folder === "inbox"
  const first = mail.from.split(" ")[0]

  return (
    <Paper as="article" stock="paper" tilt={false} seed={`inbox-${mail.id}`} aria-labelledby={`${uid}-subject`} className="flex min-h-full flex-col gap-4 p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={onBack}>
          <Icon name="arrow-left" />
          Back to the list
        </Button>
        <div className="ms-auto flex flex-wrap items-center gap-1" role="group" aria-label="What to do with this letter">
          {inInbox ? (
            <Button variant="outline" size="sm" aria-label="Archive" onClick={onArchive}>
              <Icon name="archive" />
              <span className="hidden sm:inline">Archive</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" aria-label="Move to inbox" onClick={onRestore}>
              <Icon name="inbox" />
              <span className="hidden sm:inline">Move to inbox</span>
            </Button>
          )}
          {mail.folder !== "trash" ? (
            <Button variant="outline" size="sm" aria-label="Delete" onClick={onTrash}>
              <Icon name="trash" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          ) : null}
          <Button variant="outline" size="sm" aria-label={mail.unread ? "Mark as read" : "Mark as unread"} onClick={() => onUnread(!mail.unread)}>
            <Icon name={mail.unread ? "mail-check" : "mail"} />
            <span className="hidden sm:inline">{mail.unread ? "Read" : "Unread"}</span>
          </Button>
          <Toggle variant="outline" size="sm" aria-label="Star" pressed={mail.starred} onPressedChange={onStar}>
            <Icon name="star" />
          </Toggle>
        </div>
      </div>

      <h2 id={`${uid}-subject`} data-mail-subject="" tabIndex={-1} className="font-script text-3xl leading-tight font-bold text-balance outline-none sm:text-4xl">
        {mail.subject}
      </h2>

      <div className="flex items-center gap-3">
        <Avatar aria-hidden="true" size="lg">
          <AvatarFallback name={mail.from} />
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-bold">{mail.from}</p>
          <p className="truncate text-sm text-muted-foreground">
            {mail.address} · {mail.date}
          </p>
        </div>
      </div>

      <Separator variant="dashed" />

      <div className="flex flex-col gap-3 text-[17px] leading-relaxed">
        {mail.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {mail.attachments.length ? (
        <ul role="list" aria-label="Attachments" className="flex flex-wrap gap-2">
          {mail.attachments.map((a) => (
            <li key={a} className="flex items-center gap-1.5 bg-hi-select/60 px-2.5 py-1 text-sm">
              <Icon name="paperclip" size={14} />
              {a}
            </li>
          ))}
        </ul>
      ) : null}

      {mail.replies.length ? (
        <section aria-label="Your replies" className="flex flex-col gap-2">
          {mail.replies.map((r, i) => (
            <p key={i} className="ms-6 border-s-2 border-ink-you ps-3 text-ink-you">
              <span className="block text-sm text-muted-foreground">You wrote, just now</span>
              {r}
            </p>
          ))}
        </section>
      ) : null}

      <form
        className="mt-auto flex flex-col gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          onReply(draft.trim())
          setDraft("")
          reply.current?.focus()
        }}
      >
        <Label htmlFor={`${uid}-reply`}>Reply to {first}</Label>
        <Textarea ref={reply} id={`${uid}-reply`} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder={`Dear ${first},`} />
        <div className="flex justify-end">
          <Button type="submit" disabled={!draft.trim()}>
            <Icon name="send" />
            Send
          </Button>
        </div>
      </form>
    </Paper>
  )
}
