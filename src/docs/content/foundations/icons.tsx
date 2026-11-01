import { AnchorHeading, Callout, CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { ICON_ENTRIES } from "./_shared-b/catalog"
import { IconBrowser } from "./_shared-b/icon-browser"
import { AliasTable, IconStrip, NameResolver, SizesLab, UndrawnList } from "./_shared-b/icons-sections"

const USAGE = `import { Icon } from "@/components/ui/icon"

<Icon name="trash" />                          // 1em wide (16 px in a button), the 16 px redraw, ink, decorative (aria-hidden)
<Icon name="trash" size={24} />                // the 24 px master
<Icon name="bell" size={48} tone="doodle" />   // the drawing with its color wash
<Icon name="trash" label="Delete" />           // meaningful on its own: role="img" and aria-label
<Icon name="Trash2" />                         // any lucide spelling: Trash2, trash-2, TrashIcon

<Button>
  <Icon name="plus" />                         // inside a Button it follows the button's size
  New page
</Button>`

export default function IconsBody() {
  const count = ICON_ENTRIES.length
  return (
    <>
      <IconStrip />

      <Section id="browser" title="Every icon" description={`All ${count} drawn icons. Search by name, by an older lucide spelling or by an idea; press one to copy its JSX.`}>
        <IconBrowser />
      </Section>

      <Section id="sizes" title="Redrawn, not scaled" description="A pen has a width. Shrink a 24 px drawing to 16 px and its lines get thin and its details mush; so each icon is drawn again for the small sizes.">
        <SizesLab />
        <Prose>
          <p>
            The engine picks the drawing from the pixel size: up to 13 px the <strong>micro</strong> redraw when the icon has one (else the 16 px one), 14 to 19 px the <strong>16 px redraw</strong>,
            20 to 40 px the <strong>24 px master</strong>, and from 41 px the master plus <strong>extra detail</strong> for icons that have it. The pen is a size-dependent width, never a scaled one, and
            ink icons up to 20 px are drawn a touch heavier (<InlineCode>weight</InlineCode> changes that) so they hold their own beside bold text.
          </p>
        </Prose>
      </Section>

      <Section id="usage" title="Using an icon">
        <CodeBlock code={USAGE} lang="tsx" title="icon.tsx" />
        <Prose>
          <ul>
            <li>
              <strong>Decorative by default.</strong> The svg is <InlineCode>aria-hidden</InlineCode>. Give <InlineCode>label</InlineCode> when the icon is the only thing that says what a control does.
            </li>
            <li>
              <strong>Ink is the text color.</strong> In <InlineCode>ui</InlineCode> tone the strokes are <InlineCode>currentColor</InlineCode>, so <InlineCode>text-destructive</InlineCode> or a hover state recolors them.
              <InlineCode> doodle</InlineCode> tone adds a pale color wash to the icons that carry one.
            </li>
            <li>
              <strong>Right to left.</strong> Direction glyphs (chevrons, arrows, panels) turn themselves around in a right-to-left page. <InlineCode>flip</InlineCode> mirrors an icon whose art allows it.
            </li>
            <li>
              <strong>No lucide-react.</strong> Every glyph is one of ours. The names are lucide&apos;s, so code written for shadcn/ui keeps working.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section id="names" title="Names and aliases" description="Icons keep lucide's names. Older names and PascalCase exports resolve to the same drawing.">
        <NameResolver />
        <AnchorHeading id="older-names" level={3}>
          Icons with older names
        </AnchorHeading>
        <AliasTable />
      </Section>

      <Section id="undrawn" title="Not drawn yet">
        <UndrawnList />
      </Section>

      <Section id="cost" title="What the gallery costs">
        <Callout tone="note" title="Only what you can see is drawn">
          <p>
            Drawn by hand means real geometry, not a font: an icon at 24 px is about 3 KB of svg, so the whole set at 24 px is close to half a megabyte, and the sticker gallery (96 drawings at 96 px) is over 3 MB.
            Every gallery on these pages draws a block of tiles only when it scrolls near the screen, and keeps what it has drawn. In your app an icon costs what it costs on the page it is on.
          </p>
        </Callout>
      </Section>
    </>
  )
}
