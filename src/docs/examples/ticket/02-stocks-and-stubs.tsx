import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"

export const meta = {
  title: "Stocks, stubs, used",
  description: "Kraft, cream, cinema yellow and tram-ticket pink. The stub can be at the start, wider, or not there; a punched hole says it has been used.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="grid justify-items-center gap-y-9 p-4">
      <Ticket stock="sticky-yellow" punched seed="cinema" role="group" aria-label="Cinema ticket, used">
        <TicketBody>
          <TicketTitle>Cinema</TicketTitle>
          <TicketDescription>Sat 27 Sep - 19:30</TicketDescription>
          <TicketNumber>Screen 2 - Row F - Seat 14</TicketNumber>
        </TicketBody>
        <TicketStub>
          <TicketNumber className="text-lg">1187</TicketNumber>
        </TicketStub>
      </Ticket>
      <Ticket stock="index-card" stub="start" stubWidth={80} seed="raffle" role="group" aria-label="Raffle ticket 311">
        <TicketBody>
          <TicketTitle>Raffle</TicketTitle>
          <TicketDescription>Win a very small pencil</TicketDescription>
        </TicketBody>
        <TicketStub>
          <TicketNumber className="text-xl">311</TicketNumber>
        </TicketStub>
      </Ticket>
      <Ticket stock="sticky-pink" stub="none" seed="tram" role="group" aria-label="One tram ride">
        <TicketBody className="items-center text-center">
          <TicketTitle>One ride</TicketTitle>
          <TicketDescription>Good until the last tram</TicketDescription>
        </TicketBody>
      </Ticket>
      <Ticket stubWidth={120} seed="fair" role="group" aria-label="Fair entry 0007">
        <TicketBody>
          <TicketTitle>Admit one</TicketTitle>
          <TicketDescription>The Looseleaf Fair - Sunday</TicketDescription>
        </TicketBody>
        <TicketStub>
          <TicketNumber className="text-xl">
            <span className="block text-xs">No.</span>
            0007
          </TicketNumber>
        </TicketStub>
      </Ticket>
    </div>
  )
}
