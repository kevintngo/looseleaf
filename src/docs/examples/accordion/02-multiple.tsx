import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export const meta = {
  title: "Several open, square bracket",
  description: "`type=\"multiple\"` keeps every row you open. `bracket=\"square\"` swaps the brace for a square bracket, and `bracket={false}` leaves the margin empty. Buttons inside a panel keep their focus rings: an open panel is not clipped.",
  layout: "center" as const,
  height: 420,
}

export default function Example() {
  return (
    <Accordion type="multiple" bracket="square" defaultValue={["shipping", "returns"]} className="w-full max-w-md">
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent className="flex flex-col items-start gap-3">
          <p>Orders leave the desk on Tuesdays and Fridays, wrapped in brown paper and tied with string.</p>
          <Button variant="outline" size="sm">
            Track a parcel
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Send it back within thirty days, unused and unlined.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="notes">
        <AccordionTrigger>Gift notes</AccordionTrigger>
        <AccordionContent>We write these by hand. Tell us what to say in the order comments.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="wholesale" disabled>
        <AccordionTrigger>Wholesale (closed for the season)</AccordionTrigger>
        <AccordionContent>Back in spring.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
