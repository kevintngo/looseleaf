import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Taped, pinned, clipped",
  description: "The `tape` shorthand lays strips across a corner, along the top or across both corners. A `fastener` holds a sheet with a clip, a pin, a staple or a binder clip.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid gap-x-10 gap-y-10 p-6 @2xl:grid-cols-3">
        <Paper tape="both" tapeKind="washi-dots" seed="a" className="h-32 p-5">
          <p className="font-script text-2xl font-bold">Taped up</p>
          <p className="text-sm">two strips, one at each corner</p>
        </Paper>
        <Paper stock="index-card" fastener="pin" seed="b" className="h-32 p-5 pt-3">
          <p className="mb-3 font-script text-2xl font-bold">Pinned</p>
          <p className="text-sm">a push-pin through the top</p>
        </Paper>
        <Paper stock="slip" fastener="clip" fastenerTone="sky" seed="c" className="h-32 p-5">
          <p className="font-script text-2xl font-bold">Clipped</p>
          <p className="text-sm">plastic-coated, sky blue</p>
        </Paper>
      </div>
    </div>
  )
}
