import * as React from "react"

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"

export const meta = {
  title: "Links only",
  description: "No panels: a strip of links. In the strip a link is a tab like the triggers, and the current page (active) is filled with highlighter with aria-current. Arrow keys walk the tabs; asChild puts the tab on your router's link.",
  layout: "center" as const,
}

const PAGES = ["Overview", "Notebooks", "Stickers", "Settings"]

export default function Example() {
  const [page, setPage] = React.useState("Notebooks")
  return (
    <div className="grid justify-items-center gap-4">
      <NavigationMenu aria-label="Sections">
        <NavigationMenuList>
          {PAGES.map((p) => (
            <NavigationMenuItem key={p}>
              <NavigationMenuLink asChild active={page === p} seed={p}>
                <a
                  href={`#${p}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p)
                  }}
                >
                  {p}
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        You are on {page}.
      </p>
    </div>
  )
}
