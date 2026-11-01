import { Lettering } from "@/components/ui/lettering"
import { Mascot } from "@/components/ui/mascot"
import { Napkin, NapkinContent } from "@/components/ui/napkin"

function Error404Scene() {
  return (
    <div data-slot="error-scene" aria-hidden="true" className="flex flex-col items-center gap-y-6 @xl:flex-row @xl:items-end @xl:justify-center @xl:gap-x-2">
      <Napkin fold="quarter" stain fastener="pin" fastenerTone="tomato" seed="error-404-napkin" className="min-h-0 w-72 max-w-full p-7">
        <NapkinContent className="flex items-center justify-center">
          <Lettering as="p" size="hero" tone="tomato" seed="error-404-digits" className="ll-num">
            404
          </Lettering>
        </NapkinContent>
      </Napkin>
      <Mascot pose="shrug" size={184} className="mb-1 h-[184px] w-auto @xl:-ms-10" />
    </div>
  )
}

export { Error404Scene }
