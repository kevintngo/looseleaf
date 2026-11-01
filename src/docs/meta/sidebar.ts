import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "sidebar",
  title: "Sidebar",
  category: "Navigation",
  description:
    "An order pad hung from the top of the screen: cream paper with a torn top edge and a binder clip. Rows carry their own line of the pad's ruling, hover is the highlighter, and the current page is marked with a highlighter swipe and a bracket in the margin. It collapses to icons or slides away, becomes a sheet on phones, and stays cheap for a long menu: only the one active row draws anything.",
  status: "stable",
  upstream: "sidebar",
  parts: [
    {
      name: "SidebarProvider",
      description: "Holds the open state (cookie `sidebar_state`, 7 days), the Ctrl/Cmd+B shortcut, the phone sheet's state and a TooltipProvider. Set the widths with `--sidebar-width` and `--sidebar-width-icon` in `style`.",
      props: [
        { name: "defaultOpen", type: "boolean", default: "true", description: "Initial state when uncontrolled. Read the cookie on the server to restore it." },
        { name: "open / onOpenChange", type: "boolean / (open: boolean) => void", description: "Controlled state." },
      ],
    },
    {
      name: "Sidebar",
      description:
        "The pad. Desktop: a fixed container beside a gap that reserves its width, holding the pad (a Paper: order-pad stock, torn top edge drawn, binder clip). Phone: the same pad in a Sheet. `className` and props go to the fixed container, as upstream.",
      props: [
        { name: "side", type: '"left" | "right"', default: '"left"', description: "Which edge it hangs on." },
        { name: "variant", type: '"sidebar" | "floating" | "inset"', default: '"sidebar"', description: "`sidebar` docks to the edge and casts its shadow toward the page; `floating` is set down on the desk a little turned; `inset` leaves room around the pad and turns SidebarInset into a sheet of paper." },
        { name: "collapsible", type: '"offcanvas" | "icon" | "none"', default: '"offcanvas"', description: "Slide away, shrink to icons (3rem, labels fade, the margin bracket hides), or never collapse." },
        { name: "stock", type: "StockName", default: '"pad"', description: "What the pad is made of. A stock with a cut edge (`paper`, `kraft`...) is a pure CSS sheet." },
        { name: "clip", type: "boolean", default: "true (false with collapsible=\"none\")", description: "The binder clip at the top. A docked pad hangs it in the gutter above the torn edge; the phone sheet and a `collapsible=\"none\"` pad have no gutter, so the clip stands on the paper and the pad's top padding grows to clear it (`collapsible=\"none\"` is opt-in, since a static pad sits wherever you put it). Never drawn in calm density or when collapsed to icons." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always tears and clips the pad the same way." },
      ],
    },
    { name: "SidebarTrigger", description: "A ghost icon Button with a drawn panel glyph that toggles the sidebar (the sheet on phones). Takes every Button prop." },
    { name: "SidebarRail", description: "A thin strip on the pad's edge that toggles it on click. Not in the tab order (the trigger and Ctrl/Cmd+B are the keyboard routes)." },
    { name: "SidebarInset", description: "The page beside the pad, a `main` region. With `variant=\"inset\"` on the Sidebar it is a sheet of paper on the desk from the `md` breakpoint up (a CSS sheet: no SVG); with any other variant, and on a phone, the sheet is switched off. Pass `before:block` in `className` to keep the sheet beside every pad." },
    { name: "SidebarHeader", description: "Top of the pad: a column with 8 px padding." },
    { name: "SidebarFooter", description: "Bottom of the pad." },
    { name: "SidebarContent", description: "The scrolling middle. It does not scroll when collapsed to icons." },
    { name: "SidebarSeparator", description: "A pencil rule (the Separator component)." },
    { name: "SidebarInput", description: "An Input sized for the pad (32 px)." },
    { name: "SidebarGroup", description: "A section of the pad." },
    { name: "SidebarGroupLabel", description: "The section's heading, in the typewriter. It fades and closes up when collapsed to icons.", props: [{ name: "asChild", type: "boolean", default: "false", description: "Render your element (a Collapsible trigger, say)." }] },
    { name: "SidebarGroupAction", description: "A small button at the end of the group's label row.", props: [{ name: "asChild", type: "boolean", default: "false", description: "Render your element." }] },
    { name: "SidebarGroupContent", description: "Wraps a group's menu." },
    { name: "SidebarMenu", description: "The list (`ul`) of rows." },
    { name: "SidebarMenuItem", description: "One row (`li`)." },
    {
      name: "SidebarMenuButton",
      description:
        "The row's button, or your link with `asChild`. Not an ink host: hover and keyboard focus wear the highlighter as a CSS background, and a CSS gradient under it is the row's line of the pad's ruling (so the lines always meet the rows; hidden when collapsed to icons and in calm density). The current page (`isActive`) mounts one small drawing inside it, a highlighter swipe with a bracket in the margin; the `outline` variant draws a pencil box the same way.",
      props: [
        { name: "isActive", type: "boolean", default: "false", description: "Marks the current page: bold, highlighter, margin bracket, `data-active`. With `asChild` the link gets `aria-current=\"page\"` too." },
        { name: "variant", type: '"default" | "outline"', default: '"default"', description: "`outline` adds a pencil box." },
        { name: "size", type: '"default" | "sm" | "lg"', default: '"default"', description: "32, 28 or 48 px high." },
        { name: "tooltip", type: "string | TooltipContent props", description: "Names the row when the sidebar is collapsed to icons (never shown when expanded or on phones)." },
        { name: "asChild", type: "boolean", default: "false", description: "Render your link instead of a button; the mark lands inside it." },
      ],
    },
    { name: "SidebarMenuAction", description: "A small button at the end of a row.", props: [{ name: "showOnHover", type: "boolean", default: "false", description: "Only visible on hover or focus within the row (always visible on touch)." }, { name: "asChild", type: "boolean", default: "false", description: "Render your element (a DropdownMenuTrigger)." }] },
    { name: "SidebarMenuBadge", description: "A count at the end of a row, written in blue felt in the script font." },
    {
      name: "SidebarMenuSkeleton",
      description: "A loading row of pencil hatch. Its width is derived from the seed (50 to 90 %), not from a random number, so the server and the client agree.",
      props: [
        { name: "showIcon", type: "boolean", default: "false", description: "A square for the icon." },
        { name: "seed", type: "string | number", description: "Pins the width. Default: from useId()." },
      ],
    },
    { name: "SidebarMenuSub", description: "A nested list under a row, indented, with a pencil line drawn down its start edge (one small drawing per open sub-menu)." },
    { name: "SidebarMenuSubItem", description: "One sub-row (`li`)." },
    { name: "SidebarMenuSubButton", description: "The sub-row's link (`a`), or your element with `asChild`. The current one is bold on the highlighter. 28 px high for one line; a title that wraps makes its row taller instead of running over the next one (a trailing `span` still truncates).", props: [{ name: "isActive", type: "boolean", default: "false", description: "Marks the current page." }, { name: "size", type: '"sm" | "md"', default: '"md"', description: "15 or 16 px text." }, { name: "asChild", type: "boolean", default: "false", description: "Render your link." }] },
    { name: "useSidebar", description: "`{ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }`. Throws outside a SidebarProvider." },
  ],
  a11y: [
    "The sidebar adds no landmark of its own: wrap it in a `nav` (or give it `aria-label` on the Sidebar's container) so screen readers can find it. The rows are ordinary buttons and links in a list; `isActive` on a link (`asChild`) or a sub-menu button sets `aria-current=\"page\"` for you (pass your own to override; a plain button gets none); the drawing is decoration.",
    "Ctrl or Cmd + B toggles it from anywhere; the SidebarTrigger is a labelled button (\"Toggle Sidebar\"). The rail is not a tab stop. On phones the pad opens in a Sheet: a dialog named \"Sidebar\" that traps focus, closes with Escape or a tap on the scrim and gives focus back to whatever opened it (Radix only does that for its own Trigger, so the Sidebar remembers the opener itself). Growing the window past the phone width closes the sheet, so it does not come back by itself when the window shrinks again. Ctrl/Cmd+B is left alone when something nearer (a rich-text editor's Bold) has already handled the key.",
    "Keyboard focus on a row shows the highlighter and the theme's blue focus ring. Every row is at least 28 px high (32 by default); collapsed rows are 32 px squares, named by their tooltip and their text (keep the label in a `span` so it stays in the accessible name).",
    "When it collapses to icons the labels are hidden with CSS only, so the accessible names stay. Tooltips appear on hover and keyboard focus, never on touch.",
    "The torn edge, ruled lines, binder clip, bracket and sub-menu line are aria-hidden decoration with no pointer events. In forced-colors mode the clip is hidden and the drawings give way to real outlines. Reduced motion collapses the slide of the pad and the fade of the labels.",
    "The open state is remembered in the `sidebar_state` cookie; read it on the server to render the right state on first paint.",
  ],
  usage: `import { Icon } from "@/components/ui/icon"
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive tooltip="Home">
                    <a href="/">
                      <Icon name="house" />
                      <span>Home</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}`,
  related: ["sheet", "collapsible", "dropdown-menu", "tooltip", "navigation-menu", "breadcrumb"],
} satisfies ComponentDoc
