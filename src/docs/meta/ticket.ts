import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "ticket",
  title: "Ticket",
  category: "Paper",
  description:
    "A ticket with concave corners, a bite out of both edges where the stub tears off, and a row of holes along the tear. The holes are cut out of the paper, so the desk (and the shadow) show through. A body, a stub, spaced capitals in the typewriter font and a serial number in red.",
  status: "new",
  parts: [
    {
      name: "Ticket",
      description: "A flex row. Its whole silhouette is one drawn sheet, tilted and shadowed as one; the content on it is real DOM. Until it is measured (or given `size`) it wears a plain card.",
      props: [
        { name: "stock", type: "StockName", default: '"kraft"', description: "What it is printed on: kraft, index-card (cream), sticky-yellow (a cinema ticket), sticky-pink ..." },
        { name: "stub", type: '"end" | "start" | "none"', default: '"end"', description: "Where the tear-off stub is. Mirrors in right-to-left layouts." },
        { name: "stubWidth", type: "number", default: "88", description: "Width of the stub in px; the tear line sits that far from the edge." },
        { name: "punched", type: "boolean", default: "false", description: "A hole punched through the body, at the end of the reading line beside the tear (the words start at the other side): the ticket has been used." },
        { name: "tilt / seed / size", type: "boolean | number / string | number / [w, h]", description: "A seeded turn under 1.2 degrees (or degrees, or false); pins the hand; the box in px for server-rendered drawings." },
      ],
    },
    { name: "TicketBody", description: "The part you keep: padded inside the printed frame, in the type font, its content centered vertically." },
    { name: "TicketStub", description: "The part the doorman tears off: an `aside` with `role=\"note\"` (ancillary to the ticket, not a page landmark), `stubWidth` wide, content centered." },
    { name: "TicketTitle", description: "The big line, 24 px spaced capitals (ADMIT ONE)." },
    { name: "TicketDescription", description: "The place and time, 14 px spaced capitals." },
    { name: "TicketNumber", description: "The serial number in red, tabular figures." },
  ],
  a11y: [
    "A ticket is a `div`. Give it `role=\"group\"` and a label when several sit on a page. The stub is an `aside` with `role=\"note\"`, so a page of tickets does not fill up with unnamed complementary landmarks.",
    "The drawn paper, notches, holes and frames are aria-hidden decoration; the ticket's information is text in the body and stub. Punched is shown by a hole and a data attribute: also say it in text (\"Used\") if it matters.",
    "Ink on every ticket stock is at least 9:1; the serial number is a red darkened with ink and reads at least 4.9:1 on kraft, yellow and pink. The tilt is zero in calm density; Windows high contrast replaces the drawing with an outline.",
  ],
  usage: `import { Ticket, TicketBody, TicketDescription, TicketNumber, TicketStub, TicketTitle } from "@/components/ui/ticket"

<Ticket role="group" aria-label="Ticket 0042">
  <TicketBody>
    <TicketTitle>Admit one</TicketTitle>
    <TicketDescription>Le Grand Jardin</TicketDescription>
  </TicketBody>
  <TicketStub><TicketNumber>No. 0042</TicketNumber></TicketStub>
</Ticket>`,
  related: ["receipt", "label-tag", "paper", "stamp"],
} satisfies ComponentDoc
