import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeTrigger } from "@/components/ui/envelope"

export const meta = {
  title: "Opens when you look",
  description: "`openOnHover` opens it under a mouse and closes it again on leaving, unless you clicked it open. On touch and keyboard the trigger works as always.",
  layout: "center" as const,
  stage: "desk" as const,
  height: 420,
}

export default function Example() {
  return (
    <Envelope openOnHover stock="paper" stamp="grape" seed="hover" className="mt-12" tilt={1}>
      <EnvelopeFront>
        <EnvelopeAddress>
          <p>A curious reader</p>
        </EnvelopeAddress>
        <EnvelopeTrigger>Open the letter</EnvelopeTrigger>
      </EnvelopeFront>
      <EnvelopeLetter stock="index-card" rules="index">
        <p className="font-script text-2xl leading-none font-bold">Peek</p>
        <p className="text-sm">Hover me, or press the envelope.</p>
      </EnvelopeLetter>
    </Envelope>
  )
}
