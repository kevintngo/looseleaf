import { Paper } from "@/components/ui/paper"
import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Sticker } from "@/components/ui/sticker"

function LoginPolaroids() {
  return (
    <div data-slot="login-polaroids" aria-hidden="true" className="relative isolate size-full min-h-[38rem] overflow-hidden">
      <Paper stock="kraft" tilt={false} shadow="none" seed="login-04-kraft" className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[36rem] w-[20rem] shrink-0">
          <Polaroid tilt={-4} tape="top" tapeKind="washi-dots" seed="login-04-a" className="absolute start-0 top-2 w-40">
            <PolaroidImage scene="hills" seed="login-04-hills" />
            <PolaroidCaption>august</PolaroidCaption>
          </Polaroid>
          <Polaroid tilt={5} fastener="pin" fastenerTone="tomato" seed="login-04-b" className="absolute end-3 top-[11rem] w-40">
            <PolaroidImage scene="house" date="'25 9 24" seed="login-04-house" />
            <PolaroidCaption>gran&apos;s</PolaroidCaption>
          </Polaroid>
          <Polaroid tilt={-2} tape="corner" tapeKind="clear" seed="login-04-c" className="absolute start-3 top-[21.5rem] w-40">
            <PolaroidImage scene="sea" seed="login-04-sea" />
            <PolaroidCaption>the ferry</PolaroidCaption>
          </Polaroid>
          <Sticker name="rainbow" size={76} rotate={-8} className="absolute end-1 top-0" />
          <Sticker name="cactus" size={68} rotate={-6} className="absolute start-2 top-[15rem]" />
          <Sticker name="donut" size={64} rotate={10} className="absolute end-2 top-[30.5rem]" />
        </div>
      </div>
    </div>
  )
}

export { LoginPolaroids }
