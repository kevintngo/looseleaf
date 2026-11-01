import { Input } from "@/components/ui/input"

export const meta = {
  title: "States",
  description: "Filled, invalid (red pencil, a wavy underline and a !), disabled (dashed pencil) and read-only (printed). Hover and Tab into them to see the rest.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Input aria-label="Filled" defaultValue="ada@analytical.engine" />
      <Input aria-label="Invalid" defaultValue="not-an-email" aria-invalid />
      <Input aria-label="Disabled" defaultValue="Can't touch this" disabled />
      <Input aria-label="Read only" defaultValue="Order #2049" readOnly />
    </div>
  )
}
