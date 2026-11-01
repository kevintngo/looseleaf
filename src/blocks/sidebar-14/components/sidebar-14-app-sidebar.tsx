import * as React from "react"

import { pageOutline } from "@/blocks/sidebar-shared/sidebar-data"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar role="navigation" aria-label="On this page" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Table of contents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pageOutline.map((heading) => (
                <SidebarMenuItem key={heading.title}>
                  <SidebarMenuButton asChild>
                    <a href={heading.url} className="font-bold">
                      {heading.title}
                    </a>
                  </SidebarMenuButton>
                  {heading.items.length ? (
                    <SidebarMenuSub>
                      {heading.items.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={item.isActive} className="h-auto min-h-7 py-0.5 leading-snug">
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
