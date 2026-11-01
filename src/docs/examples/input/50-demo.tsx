import { Input } from "@/components/ui/input"

export const meta = {
  title: "Email field",
  description: "shadcn's `input-demo`: the bare Input, nothing around it. `type=\"email\"` and a placeholder are all it takes; what you type comes out in blue felt.",
  layout: "center" as const,
}

export default function Example() {
  return <Input type="email" placeholder="Email" className="max-w-xs" aria-label="Email" />
}
