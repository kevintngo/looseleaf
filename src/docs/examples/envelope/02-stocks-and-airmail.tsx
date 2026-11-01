import { Envelope, EnvelopeAddress, EnvelopeFront, EnvelopeLetter, EnvelopeTrigger } from "@/components/ui/envelope"

export const meta = {
  title: "Manila, white, airmail",
  description: "Kraft (the default), white paper with a sky-blue stamp, and an airmail envelope with its striped border. Each stamp is perforated; each has a postmark over it.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <Envelope seed="a" tilt={-1} className="w-52">
        <EnvelopeFront>
          <EnvelopeAddress className="text-[1.1rem]">
            <p>The Stationer</p>
            <p>High Street</p>
          </EnvelopeAddress>
          <EnvelopeTrigger>Open the letter from Ada</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>hello</EnvelopeLetter>
      </Envelope>
      <Envelope stock="paper" stamp="sky" seed="b" tilt={0.8} className="w-52">
        <EnvelopeFront>
          <EnvelopeAddress className="text-[1.1rem]">
            <p>Marguerite</p>
            <p>Lyon</p>
          </EnvelopeAddress>
          <EnvelopeTrigger>Open the letter for Marguerite</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>hello</EnvelopeLetter>
      </Envelope>
      <Envelope stock="paper" airmail stamp="tangerine" seed="c" tilt={-0.6} className="w-52">
        <EnvelopeFront className="ps-[15%] pb-[13%]">
          <EnvelopeAddress className="text-[1.1rem]">
            <p>Ms. A. Lovelace</p>
            <p>Par avion</p>
          </EnvelopeAddress>
          <EnvelopeTrigger>Open the airmail letter</EnvelopeTrigger>
        </EnvelopeFront>
        <EnvelopeLetter>hello</EnvelopeLetter>
      </Envelope>
    </div>
  )
}
