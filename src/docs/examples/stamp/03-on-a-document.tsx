import { Paper } from "@/components/ui/paper"
import { Stamp } from "@/components/ui/stamp"

export const meta = {
  title: "On a document",
  description: "Stamps go on top of real content and never block it: the svg ignores the pointer and keeps its own name for screen readers.",
  layout: "stack" as const,
  stage: "desk" as const,
}

export default function Example() {
  return (
    <Paper stock="slip" tilt={false} className="relative w-full max-w-md p-6 text-ink">
      <h3 className="font-script text-3xl">Invoice 2026-031</h3>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
        <dt className="text-pencil-text">To</dt>
        <dd>The Paper Club</dd>
        <dt className="text-pencil-text">For</dt>
        <dd>Twelve notebooks, felt tips</dd>
        <dt className="text-pencil-text">Total</dt>
        <dd className="ll-num">$ 148.00</dd>
      </dl>
      <Stamp name="stamp-paid" className="absolute right-4 bottom-3" />
    </Paper>
  )
}
