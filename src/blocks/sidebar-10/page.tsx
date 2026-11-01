import { AppSidebar } from "@/blocks/sidebar-10/components/sidebar-10-app-sidebar"
import { NavActions } from "@/blocks/sidebar-10/components/sidebar-10-nav-actions"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={c.provider}>
      <AppSidebar className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={["Project plan & to-dos"]}>
          <NavActions />
        </PageHeader>
        <PageBody title="Project plan & to-dos" kicker="Favorites">
          <PageNote title="A blank page, for now" pose="write">
            Nothing on this page yet. Open the three dots up in the corner to see what you can do with it.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
