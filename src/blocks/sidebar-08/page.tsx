import { AppSidebar } from "@/blocks/sidebar-08/components/sidebar-08-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={c.provider}>
      <AppSidebar className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader crumbs={[{ label: "Sketchbook", href: "#sketchbook" }, "Recent"]} />
        <PageBody title="Recent sketches" kicker="Sketchbook">
          <PageNote title="Two sheets on the desk" pose="search">
            The pad keeps its distance and the page rests beside it; on a phone the pad slides in over it. Fold a row open to look inside.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
