import * as React from "react"

import { Button } from "@/components/ui/button"
import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeSender, EnvelopeTrigger } from "@/components/ui/envelope"

export const meta = {
  title: "An inbox",
  description: "A real use: messages that arrive as envelopes. Opening one marks it read; only one is open at a time. State lives in your app; the envelope only shows it.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 560,
}

const mail = [
  { id: "ada", from: "Ada", to: "You", line: "The flap is up, and the letter comes out.", stamp: "tomato" },
  { id: "lin", from: "Lin", to: "You", line: "The install page is written. Please read it.", stamp: "sky" },
] as const

export default function Example() {
  const [open, setOpen] = React.useState<string | null>(null)
  const [read, setRead] = React.useState<Record<string, boolean>>({})
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-10 pt-2">
      {mail.map((m) => (
        <Envelope
          key={m.id}
          seed={m.id}
          stamp={m.stamp}
          open={open === m.id}
          onOpenChange={(o) => {
            setOpen(o ? m.id : null)
            if (o) setRead((r) => ({ ...r, [m.id]: true }))
          }}
        >
          <EnvelopeFront>
            <EnvelopeSender>{m.from}</EnvelopeSender>
            <EnvelopeAddress className="text-[1.1rem]">
              <p>{m.to}</p>
              <p>{read[m.id] ? "read" : "unread"}</p>
            </EnvelopeAddress>
            <EnvelopeTrigger>
              {read[m.id] ? "Reopen" : "Open"} the letter from {m.from}
            </EnvelopeTrigger>
          </EnvelopeFront>
          <EnvelopeLetter>
            <p className="font-script text-2xl leading-none font-bold">Dear you,</p>
            <p className="mt-1">{m.line}</p>
          </EnvelopeLetter>
        </Envelope>
      ))}
      <Button variant="secondary" onClick={() => setOpen(null)} disabled={open === null}>
        Close them all
      </Button>
    </div>
  )
}
