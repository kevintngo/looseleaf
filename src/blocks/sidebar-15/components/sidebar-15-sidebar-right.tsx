"use client"

import * as React from "react"

import { appUser, calendarGroups } from "@/blocks/sidebar-shared/sidebar-data"
import { Calendars, DatePicker } from "@/blocks/sidebar-shared/sidebar-calendar"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Icon } from "@/components/ui/icon"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar"
import { Tape } from "@/components/ui/tape"
import { cn } from "@/lib/utils"

export function SidebarRight({
  date,
  onDateChange,
  visible,
  onVisibleChange,
  contained = false,
  className,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  date: Date
  onDateChange: (date: Date) => void
  visible: string[]
  onVisibleChange: (next: string[]) => void
  contained?: boolean
}) {
  return (
    <Sidebar
      collapsible="none"
      role="navigation"
      aria-label="Calendars"
      className={cn("sticky top-0 hidden border-s border-sidebar-border pt-3 lg:flex", contained ? "h-full" : "h-svh", className)}
      {...props}
    >
      <Tape kind="washi-stripes" color="tangerine" length={72} height={18} angle={-2} className="absolute top-0 start-1/2 -ms-9" />
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser user={appUser} align="start" />
      </SidebarHeader>
      <SidebarContent>
        <DatePicker selected={date} onSelect={(next) => next && onDateChange(next)} />
        <SidebarSeparator className="mx-0" />
        <Calendars groups={calendarGroups} value={visible} onValueChange={onVisibleChange} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Icon name="plus" />
              <span>New calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
