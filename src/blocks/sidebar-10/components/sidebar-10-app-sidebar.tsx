import * as React from "react"

import { notesFavorites, notesNav, notesSecondary, notesWorkspaces, appTeams } from "@/blocks/sidebar-shared/sidebar-data"
import { NavSecondary } from "@/blocks/sidebar-shared/sidebar-nav-app"
import { NavFavorites, NavLinks, NavWorkspaces } from "@/blocks/sidebar-shared/sidebar-nav-notes"
import { TeamSwitcher } from "@/blocks/sidebar-shared/sidebar-team-switcher"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar role="navigation" aria-label="Notes" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={appTeams} compact />
        <NavLinks items={notesNav} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={notesFavorites} />
        <NavWorkspaces workspaces={notesWorkspaces} />
        <NavSecondary items={notesSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
