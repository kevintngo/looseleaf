import { Bubble, BubbleContent } from "@/components/ui/bubble"

export const meta = {
  title: "Notes, stickies and your own hand",
  description: "A bubble does not have to be a cloud. A note is a slip of paper folded twice, a sticky is a sticky note, and `pen=\"you\"` writes in blue felt and the script font.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-8 px-4 pb-8 sm:grid-cols-2">
      <Bubble shape="note">
        <BubbleContent seed="note" className="min-h-14" paper={{ tilt: -1.6 }}>
          meet me by the library at four
        </BubbleContent>
      </Bubble>
      <Bubble shape="sticky" variant="secondary">
        <BubbleContent seed="sticky" className="min-h-24 pt-7" paper={{ tilt: 1.8, fastener: "pin" }}>
          buy more ink!
        </BubbleContent>
      </Bubble>
      <Bubble shape="sticky" variant="tinted" align="end">
        <BubbleContent seed="sticky-2" className="min-h-24" paper={{ tilt: -1.4 }}>
          call mum before six
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline" pen="you" align="end" className="max-w-full">
        <BubbleContent seed="you">Make the chips a little smaller, please.</BubbleContent>
      </Bubble>
    </div>
  )
}
