import { Quote, QuoteAttribution, QuoteText } from "@/components/ui/quote"
import { Paper } from "@/components/ui/paper"
import { Signature } from "@/components/ui/signature"

export const meta = {
  title: "A testimonial card",
  description: "A quote on a taped index card with the customer's signature under it: three hand-made parts that share a pen. The words sit on the card's printed rules.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="index-card" tape="corner" tilt seed="quote-card" className="w-full max-w-md p-7">
      <p className="h-4 font-type text-xs leading-4 text-pencil-text">Kind words</p>
      <Quote className="gap-1">
        <QuoteText animate size="md" className="pt-0 leading-[30px]">
          I stopped using three apps the week I found this. It just looks like my notebook.
        </QuoteText>
        <QuoteAttribution>Mira, ceramicist</QuoteAttribution>
      </Quote>
      <div className="mt-1.5 flex justify-end">
        <Signature size="sm" animate delay={900}>
          Mira Okonkwo
        </Signature>
      </div>
    </Paper>
  )
}
