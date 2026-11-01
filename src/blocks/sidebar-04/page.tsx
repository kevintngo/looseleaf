import * as React from "react"

import { AppSidebar } from "@/blocks/sidebar-04/components/sidebar-04-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { docsTrail } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={c.provider} style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={docsTrail} />
        <PageBody title="Margins" kicker="Writing on paper">
          <PageNote title="Two sheets on one desk" pose="sketch">
            The pad floats, the page rests. Nothing is stuck down. On a phone the pad slides in over the page instead.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
