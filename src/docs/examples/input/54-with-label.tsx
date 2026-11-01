import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "With label",
  description: "shadcn's `input-with-label`: a Label above the field in a grid, tied to it by `htmlFor` and `id`, so a click on the word puts the cursor in the box.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="input-label-email">Email</Label>
      <Input type="email" id="input-label-email" placeholder="Email" />
    </div>
  )
}
