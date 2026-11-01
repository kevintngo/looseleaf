import * as React from "react"

import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const meta = {
  title: "Responsive: menu or drawer",
  description:
    "A deep path keeps its first and last two crumbs and folds the rest. The fold opens a dropdown on a wide screen and a drawer on a phone, from one component: the query is read with useSyncExternalStore, so the server renders the wide version and a phone swaps after hydration.",
  layout: "center" as const,
}

const ITEMS = [
  { href: "#home", label: "Home" },
  { href: "#docs", label: "Documentation" },
  { href: "#build", label: "Build your application" },
  { href: "#fetching", label: "Data fetching" },
  { label: "Caching and revalidating" },
]

const ITEMS_TO_DISPLAY = 3

function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", notify)
      return () => mq.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}

export default function Example() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const folded = ITEMS.slice(1, -ITEMS_TO_DISPLAY + 1)
  const tail = ITEMS.slice(-ITEMS_TO_DISPLAY + 1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={ITEMS[0].href}>{ITEMS[0].label}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {ITEMS.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger className="-mx-1 flex items-center gap-1 px-1 hover:ll-swipe focus-visible:ll-swipe data-[state=open]:ll-swipe" aria-label="Toggle menu">
                    <BreadcrumbEllipsis className="size-6" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {folded.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <a href={item.href}>{item.label}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger className="-mx-1 flex items-center px-1 hover:ll-swipe focus-visible:ll-swipe" aria-label="Toggle menu">
                    <BreadcrumbEllipsis className="size-6" />
                  </DrawerTrigger>
                  <DrawerContent seed="crumbs">
                    <DrawerHeader className="text-start">
                      <DrawerTitle>Navigate to</DrawerTitle>
                      <DrawerDescription>Select a page to navigate to.</DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {folded.map((item) => (
                        <a key={item.label} href={item.href} className="py-1 hover:ll-swipe focus-visible:ll-swipe">
                          {item.label}
                        </a>
                      ))}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        {tail.map((item, i) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href} className="max-w-20 truncate md:max-w-none">
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage seed="responsive" className="max-w-20 truncate md:max-w-none">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {i < tail.length - 1 ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
