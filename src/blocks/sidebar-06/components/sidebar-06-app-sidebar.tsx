import * as React from "react"

import { NavMain } from "@/blocks/sidebar-06/components/sidebar-06-nav-main"
import { SidebarOptInForm } from "@/blocks/sidebar-06/components/sidebar-06-opt-in-form"
import { SidebarBrand } from "@/blocks/sidebar-shared/sidebar-brand"
import { docsNav } from "@/blocks/sidebar-shared/sidebar-data"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar role="navigation" aria-label="Field guide" {...props}>
      <SidebarHeader>
        <SidebarBrand title="Field guide" subtitle="v1.0.0" icon="book-open" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={docsNav} />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1 [@media(max-height:34rem)]:hidden">
          <SidebarOptInForm />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
