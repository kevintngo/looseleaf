"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Lettering } from "@/components/ui/lettering"
import { Mascot } from "@/components/ui/mascot"
import { Sticker } from "@/components/ui/sticker"
import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub } from "@/components/ui/ticket"

export default function Cta01() {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} className="@container w-full">
      <div className="px-4 py-14 @xl:px-8 @xl:py-20">
        <div className="relative mx-auto max-w-4xl">
          <Ticket stock="index-card" stubWidth={112} seed="cta-ticket" className="max-w-none">
            <TicketBody className="gap-3 px-6 py-8 @xl:px-10 @xl:py-10">
              <TicketDescription>Admit one team</TicketDescription>
              <Lettering as="h2" id={titleId} size="md" tone="marker" wobble={0.4} seed="cta-title" className="text-start @xl:text-6xl">
                Ready when you are.
              </Lettering>
              <p className="max-w-lg font-hand text-lg/7 text-ink-soft">Start a notebook in under a minute. It is free for teams of five, and there is no card to enter.</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href="#start">
                    Start writing
                    <Icon name="arrow-right" className="rtl:-scale-x-100" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href="#talk">or talk to a human</a>
                </Button>
              </div>
            </TicketBody>
            <TicketStub className="gap-1">
              <Mascot pose="celebrate" size={84} />
              <TicketNumber>No. 0001</TicketNumber>
            </TicketStub>
          </Ticket>
          <Sticker name="party-popper" size={76} rotate={-14} className="pointer-events-none absolute -start-5 -top-9 hidden @xl:block" />
        </div>
      </div>
    </section>
  )
}
