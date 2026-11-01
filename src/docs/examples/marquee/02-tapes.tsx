import { Marquee, MarqueeItem } from "@/components/ui/marquee"

export const meta = {
  title: "Tapes and directions",
  description: "Any tape from the desk: masking, striped, gingham. direction=\"end\" runs it the other way, speed sets px per second. (washi-dots is for short, large words: its white dots are as big as small letters.)",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">
      <Marquee tape="masking" speed={45} label="Masking tape ticker" controls={false}>
        <MarqueeItem>Handle with care</MarqueeItem>
        <MarqueeItem>This side up</MarqueeItem>
      </Marquee>
      <Marquee tape="washi-stripes" color="sky" direction="end" label="Striped tape ticker">
        <MarqueeItem>New arrivals</MarqueeItem>
        <MarqueeItem>Restocked today</MarqueeItem>
      </Marquee>
      <Marquee tape="washi-gingham" color="tomato" speed={90} label="Gingham ticker">
        <MarqueeItem>Picnic season</MarqueeItem>
        <MarqueeItem>Bring a blanket</MarqueeItem>
      </Marquee>
    </div>
  )
}
