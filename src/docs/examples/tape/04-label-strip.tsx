import { Tape } from "@/components/ui/tape"

export const meta = {
  title: "A label on tape",
  description: "Write on it: put the tape behind a line of text. The strip is decoration, so the label is real text a screen reader reads.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-8 p-4">
      {[
        { kind: "masking", text: "fragile" },
        { kind: "kraft", text: "this side up" },
        { kind: "washi-gingham", text: "picnic" },
      ].map(({ kind, text }) => (
        <span key={text} className="relative inline-block">
          <Tape kind={kind as "masking"} length={132} height={32} seed={text} className="absolute inset-0" />
          <span className="relative z-(--ll-z-prop) block w-[132px] text-center font-script text-2xl leading-[32px] font-bold">{text}</span>
        </span>
      ))}
    </div>
  )
}
