import { Squiggle } from "@/components/ui/squiggle"

export const meta = {
  title: "Default",
  description: "A wavy line across the width, between two paragraphs.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="max-w-md text-[17px] leading-[1.6]">
      <p>The morning was slow and grey and smelled of toast.</p>
      <Squiggle className="my-3" />
      <p>By noon the whole street had come out to look at the sky.</p>
    </div>
  )
}
