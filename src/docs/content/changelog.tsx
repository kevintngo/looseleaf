import { useCatalog } from "../core/catalog-context"
import { addCommand } from "../core/install"
import { categoryAnchor } from "../core/nav"
import { Link } from "../core/router"
import { paths } from "../core/router-core"
import { AnchorHeading, Callout, Chip, InlineCode, Prose, Section } from "../kit"

const HIGHLIGHTS = [
  "Every shadcn/ui component, with the same parts, props and data-slot names, on Radix. Swap a file, keep your JSX.",
  "Around sixty originals that shadcn does not have: paper objects, hand marks, stickers, a sketchpad, hand-drawn charts and a chat kit.",
  "A drawing engine that writes with pressure and grain, fills in register, and a theme made only of CSS variables.",
  "A shadcn registry: one command adds a component, its recipe and its packages to your repo.",
  "Three densities, so the charm can be turned down to a hairline for dense screens.",
]

const ENGINE = [
  "Pens with pressure, swell and dry-tooth skips: felt, brush, pencil, marker and highlighter, each with a baked grain mask. No filters at runtime and no SVG turbulence.",
  "Every random choice is seeded from useId() or a seed prop, so the server and the client draw the same hand and hydration is exact.",
  "Drawings are pure functions of (recipe, size, seed, tier, density), memoised in 4 px buckets. States are CSS on the host (hover, pressed, focus-visible, checked, invalid, disabled), so a click never redraws.",
  "Two tiers (lo for the interface, hi for hero art and screenshots) and three densities (comfortable, compact, calm).",
  "Paper is CSS wherever it can be: a cut sheet costs no SVG at all, and torn, deckled, pinked or scalloped edges draw their outline once.",
]

const THEME = [
  "The Notebook theme: cream paper on a sage desk, felt-tip ink, terracotta marker, yellow highlighter. Contrast is measured: ink on paper is 14:1, and every text pair in the token table is checked by the QA gate.",
  "Everything is a --ll-* custom property that shadcn's semantic names alias, so a second theme is a CSS block, not a fork.",
  "Reduced motion (the OS setting or data-motion=\"reduced\") zeroes every duration; forced-colors mode swaps the overlay drawings for real borders.",
  "Kevin Sans in three tuned roles, and IBM Plex Mono for code.",
]

const REGISTRY = [
  "An umbrella item (looseleaf) and one item per component, hook, block and font. Art ships as separate items, so installing a button does not download the sticker book.",
  "Works with the namespace (@looseleaf/button) or by URL. Verified with the real shadcn CLI against a standard project, a Next.js-shaped one and one with non-standard aliases.",
  "A component brings its own recipe file. Installing twice changes nothing.",
]

const QUALITY = [
  "Around 6,500 automated tests: roles and names, keyboard behavior, controlled and uncontrolled use, forms, axe on every component and every docs page.",
  "Every example is also rendered to a string twice and compared, hydrated with console errors trapped, and mounted at four box sizes to check that something was drawn.",
  "A house-rules linter, a Tailwind class checker and a token checker run in one gate (node tools/qa.mjs).",
]

const LIMITS = [
  "The Notebook theme is light only. The dark variant exists for a later theme; a dark material system (opaque pens, no multiply) is planned.",
  "Long lists do not draw a rule per row on purpose: table and menu rows use plain CSS, and calm density is there for the rest.",
  "A few CSS effects only a real engine can confirm, such as filters on SVG roots and clip-path on SVG groups, are still to be checked in every browser: Safari and Firefox get the first pass.",
  "Textarea auto-grow uses field-sizing, which Firefox does not ship yet; the textarea keeps a minimum height there.",
]

function List({ items }: { items: readonly string[] }) {
  return (
    <Prose>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Prose>
  )
}

