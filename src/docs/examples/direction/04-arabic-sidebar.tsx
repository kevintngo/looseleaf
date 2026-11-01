import { Button } from "@/components/ui/button"
import { DirectionProvider } from "@/components/ui/direction"
import { Icon } from "@/components/ui/icon"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const meta = {
  title: "Arabic: sidebar",
  description:
    "The pad hangs on the right, where a right-to-left page keeps its margin: side=\"right\" is a physical side, so you choose it. The clip, the highlighter, the bracket, the panel icon and the sheet on a phone all follow.",
  layout: "full" as const,
  height: 520,
  stage: "desk" as const,
}

const PAGES = [
  { title: "الرئيسية", icon: "house", active: true },
  { title: "الملاحظات", icon: "file-text", count: "12" },
  { title: "الأصدقاء", icon: "users" },
  { title: "الإعدادات", icon: "settings" },
]

export default function Example() {
  return (
    <DirectionProvider direction="rtl">
      <div lang="ar" className="relative h-[520px] w-full overflow-hidden [transform:translateZ(0)]">
        <SidebarProvider className="h-full min-h-0">
          <Sidebar side="right" className="h-full" seed="direction-sidebar">
            <SidebarHeader className="font-script text-2xl font-semibold">دفتري</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="tracking-normal">الصفحات</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {PAGES.map((page) => (
                      <SidebarMenuItem key={page.title}>
                        <SidebarMenuButton isActive={page.active} tooltip={page.title}>
                          <Icon name={page.icon} />
                          <span>{page.title}</span>
                        </SidebarMenuButton>
                        {page.count ? <SidebarMenuBadge>{page.count}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="font-script text-2xl leading-none font-semibold">مرحبًا بك</h2>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">الشريط الجانبي على يمين الصفحة. اطوِه بالزر، أو بالاختصار Ctrl/Cmd+B.</p>
            <Button variant="secondary" size="sm" className="mt-4 w-fit">
              <Icon name="sparkles" /> ابدأ
            </Button>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </DirectionProvider>
  )
}
