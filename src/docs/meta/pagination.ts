import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "pagination",
  title: "Pagination",
  category: "Navigation",
  description:
    "Page links as drawn buttons: each number is a Button around your own link, the page you are on is a block of highlighter, the arrows and the ellipsis are hand-drawn. It is just links, so it works with any router, or with plain hrefs and no JavaScript at all.",
  status: "stable",
  upstream: "pagination",
  parts: [
    { name: "Pagination", description: "The `nav` landmark (`role=\"navigation\"`, labeled \"pagination\"), centered." },
    { name: "PaginationContent", description: "The list (`ul`) of items." },
    { name: "PaginationItem", description: "One entry (`li`)." },
    {
      name: "PaginationLink",
      description:
        "A page link: `<Button asChild>` around an `<a>`, so it is drawn (ghost, or secondary when active) and keeps your `href`, `target` and handlers. `buttonVariants()` on a bare anchor would give layout without the drawing, which is why this wraps a Button.",
      props: [
        { name: "isActive", type: "boolean", default: "false", description: "The current page: a block of highlighter, `aria-current=\"page\"`, `data-active`." },
        { name: "size", type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"', default: '"icon"', description: "A Button size. A page number is a square icon button." },
        { name: "disabled", type: "boolean", default: "false", description: "For a link that goes nowhere (the first page's Previous): drawn dashed, `aria-disabled`, out of the tab order, its click swallowed (your onClick does not run)." },
      ],
    },
    { name: "PaginationPrevious", description: "A labeled link (\"Go to previous page\") with a drawn chevron. The word \"Previous\" hides on phones; the label stays." },
    { name: "PaginationNext", description: "The same, pointing on (\"Go to next page\")." },
    { name: "PaginationEllipsis", description: "Three pencil dots for the pages left out; hidden from assistive technology with an `sr-only` \"More pages\"." },
  ],
  a11y: [
    "A `nav` landmark labeled \"pagination\" holding a list of links. The current page has `aria-current=\"page\"`; it is also bold-on-highlighter, so it does not rely on color.",
    "Previous and Next carry `aria-label`s that name their destination, so they read the same when the word is hidden on a phone. Give number links an accessible name of their own when the bare number is ambiguous (`aria-label=\"Page 3\"`).",
    "A disabled link is `aria-disabled`, removed from the tab order and drawn as the dashed alternative; its click is prevented and your `onClick` is not called.",
    "Each link is at least 36 px square (32 compact, 28 calm), a tab stop with the theme's drawn blue focus ring. Being plain anchors, they work without JavaScript and with any router.",
  ],
  usage: `import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function Example() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?page=1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}`,
  related: ["button", "breadcrumb", "tabs", "table"],
} satisfies ComponentDoc
