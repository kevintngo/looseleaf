import * as React from "react"

import { BrandTile, BrandText } from "@/blocks/sidebar-shared/sidebar-brand"
import { appNav, appProjects, appSecondary, appUser } from "@/blocks/sidebar-shared/sidebar-data"
import { NavMainFolds, NavProjects, NavSecondary } from "@/blocks/sidebar-shared/sidebar-nav-app"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" role="navigation" aria-label="Studio" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#studio">
                <BrandTile icon="book-open" />
                <BrandText title="Looseleaf Studio" subtitle="Notebook" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="[&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!">
        <NavMainFolds items={appNav} />
        <NavProjects projects={appProjects} />
        <NavSecondary items={appSecondary} small className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={appUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
