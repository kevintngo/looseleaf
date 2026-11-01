import * as React from "react"

import { docsNav, docsVersions } from "@/blocks/sidebar-shared/sidebar-data"
import { SearchForm } from "@/blocks/sidebar-shared/sidebar-search-form"
import { VersionSwitcher } from "@/blocks/sidebar-shared/sidebar-version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar role="navigation" aria-label="Field guide" {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={docsVersions} defaultVersion={docsVersions[0]!} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="[&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!">
        {docsNav.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
