import { appNav, appProjects, appSecondary, appTeams, appUser } from "@/blocks/sidebar-shared/sidebar-data"
import { NavMainFolds, NavProjects, NavSecondary } from "@/blocks/sidebar-shared/sidebar-nav-app"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SearchForm } from "@/blocks/sidebar-shared/sidebar-search-form"
import { TeamSwitcher } from "@/blocks/sidebar-shared/sidebar-team-switcher"
import { NavUser } from "@/blocks/sidebar-shared/sidebar-user-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarRail } from "@/components/ui/sidebar"
import { SidebarFrame } from "./_sidebar-frame"

export default function SidebarSharedPreview() {
  return (
    <SidebarFrame>
      <SidebarProvider className="h-full min-h-0">
        <Sidebar role="navigation" aria-label="Studio" className="h-full">
          <SidebarHeader>
            <TeamSwitcher teams={appTeams} />
            <SearchForm placeholder="Search the studio..." />
          </SidebarHeader>
          <SidebarContent>
            <NavMainFolds items={appNav} />
            <NavProjects projects={appProjects} />
            <NavSecondary items={appSecondary} small className="mt-auto" />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={appUser} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <PageSheet className="overflow-y-auto">
          <PageHeader crumbs={["Parts", "Sidebar kit"]} bordered />
          <PageBody title="Sidebar kit" kicker="Shared by sidebar-01 to sidebar-16">
            <PageNote title="Take what you need" pose="carry">
              Team switcher, search box, account menu, project and secondary lists, calendar, page header, this note. They come with any sidebar block; copy them into your app as they are.
            </PageNote>
          </PageBody>
        </PageSheet>
      </SidebarProvider>
    </SidebarFrame>
  )
}
