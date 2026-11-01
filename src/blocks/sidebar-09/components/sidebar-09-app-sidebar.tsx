"use client"

import * as React from "react"

import { BrandTile } from "@/blocks/sidebar-shared/sidebar-brand"
import { appUser, mailFolders, type Mail, type MailFolder } from "@/blocks/sidebar-shared/sidebar-data"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const matches = (mail: Mail, query: string) => {
  const q = query.trim().toLowerCase()
  return !q || [mail.name, mail.subject, mail.teaser].some((text) => text.toLowerCase().includes(q))
}

export function AppSidebar({
  folder,
  onFolderChange,
  mails,
  unread,
  selectedId,
  onSelectMail,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  folder: MailFolder
  onFolderChange: (folder: MailFolder) => void
  mails: Mail[]
  unread: ReadonlySet<string>
  selectedId: string | null
  onSelectMail: (id: string) => void
}) {
  const { setOpen, isMobile, setOpenMobile } = useSidebar()
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const switchId = React.useId()
  const visible = mails.filter((mail) => mail.folder === folder && (!unreadOnly || unread.has(mail.id)) && matches(mail, query))

  return (
    <Sidebar collapsible="icon" role="navigation" aria-label="Mail" {...props}>
      <div className="flex h-full min-h-0 w-full flex-row">
        <div data-slot="mail-rail" className="flex h-full w-[var(--sidebar-width-icon,3rem)] shrink-0 flex-col">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 justify-center p-0">
                  <a href="#studio" aria-label="Looseleaf Studio">
                    <BrandTile icon="mail" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {mailFolders.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={isMobile ? undefined : { children: item.title, hidden: false }}
                        isActive={folder === item.title}
                        aria-current={folder === item.title ? "true" : undefined}
                        className="px-2.5 md:px-2"
                        onClick={() => {
                          onFolderChange(item.title)
                          setOpen(true)
                        }}
                      >
                        <Icon name={item.icon} />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={appUser} iconOnly />
          </SidebarFooter>
        </div>

        <Sidebar collapsible="none" stock="card" aria-label={`${folder} messages`} role="region" className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <SidebarHeader className="gap-3.5 border-b border-sidebar-border p-4">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="font-script text-2xl leading-none font-semibold">{folder}</div>
              <Label htmlFor={switchId} className="flex items-center gap-2 text-sm">
                <span>Unreads</span>
                <Switch id={switchId} size="sm" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
              </Label>
            </div>
            <SidebarInput type="search" aria-label="Search mail" placeholder="Type to search..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {visible.length ? (
                  <ul aria-label={`${folder} messages`}>
                    {visible.map((mail) => {
                      const isUnread = unread.has(mail.id)
                      return (
                        <li key={mail.id} className="border-b border-sidebar-border last:border-b-0">
                          <button
                            type="button"
                            aria-current={selectedId === mail.id ? "true" : undefined}
                            onClick={() => {
                              onSelectMail(mail.id)
                              if (isMobile) setOpenMobile(false)
                            }}
                            className="flex w-full flex-col items-start gap-1.5 p-4 text-start text-sm leading-tight hover:ll-swipe focus-visible:ll-swipe aria-[current=true]:ll-swipe"
                          >
                            <span className="flex w-full items-center gap-2">
                              {isUnread ? <Icon name="dot" size={12} className="-ms-3.5 -me-1.5 shrink-0 text-marker" /> : null}
                              <span className={cn("truncate", isUnread && "font-bold")}>
                                {isUnread ? <span className="sr-only">Unread. </span> : null}
                                {mail.name}
                              </span>
                              <span className="ms-auto shrink-0 text-sm text-muted-foreground">{mail.date}</span>
                            </span>
                            <span className="w-full truncate font-bold">{mail.subject}</span>
                            <span className="line-clamp-2 w-full text-sm whitespace-break-spaces text-muted-foreground">{mail.teaser}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p role="status" className="p-4 text-sm text-muted-foreground">
                    No letters here. Try another folder, or clear the search.
                  </p>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>
    </Sidebar>
  )
}
