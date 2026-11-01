import { Mascot } from "@/components/ui/mascot"
import { Sticker } from "@/components/ui/sticker"
import { Stamp } from "@/components/ui/stamp"
import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"

function SignupTicket() {
  return (
    <div data-slot="signup-ticket" aria-hidden="true" className="relative h-[30rem] w-[23rem] shrink-0">
      <Ticket stock="kraft" tilt={-4} stubWidth={92} seed="signup-02-ticket" className="absolute start-0 top-[5.5rem] min-h-36 w-[22rem]">
        <TicketBody>
          <TicketTitle>Admit one</TicketTitle>
          <TicketDescription>The Looseleaf Club</TicketDescription>
          <p className="text-xs text-ink-soft">Founding season - general</p>
        </TicketBody>
        <TicketStub>
          <span className="text-xs">No.</span>
          <TicketNumber>0001</TicketNumber>
        </TicketStub>
      </Ticket>
      <Sticker name="party-popper" size={92} rotate={-10} className="absolute start-2 top-2" />
      <Stamp name="stamp-member" size={120} tilt={-8} className="absolute end-0 top-[12.5rem]" />
      <Mascot pose="celebrate" size={190} seed="signup-02-stubby" className="absolute start-[7.5rem] bottom-0 [--ll-blend:normal]" />
      <p className="absolute start-2 bottom-10 max-w-[7.5rem] font-script text-[2rem] leading-[0.95] font-bold text-ink">your seat is saved</p>
    </div>
  )
}

export { SignupTicket }
