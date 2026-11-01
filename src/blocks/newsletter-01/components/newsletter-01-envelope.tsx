"use client"

import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeSender, EnvelopeTrigger } from "@/components/ui/envelope"
import { Stamp } from "@/components/ui/stamp"

type Newsletter01EnvelopeProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stamped: boolean
}

function Newsletter01Envelope({ open, onOpenChange, stamped }: Newsletter01EnvelopeProps) {
  return (
    <div className="relative mx-auto flex aspect-[40/39] w-full max-w-sm flex-col justify-end">
      <Envelope stock="kraft" stamp="tomato" postmark open={open} onOpenChange={onOpenChange} seed="newsletter-envelope" tilt={1}>
        <EnvelopeFront>
          <EnvelopeSender>
            Penmark
            <br />
            Lisbon
          </EnvelopeSender>
          <EnvelopeAddress className="text-[1.15rem]">
            <p>You</p>
            <p>Your inbox</p>
            <p>Sunday morning</p>
          </EnvelopeAddress>
          <EnvelopeTrigger>Peek inside the Sunday letter</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>
          <p className="font-script text-2xl leading-none font-bold">Sunday letter, no. 41</p>
          <p className="mt-1 text-sm">On buying too many pens, and one very good link.</p>
        </EnvelopeLetter>
      </Envelope>
      {stamped ? (
        <Stamp
          text="Subscribed"
          ink="green"
          w={150}
          h={50}
          tilt={-8}
          ghost
          seed="newsletter-stamp"
          className="pointer-events-none absolute end-3 bottom-5 z-30 animate-in zoom-in-[1.7] fade-in-0 duration-(--ll-dur-pop)"
        />
      ) : null}
    </div>
  )
}

export { Newsletter01Envelope }
