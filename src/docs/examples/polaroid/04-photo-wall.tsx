import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"
import { Sticker } from "@/components/ui/sticker"

export const meta = {
  title: "A photo wall",
  description: "A real composition: photographs at different tilts, overlapping a little, with a sticker stuck on. The window takes anything: here every picture is a drawn scene, in an app it would be an `img`.",
  layout: "stack" as const,
  stage: "desk" as const,
  height: 460,
}

export default function Example() {
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-start justify-center gap-y-10 p-6">
      <Polaroid tape="top" tilt={-3} seed="w1" className="-me-4 w-56">
        <PolaroidImage scene="house" seed="w1i" label="A yellow house" />
        <PolaroidCaption>home</PolaroidCaption>
      </Polaroid>
      <Polaroid fastener="pin" tilt={2.5} seed="w2" className="mt-8 w-56">
        <PolaroidImage scene="sea" date="'25 8 09" seed="w2i" label="A sailboat at sunset" />
        <PolaroidCaption>the ferry</PolaroidCaption>
      </Polaroid>
      <Polaroid tape="corner" tilt={-1.5} seed="w3" className="-ms-4 w-56">
        <PolaroidImage scene="night" seed="w3i" label="Roofs under a moon" />
        <PolaroidCaption>11pm</PolaroidCaption>
        <Sticker name="done" size={64} rotate={12} className="absolute -right-5 -bottom-4 z-10" />
      </Polaroid>
    </div>
  )
}
