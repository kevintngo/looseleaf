import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "dropdown-menu",
  title: "Dropdown Menu",
  category: "Overlays",
  description:
    "A menu written on a slip of paper that drops from a button. The row under the pointer or the keyboard wears the highlighter, a ticked row is a pencil box with a felt-tip tick over it, shortcuts are drawn keycaps, and a destructive row hatches in red pencil instead. Sub-menus, typeahead and focus handling are Radix's.",
  status: "stable",
  upstream: "dropdown-menu",
  parts: [
    { name: "DropdownMenu", description: "The Radix root: `open`, `defaultOpen`, `onOpenChange`, `modal`, `dir`." },
    { name: "DropdownMenuTrigger", description: "Opens the menu. Use `asChild` on a Button." },
    { name: "DropdownMenuPortal", description: "Portal for content you compose by hand." },
    {
      name: "DropdownMenuContent",
      description:
        "The slip: a Paper that is also the Radix content (role=menu). A CSS sheet with no SVG unless a torn edge is asked for. Rows scroll in a viewport inside it, never the slip, so its shadow and tape are not cut. `max-h-*`, `overflow-*` and `overscroll-*` in `className` are applied to that viewport (shadcn code writes them on the content), the rest stays on the slip. Every Radix Content prop passes through (`side`, `align`, `sideOffset`, `collisionPadding`...).",
      props: [
        { name: "sideOffset", type: "number", default: "6", description: "Gap between the trigger and the slip (upstream's is 4)." },
        { name: "stock", type: "StockName", default: '"slip"', description: "What it is made of: slip, paper, kraft, sticky-*, index-card ..." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle ..." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Small seeded tilt of the sheet; text stays upright." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Strips of masking tape holding the slip down." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    { name: "DropdownMenuGroup", description: "Groups rows (role=group)." },
    {
      name: "DropdownMenuLabel",
      description: "A heading in the typewriter, like the kicker of a form.",
      props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }],
    },
    {
      name: "DropdownMenuItem",
      description: "A row. It is not an ink host: the highlighter is a CSS background, so a plain row costs one element. (A ticked row carries two small icons, about 4 KB of markup: for a list of hundreds to choose from, reach for Command or Combobox.)",
      props: [
        { name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." },
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Destructive is red, and its highlight is a red pencil hatch (a pattern, not only a hue)." },
        { name: "onSelect", type: "(event: Event) => void", description: "Runs when it is chosen; call `event.preventDefault()` to keep the menu open." },
        { name: "disabled", type: "boolean", default: "false", description: "Pencil-gray, skipped by the arrow keys, cannot be chosen." },
      ],
    },
    {
      name: "DropdownMenuCheckboxItem",
      description: "A toggle row: a pencil box at the start, ticked in blue felt (written on) when `checked`.",
      props: [
        { name: "checked", type: "boolean | 'indeterminate'", description: "Controlled state." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called when it is toggled." },
      ],
    },
    { name: "DropdownMenuRadioGroup", description: "Holds radio rows; `value` and `onValueChange` make it controlled." },
    { name: "DropdownMenuRadioItem", description: "One choice: a pencil ring with a bold felt dot in the chosen one.", props: [{ name: "value", type: "string", required: true, description: "The value this row stands for." }] },
    { name: "DropdownMenuSeparator", description: "A pencil rule between groups (the Separator component, so it is hand-drawn)." },
    {
      name: "DropdownMenuShortcut",
      description: "Keys at the end of a row. A string is drawn as keycaps: `⌘S` is two keys, `⇧⌘P` three (`⌘` is the drawn command glyph), `Ctrl+K` two, `F2` one. Anything that is not a string is put in as it is.",
    },
    { name: "DropdownMenuSub", description: "A nested menu (Radix Sub): `open`, `defaultOpen`, `onOpenChange`." },
    { name: "DropdownMenuSubTrigger", description: "The row that opens it, with a hand-drawn chevron. It keeps the highlighter while its sub-menu is open.", props: [{ name: "inset", type: "boolean", default: "false", description: "Lines the text up with rows that carry a tick or an icon." }] },
    { name: "DropdownMenuSubContent", description: "The sub-menu's own slip, set down beside its row with its first row level with the one that opened it (`alignOffset` -4, the slip's padding). Takes the same paper props as the content." },
  ],
  a11y: [
    "Radix DropdownMenu: the trigger has aria-haspopup=menu, aria-expanded and aria-controls; the content is role=menu labeled by the trigger. Rows are menuitem, menuitemcheckbox (aria-checked) and menuitemradio.",
    "Enter, Space and ArrowDown on the trigger open it with the first row highlighted (ArrowUp opens nothing). Up and Down move (pass `loop` to the content to wrap), Home and End jump, typing a letter jumps to the next row that starts with it, ArrowRight opens a sub-menu and ArrowLeft closes it, Enter or Space chooses, Escape closes and returns focus to the trigger. Disabled rows are skipped.",
    "The highlight follows the keyboard as well as the pointer (`data-highlighted`) and is the focus indicator: dark text on the highlighter is 12:1, and because the highlighter itself is faint against the slip, a row with keyboard focus also gets a bar of blue felt at its start edge. A destructive row's cue is the word, the red glyph and the hatch.",
    "Ticks, dots, chevrons and the pencil boxes are aria-hidden drawings. Keycaps are real `kbd` elements; the command glyph carries the name Command.",
    "Rows are 32 px high (28 compact and calm). Nothing depends on hover. Portalled content repeats the InkProvider's data-density, data-motion and data-theme; with reduced motion it appears without the slide and zoom. In forced-colors mode the ticks keep the system text color and the highlighted row takes the system highlight colors.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem>
          Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
  related: ["context-menu", "menubar", "select", "popover", "kbd"],
} satisfies ComponentDoc
