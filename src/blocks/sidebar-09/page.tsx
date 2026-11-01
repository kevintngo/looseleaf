"use client"

import * as React from "react"

import { AppSidebar } from "@/blocks/sidebar-09/components/sidebar-09-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { mails, type MailFolder } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  const [folder, setFolder] = React.useState<MailFolder>("Inbox")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [unread, setUnread] = React.useState<ReadonlySet<string>>(() => new Set(mails.filter((m) => m.unread).map((m) => m.id)))
  const selected = mails.find((m) => m.id === selectedId) ?? null

  const setRead = (id: string, read: boolean) =>
    setUnread((prev) => {
      const next = new Set(prev)
      if (read) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <SidebarProvider className={cn("overflow-x-clip", c.provider)} style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar
        className={c.sidebar}
        folder={folder}
        onFolderChange={(next) => {
          setFolder(next)
          setSelectedId(null)
        }}
        mails={mails}
        unread={unread}
        selectedId={selectedId}
        onSelectMail={(id) => {
          setSelectedId(id)
          setRead(id, true)
        }}
      />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={["All inboxes", folder]} sticky bordered />
        {selected ? (
          <PageBody title={selected.subject} kicker={`From ${selected.name}`}>
            <article aria-label={selected.subject} className="grid max-w-prose gap-3 text-base">
              <p className="text-sm text-muted-foreground">
                {selected.name} &lt;{selected.email}&gt; &middot; {selected.date}
              </p>
              {selected.teaser.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
              <div>
                <Button variant="outline" size="sm" onClick={() => setRead(selected.id, false)}>
                  Mark as unread
                </Button>
              </div>
            </article>
          </PageBody>
        ) : (
          <PageBody title={folder} kicker="All inboxes">
            <PageNote title="No letter open" pose="idle">
              Pick a message from the list on the pad and it opens here, ready to read.
            </PageNote>
          </PageBody>
        )}
      </PageSheet>
    </SidebarProvider>
  )
}
