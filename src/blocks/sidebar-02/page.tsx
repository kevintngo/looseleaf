import { AppSidebar } from "@/blocks/sidebar-02/components/sidebar-02-app-sidebar"
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
        <PageHeader crumbs={docsTrail} sticky bordered className="overflow-x-clip" />
        <PageBody title="Margins" kicker="Writing on paper">
          <PageNote title="Fold what you are not reading" pose="think">
            Every heading on the pad folds shut. Tidy the shelf, and the page you want is one glance away.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
