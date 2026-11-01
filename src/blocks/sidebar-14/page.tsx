import { AppSidebar } from "@/blocks/sidebar-14/components/sidebar-14-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { docsTrail } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={cn("overflow-x-clip", c.provider)}>
      <PageSheet className={c.inset}>
        <PageHeader crumbs={docsTrail} trigger="end" bordered />
        <PageBody title="Margins" kicker="Writing on paper">
          <PageNote title="Read it from the right" pose="peek">
            The pad on this side lists what is on the page. Fold it away with the button in the corner when you would rather just read.
          </PageNote>
        </PageBody>
      </PageSheet>
      <AppSidebar side="right" className={c.sidebar} />
    </SidebarProvider>
  )
}
