"use client"

import * as React from "react"

import { calendarGroups, appUser } from "@/blocks/sidebar-shared/sidebar-data"
import { Calendars, DatePicker } from "@/blocks/sidebar-shared/sidebar-calendar"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Icon } from "@/components/ui/icon"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator } from "@/components/ui/sidebar"

export function AppSidebar({
  date,
  onDateChange,
  visible,
  onVisibleChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  date: Date
  onDateChange: (date: Date) => void
  visible: string[]
  onVisibleChange: (next: string[]) => void
}) {
  return (
    <Sidebar role="navigation" aria-label="Calendars" {...props}>
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
      <SidebarRail />
    </Sidebar>
  )
}
