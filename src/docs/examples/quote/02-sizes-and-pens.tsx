import { Quote, QuoteAttribution, QuoteText } from "@/components/ui/quote"

export const meta = {
  title: "Sizes, pens and the rule",
  description: "Three sizes of marks (the padding grows with them), felt pens instead of marker, and a pencil rule down the edge that runs between the marks of a longer quotation.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid items-start gap-x-10 gap-y-8 sm:grid-cols-2">
      <Quote>
        <QuoteText size="sm" className="text-xl">Small and quiet.</QuoteText>
      </Quote>
      <Quote>
        <QuoteText size="lg" tone="blue" weight="brush">Big and blue.</QuoteText>
        <QuoteAttribution className="ps-[4.75rem]">Sam</QuoteAttribution>
      </Quote>
      <Quote>
        <QuoteText rule tone="red" className="max-w-xs">A rule down the side, in pencil, so a long quotation keeps its edge all the way down.</QuoteText>
      </Quote>
      <Quote>
        <QuoteText tone="ink" weight="fine">Ink, with a fine hand.</QuoteText>
      </Quote>
    </div>
  )
}
