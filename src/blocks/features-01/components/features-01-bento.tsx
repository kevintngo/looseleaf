import { Corkboard } from "@/components/ui/corkboard"
import { Paper } from "@/components/ui/paper"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Receipt, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"
import { Ribbon } from "@/components/ui/ribbon"
import { StickyNote, StickyNoteContent, StickyNoteTitle } from "@/components/ui/sticky-note"
import { Strike } from "@/components/ui/strike"
import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"
import { Underline } from "@/components/ui/underline"

function Features01Bento() {
  return (
    <div className="relative" data-slot="features-bento">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Corkboard label="Cork" disabled seed="features-cork" className="h-full min-h-0" />
      </div>
      <ul role="list" className="relative grid list-none items-start gap-9 p-9 @xl:grid-cols-2 @xl:p-11 @4xl:grid-cols-6">
        <li className="@xl:col-span-2 @4xl:col-span-4 @4xl:row-span-2 @4xl:self-stretch">
          <Paper
            as="article"
            stock="paper"
            rules="ruled"
            tilt={0.4}
            fastener="clip"
            seed="bento-write"
            className="flex h-full flex-col pt-4 pe-6 pb-7 ps-14 text-[17px] leading-7 rtl:[&>[data-slot=paper-rules]]:-scale-x-100"
          >
            <p className="font-type text-sm leading-7 tracking-[0.18em] text-pencil-text uppercase">Kickoff notes / Tuesday</p>
            <h3 className="font-script text-3xl leading-7 font-bold">Write together</h3>
            <p className="text-ink-soft">Everyone edits the same page at once. Name flags show who is where, and nobody has to say &ldquo;are you in the doc?&rdquo; ever again.</p>
            <ul role="list" className="mt-7 grid list-none">
              <li>
                Ship the <Underline tone="blue">tape update</Underline> before Friday
              </li>
              <li>
                Ask Ada about the cover <Ribbon variant="flag" tone="sky" size="sm" className="-my-1 align-middle">Ada</Ribbon>
              </li>
              <li>
                <Strike>Rename the tabs</Strike> done, thanks Jo
              </li>
              <li>Draw something for the launch post</li>
            </ul>
          </Paper>
        </li>

        <li className="@4xl:col-span-2">
          <StickyNote as="article" color="green" done fastener="pin" seed="bento-tick" className="mx-auto w-full max-w-56">
            <StickyNoteTitle>
              <h3 className="inline">Tick things off</h3>
            </StickyNoteTitle>
            <StickyNoteContent className="text-lg">Tasks live next to the notes they came from.</StickyNoteContent>
          </StickyNote>
        </li>

        <li className="@4xl:col-span-2">
          <Polaroid as="article" tape="top" tapeKind="washi-stripes" seed="bento-draw" className="mx-auto w-full max-w-64">
            <PolaroidImage scene="night" seed="bento-night" />
            <PolaroidCaption className="flex-col gap-1">
              <h3 className="inline">Draw on anything</h3>
              <span className="font-hand text-sm leading-tight font-normal text-ink-soft">A sketch pad on every page.</span>
            </PolaroidCaption>
          </Polaroid>
        </li>

        <li className="@4xl:col-span-3">
          <Receipt seed="bento-receipt" className="w-full max-w-72">
            <ReceiptHeader>
              <h3>Version history</h3>
              <p>every draft, itemised</p>
            </ReceiptHeader>
            <ReceiptLines>
              <ReceiptLine price="9:02">Draft one</ReceiptLine>
              <ReceiptLine price="9:40">Ada&rsquo;s edits</ReceiptLine>
              <ReceiptLine price="11:15">Cut the intro</ReceiptLine>
              <ReceiptLine price="14:30">Final, really</ReceiptLine>
            </ReceiptLines>
            <ReceiptTotal label="PAGES KEPT" circled seed="bento-total">
              12
            </ReceiptTotal>
          </Receipt>
        </li>

        <li className="@4xl:col-span-3">
          <Ticket stock="index-card" seed="bento-ticket" className="mx-auto">
            <TicketBody>
              <TicketTitle>
                <h3 className="inline">Works offline</h3>
              </TicketTitle>
              <TicketDescription>Plane, train, tunnel: keep writing</TicketDescription>
            </TicketBody>
            <TicketStub>
              <TicketDescription>admit</TicketDescription>
              <TicketNumber>No. 0007</TicketNumber>
            </TicketStub>
          </Ticket>
        </li>
      </ul>
    </div>
  )
}

export { Features01Bento }
