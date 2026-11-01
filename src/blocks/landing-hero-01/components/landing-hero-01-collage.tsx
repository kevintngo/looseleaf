import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { Mascot } from "@/components/ui/mascot"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Sticker } from "@/components/ui/sticker"
import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"

function LandingHero01Collage() {
  return (
    <div
      data-slot="landing-hero-collage"
      className="mx-auto flex max-w-full flex-wrap items-start justify-center gap-x-8 gap-y-8 pt-2 @xl:relative @xl:block @xl:h-[30rem] @xl:w-[26rem] @xl:pt-0"
    >
      <Polaroid seed="hero-photo" tape="top" tapeKind="washi-dots" className="w-60 max-w-full @xl:absolute @xl:start-0 @xl:top-2">
        <PolaroidImage scene="hills" label="A drawn hillside with one tree and a sun" seed="hero-hills" />
        <PolaroidCaption>monday, 9:41</PolaroidCaption>
      </Polaroid>

      <StickyNote color="yellow" fastener="pin" seed="hero-todo" className="w-44 @xl:absolute @xl:start-[13.5rem] @xl:top-20">
        <StickyNoteTitle>todo</StickyNoteTitle>
        <StickyNoteContent>ship the new page (friday!)</StickyNoteContent>
      </StickyNote>

      <IndexCard seed="hero-roadmap" fastener="clip" className="min-h-0 w-60 max-w-full @xl:absolute @xl:start-10 @xl:top-[18rem]">
        <IndexCardHeader>
          <IndexCardTitle>Roadmap</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>
          <p>1. draw the thing</p>
          <p>2. show a friend</p>
          <p>3. ship it</p>
        </IndexCardContent>
        <IndexCardFooter>
          <span className="ll-num">no. 0042</span>
        </IndexCardFooter>
      </IndexCard>

      <Mascot pose="wave" size={184} className="h-[184px] w-auto @xl:absolute @xl:end-0 @xl:bottom-0" />
      <Sticker name="rocket" size={76} rotate={10} className="hidden @xl:absolute @xl:-top-2 @xl:end-2 @xl:block" />
    </div>
  )
}

export { LandingHero01Collage }
