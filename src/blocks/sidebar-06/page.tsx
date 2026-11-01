import { AppSidebar } from "@/blocks/sidebar-06/components/sidebar-06-app-sidebar"
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
          <PageNote title="Pick a section" pose="point">
            Each heading on the pad opens a small menu of its pages. Choose one and it lands here.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
