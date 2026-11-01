import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "page",
  title: "Page",
  category: "Paper",
  description:
    "The app's main paper column: a sheet on the desk with a header, content and a footer. It can be three-hole punched (the desk shows through the holes), torn from a pad, ringed with a coffee stain, and its title is underlined by the same hand that wrote it.",
  status: "new",
  parts: [
    {
      name: "Page",
      description: "A Paper laid out as a centered flex column (gap 6, px 6 / 10, py 8 / 10). It takes every Paper prop; the holes and the stain are ink behind the content, turned with the sheet. The holes' drawing is exactly the page's box (it adds no bleed of its own); but a page that fills the window is turned by up to 0.35 degrees and its far corners swing a few px past the window's edge, so give a full-width page a container with `overflow-x-clip` (and 8 px of side padding, which keeps its shadow) or lay it square with `tilt={false}`.",
      props: [
        { name: "as", type: '"div" | "main" | "article" | "section" | "form"', default: '"div"', description: "The element. Use `main` when the page is the app's main landmark." },
        { name: "width", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "Column width: 32rem, 42rem, 56rem, 72rem or unbounded. Always centered." },
        { name: "holes", type: '"start" | "top" | "none" | boolean', default: "false", description: "Punched holes: three down the start edge (mirrored for right-to-left), or two across the top. `true` is `start`. The desk shows through them; the start padding grows to clear them." },
        { name: "reinforced", type: "boolean", default: "false", description: "Gummed reinforcement rings round the holes." },
        { name: "stain", type: "boolean", default: "false", description: "A coffee ring in the lower corner (multiply-printed, faint)." },
        { name: "torn", type: 'boolean | "top" | "bottom" | "both"', description: "Shorthand for a torn edge. `edge` wins if both are given." },
        { name: "stock", type: "StockName", default: '"paper"', description: "Any Paper stock: paper, slip, graph, dot-grid, kraft, parchment ..." },
        { name: "rules", type: "RuleName", default: '"none"', description: "Printed rules (ruled, graph, dots ...). Ruled paper's red margin mirrors in RTL." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Seeded turn of the sheet (under 0.35 degrees for a page). The holes turn with it; text never does." },
        { name: "tape / fastener", type: "Paper props", description: "Tape it or clip it down, like any sheet." },
        { name: "seed", type: "string | number", description: "Pins the hand: tilt, holes, stain." },
      ],
    },
    { name: "PageHeader", description: "A column for the title and description (gap 2)." },
    {
      name: "PageTitle",
      description: "The title, a heading in the script font (41 px). A hand-drawn mark sits under it.",
      props: [
        { name: "as", type: '"h1" | "h2" | "h3" | "p" | "div"', default: '"h1"', description: "The element." },
        { name: "underline", type: '"single" | "double" | "wavy" | "highlight" | "none"', default: '"single"', description: "A pen line, two, a wavy one, or a yellow highlighter swipe behind the lower half of the words. Calm density draws a hairline." },
        { name: "seed", type: "string | number", description: "Pins the hand of the mark." },
      ],
    },
    { name: "PageDescription", description: "Muted text, at most a prose measure wide." },
    { name: "PageContent", description: "The body: a growing flex column (gap 4) that pushes the footer down." },
    { name: "PageFooter", description: "A row at the foot of the sheet (page number, actions), muted, 14 px." },
  ],
  a11y: [
    "Page is a plain element (`div` by default): pass `as=\"main\"` for the main landmark, or `as=\"article\"` / `\"section\"` with a label when it means something.",
    "PageTitle is a real heading (`h1` by default); its mark, the holes, rings, stain, tape and fasteners are aria-hidden, pointer-events-none decoration.",
    "Ink on paper is 14:1 and the muted description 8.9:1. The tilt is zero in calm density, and Windows high contrast replaces the drawing with a real outline.",
    "The start padding grows with `holes` so text never reaches the punch; right-to-left pages get their holes and margin rules on the right.",
  ],
  usage: `import { Page, PageContent, PageDescription, PageFooter, PageHeader, PageTitle } from "@/components/ui/page"

export function Example() {
  return (
    <Page as="main" holes reinforced>
      <PageHeader>
        <PageTitle>Field notes</PageTitle>
        <PageDescription>A week of small observations.</PageDescription>
      </PageHeader>
      <PageContent>…</PageContent>
      <PageFooter>- 3 -</PageFooter>
    </Page>
  )
}

<Page torn stock="slip" width="sm"><PageTitle underline="highlight">Order pad</PageTitle>…</Page>`,
  related: ["paper", "card", "notebook", "desk"],
} satisfies ComponentDoc
