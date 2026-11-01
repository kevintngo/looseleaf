import { AppSidebar } from "@/blocks/sidebar-16/components/sidebar-16-app-sidebar"
import { SiteHeader } from "@/blocks/sidebar-16/components/sidebar-16-site-header"
import { containedClasses } from "@/blocks/sidebar-shared/sidebar-contained"
import { PageBody, PageNote, PageSheet } from "@/blocks/sidebar-shared/sidebar-page"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function Page({ contained = false }: { contained?: boolean }) {
  const c = containedClasses(contained)
  return (
    <div className={cn("[--header-height:calc(--spacing(14))]", contained && "h-full")}>
      <SidebarProvider className={cn("flex-col overflow-x-clip", c.provider)}>
        <SiteHeader />
        <div className="flex min-h-0 flex-1">
          <AppSidebar contained={contained} />
          <PageSheet className={c.inset}>
            <PageBody title="Margins" kicker="Writing on paper">
              <PageNote title="Header on top, pad below" pose="wave">
                The strip across the top belongs to the whole window, so the search box is always in reach, wherever you have scrolled to.
              </PageNote>
            </PageBody>
          </PageSheet>
        </div>
      </SidebarProvider>
    </div>
  )
}
