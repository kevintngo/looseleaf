import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "Edges",
  description: "A plain cut is pure CSS. Torn, deckled, pinked, perforated and scalloped edges draw their outline once, with a fringe of torn fibres.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const edges = ["cut", "torn", "deckle", "crimp", "zig", "perf", "scallop"] as const

export default function Example() {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 p-2 @2xl:grid-cols-4">
        {edges.map((edge) => (
          <figure key={edge} className="m-0 grid gap-2">
            <Paper edge={edge} seed={edge} className="h-20" />
            <figcaption className="font-script text-xl leading-none font-bold">{edge}</figcaption>
          </figure>
        ))}
        <figure className="m-0 grid gap-2">
          <Paper edge={{ bottom: "torn" }} seed="one-side" className="h-20" />
          <figcaption className="font-script text-xl leading-none font-bold">torn below</figcaption>
        </figure>
      </div>
    </div>
  )
}
