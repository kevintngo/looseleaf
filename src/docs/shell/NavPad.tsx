import { useRef } from "react"
import { Fastener } from "@/components/ui/paper"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Sidebar, useSidebar } from "@/components/ui/sidebar"
import { SideNav } from "./SideNav"
import { LogoMark } from "./LogoMark"

export function NavPad() {
  return (
    <div id="site-nav" className="dk-sidebar sticky top-[4.75rem] mt-5 hidden h-[calc(100dvh-5.75rem)] w-64 shrink-0 md:block print:hidden">
      <Sidebar collapsible="none" stock="pad" seed="docs-pad" className="pt-6">
        <Fastener kind="binder-clip" size={38} seed="docs-pad|clip" className="absolute start-1/2 -top-3.5 -ms-[19px] calm:hidden forced-colors:hidden" />
        <SideNav />
      </Sidebar>
    </div>
  )
}

export function MobileNav() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const opener = useRef<HTMLElement | null>(null)
  const content = useRef<HTMLDivElement>(null)
  if (!isMobile) return null
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        ref={content}
        id="site-nav"
        side="left"
        stock="pad"
        binding="none"
        className="dk-sidebar w-72 max-w-[85vw] gap-2 pt-4"
        onOpenAutoFocus={(event) => {
          opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          const current = content.current?.querySelector<HTMLElement>('[aria-current="page"]')
          if (current) {
            event.preventDefault()
            current.focus({ preventScroll: true })
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          opener.current?.focus({ preventScroll: true })
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a[href]")) setOpenMobile(false)
        }}
      >
        <SheetHeader className="flex-row items-center gap-2 pb-0">
          <LogoMark size={34} />
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">The pages of the documentation.</SheetDescription>
        </SheetHeader>
        <SideNav />
      </SheetContent>
    </Sheet>
  )
}
