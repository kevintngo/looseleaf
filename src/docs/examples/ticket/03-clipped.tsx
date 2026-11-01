import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"
import { Tape } from "@/components/ui/tape"

export const meta = {
  title: "Taped to the page",
  description: "A ticket is an ordinary positioned box: tape and stamps go on it with plain className. Its shadow follows the notches and the holes.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="relative">
      <Tape kind="washi-stripes" length={72} height={22} angle={-24} className="absolute -top-2 -left-6 z-10" />
      <Ticket stock="kraft" tilt={-2} seed="taped" role="group" aria-label="Ticket 0099" className="max-w-md">
        <TicketBody>
          <TicketTitle>Admit one</TicketTitle>
          <TicketDescription>Museum of small things</TicketDescription>
        </TicketBody>
        <TicketStub>
          <TicketNumber className="text-lg">0099</TicketNumber>
        </TicketStub>
      </Ticket>
    </div>
  )
}
