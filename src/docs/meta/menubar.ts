import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "menubar",
  title: "Menubar",
  category: "Navigation",
  description:
    "A desktop-style menu bar: a strip of paper with a pencil ruler along its foot and the menu titles written on it. Hovered, focused or open, a title wears the highlighter; each menu opens the same slip as the dropdown. Roving focus, hover-to-switch and typeahead are Radix's.",
  status: "stable",
  upstream: "menubar",
  parts: [
    {
      name: "Menubar",
      description: "The bar (Radix Menubar root, role=menubar) and the ink host of the strip: a pale paper-shade body under a fine felt outline, a pencil ruler's ticks along the foot. Hairline and without the ruler in calm density.",
      props: [
        { name: "value / defaultValue / onValueChange", type: "string / string / (value: string) => void", description: "Which menu is open (a `MenubarMenu` `value`)." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction; the arrows and the drawings follow it." },
        { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around the ends of the bar." },
        { name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." },
      ],
    },
    { name: "MenubarMenu", description: "One title with its menu (Radix Menu). Give it a `value` when the bar is controlled." },
    { name: "MenubarTrigger", description: "A title on the strip (role=menuitem). It is not an ink host: hover, focus and open wear the highlighter." },
    { name: "MenubarPortal", description: "Portal for content you compose by hand." },
    {
      name: "MenubarContent",
      description: "The slip: a Paper that is also the Radix content (role=menu). Rows scroll in a viewport inside it so the shadow is not cut. `max-h-*`, `overflow-*` and `overscroll-*` in `className` are applied to that viewport (shadcn code writes them on the content), the rest stays on the slip. Every Radix Content prop passes through.",
      props: [
        { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Where the slip sits under its title." },
        { name: "alignOffset", type: "number", default: "-4", description: "Nudges the slip so its text lines up with the title." },
        { name: "sideOffset", type: "number", default: "8", description: "Gap between the bar and the slip." },
        { name: "stock", type: "StockName", default: '"slip"', description: "What it is made of: slip, paper, kraft, sticky-* ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Small seeded tilt of the sheet; text stays upright." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Strips of masking tape holding the slip down." },
      ],
    },
    { name: "MenubarGroup", description: "Groups rows (role=group)." },
    { name: "MenubarLabel", description: "A heading in the typewriter.", props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }] },
    {
      name: "MenubarItem",
      description: "A row; the highlighter is a CSS background.",
      props: [
        { name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." },
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Destructive is red, and hatches in red pencil when highlighted." },
      ],
    },
    { name: "MenubarCheckboxItem", description: "A pencil box at the start of the row, ticked in blue felt when `checked`.", props: [{ name: "checked", type: "boolean | 'indeterminate'", description: "Controlled state." }, { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called when toggled." }] },
    { name: "MenubarRadioGroup", description: "Holds radio rows; `value` and `onValueChange` make it controlled." },
    { name: "MenubarRadioItem", description: "One choice: a pencil ring with a bold felt dot in the chosen one.", props: [{ name: "value", type: "string", required: true, description: "The value this row stands for." }] },
    { name: "MenubarSeparator", description: "A pencil rule between groups (the Separator component)." },
    { name: "MenubarShortcut", description: "Keys at the end of a row: a string is drawn as keycaps (`⌘T` is two keys, `Ctrl+N` two, `F5` one), anything else is put in as it is." },
    { name: "MenubarSub", description: "A nested menu (Radix Sub)." },
    { name: "MenubarSubTrigger", description: "The row that opens it, with a hand-drawn chevron; it keeps the highlighter while its sub-menu is open.", props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }] },
    { name: "MenubarSubContent", description: "The sub-menu's own slip, set down beside its row with its first row level with the one that opened it (`alignOffset` -4, the slip's padding)." },
  ],
  a11y: [
    "Radix Menubar: role=menubar with menuitem titles (aria-haspopup, aria-expanded). Left and Right (mirrored in RTL) move between titles; Enter, Space or ArrowDown opens a menu with its first row highlighted (ArrowUp on a title opens nothing). Once one is open, hovering another title or pressing Left or Right from a plain row switches menus.",
    "Inside a menu: Up and Down move (disabled rows are skipped), Home and End jump, typing a letter jumps to the next row that starts with it, ArrowRight opens a sub-menu and ArrowLeft closes it, Enter or Space chooses, Escape closes and returns focus to the title. The bar is one tab stop.",
    "The strip and its ruler are aria-hidden decoration with no pointer events; the titles keep a 28 px hit box. The highlight follows the keyboard as well as the pointer, and keyboard focus on a title also shows the theme's blue focus ring; inside a menu the row with keyboard focus gets a bar of blue felt at its start edge.",
    "Ticks, dots, chevrons and pencil boxes are aria-hidden drawings; keycaps are real `kbd` elements. Portalled content repeats the InkProvider's data-density, data-motion and data-theme. In forced-colors mode the strip gives way to a real outline and the hovered, focused or open title takes the system highlight colors.",
  ],
  usage: `import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

export function Example() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}`,
  related: ["dropdown-menu", "navigation-menu", "context-menu", "tabs"],
} satisfies ComponentDoc
