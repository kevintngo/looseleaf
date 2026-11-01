import * as React from "react"

import { NavMain } from "@/blocks/sidebar-07/components/sidebar-07-nav-main"
import { appNav, appProjects, appTeams, appUser } from "@/blocks/sidebar-shared/sidebar-data"
import { NavProjects } from "@/blocks/sidebar-shared/sidebar-nav-app"
import { TeamSwitcher } from "@/blocks/sidebar-shared/sidebar-team-switcher"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const nav = appNav.map((item) => ({ ...item, items: item.items?.map((sub) => ({ ...sub, isActive: sub.title === "Recent" })) }))

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" role="navigation" aria-label="Studio" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={appTeams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav} />
        <NavProjects projects={appProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={appUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
