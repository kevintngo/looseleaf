import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "tabs",
  title: "Tabs",
  category: "Navigation",
  description:
    "Index-divider tabs: the active one is lifted and filled with highlighter, and the pencil baseline breaks under it. Also a hairline `line` style with a blue felt underline, and vertical binder tabs. Radix behaviour and roving focus are untouched.",
  status: "stable",
  upstream: "tabs",
  parts: [
    {
      name: "Tabs",
      description: "The Radix Tabs root. Vertical tabs lay the list and the panel side by side.",
      props: [
        { name: "value / defaultValue / onValueChange", type: "string / string / (value: string) => void", description: "Controlled and uncontrolled state." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical draws binder tabs on a spine and moves with ArrowUp / ArrowDown." },
        { name: "activationMode", type: '"automatic" | "manual"', default: '"automatic"', description: "Automatic opens a tab as focus reaches it; manual waits for Enter or Space." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction; the arrows and the drawings follow it." },
      ],
    },
    {
      name: "TabsList",
      description: "The `role=\"tablist\"` row (or column). `tabsListVariants` is exported for consumers that style their own list.",
      props: [{ name: "variant", type: '"default" | "line"', default: '"default"', description: "`default` = paper index tabs; `line` = hairline with the active tab underlined in blue felt." }],
    },
    {
      name: "TabsTrigger",
      description: "A tab (Radix Trigger, a button). It hosts its own drawing: sketch and baseline at rest, felt outline on hover, highlighter fill when active, a blue ring on keyboard focus.",
      props: [
        { name: "value", type: "string", required: true, description: "Ties the tab to its TabsContent." },
        { name: "disabled", type: "boolean", default: "false", description: "Dashed pencil sketch, skipped by the arrow keys." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." },
      ],
    },
    { name: "TabsContent", description: "The panel (`role=\"tabpanel\"`, focusable with Tab). It fades in when its tab opens." },
  ],
  a11y: [
    "Radix roles and keys: tablist, tab (aria-selected, aria-controls) and tabpanel (aria-labelledby). Left/Right (Up/Down when vertical, mirrored in RTL) move between tabs and, in automatic mode, open them; Home and End jump to the first and last; Tab goes on into the panel.",
    "The drawn tab, baseline and underline are aria-hidden and pointer-events: none; the tab keeps a 36 px hit box (32 compact, 28 calm).",
    "The active tab is told apart by fill and outline, not by hue alone. Inactive text is 4.6:1 on paper, active text 14:1.",
    "Keyboard focus draws a blue felt ring around the tab. Windows high contrast replaces the drawing with a real outline. Reduced motion turns the lift and the underline wipe into instant changes.",
    "The tab list keeps its shape in right-to-left layouts: the vertical spine moves to the other side and the drawings mirror.",
  ],
  usage: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Example() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Make changes to your account here.</TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  )
}`,
  related: ["accordion", "card", "scroll-area", "navigation-menu"],
} satisfies ComponentDoc
