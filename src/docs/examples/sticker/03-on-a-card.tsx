import { IndexCard, IndexCardContent, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "Slapped on a card",
  description: "A sticker on an index card. Size it small and it switches to its 64 px redraw.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <IndexCard seed="order-4471" className="relative max-w-sm">
      <Sticker name="done" size={64} className="absolute -top-5 -right-4" rotate={9} />
      <IndexCardHeader>
        <IndexCardTitle>Order 4471</IndexCardTitle>
      </IndexCardHeader>
      <IndexCardContent>
        <p className="max-w-[16rem]">Two notebooks, a pack of felt tips and one very small pencil.</p>
        <div className="relative">
          <Sticker name="cursor-click" size={40} rotate={-6} className="absolute -top-1 left-0" />
          <p className="ps-12">Track parcel</p>
        </div>
      </IndexCardContent>
    </IndexCard>
  )
}
