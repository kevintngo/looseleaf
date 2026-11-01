import { AppSidebar } from "@/blocks/sidebar-05/components/sidebar-05-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { docsTrail } from "@/blocks/sidebar-shared/sidebar-data"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={c.provider}>
      <AppSidebar className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={docsTrail} bordered className="overflow-x-clip" />
        <PageBody title="Margins" kicker="Writing on paper">
          <PageNote title="Plus opens, minus closes" pose="wave">
            Open a section on the pad to see its pages. Only one is open to begin with, so the list stays short.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
