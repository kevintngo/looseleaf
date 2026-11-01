import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Controlled and loading",
  description:
    "Official `sidebar-controlled` and `sidebar-rsc` in one pad. Controlled: `open` and `onOpenChange` on the provider, with the state kept in the page so any button can open and close the pad. Loading: `SidebarMenuSkeleton` rows (with icons) stand in while the projects load, then are swapped for the list. The original's loading is a React Server Component behind Suspense, which a client-only page cannot show, so a timer stands in for the fetch. Reload runs it again.",
  layout: "full" as const,
  height: 360,
  stage: "desk" as const,
}

const projects = [
  { name: "Design Engineering", url: "#sidebar-loading-design", icon: "frame" },
  { name: "Sales & Marketing", url: "#sidebar-loading-sales", icon: "chart-pie" },
  { name: "Travel", url: "#sidebar-loading-travel", icon: "map" },
  { name: "Support", url: "#sidebar-loading-support", icon: "life-buoy" },
  { name: "Feedback", url: "#sidebar-loading-feedback", icon: "send" },
]

export default function Example() {
  const [open, setOpen] = React.useState(true)
  const [loaded, setLoaded] = React.useState(false)
  const [round, setRound] = React.useState(0)

  React.useEffect(() => {
    setLoaded(false)
    const timer = setTimeout(() => setLoaded(true), 2000)
    return () => clearTimeout(timer)
  }, [round])

  return (
    <div className="relative h-[360px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider open={open} onOpenChange={setOpen} className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-controlled">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent aria-busy={!loaded}>
                <SidebarMenu>
                  {loaded
                    ? projects.map((project) => (
                        <SidebarMenuItem key={project.name}>
                          <SidebarMenuButton asChild>
                            <a href={project.url}>
                              <Icon name={project.icon} />
                              <span>{project.name}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    : projects.map((project) => (
                        <SidebarMenuItem key={project.name}>
                          <SidebarMenuSkeleton showIcon seed={project.name} />
                        </SidebarMenuItem>
                      ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center justify-between px-4">
            <Button onClick={() => setOpen((o) => !o)} size="sm" variant="ghost">
              {open ? <Icon name="panel-left-close" /> : <Icon name="panel-left-open" />}
              <span>{open ? "Close" : "Open"} Sidebar</span>
            </Button>
            <Button onClick={() => setRound((r) => r + 1)} size="sm" variant="outline" disabled={!loaded}>
              <Icon name="rotate-cw" />
              Reload
            </Button>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
