import { Highlight } from "@/components/ui/highlight"
import { Paper } from "@/components/ui/paper"
import { Scribble } from "@/components/ui/scribble"
import { Strike } from "@/components/ui/strike"

export const meta = {
  title: "An edited draft",
  description: "Scribbles, strikes and a highlight on the same page: an editor's pass over a paragraph.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="paper" className="w-full max-w-lg p-7" tilt>
      <p className="font-script text-2xl">Draft 3</p>
      <p className="mt-3 text-[17px] leading-[1.7]">
        The garden was <Scribble weight="fine">very extremely</Scribble> overgrown, and the gate, which had been <Strike>painted green</Strike> left open for years, no longer{" "}
        <Scribble tone="red">closed properly at all</Scribble> closed. <Highlight tone="green">Keep this line.</Highlight>
      </p>
    </Paper>
  )
}
