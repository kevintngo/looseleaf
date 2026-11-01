import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "card",
  title: "Card",
  category: "Layout",
  description:
    "A card is a sheet of paper: header, title, description, action, content and footer with shadcn's spacing, on any stock and edge. Dividers are drawn pencil rules, and a card can be taped, pinned or clipped to the desk.",
  status: "stable",
  upstream: "card",
  parts: [
    {
      name: "Card",
      description: "A Paper with shadcn's card layout (a flex column, gap 6, py 6). It takes every Paper prop; its default stock is `card` (paper colour, a small shadow).",
      props: [
        { name: "stock", type: "StockName", default: '"card"', description: "Paper, slip, index-card, graph, dot-grid, check, ledger, pad, kraft, napkin, sticky-*, photo, parchment, receipt." },
        { name: "edge", type: "EdgeSpec", default: '"cut"', description: "Cut (pure CSS), torn, deckle, crimp, zig, perf, scallop, or one kind per side." },
        { name: "tilt", type: "boolean | number", default: "true", description: "Seeded tilt of the sheet; text stays upright." },
        { name: "rules", type: "RuleName", default: '"none"', description: "Printed rules: ruled, index, graph, dots, ledger, pad. Off by default (unlike Paper, which prints its stock's own rules) because arbitrary content does not sit on ruled lines." },
        { name: "tape", type: '"corner" | "top" | "both" | false', description: "Tape strips at the corners or the top edge." },
        { name: "fastener", type: '"clip" | "pin" | "staple" | "binder-clip" | false', description: "Hold the card down with a drawn prop." },
        { name: "seed", type: "string | number", description: "Pins the hand." },
      ],
    },
    {
      name: "CardHeader",
      description: "A container query grid (`@container/card-header`): title and description on the left, an optional CardAction on the right. `border-b` asks for a drawn divider and adds the usual bottom padding.",
      props: [{ name: "rule", type: '"pencil" | "dashed" | "wavy"', default: '"pencil"', description: "How the divider under a header with `border-b` is drawn: a pencil line that rises to the right, dashes like a ledger, or a wavy underline." }],
    },
    { name: "CardTitle", description: "The title in the script font at 27 px, leading none, semibold." },
    { name: "CardDescription", description: "Muted text in the hand font, 14 px." },
    { name: "CardAction", description: "Placed top right of the header grid, spanning both rows." },
    { name: "CardContent", description: "The body, px 6." },
    {
      name: "CardFooter",
      description: "A flex row. `border-t` draws a divider above it and adds the top padding.",
      props: [{ name: "rule", type: '"pencil" | "dashed" | "wavy"', default: '"pencil"', description: "How the divider above a footer with `border-t` is drawn." }],
    },
  ],
  a11y: [
    "A Card is a plain div, as upstream: give it a role or an element (`as=\"article\"`, `role=\"group\"` with a label) when it means something more.",
    "The sheet, dividers, tape and fasteners are aria-hidden decoration; nothing in them is focusable or takes pointer events.",
    "Ink on paper is 14:1; muted descriptions 8.9:1. Text stays upright while the sheet turns, and the tilt is zero in calm density.",
    "Calm density also draws a plain cut edge with a hairline shadow and hides tape and fasteners.",
  ],
  usage: `import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Example() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what lands in your inbox.</CardDescription>
        <CardAction><Button variant="link" size="sm">Reset</Button></CardAction>
      </CardHeader>
      <CardContent>…</CardContent>
      <CardFooter className="border-t"><Button>Save</Button></CardFooter>
    </Card>
  )
}

<Card stock="index-card" edge="torn" tape="both">…</Card>`,
  related: ["paper", "tape", "button", "separator"],
} satisfies ComponentDoc
