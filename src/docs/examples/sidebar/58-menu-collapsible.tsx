import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icon } from "@/components/ui/icon"
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
  title: "Menu collapsible",
  description:
    "Official `sidebar-menu-collapsible`: the same table of contents with each section folding open and shut. The first section starts open. The original wraps each item in a `div`, which is not valid inside a `ul`; `Collapsible asChild` here lets the `li` itself be the collapsible, so the list markup stays valid and the chevron still turns from `group-data-[state=open]/collapsible`.",
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
        <Sidebar className="h-full" seed="official-menu-collapsible">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item, index) => (
                    <Collapsible key={item.title} asChild className="group/collapsible" defaultOpen={index === 0}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <span>{item.title}</span>
                            <Icon name="chevron-right" className="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem}>
                                <SidebarMenuSubButton asChild isActive={subItem === active}>
                                  <a href={`#sidebar-collapsible-${slug(subItem)}`} aria-current={subItem === active ? "page" : undefined}>
                                    <span>{subItem}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
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
