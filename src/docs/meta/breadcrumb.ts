import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "breadcrumb",
  title: "Breadcrumb",
  category: "Navigation",
  description:
    "The path to the page you are on, written in a notebook: names between pencil slashes, links that wear the highlighter when pointed at, and the current page underlined twice in blue felt. Swap the slash for a chevron or any node, and fold the middle of a long path into a dropdown.",
  status: "stable",
  upstream: "breadcrumb",
  parts: [
    { name: "Breadcrumb", description: "The `nav` landmark, labelled \"breadcrumb\"." },
    { name: "BreadcrumbList", description: "The ordered list (`ol`). It wraps onto several lines when the path is long." },
    { name: "BreadcrumbItem", description: "One crumb (`li`)." },
    {
      name: "BreadcrumbLink",
      description: "A link on the path (an `a`, or your router link with `asChild`). Pointed at or keyboard-focused it wears the highlighter.",
      props: [{ name: "asChild", type: "boolean", default: "false", description: "Render your element (Next's Link, a router NavLink)." }],
    },
    {
      name: "BreadcrumbPage",
      description: "The page you are on: bold, `aria-current=\"page\"`, underlined twice in blue felt (one pencil line in calm density). The underline is the only drawing in a breadcrumb; it becomes an ink host once it is measured.",
      props: [{ name: "seed", type: "string | number", description: "Pins the hand. Default: derived from useId()." }],
    },
    {
      name: "BreadcrumbSeparator",
      description: "The mark between two crumbs (`li`, hidden from assistive technology). A hand-drawn slash by default; pass any node (an Icon chevron, a dot) as children.",
    },
    { name: "BreadcrumbEllipsis", description: "Three pencil dots for the crumbs left out, with a screen-reader label. Put it in a DropdownMenuTrigger to open the hidden ones: give the trigger an `aria-label` (the ellipsis itself is aria-hidden) and keep the box at `size-6` (24 px) or more so it is easy to hit." },
  ],
  a11y: [
    "Landmark and list semantics as in the WAI-ARIA breadcrumb pattern: `nav` labelled \"breadcrumb\" holding an ordered list; the current page carries `aria-current=\"page\"` (and, as upstream, `role=\"link\"` with `aria-disabled` since it goes nowhere).",
    "Separators and the ellipsis glyph are hidden from assistive technology; the ellipsis keeps an `sr-only` \"More\", and the button you wrap it in needs its own name (\"Toggle menu\").",
    "The underline and the highlighter are decoration with no pointer events and never move the text. Links keep the theme's focus ring; the current page is bold and underlined, so it does not depend on colour.",
  ],
  usage: `import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}`,
  related: ["pagination", "navigation-menu", "dropdown-menu", "tabs"],
} satisfies ComponentDoc
