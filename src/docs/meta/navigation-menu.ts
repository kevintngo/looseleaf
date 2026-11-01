import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "navigation-menu",
  title: "Navigation Menu",
  category: "Navigation",
  description:
    "A site's top navigation as a strip of index dividers: pencil-sketched tabs standing on a pencil line, the open one lifted and washed with highlighter, the current page filled. Its panel drops from under the strip as a slip of paper that follows the size of what is inside, and a felt-tip underline slides along to the open tab. Hover intent, arrow keys and the motion between panels are Radix's.",
  status: "stable",
  upstream: "navigation-menu",
  parts: [
    {
      name: "NavigationMenu",
      description: "The Radix root (`nav`). Renders the shared viewport slip after its children unless told not to. The panel is not portalled: it hangs from the strip, so its `z-index` counts inside the nearest stacking context. Inside a Paper, a card or any other isolated header, give that element a z-index (`z-(--ll-z-raised)`) so the panel drops over the content that follows it.",
      props: [
        { name: "viewport", type: "boolean", default: "true", description: "One slip shared by every panel, resized to the open one (and the panels slide inside it). `false`: each panel is a slip of its own set down under its tab." },
        { name: "value / defaultValue / onValueChange", type: "string / string / (value: string) => void", description: "Which item is open." },
        { name: "delayDuration / skipDelayDuration", type: "number", default: "200 / 300", description: "Hover intent, in ms." },
        { name: "dir / orientation", type: "", description: "Radix's. The tabs, arrows and drawings follow the reading direction." },
      ],
    },
    { name: "NavigationMenuList", description: "The row of tabs (`ul`). It is the ink host of the pencil line they stand on." },
    { name: "NavigationMenuItem", description: "One entry: a trigger with its content, or a link (`li`)." },
    {
      name: "NavigationMenuTrigger",
      description: "A tab that opens a panel (a button, `aria-expanded`). Its drawing: a faint pencil sketch at rest, highlighter and felt under the pointer, lifted with a wash while open. The chevron turns over when it opens.",
      props: [
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same tab. Default: from useId()." },
        { name: "disabled", type: "boolean", default: "false", description: "A dashed pencil tab that does not open." },
      ],
    },
    { name: "NavigationMenuContent", description: "A panel's contents. In the shared viewport it slides between items, clipped to the slip; without the viewport it is a slip of its own. Links inside it are rows." },
    { name: "NavigationMenuViewport", description: "The shared slip the open panel is written on: a Paper (a CSS sheet) around Radix's clipping viewport, dropped from under the strip and resized to fit." },
    {
      name: "NavigationMenuLink",
      description:
        "A link. Inside a panel it is a row that wears the highlighter (the current one stays on it). In the strip itself it is a tab, like the triggers, and the current page (`active`) is filled with highlighter: pass `asChild` to use your router's link. Inside a panel every svg without a `size-*` class is drawn 16 px (the icon rule), so give art such as a Mascot an explicit size.",
      props: [
        { name: "active", type: "boolean", default: "false", description: "The current page: `aria-current=\"page\"`, `data-active`, and the filled tab." },
        { name: "asChild", type: "boolean", default: "false", description: "Render your link; the tab's drawing lands inside it." },
        { name: "seed", type: "string | number", description: "Pins the hand of a tab link." },
      ],
    },
    { name: "NavigationMenuIndicator", description: "The felt-tip underline under the strip that slides to the open tab and stretches to fit it. Shown only while a panel is open. Put it inside the List, after the items." },
    { name: "navigationMenuTriggerStyle", description: "The class of a tab (a cva). Radix links in the strip already wear it; use it for your own element that should look like a tab." },
  ],
  a11y: [
    "Radix NavigationMenu: a `nav` landmark (give it `aria-label`), a list of items, triggers with `aria-expanded` and `aria-controls`. It is a disclosure pattern, not `role=menu`: panels hold ordinary links.",
    "Hover (with intent delay), click and Enter or Space open a panel; Escape closes it and returns focus to its trigger. Left and Right (mirrored in RTL) move between triggers and links, ArrowDown from an open trigger steps into the panel, and Tab moves through the panel's links and on. Focus leaving the menu closes it.",
    "The current page is `aria-current=\"page\"` and a filled tab, so it does not depend on color. The sketches, the pencil line, the underline and the highlighter are aria-hidden decoration with no pointer events. Tabs are 36 px high (32 compact, 28 calm).",
    "Touch: a tap opens a panel (hover is not needed). Reduced motion removes the drop, the slide between panels and the underline's glide. In forced-colors mode the drawings give way to real outlines.",
  ],
  usage: `import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/install">Installation</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs" active>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
}`,
  related: ["menubar", "tabs", "breadcrumb", "sidebar", "dropdown-menu"],
} satisfies ComponentDoc
