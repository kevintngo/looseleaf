import * as React from "react"

import { BrandTile, BrandText } from "@/blocks/sidebar-shared/sidebar-brand"
import { appNav, appProjects, appSecondary, appUser } from "@/blocks/sidebar-shared/sidebar-data"
import { NavMainFolds, NavProjects, NavSecondary } from "@/blocks/sidebar-shared/sidebar-nav-app"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function AppSidebar({ contained = false, className, ...props }: React.ComponentProps<typeof Sidebar> & { contained?: boolean }) {
  return (
    <Sidebar
      role="navigation"
      aria-label="Studio"
      className={cn("top-(--header-height)", contained ? "h-[calc(100%-var(--header-height))]!" : "h-[calc(100svh-var(--header-height))]!", className)}
      {...props}
    >
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
      <SidebarContent>
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
