import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Menu sub",
  description:
    "Official `sidebar-menu-sub`: a table of contents, each section a button over an indented `SidebarMenuSub` that is always open. A pencil line runs down the start of each sub-list. The content scrolls inside the pad when it is taller than the pad. The data is the original's, written as strings.",
  layout: "full" as const,
  height: 420,
  stage: "desk" as const,
}

const active = "Data Fetching"

const items = [
  { title: "Getting Started", items: ["Installation", "Project Structure"] },
  {
    title: "Build Your Application",
    items: ["Routing", "Data Fetching", "Rendering", "Caching", "Styling", "Optimizing", "Configuring", "Testing", "Authentication", "Deploying", "Upgrading", "Examples"],
  },
  { title: "API Reference", items: ["Components", "File Conventions", "Functions", "next.config.js Options", "CLI", "Edge Runtime"] },
  { title: "Architecture", items: ["Accessibility", "Fast Refresh", "Next.js Compiler", "Supported Browsers", "Turbopack"] },
]

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-")

export default function Example() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider className="h-full min-h-0">
        <Sidebar className="h-full" seed="official-menu-sub">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={`#sidebar-sub-${slug(item.title)}`}>
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem}>
                            <SidebarMenuSubButton asChild isActive={subItem === active}>
                              <a href={`#sidebar-sub-${slug(subItem)}`} aria-current={subItem === active ? "page" : undefined}>
                                <span>{subItem}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
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
