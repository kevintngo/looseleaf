import * as React from "react"

import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Collapse to icons",
  description:
    "collapsible=\"icon\" shrinks the pad to a 3rem strip: labels fade, the margin bracket steps aside, the binder clip comes off, and each button names itself in a tooltip. The state is controlled here so the page can read it.",
  layout: "full" as const,
  height: 460,
  stage: "desk" as const,
}

const ITEMS = [
  { title: "Inbox", icon: "inbox", count: "3" },
  { title: "Calendar", icon: "calendar" },
  { title: "Search", icon: "search" },
  { title: "Settings", icon: "settings" },
]

export default function Example() {
  const [open, setOpen] = React.useState(true)
  const [current, setCurrent] = React.useState("Inbox")

  return (
    <div className="relative h-[460px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider open={open} onOpenChange={setOpen} className="h-full min-h-0">
        <Sidebar collapsible="icon" className="h-full" seed="icons">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Looseleaf">
                  <Icon name="book-open" />
                  <span className="font-bold">Looseleaf</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ITEMS.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={current === item.title} tooltip={item.title} onClick={() => setCurrent(item.title)}>
                        <Icon name={item.icon} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.count ? <SidebarMenuBadge>{item.count}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="font-script text-2xl leading-none font-semibold">{current}</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
            The pad is {open ? "open" : "collapsed to icons"}. Hover a button when it is collapsed to read its name.
          </p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
