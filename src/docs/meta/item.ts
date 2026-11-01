import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "item",
  title: "Item",
  category: "Data display",
  description:
    "A row for lists of things: an icon or photo, a title with a line of description, some actions. Rows sit on ruled paper, a link row lights up under a highlighter swipe, and none of it carries ink of its own, so a list of hundreds costs nothing.",
  status: "stable",
  upstream: "item",
  parts: [
    {
      name: "Item",
      description:
        "A flex row (a div, or your own element with asChild). The rough pencil box of variant=outline, the wash of muted and the highlighter hover of a link or button row are CSS (masks made from a few tiny drawn tiles, defined once per page in one hoisted stylesheet), never an svg per row. Inside an ItemGroup it is a list item; an asChild row is wrapped in one, so the link keeps its own role.",
      props: [
        {
          name: "variant",
          type: '"default" | "outline" | "muted"',
          default: '"default"',
          description:
            "default = bare; outline = a rough ruled pencil box (three hands, by seed); muted = a paper-shade wash in the shape of a highlighter swipe.",
        },
        {
          name: "size",
          type: '"default" | "sm"',
          default: '"default"',
          description: "Roomy (gap 16, padding 16) or snug (gap 10, padding 16 x 12). Compact and calm density are a step tighter each.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render your own element (a link, a button); it hovers under the highlighter swipe, and takes the focus ring.",
        },
        {
          name: "seed",
          type: "string | number",
          description: "Picks which of the three hands draws this row's outline and rule. Default: derived from useId().",
        },
      ],
    },
    {
      name: "ItemGroup",
      description: "A role=list column of rows.",
      props: [
        {
          name: "ruled",
          type: "boolean",
          default: "false",
          description: "Ruled paper: a blue pencil line under each row, drawn by the stylesheet so it always matches the height of the row.",
        },
      ],
    },
    {
      name: "ItemSeparator",
      description:
        "A horizontal rule between rows: takes every Separator prop. Its default, the pencil line, is drawn by the same stylesheet as the rows (a mask, no svg), so a separator between each of a few hundred rows costs nothing. Any other variant (dashed, wavy, tape...) is a real Separator with a drawing of its own: use it sparingly. Do not combine it with ruled, which already draws a line under each row.",
    },
    {
      name: "ItemMedia",
      description: "The leading (or trailing) picture.",
      props: [
        {
          name: "variant",
          type: '"default" | "icon" | "image"',
          default: '"default"',
          description:
            "icon = a 36 px well with a rough box and a paper-shade wash; image = a 40 px photograph with a white border that lies a degree crooked (alternating rows, straight in calm density).",
        },
      ],
    },
    { name: "ItemContent", description: "The growing column that holds a title and a description." },
    { name: "ItemTitle", description: "The title: hand font, 16 px, bold." },
    { name: "ItemDescription", description: "A muted line of description, clamped to two lines; links inside are blue felt with an underline." },
    { name: "ItemActions", description: "The trailing controls." },
    { name: "ItemHeader", description: "A full-width row above the content (basis-full)." },
    { name: "ItemFooter", description: "A full-width row below the content (basis-full)." },
  ],
  a11y: [
    "ItemGroup is role=list and every Item inside it is role=listitem (upstream leaves that to you, and axe reports the group otherwise). An asChild link or button is wrapped in a listitem, so it keeps its own role, name and keyboard behavior.",
    "A link or button row is one big hit area. Its focus mark is a plain 2 px blue outline, not the drawn felt ring of a Button (a row carries no drawing, so its ring is CSS too); hover is a highlighter swipe that is also visible without its hue (the swipe changes the background's lightness), and is off on touch screens.",
    "The drawing (outline, rules, wash) is decoration in CSS: it has no role, cannot take focus and does not change layout. In Windows high contrast it becomes a real 1 px border and a real rule.",
    "Muted text is 8.9:1 on paper; the description is clamped to two lines, so put anything essential in the title.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

export function Example() {
  return (
    <ItemGroup ruled className="max-w-md">
      <Item>
        <ItemMedia variant="icon">
          <Icon name="bell" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Choose what lands in your inbox.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">Edit</Button>
        </ItemActions>
      </Item>
      <Item asChild>
        <a href="/pages">
          <ItemContent>
            <ItemTitle>All pages</ItemTitle>
          </ItemContent>
        </a>
      </Item>
    </ItemGroup>
  )
}`,
  related: ["card", "separator", "empty", "table", "avatar"],
} satisfies ComponentDoc
