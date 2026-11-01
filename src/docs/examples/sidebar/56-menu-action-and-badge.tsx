import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Menu action and badge",
  description:
    "Official `sidebar-menu-action` and `sidebar-menu-badge` in one pad. Top group: each row has a `SidebarMenuAction` (a small button that opens a menu), and the row keeps the highlighter while its menu is open. Bottom group: a `SidebarMenuBadge` writes a count in the margin in blue felt tip. Action and badge share the same corner, so a row takes one or the other.",
  layout: "full" as const,
  height: 380,
  stage: "desk" as const,
}

const projects = [
  { name: "Design Engineering", url: "#sidebar-action-design", icon: "frame" },
  { name: "Sales & Marketing", url: "#sidebar-action-sales", icon: "chart-pie" },
  { name: "Travel", url: "#sidebar-action-travel", icon: "map" },
]

const unread = [
  { name: "Support", url: "#sidebar-badge-support", icon: "life-buoy", badge: "21" },
  { name: "Feedback", url: "#sidebar-badge-feedback", icon: "send", badge: "8" },
  { name: "Travel", url: "#sidebar-badge-travel", icon: "map", badge: "3" },
]

export default function Example() {
  return (
    <div className="relative h-[380px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-menu-action">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.name}>
                      <SidebarMenuButton asChild className="group-has-[[data-state=open]]/menu-item:ll-swipe">
                        <a href={project.url}>
                          <Icon name={project.icon} />
                          <span>{project.name}</span>
                        </a>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction>
                            <Icon name="ellipsis" />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem>
                            <span>Edit Project</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Unread</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {unread.map((project) => (
                    <SidebarMenuItem key={project.name}>
                      <SidebarMenuButton asChild>
                        <a href={project.url}>
                          <Icon name={project.icon} />
                          <span>{project.name}</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{project.badge}</SidebarMenuBadge>
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