export default function ChangelogBody() {
  const catalog = useCatalog()
  return (
    <div className="dk-changelog">
      <section className="dk-release" aria-labelledby="release-0-1-0">
        <h2 id="release-0-1-0" className="dk-heading" data-level={2}>
          0.1.0 <span className="dk-release-title">First sheet</span>
        </h2>
        <p className="dk-hint">September 2026. The first version: the whole library, the registry and this site.</p>

        <Callout tone="note" title="Versions before 1.0">
          <p>
            The shadcn API of each component (parts, props, <InlineCode>data-slot</InlineCode>s) is the contract and will not break. Looseleaf's own additions (<InlineCode>tone</InlineCode>, <InlineCode>seed</InlineCode>,{" "}
            <InlineCode>tilt</InlineCode>, <InlineCode>stock</InlineCode>...) are additive, but until 1.0 a minor version may still rename one. Read this page when you update.
          </p>
        </Callout>

        <Section id="highlights" title="Highlights" level={3}>
          <List items={HIGHLIGHTS} />
        </Section>

        <Section id="components" title="Components" level={3} description={catalog.components.length > 0 ? `${catalog.components.length} components in ${catalog.groups.length} categories.` : undefined}>
          {catalog.groups.length > 0 ? (
            <ul className="dk-chips" role="list" aria-label="Categories">
              {catalog.groups.map((g) => (
                <li key={g.category}>
                  <Link to={`${paths.components()}#${categoryAnchor(g.category)}`} className="dk-chip-link">
                    {g.category} <Chip tone="count">{g.items.length}</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <Prose>
            <p>
              Everything upstream is here, from <InlineCode>Accordion</InlineCode> to <InlineCode>Toggle Group</InlineCode>, including the newer ones (<InlineCode>Field</InlineCode>, <InlineCode>Item</InlineCode>,{" "}
              <InlineCode>Empty</InlineCode>, <InlineCode>Button Group</InlineCode>, <InlineCode>Input Group</InlineCode>, <InlineCode>Spinner</InlineCode>, <InlineCode>Kbd</InlineCode>). The originals are grouped like this:
            </p>
            <ul>
              <li>
                <strong>Paper.</strong> Page, Desk, Notebook, Index card, Sticky note, Napkin, Polaroid, Receipt, Ticket, Envelope, Folder, Clipboard, Label tag, Bookmark, Tape and fasteners.
              </li>
              <li>
                <strong>Marks.</strong> Annotate, Highlight, Circled, Underline, Strike, Bracket, Callout, Arrow, Asterisk, Squiggle, Scribble, Tally, Lettering, Handwritten.
              </li>
              <li>
                <strong>Stickers and doodles.</strong> Sticker, Sticker board, Sticker picker, Sticker sheet, Stamp, Doodle, and Stubby the pencil (fifteen poses).
              </li>
              <li>
                <strong>Drawing.</strong> Sketchpad with replay and export, Signature pad.
              </li>
              <li>
                <strong>Charts.</strong> Bar, line, area, pie and donut, radar, radial and gauge, scatter, heatmap, tally chart, sparklines, with hand-drawn annotations and a color-is-not-the-only-channel mode.
              </li>
              <li>
                <strong>Chat.</strong> Message, Bubble, Prompt input, Typing indicator, Message scroller, Attachment, Code block.
              </li>
              <li>
                <strong>Interactive.</strong> Rating, Stepper, Marquee, Typewriter, Reveal, Confetti, Flip card, Tear-off, Boil.
              </li>
              <li>
                <strong>Icons.</strong> 160 hand-drawn icons under lucide's names, redrawn for small sizes instead of scaled.
              </li>
            </ul>
          </Prose>
        </Section>

        <Section id="engine" title="The engine" level={3}>
          <List items={ENGINE} />
        </Section>

        <Section id="theme" title="Theme and tokens" level={3}>
          <List items={THEME} />
        </Section>

        <Section id="registry" title="Registry and install" level={3}>
          <List items={REGISTRY} />
          <Prose>
            <p>
              Start with <InlineCode>{addCommand("npm", "button")}</InlineCode>, or read <Link to={paths.gettingStarted}>Getting started</Link>.
            </p>
          </Prose>
        </Section>

        <Section id="quality" title="Quality" level={3}>
          <List items={QUALITY} />
        </Section>

        <Section id="limits" title="Known limits" level={3} description="Said plainly, so nobody finds them by surprise.">
          <List items={LIMITS} />
        </Section>

        <Section id="next" title="What is next" level={3}>
          <Prose>
            <ul>
              <li>A second theme, to prove the token architecture on real ground: a heavier-pen zine look and a forest sketchbook.</li>
              <li>A dark material system.</li>
              <li>A browser pass over the CSS that only a real engine can confirm.</li>
              <li>More blocks, and templates built from them.</li>
            </ul>
          </Prose>
        </Section>
      </section>
    </div>
  )
}
