import { Handwritten } from "@/components/ui/handwritten"

export const meta = {
  title: "Strength, and what it leaves alone",
  description: "0.5, 1 and 2. Code, keys and links inside are never touched; data-handwritten=\"off\" opts anything else out.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid max-w-xl gap-4 text-[17px] leading-[1.7]">
      <Handwritten as="p" strength={0.5}>strength 0.5: barely there, a careful hand.</Handwritten>
      <Handwritten as="p" strength={1}>strength 1: the default hand, every word a hair off.</Handwritten>
      <Handwritten as="p" strength={2}>strength 2: a hurried hand, in a bus, in the rain.</Handwritten>
      <Handwritten as="p">
        Press <kbd className="font-mono text-sm">Ctrl</kbd> then run <code className="font-mono text-sm">npm test</code> or read <a href="#" className="font-bold text-link underline">the docs</a>{" "}
        <span data-handwritten="off">(these words are typeset)</span> and carry on.
      </Handwritten>
    </div>
  )
}
