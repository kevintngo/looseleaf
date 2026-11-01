import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "With an icon",
  description: "className goes to the frame, but padding goes to the input: pl-9 makes room for the pencilled magnifier exactly as it would on a plain shadcn input.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="relative w-full max-w-sm">
      <Icon name="search" size={16} className="absolute start-3 top-1/2 z-10 -translate-y-1/2 text-ink-muted" />
      <Input type="search" aria-label="Search the notebook" placeholder="Search the notebook" className="ps-9" />
    </div>
  )
}
