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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Demo",
  description:
    "Official `sidebar-demo`: one group of five links and an inset with the trigger. The pad hangs from a binder clip and every link wears the highlighter when pointed at. The outer frame is only there so the fixed pad stays inside this preview (in an app the provider goes at the root); try Ctrl/Cmd+B.",
  layout: "full" as const,
  height: 320,
  stage: "desk" as const,
}

const items = [
  { title: "Home", url: "#sidebar-demo-home", icon: "house" },
  { title: "Inbox", url: "#sidebar-demo-inbox", icon: "inbox" },
  { title: "Calendar", url: "#sidebar-demo-calendar", icon: "calendar" },
  { title: "Search", url: "#sidebar-demo-search", icon: "search" },
  { title: "Settings", url: "#sidebar-demo-settings", icon: "settings" },
]

export default function Example() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-demo">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <Icon name={item.icon} />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center justify-between px-4">
            <SidebarTrigger />
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
