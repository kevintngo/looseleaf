import { Receipt, ReceiptHeader, ReceiptLine, ReceiptLines, ReceiptTotal } from "@/components/ui/receipt"

export const meta = {
  title: "Four ways to cut it",
  description: "`ends` is the cut of both ends: the tear bar's sawtooth, a perforation, a hand tear, or a plain guillotine.",
  layout: "stack" as const,
  stage: "desk" as const,
}

const ends = ["zig", "perf", "torn", "cut"] as const

export default function Example() {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-8 gap-y-10 p-4">
      {ends.map((e) => (
        <Receipt as="article" key={e} ends={e} seed={e} className="w-44" aria-label={`Receipt, ${e} ends`}>
          <ReceiptHeader>
            <span>{e}</span>
          </ReceiptHeader>
          <ReceiptLines>
            <ReceiptLine price="2.20">tea</ReceiptLine>
          </ReceiptLines>
          <ReceiptTotal>2.20</ReceiptTotal>
        </Receipt>
      ))}
    </div>
  )
}
