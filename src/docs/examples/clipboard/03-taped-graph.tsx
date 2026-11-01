import { Clipboard, ClipboardPaper } from "@/components/ui/clipboard"

export const meta = {
  title: "Graph paper and tape",
  description: "The paper is a Paper: graph rules, a strip of tape across a corner, a small extra note taped on top.",
  layout: "center" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Clipboard tone="sky" seed="graph" tilt={0.8} className="max-w-sm">
      <ClipboardPaper stock="graph" rules="graph" tape="corner" seed="graph-p" className="pl-5">
        <p className="font-script text-[1.75rem] leading-none font-bold">Rain, week 39</p>
        <p className="mt-2 text-ink-you">so much of it</p>
      </ClipboardPaper>
    </Clipboard>
  )
}
