import { IndexCard, IndexCardContent, IndexCardFooter, IndexCardHeader, IndexCardTitle } from "@/components/ui/index-card"

export const meta = {
  title: "Taped, clipped, stacked",
  description: "Paper's tape and fasteners work on a card as on any sheet. Cards turn under a quarter of a degree, so the printed lines stay level under the text.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid gap-x-10 gap-y-12 p-4 md:grid-cols-2">
      <IndexCard tape="both" tapeKind="washi-dots" stack={1} seed="washi" className="min-h-[194px]">
        <IndexCardHeader>
          <IndexCardTitle>Taped up</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>
          <p>two strips of washi</p>
        </IndexCardContent>
      </IndexCard>
      <IndexCard fastener="clip" seed="clip" className="min-h-[194px]">
        <IndexCardHeader>
          <IndexCardTitle>Clipped</IndexCardTitle>
        </IndexCardHeader>
        <IndexCardContent>
          <p>a paper clip, top right</p>
        </IndexCardContent>
        <IndexCardFooter>
          <span>page 1 of 1</span>
        </IndexCardFooter>
      </IndexCard>
    </div>
  )
}
