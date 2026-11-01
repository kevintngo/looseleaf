import type { ComponentDoc } from "../types"

export default {
  slug: "icon",
  title: "Icon",
  category: "Icons",
  description:
    "Every glyph in Looseleaf is a hand-drawn felt-tip icon, redrawn at each size so a 16 px chevron is a chevron and not a shrunken 24 px one. It takes lucide names, so a shadcn snippet keeps working.",
  status: "new",
  parts: [
    {
      name: "Icon",
      description: "An intrinsic ink svg: no measuring, fully server-rendered, currentColor ink.",
      props: [
        { name: "name", type: "IconName | string", required: true, description: "A lucide 1.x name (`chevron-down`), an older one (`trash-2`, `alert-triangle`, `Loader2`) or a PascalCase export (`ChevronDownIcon`). Unknown names draw a boxed question mark." },
        { name: "size", type: "number", default: "16, or the `size-N` class", description: "Pixels. Picks the drawing: 12 and below `micro` (when the icon has one), 14 to 19 the 16 px redraw, 20 to 40 the 24 px master, 41 and up the master plus its extras. Without it the tier follows a `size-N` class (or, inside a `xs` / `icon-xs` Button, the 12 px tier the Button hands down), so the shadcn `[&_svg:not([class*=size-])]:size-4` rule and an explicit `size-6` both pick the right drawing." },
        { name: "tone", type: '"ui" | "doodle"', default: '"ui"', description: "`ui` is ink only. `doodle` also shows the icon's accent wash (a highlighter behind the warning triangle, a pink head on the user)." },
        { name: "accent", type: "Accent | \"hi\" | \"kraft\"", description: "Colour of the wash in doodle tone; defaults to the icon's own." },
        { name: "seed", type: "string | number", description: "The hand: the same icon with another seed is drawn a little differently. Default: the icon name, so identical icons match." },
        { name: "label", type: "string", description: "Accessible name. Without it the icon is decorative (`aria-hidden`); with it, `role=\"img\"` and `aria-label`." },
        { name: "weight", type: "number", default: "1.12 (ui tone, up to 20 px), else 1", description: "Pen weight multiplier. Small ui icons are drawn a hair heavier than the engine's floor so they hold their own beside a bold Kevin Sans label; pass `weight={1}` for the plain pen." },
        { name: "flip", type: 'boolean | "x" | "y"', description: "Mirror an icon whose art is marked symmetric. Direction glyphs (chevrons, arrows, panel toggles) flip themselves in RTL through `rtl:-scale-x-100`; nothing with a baked flourish is ever mirrored." },
      ],
    },
  ],
  a11y: [
    "Decorative by default: `aria-hidden=\"true\"` and `focusable=\"false\"`. Pass `label` when the icon is the only content of a control, or name the control instead.",
    "Ink is `currentColor`, so text colour utilities and forced-colors mode work; icons are kept in forced-colors mode.",
    "Status icons differ by silhouette, not only by colour: a triangle warns, an octagon stops, a ring informs, an arc waits.",
  ],
  usage: `import { Icon } from "@/components/ui/icon"

export function Example() {
  return (
    <button className="inline-flex items-center gap-2">
      <Icon name="trash" />
      Delete
    </button>
  )
}`,
  related: ["doodle", "sticker", "button"],
} satisfies ComponentDoc
