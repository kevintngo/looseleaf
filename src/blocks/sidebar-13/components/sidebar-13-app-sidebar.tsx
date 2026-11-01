"use client"

import * as React from "react"

import { SidebarBrand } from "@/blocks/sidebar-shared/sidebar-brand"
import { Icon } from "@/components/ui/icon"
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const LINKS = [
  { title: "Notes", icon: "file-text", isActive: true },
  { title: "Calendar", icon: "calendar" },
  { title: "Inbox", icon: "inbox" },
]

export function AppSidebar({ onOpenSettings, ...props }: React.ComponentProps<typeof Sidebar> & { onOpenSettings: (opener: HTMLElement) => void }) {
  return (
    <Sidebar role="navigation" aria-label="Main" {...props}>
      <SidebarHeader>
        <SidebarBrand title="Looseleaf Studio" subtitle="Notebook" icon="book-open" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {LINKS.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <a href={`#${item.title.toLowerCase()}`}>
                    <Icon name={item.icon} />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={(event) => onOpenSettings(event.currentTarget)} aria-haspopup="dialog">
                <Icon name="settings" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
