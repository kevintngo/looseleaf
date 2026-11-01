import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "typography",
  title: "Typography",
  category: "Typography",
  description:
    "The type scale and a Prose wrapper for the notebook: script headings with a hand-drawn rule, body text in the hand at 17 px on a 1.7 line, blue felt links, marker bullets, mono code chips. Prose styles markup you did not write (markdown, CMS html, MDX).",
  status: "new",
  parts: [
    { name: "H1", description: "Page title: script 48 px bold, with a double hand-drawn rule.", props: [{ name: "rule", type: "boolean", default: "true", description: "Draw the rule under the heading." }, { name: "seed", type: "string | number", description: "Picks which of the three hands draws the rule. Default: from useId()." }] },
    { name: "H2", description: "Section title: script 36 px bold, with a single pencil rule.", props: [{ name: "rule", type: "boolean", default: "true", description: "Draw the rule under the heading." }, { name: "seed", type: "string | number", description: "Picks which of the three hands draws the rule." }] },
    { name: "H3", description: "Script 28 px bold." },
    { name: "H4", description: "Hand 20 px bold." },
    { name: "P", description: "Body paragraph: 17 px on a 1.7 line; a paragraph after a paragraph gets room." },
    { name: "Lead", description: "The line under a title: 20 px in the muted ink." },
    { name: "Large", description: "18 px bold." },
    { name: "Small", description: "14 px bold, tight." },
    { name: "Muted", description: "14 px in the muted ink, for dates, captions and second lines." },
    { name: "List", description: "A bulleted list with marker-colored bullets; `ordered` makes it a numbered <ol> with script numerals. Children are <li>s.", props: [{ name: "ordered", type: "boolean", default: "false", description: "Render an <ol>." }] },
    { name: "InlineCode", description: "Code in a sentence: a mono chip on a paper-shade wash whose corners are not quite square." },
    { name: "Blockquote", description: "A quotation set into the text: a marker rule down the start edge and the words in the script role. For a pull quote with drawn quotation marks use Quote." },
    {
      name: "Prose",
      description:
        "Wraps raw markup and styles it, with one hoisted stylesheet scoped to `[data-slot=\"typography-prose\"]` (in the components layer and written with :where(), so any utility class on a child still wins). At most 64 characters wide. Put `ll-not-prose` on a child to opt out. It styles, it does not sanitize: pass trusted or sanitized HTML.",
    },
  ],
  a11y: [
    "Real elements with their real semantics: h1 to h4, p, ul/ol, blockquote, code. Nothing here changes the outline or the reading order.",
    "Body text is the hand at 17 px in ink on paper (14:1); muted text is the muted-foreground token (4.5:1 or better on paper and on the desk); links are blue felt (7:1) and bold with a thick underline, never color alone.",
    "The hand-drawn heading rule is a baked alpha mask painted by ::after; browsers without mask support keep a plain pencil border. Windows high contrast paints the rule with system text color.",
    "Line length is capped at 64 characters in Prose; long words wrap and code blocks scroll sideways (a table wider than the column needs a scrolling wrapper of its own).",
  ],
  usage: `import { H1, Lead, P, InlineCode, Prose } from "@/components/ui/typography"

export function Article() {
  return (
    <article>
      <H1>Notes on keeping a notebook</H1>
      <Lead>A small argument you have with yourself.</Lead>
      <P>Run <InlineCode>npm run notes</InlineCode> to see them.</P>
    </article>
  )
}

export function Markdown({ html }: { html: string }) {
  return <Prose dangerouslySetInnerHTML={{ __html: html }} />
}`,
  related: ["lettering", "quote", "handwritten", "label"],
} satisfies ComponentDoc
