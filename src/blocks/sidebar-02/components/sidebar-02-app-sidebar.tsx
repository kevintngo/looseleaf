import * as React from "react"

import { docsNav, docsVersions } from "@/blocks/sidebar-shared/sidebar-data"
import { SearchForm } from "@/blocks/sidebar-shared/sidebar-search-form"
import { VersionSwitcher } from "@/blocks/sidebar-shared/sidebar-version-switcher"
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/ui/collapsible"
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
      <SidebarContent className="gap-0 [&_[data-slot=sidebar-menu-button-mark]]:overflow-visible!">
        {docsNav.map((section) => (
          <Collapsible key={section.title} defaultOpen>
            <SidebarGroup>
              <SidebarGroupLabel asChild className="w-full text-sm text-sidebar-foreground hover:ll-swipe focus-visible:ll-swipe">
                <CollapsibleTrigger>
                  {section.title}
                  <CollapsibleIndicator className="ms-auto" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
