import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "paper",
  title: "Paper",
  category: "Paper",
  description:
    "A sheet of paper on the desk: a stock (paper, slip, index card, graph, kraft, sticky notes ...), an edge (cut, torn, deckle, pinked ...), printed rules, a shadow and a small seeded tilt. The sheet turns; your content never does.",
  status: "new",
  parts: [
    {
      name: "Paper",
      description:
        "A container whose background is drawn paper. A plain cut edge is pure CSS (baked tooth tiles, a lit gradient, an umber shadow stack): no SVG at all. A torn, deckled, crimped, pinked, perforated or scalloped edge is the same CSS sheet cut to a drawn outline (`clip-path`), with a small svg of plain paths for the fiber fringe and the edge line: no texture lives in the svg, so a page of drawn sheets costs what a page of cut ones does. Everything behind the content turns together by `--ll-tilt`; children are upright. A drawn edge is a few px larger than the box on every side (the fringe) and a turned sheet's corners swing by half its width times the angle, so a sheet that ends flush with the window (a full-width page, a sheet at the very bottom) can scroll it by that much: put it in a container with `overflow-x-clip` (`overflow-clip` at the bottom), or lay it square with `tilt={false}`.",
      props: [
        { name: "stock", type: '"paper" | "card" | "slip" | "index-card" | "graph" | "dot-grid" | "check" | "ledger" | "pad" | "kraft" | "napkin" | "sticky-yellow" | "sticky-green" | "sticky-orange" | "sticky-pink" | "sticky-blue" | "photo" | "parchment" | "receipt"', default: '"paper"', description: "What the sheet is made of: its color token, tooth, shadow stack, default edge and printed rules." },
        { name: "edge", type: '"cut" | "torn" | "deckle" | "crimp" | "zig" | "perf" | "scallop" | { top?, right?, bottom?, left? }', default: "the stock's own", description: "How it is cut. One kind, or one per side (missing sides are cut). Anything but `cut` cuts the sheet to a drawn outline; until it has a size the sheet shows as a cut CSS sheet." },
        { name: "tilt", type: "boolean | number", default: "true", description: "true: a seeded angle within the stock's limit (never under a quarter of it, clamped to --ll-tilt-max, zero in calm density). A number is degrees. false lays it square." },
        { name: "rules", type: '"none" | "ruled" | "ruled-hand" | "index" | "graph" | "dots" | "ledger" | "pad" | "window"', default: "the stock's own", description: "Printed rules on the sheet: blue lines and a red margin (`ruled` is gradients, `ruled-hand` is a light svg of wandering pencil lines), an index card's red header rule, graph cells, a dot grid, a ledger, an order pad's lines. One decorative element of CSS gradients; ruled stocks tilt less so text stays on the lines. Text sits on `ruled` (28 px pitch), `pad` and `index` (30) and `ledger` (24) rules when its line-height is the pitch and a line box ends where the first rule's line does (`ruled`: 16 px of padding, then 28 px lines): each rule is printed `--ll-rule-offset` above the bottom of its line box (default 8 px for `ruled`, 9 for `pad` and `index`, 6 for `ledger`), which is where a hand font's baseline leaves room for the rule to run 2 to 3 px under it. Set `--ll-rule-offset` on the sheet or any ancestor to tune it; the script role sits lower in its line box, lift it by the offset less about 3 px." },
        { name: "tape", type: '"corner" | "top" | "both" | false', default: "false", description: "Tape strips across one top corner, along the top edge, or across both top corners." },
        { name: "tapeKind", type: "TapeKind", default: '"masking"', description: "Which tape: masking, washi-dots, washi-stripes, washi-zigzag, washi-gingham, kraft, clear." },
        { name: "fastener", type: '"clip" | "pin" | "staple" | "binder-clip" | false', default: "false", description: "Holds the sheet with a drawn prop that has a lit stroke and a short warm shadow." },
        { name: "fastenerTone", type: '"steel" | "tomato" | "tangerine" | "lemon" | "grass" | "teal" | "sky" | "grape" | "bubblegum"', description: "Color of the clip's plastic coating or the pin's head." },
        { name: "fastenerClassName", type: "string", description: "Classes for the fastener, merged after its default place (a clip stands at `-top-5 right-8`, a pin at `-top-2 left-1/2`), so `right-[3.125rem]` slides a clip along the top edge and `-top-8` lifts it. Use it to keep a fastener off a control at the sheet's corner." },
        { name: "shadow", type: '"stock" | "none" | "hair" | "loose" | "lift" | "slip" | "card" | "pad" | "check" | "paper" | "sticky"', default: '"stock"', description: "The umber shadow stack. Calm density swaps it for a hairline. A drawn edge casts the stack's soft layers from a rectangle inset to the mean of its edge, and its tight layer as a hairline that follows the edge." },
        { name: "curl", type: "boolean", default: "false", description: "A sticky note's curling bottom-right corner: the sheet is chamfered and the lifted flap is drawn into it, so it turns and casts with the sheet." },
        { name: "as", type: '"div" | "section" | "article" | "aside" | "header" | "footer" | "main" | "nav" | "li" | "ul" | "ol" | "form" | "fieldset" | "figure"', default: '"div"', description: "The element to render." },
        { name: "seed", type: "string | number", description: "Pins the hand: the same seed always cuts, tilts and textures the sheet the same way. Default: derived from useId()." },
        { name: "size", type: "[number, number]", description: "The sheet's size in px, if you know it. A drawn edge is then part of the server markup instead of appearing after the first measure." },
      ],
    },
    {
      name: "Fastener",
      description: "A paper clip, push-pin, staple or binder clip as a free-standing prop. Intrinsic size, complete in server markup; place it with className.",
      props: [
        { name: "kind", type: '"clip" | "pin" | "staple" | "binder-clip"', default: '"clip"', description: "Which fastener." },
        { name: "tone", type: '"steel" | Accent', description: "Clip coating or pin head color." },
        { name: "size", type: "number", description: "Clip height, pin head diameter, staple length or binder clip width in px." },
        { name: "seed", type: "string | number", description: "Pins the drawing." },
      ],
    },
    {
      name: "PaperDefs",
      description:
        "The paper tiles as SVG `<pattern>`s, for static svg art of your own that wants paper texture. A `Paper` needs none of it: torn, deckled and pinked sheets wear the tiles as CSS backgrounds, cached once per tile by the browser. Do not fill per-instance svgs with these patterns; every instance rasterizes its own copy.",
      props: [{ name: "tiles", type: "PaperTileName[]", default: "fiber, relief, slip, kraft, cloud", description: "Which tiles to define." }],
    },
  ],
  a11y: [
    "A CSS sheet brings the tooth tiles of its stock itself (one deduplicated `<style>` per tile, in the server HTML too), so it needs no provider. Saturated sticky notes lay a veil of their own color over the tooth, so orange and pink read as paper, not plaster.",
    "The sheet, its rules, tape and fasteners are decoration: the drawing is aria-hidden, pointer-events: none and never focusable. Paper adds no role; give it one (`as=\"article\"`, `role=\"region\"` with a label) when the content deserves it.",
    "Text is ink on paper (14:1 on paper, 9.4:1 on kraft, at least 9:1 on every sticky note) and stays upright: only the sheet and its rules turn.",
    "Tilt is clamped to --ll-tilt-max and is zero in calm density and in reduced-motion contexts that set it; props are hidden in calm density.",
    "In Windows high contrast the drawn svg (fiber fringe, edge line) steps aside and the host gets a real 1px outline; the paper stays cut to its edge, and tape stays visible.",
  ],
  usage: `import { Paper } from "@/components/ui/paper"

export function Note() {
  return (
    <Paper stock="index-card" tape="both" className="w-72 p-6">
      <h3 className="font-script text-2xl font-bold">Buy more ink</h3>
      <p>Black, blue, and one red for corrections.</p>
    </Paper>
  )
}

<Paper edge={{ bottom: "torn" }} fastener="pin" className="p-6">…</Paper>`,
  related: ["card", "tape", "sticker", "dialog"],
} satisfies ComponentDoc
