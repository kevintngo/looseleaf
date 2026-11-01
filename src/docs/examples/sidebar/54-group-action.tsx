import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Toaster, toast } from "@/components/ui/sonner"

export const meta = {
  title: "Group action",
  description:
    "Official `sidebar-group-action`: a `SidebarGroupAction` is a small button in the corner of a group, next to its label. Here the plus posts a toast. The original parks the Toaster at the bottom left with a margin to clear the sidebar; inside this frame it sits at the bottom right instead.",
  layout: "full" as const,
  height: 250,
  stage: "desk" as const,
}

const ID = "sidebar-group-action"

export default function Example() {
  return (
    <div className="relative h-[250px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Toaster id={ID} position="bottom-right" />
        <Sidebar className="h-full" seed="official-group-action">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupAction title="Add Project" onClick={() => toast("You clicked the group action!", { toasterId: ID })}>
                <Icon name="plus" /> <span className="sr-only">Add Project</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#sidebar-group-action-design">
                        <Icon name="frame" />
                        <span>Design Engineering</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#sidebar-group-action-sales">
                        <Icon name="chart-pie" />
                        <span>Sales & Marketing</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#sidebar-group-action-travel">
                        <Icon name="map" />
                        <span>Travel</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
