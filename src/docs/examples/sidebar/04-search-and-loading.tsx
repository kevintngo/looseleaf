import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Search and loading",
  description:
    "A long menu stays cheap: 40 notebooks are 40 list items with no drawing each, only the current one draws its mark. The search field filters them, the plus on the label adds one, and Reload shows loading rows (their widths come from a seed, so they are the same on the server and the client).",
  layout: "full" as const,
  height: 560,
  stage: "desk" as const,
}

const BASE = ["Field notes", "Garden log", "Recipes", "Trip to Lisbon", "Sketches", "Reading list", "Letters", "Budget"]
const ALL = Array.from({ length: 40 }, (_, i) => `${BASE[i % BASE.length]}${i >= BASE.length ? ` ${Math.floor(i / BASE.length) + 1}` : ""}`)

export default function Example() {
  const [q, setQ] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [current, setCurrent] = React.useState(ALL[0])
  const [extra, setExtra] = React.useState<string[]>([])
  const names = [...extra, ...ALL].filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()))

  function reload() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1400)
  }

  return (
    <div className="relative h-[560px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="search">
          <SidebarHeader>
            <SidebarInput aria-label="Search notebooks" placeholder="Search notebooks…" value={q} onChange={(e) => setQ(e.target.value)} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Notebooks</SidebarGroupLabel>
              <SidebarGroupAction aria-label="New notebook" onClick={() => setExtra((e) => [`Untitled ${e.length + 1}`, ...e])}>
                <Icon name="plus" />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {loading
                    ? Array.from({ length: 7 }, (_, i) => (
                        <SidebarMenuItem key={i}>
                          <SidebarMenuSkeleton showIcon seed={`sk-${i}`} />
                        </SidebarMenuItem>
                      ))
                    : names.map((name) => (
                        <SidebarMenuItem key={name}>
                          <SidebarMenuButton isActive={current === name} onClick={() => setCurrent(name)}>
                            <Icon name="file-text" />
                            <span>{name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  {!loading && names.length === 0 ? <li className="px-2 py-1.5 text-sm text-muted-foreground">No notebook matches “{q}”.</li> : null}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="gap-3 p-4">
          <h2 className="font-script text-2xl leading-none font-semibold">{current}</h2>
          <p className="max-w-sm text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Loading notebooks…" : `${names.length} notebooks shown.`}
          </p>
          <Button variant="outline" size="sm" className="w-fit" onClick={reload} disabled={loading}>
            <Icon name="rotate-cw" /> Reload
          </Button>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
