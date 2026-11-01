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
  title: "Group",
  description:
    "Official `sidebar-group`: a `SidebarGroup` is a label (a typewriter kicker) over a menu. Two buttons here; a pad can hold as many groups as it likes. Like the original, this one has no inset page beside it.",
  layout: "full" as const,
  height: 230,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="relative h-[230px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-group">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Help</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Icon name="life-buoy" />
                      Support
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Icon name="send" />
                      Feedback
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
