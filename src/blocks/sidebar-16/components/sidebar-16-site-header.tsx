import { docsTrail } from "@/blocks/sidebar-shared/sidebar-data"
import { SearchForm } from "@/blocks/sidebar-shared/sidebar-search-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const STRIP = "ll-paper ll-stock-paper ll-tooth-cold [--ll-sheet-shadow:var(--ll-shadow-hair)]"

export function SiteHeader() {
  return (
    <header data-slot="site-header" className={`sticky top-0 z-50 flex w-full items-center ${STRIP}`}>
      <div className="relative flex h-(--header-height) w-full items-center gap-2 px-4">
        <SidebarTrigger className="size-8" />
        <Separator orientation="vertical" className="me-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#writing-on-paper">{docsTrail[0]}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{docsTrail[1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm variant="bar" placeholder="Type to search..." className="w-full sm:ms-auto sm:w-auto" />
        <Separator className="absolute inset-x-0 bottom-0 w-auto" />
      </div>
    </header>
  )
}
