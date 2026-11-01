import { AppSidebar } from "@/blocks/sidebar-07/components/sidebar-07-app-sidebar"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageHeader, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <SidebarProvider className={c.provider}>
      <AppSidebar className={c.sidebar} />
      <PageSheet className={c.inset}>
        <PageHeader
          crumbs={[{ label: "Sketchbook", href: "#sketchbook" }, "Recent"]}
          className="transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        />
        <PageBody title="Recent sketches" kicker="Sketchbook">
          <PageNote title="Nothing sketched today" pose="sketch">
            The button above squeezes the pad down to icons so the page gets all the room. On a phone it opens the pad instead.
          </PageNote>
        </PageBody>
      </PageSheet>
    </SidebarProvider>
  )
}
