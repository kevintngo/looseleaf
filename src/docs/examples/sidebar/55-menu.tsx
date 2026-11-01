import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Menu",
  description:
    "Official `sidebar-menu`: five projects as `SidebarMenuButton asChild` around links. Each row carries its own line of the pad's ruling, painted by CSS, so this list costs no drawing per row; only a current page (`isActive`) draws a mark.",
  layout: "full" as const,
  height: 260,
  stage: "desk" as const,
}

const projects = [
  { name: "Design Engineering", url: "#sidebar-menu-design", icon: "frame" },
  { name: "Sales & Marketing", url: "#sidebar-menu-sales", icon: "chart-pie" },
  { name: "Travel", url: "#sidebar-menu-travel", icon: "map" },
  { name: "Support", url: "#sidebar-menu-support", icon: "life-buoy" },
  { name: "Feedback", url: "#sidebar-menu-feedback", icon: "send" },
]

export default function Example() {
  return (
    <div className="relative h-[260px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-menu">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.name}>
                      <SidebarMenuButton asChild>
                        <a href={project.url}>
                          <Icon name={project.icon} />
                          <span>{project.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
