import { Typewriter } from "@/components/ui/typewriter"

export const meta = {
  title: "A rotating word",
  description: "mode=\"cycle\" types a word, holds it, backspaces it and moves on; loop keeps it going. A block caret, and the sentence still reads once to a screen reader.",
  layout: "center" as const,
  height: 160,
}

export default function Example() {
  return (
    <p className="text-center font-script text-4xl leading-tight">
      We make{" "}
      <span className="inline-block w-[11em] text-start align-baseline">
        <Typewriter text={["notebooks", "stickers", "tape", "small good things"]} mode="cycle" loop cursor="block" pause={1100} speed={14} className="text-orange-text" startOnView={false} />
      </span>
    </p>
  )
}
