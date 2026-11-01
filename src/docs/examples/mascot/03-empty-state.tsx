import { Mascot } from "@/components/ui/mascot"

export const meta = {
  title: "An empty state",
  description: "Where Stubby earns his keep: an empty search, a quiet inbox. The words carry the meaning, so he stays decorative.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="flex w-full max-w-md items-center gap-5 text-ink">
      <Mascot pose="think" size={96} />
      <div>
        <h3 className="font-script text-2xl">No results for &ldquo;pencil case&rdquo;</h3>
        <p className="mt-1 text-pencil-text">Try a shorter word, or check the spelling. Stubby is thinking about it.</p>
      </div>
    </div>
  )
}
