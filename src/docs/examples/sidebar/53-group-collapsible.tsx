import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  title: "Collapsible group",
  description:
    "Official `sidebar-group-collapsible`: the group label becomes the trigger of a Collapsible (`SidebarGroupLabel asChild` around `CollapsibleTrigger`), with a chevron that turns over as it opens. The label wears the highlighter on hover, where shadcn tints it with the accent colour.",
  layout: "full" as const,
  height: 230,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="relative h-[230px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-group-collapsible">
          <SidebarContent>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild className="cursor-pointer text-sm hover:ll-swipe">
                  <CollapsibleTrigger>
                    Help
                    <Icon name="chevron-down" className="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
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
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
