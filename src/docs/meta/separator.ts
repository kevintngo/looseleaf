import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "separator",
  title: "Separator",
  category: "Layout",
  description:
    "A rule that visually or semantically separates content, drawn by hand: pencil, ledger dashes, a squiggle, dots, a strip of tape, a running stitch or a torn edge of paper. Horizontal or vertical, with an optional centred label.",
  status: "stable",
  upstream: "separator",
  parts: [
    {
      name: "Separator",
      description:
        "A Radix Separator (asChild is not offered: the element is the drawing's host). Without children it is a 1 px hairline whose drawing is centred on it and spills up to 12 px across it (a hairline host, so layout is exactly shadcn's). Along its length the host clips (`overflow-x: clip` for a horizontal rule, `overflow-y: clip` for a vertical one), so a rule that ends at the window edge never scrolls the page sideways. With children it becomes a labelled divider: two rules around your text.",
      props: [
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Horizontal is h-px w-full; vertical is w-px h-full (give it a height in a flex row, or self-stretch).",
        },
        {
          name: "decorative",
          type: "boolean",
          default: "true",
          description: "As Radix: decorative rules are role=none and invisible to assistive tech; set false for a real thematic break (role=separator).",
        },
        {
          name: "variant",
          type: '"pencil" | "dashed" | "wavy" | "dotted" | "tape" | "stitched" | "torn"',
          default: '"pencil"',
          description:
            "pencil = a graphite line that sags a little; dashed = ledger dashes; wavy = a felt-tip squiggle; dotted = ink dots; tape = a strip of kraft tape stuck across; stitched = a running stitch in marker thread; torn = a strip of paper torn along both edges. Calm density draws tape, stitched and torn as the pencil rule.",
        },
        {
          name: "children",
          type: "ReactNode",
          description:
            'Puts a label in the middle ("or", "continue with"): two rules of the same variant either side, the text in the hand font. The label is real text, read by screen readers when the separator is decorative.',
        },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always draws the same rule. Default: derived from useId()." },
      ],
    },
  ],
  a11y: [
    "Decorative by default (role=none), like shadcn: use decorative={false} only for a real thematic break, and give a labelled non-decorative separator an aria-label, since children of role=separator are presentational.",
    "A vertical separator that is not decorative gets aria-orientation=vertical from Radix.",
    "The drawing is aria-hidden and pointer-events: none. Until it exists, and in Windows high contrast, the rule is a plain 1 px line.",
    "Tape, stitched and torn are decoration; nothing about the meaning of a divider ever depends on them.",
  ],
  usage: `import { Separator } from "@/components/ui/separator"

export function Example() {
  return (
    <div className="w-72">
      <h4 className="font-bold">Field notes</h4>
      <p className="text-sm text-muted-foreground">Sketches and half-thoughts.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Blog</span>
        <Separator orientation="vertical" variant="wavy" />
        <span>Docs</span>
        <Separator orientation="vertical" variant="wavy" />
        <span>Source</span>
      </div>
      <Separator className="my-4" variant="stitched">or</Separator>
    </div>
  )
}`,
  related: ["card", "item", "button-group", "paper", "tape"],
} satisfies ComponentDoc
