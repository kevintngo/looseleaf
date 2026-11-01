import { Polaroid, PolaroidCaption, PolaroidImage } from "@/components/ui/polaroid"

export const meta = {
  title: "Four scenes, four ways to hold it up",
  description: "Hills, sea, a house and a night sky, drawn in marker and felt tip. Taped, pinned, clipped and washi-taped; the sea has a date stamp.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-12 p-6 @3xl:grid-cols-4">
        <Polaroid tape="top" seed="p1" className="w-full max-w-56">
          <PolaroidImage scene="hills" seed="s1" />
          <PolaroidCaption>august, finally</PolaroidCaption>
        </Polaroid>
        <Polaroid fastener="pin" seed="p2" className="w-full max-w-56">
          <PolaroidImage scene="sea" date="'25 8 09" seed="s2" />
          <PolaroidCaption>the ferry home</PolaroidCaption>
        </Polaroid>
        <Polaroid fastener="clip" seed="p3" className="w-full max-w-56">
          <PolaroidImage scene="house" seed="s3" />
          <PolaroidCaption>gran&apos;s house</PolaroidCaption>
        </Polaroid>
        <Polaroid tape="both" tapeKind="washi-dots" seed="p4" className="w-full max-w-56">
          <PolaroidImage scene="night" date="'25 9 24" seed="s4" />
          <PolaroidCaption>last night, 11pm</PolaroidCaption>
        </Polaroid>
      </div>
    </div>
  )
}
