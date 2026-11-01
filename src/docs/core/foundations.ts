export interface Swatch {
  token: string
  label: string
}

export interface FontSample {
  token: string
  label: string
  role: string
}

export interface FoundationTopic {
  slug: string
  title: string
  summary: string
  facts: string[]
  swatches?: Swatch[]
  fonts?: FontSample[]
  see?: { label: string; to: string }[]
}

export const FOUNDATIONS: readonly FoundationTopic[] = [
  {
    slug: "principles",
    title: "Principles",
    summary: "The ten laws of the hand, what each pen means and a checklist for shipping: the why behind every other page.",
    facts: [
      "A notebook on a tidy desk: cream paper, a dark felt-tip for the words, blue felt for you and anything you can act on, graphite for the small print. Every color is a tool with one job.",
      "Ten laws decide whether a component looks drawn by a person: lines are ribbons with pressure, straight lines are ruled, no two things are identical, fills are a separate layer, paper has tooth, shadows are warm and short, paper tilts and text never does, text sits on real baselines, color is ink and marker, and the charm is a dial you can turn down.",
      "Every drawing is seeded, so the same seed draws the same hand on the server and in the browser.",
      "A short list of questions to ask before a component or a screen ships.",
    ],
    see: [
      { label: "Color", to: "/foundations/color" },
      { label: "Pens", to: "/foundations/pens" },
    ],
  },
  {
    slug: "color",
    title: "Color",
    summary: "Ink, pencil, marker and highlighter on cream paper. Loud colors stay in the decoration layer.",
    facts: [
      "Real UI is calm: cream paper, dark brown-black felt-tip, blue felt for you and anything interactive, graphite pencil for meta text.",
      "Red pencil means correction or danger, green pencil means ok, terracotta marker is the primary action, yellow highlighter is emphasis and selection.",
      "Saturated stationery accents (tomato, tangerine, lemon, grass, teal, sky, grape, bubblegum) exist only in stickers, washi, badges, avatars, chart fills and stamps.",
      "Every color is a --ll-* custom property and shadcn's semantic names (--background, --primary, ...) alias them, so a theme is a block of variable overrides.",
    ],
    swatches: [
      { token: "--ll-paper", label: "paper" },
      { token: "--ll-paper-shade", label: "paper shade" },
      { token: "--ll-slip", label: "slip" },
      { token: "--ll-card", label: "card" },
      { token: "--ll-graph", label: "graph" },
      { token: "--ll-kraft", label: "kraft" },
      { token: "--ll-desk", label: "desk" },
      { token: "--ll-ink", label: "ink" },
      { token: "--ll-ink-you", label: "blue felt" },
      { token: "--ll-pencil", label: "pencil" },
      { token: "--ll-red", label: "red pencil" },
      { token: "--ll-green", label: "green pencil" },
      { token: "--ll-marker", label: "marker" },
      { token: "--ll-hi", label: "highlighter" },
      { token: "--ll-tomato", label: "tomato" },
      { token: "--ll-tangerine", label: "tangerine" },
      { token: "--ll-lemon", label: "lemon" },
      { token: "--ll-grass", label: "grass" },
      { token: "--ll-teal", label: "teal" },
      { token: "--ll-sky", label: "sky" },
      { token: "--ll-grape", label: "grape" },
      { token: "--ll-bubblegum", label: "bubblegum" },
    ],
    see: [{ label: "Theming", to: "/foundations/theming" }],
  },
  {
    slug: "typography",
    title: "Typography",
    summary: "Four handwriting-and-typewriter faces, real DOM text on real baselines.",
    facts: [
      "Kevin Sans is the one hand, tuned for three roles: font-hand is the UI text, font-script is for titles, notes and numbers, font-type is for stamps, kickers and receipts. IBM Plex Mono (font-mono) is code.",
      "Handwriting fonts run about 1.25 times wider than a neutral face at the same visual size, so labels start at 14 px and touch inputs at 16 px.",
      "Text is always real text. Per-word jitter is an inline-block transform; it switches off in the calm density and under reduced motion.",
      "Display titles can take a riso offset shadow with the ll-riso utility.",
    ],
    fonts: [
      { token: "--font-hand", label: "Kevin Sans Hand", role: "UI text" },
      { token: "--font-script", label: "Kevin Sans Script", role: "titles and notes" },
      { token: "--font-type", label: "Kevin Sans Type", role: "stamps and kickers" },
      { token: "--font-mono", label: "IBM Plex Mono", role: "code" },
    ],
  },
  {
    slug: "pens",
    title: "Pens",
    summary: "Every line is a ribbon with pressure: felt-tip, pencil, marker and highlighter each have their own grain.",
    facts: [
      "A stroke is a filled variable-width polygon, not a uniform SVG stroke: it swells on the down-stroke, skips where the pen runs dry and wanders like a hand.",
      "Two weight classes give drawings hierarchy: fine-liner for detail, brush for the main shapes.",
      "Fills are a separate layer printed in register: one solid color that reaches right under its outline, so nothing is left unfilled.",
      "Grain is one color-independent mask per material; marker and highlighter blend with multiply.",
    ],
    see: [{ label: "Paper", to: "/foundations/paper" }],
  },
  {
    slug: "paper",
    title: "Paper",
    summary: "Sheets, edges, desk and the small props that hold them together.",
    facts: [
      "A sheet is a stock color, a baked relief tile lit from the upper left, an edge profile and a short umber shadow. Only the sheet tilts, never the text.",
      "edge=\"cut\" is pure CSS, so ordinary cards cost no SVG. Torn and deckle edges draw an ink outline.",
      "Props: masking and washi tape, paper clips, push-pins, staples, binder clips, stitches, rubber bands, coffee rings.",
      "The desk is a linen weave with a soft vignette.",
    ],
    see: [{ label: "Stickers and doodles", to: "/foundations/stickers-doodles" }],
  },
  {
    slug: "icons",
    title: "Icons",
    summary: "Hand-drawn doodle icons, redrawn at every size instead of scaled.",
    facts: [
      "More than 120 icons, lucide-name compatible, single color with an optional accent.",
      "Size tiers 16, 20, 24, 32, 48, 64, 96 and 128. Small sizes are redrawn with a heavier pen and fewer details, not scaled down.",
      "No lucide-react anywhere: every glyph is one of ours.",
      "Icons are decorative by default (aria-hidden); pair them with a text label or give the button an accessible name.",
    ],
  },
  {
    slug: "stickers-doodles",
    title: "Stickers & doodles",
    summary: "Die-cut stickers, margin doodles, stamps and Stubby the pencil stub.",
    facts: [
      "Stickers are drawings with a fat white die-cut border, a cut line and a short shadow; some peel at a fold line.",
      "Doodles (40 or more) are unframed marks: arrows, stars, tally marks, underlines.",
      "Stubby the pencil stub has poses for idle, wave, think, sleep, write, celebrate, oops and peek, used by Empty, 404 and Spinner.",
      "Art below about 60 px is redrawn with fewer details, because it muddies when scaled down.",
    ],
    see: [{ label: "Icons", to: "/foundations/icons" }],
  },
  {
    slug: "motion",
    title: "Motion",
    summary: "Short, physical, and off when asked.",
    facts: [
      "Durations: press .09 s, hover .12, fade .15, pop .18, sheet .3, drop .34, soak .52. Easings: out, settle and pop.",
      "Interaction never re-renders the art: hover, press and focus toggle pre-drawn layers with opacity and transform.",
      "One token, --ll-motion (1 or 0), collapses every duration. prefers-reduced-motion and [data-motion=\"reduced\"] both set it to 0.",
      "Boiling lines and jitter are decoration and stop under reduced motion.",
    ],
  },
  {
    slug: "density",
    title: "Density",
    summary: "Comfortable, compact and calm: charm is a dial, not a mandate.",
    facts: [
      "comfortable: 40 px hit targets. compact: 32 px. calm: 28 px, hairline pencil rules, no jitter, no fill offset.",
      "Use calm for dense data and long forms. The whole tree switches with data-density on any ancestor.",
      "Type floors stay put: 14 px labels, 16 px input text on touch, 12 px chart axes, 24 px minimum hit box.",
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    summary: "Radix behavior underneath, ink on top: the drawing never gets in the way.",
    facts: [
      "Keyboard and ARIA come from Radix (or native elements) exactly as in shadcn/ui. Ink layers are aria-hidden, pointer-events none and never affect layout.",
      "Text is at least AA against its paper. Focus is a drawn ring that keeps 3:1 against paper.",
      "Hit areas are DOM boxes of at least 24 px; the drawing may be smaller than the target, never larger.",
      "Under forced-colors the drawn borders fall back to real ones. In forced-colors mode chart series switch to pencil patterns.",
    ],
  },
  {
    slug: "theming",
    title: "Theming",
    summary: "One default theme, Notebook. A second one is a block of CSS variables.",
    facts: [
      "Tokens come in four tiers: palette (T0), shadcn roles (T1), recipe knobs like wobble, misregistration and tilt (T2), and geometry and motion (T3).",
      "A theme is a [data-theme=\"name\"] block that overrides the palette, plus an optional small recipe object for pen weights.",
      "Dark mode is shadcn's: the dark class on <html>. It will be its own material system with opaque pens and a normal blend mode.",
      "Components never need editing to be re-themed.",
    ],
    see: [{ label: "Color", to: "/foundations/color" }],
  },
]

export const FOUNDATION_BY_SLUG: ReadonlyMap<string, FoundationTopic> = new Map(FOUNDATIONS.map((t) => [t.slug, t]))
