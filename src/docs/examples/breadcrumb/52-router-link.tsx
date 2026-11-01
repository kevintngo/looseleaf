import * as React from "react"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "With your router's Link",
  description:
    "BreadcrumbLink asChild hands the highlighter, spacing and focus ring to whatever element you give it. Here that is a Link that changes the path without loading a page (a stand-in for next/link, React Router or TanStack Router); the trail is built from the path.",
  layout: "stack" as const,
}

const TITLES: Record<string, string> = { docs: "Docs", components: "Components", breadcrumb: "Breadcrumb", button: "Button", card: "Card", calendar: "Calendar" }

function Link({ href = "/", onNavigate, onClick, ...props }: React.ComponentProps<"a"> & { onNavigate: (to: string) => void }) {
  return (
    <a
      href={`#path${href.replaceAll("/", "-")}`}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        e.preventDefault()
        onNavigate(href)
      }}
      {...props}
    />
  )
}

export default function Example() {
  const [path, setPath] = React.useState("/docs/components/breadcrumb")
  const parts = path.split("/").filter(Boolean)
  const trail = [{ href: "/", title: "Home" }, ...parts.map((p, i) => ({ href: `/${parts.slice(0, i + 1).join("/")}`, title: TITLES[p] ?? p }))]

  return (
    <div className="grid justify-items-start gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {i < trail.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} onNavigate={setPath}>
                      {crumb.title}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage seed={crumb.href}>{crumb.title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < trail.length - 1 ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm" variant="outline" onClick={() => setPath("/docs/components/button")}>
          Open Button
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPath("/docs/components/card")}>
          Open Card
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPath("/docs/components/calendar")}>
          Open Calendar
        </Button>
      </div>
      <p className="font-mono text-sm text-muted-foreground" role="status">
        path: {path}
      </p>
    </div>
  )
}
