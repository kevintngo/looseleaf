import { Input } from "@/components/ui/input"

export const meta = {
  title: "Disabled",
  description: "shadcn's `input-disabled`: `disabled` draws the box in dashed pencil and takes the field out of the tab order and out of the form.",
  layout: "center" as const,
}

export default function Example() {
  return <Input disabled type="email" placeholder="Email" className="max-w-xs" aria-label="Email" />
}
