import { Callout } from "@/components/ui/callout"
import { Highlight } from "@/components/ui/highlight"
import { Paper } from "@/components/ui/paper"

export const meta = {
  title: "In the margin of a paragraph",
  description:
    "Float a callout into the page's padding (`float-end clear-end -me-56`) right after the words it is about: it lands on that line, whatever the width. Below md they are hidden.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="paper" rules="ruled" seed="margin" className="w-full max-w-3xl pt-4 pr-6 pb-6 pl-14 md:pr-60">
      <p className="text-[17px] leading-[28px]">
        Most of what I remember from a book is in the margins: an arrow, a question mark, a small argument with a dead author. The good bits get{" "}
        <Highlight>a swipe of yellow</Highlight>
        <Callout className="float-end clear-end -me-56 mt-1.5 w-48 max-md:hidden">the best line</Callout> so I can find them on the next read, and the parts I do not believe get a red pencil. I go back for them in winter, when a page is the only company.
        <Callout direction="left" bend="down" className="float-end clear-end -me-56 mt-1.5 w-48 max-md:hidden">
          ha, true
        </Callout>
      </p>
    </Paper>
  )
}
