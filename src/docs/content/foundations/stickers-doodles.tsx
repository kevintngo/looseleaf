import { AnchorHeading, Callout, CodeBlock, InlineCode, Prose, Section } from "@/docs/kit"
import { DOODLE_ENTRIES, PEELABLE_ENTRIES, POSES, STAMP_ENTRIES } from "./_shared-b/catalog"
import { StubbySection } from "./_shared-b/mascot-sections"
import { ArtCluster, BadgeShelf, DoodleShelf, SealLab, StampLab, StampShelf, StickerShelf } from "./_shared-b/stickers-sections"

const USAGE = `import { Doodle } from "@/components/ui/doodle"
import { Mascot } from "@/components/ui/mascot"
import { Stamp } from "@/components/ui/stamp"
import { Sticker } from "@/components/ui/sticker"

<Doodle name="star" size={96} rotate={-8} />         // a margin mark; rotate the drawing, never words
<Sticker name="rocket" size={96} peel />             // die-cut, with a lifted corner
<Sticker name="rocket" label="Launched" />           // meaningful: role="img" and aria-label
<Stamp name="stamp-approved" />                      // flat rubber ink; its words are its accessible name
<Mascot pose="think" size={48} />                    // Stubby: a die-cut sticker, redrawn at every size`

export default function StickersDoodlesBody() {
  return (
    <>
      <ArtCluster />

      <Section id="doodles" title="Doodles" description={`${DOODLE_ENTRIES.length} unframed marks for margins, corners and empty states: stars, clouds, arrows, flourishes. Press one to copy it.`}>
        <DoodleShelf />
        <Prose>
          <p>
            A doodle has no white border (that would make it a sticker), one flat fill in register, and at most two stationery colors. Below 72 px it is <strong>redrawn</strong> with its silhouette and one
            identifying detail, because a 96 px drawing shrunk to 48 px is mud. Turn a doodle with <InlineCode>rotate</InlineCode>; corner flourishes are drawn for the top left and turned by you.
          </p>
        </Prose>
      </Section>

      <Section id="stickers" title="Stickers" description={`${PEELABLE_ENTRIES.length} die-cut stickers: a fat white border, a cut line and a short shadow. Some come with a corner you can lift.`}>
        <StickerShelf />
        <Prose>
          <p>
            Stickers are the loud end of the set: saturated stationery colors are allowed here, and only in the decoration layer, so the real interface stays calm. The shadow is a CSS filter, never a blur inside the drawing. The
            white border is one fat stroke of the silhouette, so any shape gets a border that follows it. Stickers are decorative unless you pass <InlineCode>label</InlineCode>.
          </p>
        </Prose>
      </Section>

      <Section id="badges" title="Badges and seals" description="Round things that say somebody looked at this: hand-lettered badge stickers, and a generator for the rest.">
        <BadgeShelf />
        <AnchorHeading id="make-a-seal" level={3}>
          Make a seal
        </AnchorHeading>
        <Prose>
          <p>
            <InlineCode>Seal</InlineCode> draws a badge for any words or a hand-drawn tick or star. It is the same pens and the same solid fills as a sticker, without the white edge.
          </p>
        </Prose>
        <SealLab />
      </Section>

      <Section id="stamps" title="Stamps" description={`${STAMP_ENTRIES.length} rubber stamps. Flat ink through a wear mask, a double rule, typewriter capitals, a slight tilt: a stamp is a solid shape, not a pen stroke.`}>
        <StampShelf />
        <AnchorHeading id="make-a-stamp" level={3}>
          Make a stamp
        </AnchorHeading>
        <StampLab />
        <Callout tone="note" title="A stamp reads as its words">
          <p>
            Unlike a sticker, a stamp is <InlineCode>role=&quot;img&quot;</InlineCode> with the words on it as its name, because a stamp usually is the message. Pass <InlineCode>label</InlineCode> to say something else, and put
            the same fact in text nearby if the state matters.
          </p>
        </Callout>
      </Section>

      <Section id="stubby" title="Stubby" description={`The pencil stub who does the drawing. One body, ${POSES.length} poses, every size redrawn.`}>
        <StubbySection />
        <Prose>
          <p>
            Stubby is the face of the empty and error states. Pick the pose for the situation, not the mood: a quiet inbox is <InlineCode>sleep</InlineCode> or <InlineCode>celebrate</InlineCode>, a failed save is{" "}
            <InlineCode>oops</InlineCode>, a 404 is <InlineCode>shrug</InlineCode>. He is decorative (<InlineCode>aria-hidden</InlineCode>) unless you give him a <InlineCode>label</InlineCode>: the words next to him carry the
            meaning, so write them.
          </p>
        </Prose>
      </Section>

      <Section id="usage" title="Using the art">
        <CodeBlock code={USAGE} lang="tsx" title="art.tsx" />
        <Callout tone="note" title="Cheap to ship, cheap to show">
          <p>
            Each kind of art is its own registry item (<InlineCode>ink-doodles</InlineCode>, <InlineCode>ink-stickers</InlineCode>, <InlineCode>ink-mascot</InlineCode>), so installing a button
            never downloads the sticker book. A sticker at 96 px is about 35 KB of svg (all {PEELABLE_ENTRIES.length} of them: roughly 3 MB), which is why every gallery here draws a block only when it scrolls near.
          </p>
        </Callout>
      </Section>
    </>
  )
}
