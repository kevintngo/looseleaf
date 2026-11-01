import * as React from "react"

import { Button } from "@/components/ui/button"
import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"

export const meta = {
  title: "Your tickets",
  description: "A real list: tickets with an action, a status, and a punched hole once used. The state lives in your app; the ticket only shows it.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const initial = [
  { no: "0042", event: "Book fair", when: "Sat 27 Sep - 10:00", used: false },
  { no: "0043", event: "Print workshop", when: "Sun 28 Sep - 14:00", used: false },
  { no: "0017", event: "Opening night", when: "Fri 19 Sep - 19:30", used: true },
]

export default function Example() {
  const [tickets, setTickets] = React.useState(initial)
  return (
    <ul className="mx-auto grid max-w-xl gap-8">
      {tickets.map((t) => (
        <li key={t.no}>
          <Ticket punched={t.used} seed={t.no} role="group" aria-label={`${t.event}, ticket ${t.no}${t.used ? ", used" : ""}`}>
            <TicketBody>
              <TicketTitle>{t.event}</TicketTitle>
              <TicketDescription>{t.when}</TicketDescription>
              <div className="pt-1">
                {t.used ? (
                  <TicketNumber>Used</TicketNumber>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setTickets((all) => all.map((x) => (x.no === t.no ? { ...x, used: true } : x)))}>
                    Scan at the door
                  </Button>
                )}
              </div>
            </TicketBody>
            <TicketStub>
              <TicketNumber className="text-lg">
                <span className="block text-xs">No.</span>
                {t.no}
              </TicketNumber>
            </TicketStub>
          </Ticket>
        </li>
      ))}
    </ul>
  )
}
