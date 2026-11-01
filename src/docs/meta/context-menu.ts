import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "context-menu",
  title: "Context Menu",
  category: "Overlays",
  description:
    "The right-click menu, written on the same slip of paper as the dropdown and set down where the pointer was. Highlighter rows, drawn keycaps, pencil boxes and felt ticks, a red pencil hatch for what deletes. It opens on a right click, a long press on touch, or the menu key, and pops in where the pointer was.",
  status: "stable",
  upstream: "context-menu",
  parts: [
    { name: "ContextMenu", description: "The Radix root: `onOpenChange`, `modal`, `dir`." },
    { name: "ContextMenuTrigger", description: "The region that answers a right click. Use `asChild` to make an existing element the region; `disabled` leaves the browser's own menu." },
    { name: "ContextMenuPortal", description: "Portal for content you compose by hand." },
    {
      name: "ContextMenuContent",
      description:
        "The slip: a Paper that is also the Radix content (role=menu), opened at the pointer. A CSS sheet with no SVG unless a torn edge is asked for; rows scroll in a viewport inside it so the shadow is not cut. `max-h-*`, `overflow-*` and `overscroll-*` in `className` are applied to that viewport (shadcn code writes them on the content), the rest stays on the slip. Every Radix Content prop passes through.",
      props: [
        { name: "stock", type: "StockName", default: '"slip"', description: "What it is made of: slip, paper, kraft, sticky-*, index-card ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Small seeded tilt of the sheet; text stays upright." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Strips of masking tape holding the slip down." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "ContextMenuGroup", description: "Groups rows (role=group)." },
    { name: "ContextMenuLabel", description: "A heading in the typewriter.", props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }] },
    {
      name: "ContextMenuItem",
      description: "A row; the highlighter is a CSS background, so it costs no ink.",
      props: [
        { name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." },
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Destructive is red, and its highlight is a red pencil hatch." },
        { name: "onSelect", type: "(event: Event) => void", description: "Runs when it is chosen; `event.preventDefault()` keeps the menu open." },
      ],
    },
    { name: "ContextMenuCheckboxItem", description: "A pencil box at the start of the row, ticked in blue felt when `checked`.", props: [{ name: "checked", type: "boolean | 'indeterminate'", description: "Controlled state." }, { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called when toggled." }] },
    { name: "ContextMenuRadioGroup", description: "Holds radio rows; `value` and `onValueChange` make it controlled." },
    { name: "ContextMenuRadioItem", description: "One choice: a pencil ring with a bold felt dot in the chosen one.", props: [{ name: "value", type: "string", required: true, description: "The value this row stands for." }] },
    { name: "ContextMenuSeparator", description: "A pencil rule between groups (the Separator component)." },
    { name: "ContextMenuShortcut", description: "Keys at the end of a row: a string is drawn as keycaps (`⌘[` is two keys, `Ctrl+R` two, `F2` one), anything else is put in as it is." },
    { name: "ContextMenuSub", description: "A nested menu (Radix Sub)." },
    { name: "ContextMenuSubTrigger", description: "The row that opens it, with a hand-drawn chevron; it keeps the highlighter while its sub-menu is open.", props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }] },
    { name: "ContextMenuSubContent", description: "The sub-menu's own slip, set down beside its row with its first row level with the one that opened it (`alignOffset` -4, the slip's padding). Takes the same paper props as the content." },
  ],
  a11y: [
    "Radix ContextMenu: opens on a right click, a long press on touch and the ContextMenu key or Shift+F10 on the focused region; the content is role=menu with menuitem, menuitemcheckbox and menuitemradio rows.",
    "Up and Down move (disabled rows are skipped), Home and End jump, typing a letter jumps to the next row that starts with it, ArrowRight opens a sub-menu and ArrowLeft closes it, Enter or Space chooses, Escape closes.",
    "A context menu must never be the only way to reach an action: put the same actions on a visible control (a DropdownMenu on a button) as well.",
    "The highlight follows the keyboard as well as the pointer (`data-highlighted`); a row with keyboard focus also gets a bar of blue felt at its start edge. Ticks, dots, chevrons and the pencil boxes are aria-hidden drawings; keycaps are real `kbd` elements.",
    "Rows are 32 px high (28 compact and calm). Portalled content repeats the InkProvider's data-density, data-motion and data-theme; with reduced motion it appears without the slide and zoom. In forced-colors mode the highlighted row takes the system highlight colors.",
  ],
  usage: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-40 w-72 place-items-center">Right click here</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Reload</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}`,
  related: ["dropdown-menu", "menubar", "popover"],
} satisfies ComponentDoc
