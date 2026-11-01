import { Bracket } from "@/components/ui/bracket"

export const meta = {
  title: "Kinds and sides",
  description: "Square, curly and round; on the start side and the end side; in ink, blue and red.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-xl gap-6 sm:grid-cols-2">
      <Bracket kind="square" className="w-44 text-[17px] leading-[1.6]">
        Square: for quoting a stretch of a page.
      </Bracket>
      <Bracket kind="curly" tone="blue" side="end" className="w-44 text-[17px] leading-[1.6]">
        Curly: for lumping things together, from the end side.
      </Bracket>
      <Bracket kind="round" tone="red" className="w-44 text-[17px] leading-[1.6]">
        Round: for an aside.
      </Bracket>
      <Bracket kind="square" weight="brush" tone="ink" side="end" className="w-44 text-[17px] leading-[1.6]">
        A brush pen makes it a statement.
      </Bracket>
    </div>
  )
}
