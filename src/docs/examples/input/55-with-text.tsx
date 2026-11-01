import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "With help text",
  description: "shadcn's `input-with-text`: a line of muted help under the field. Here it is joined to the input with `aria-describedby`, which the original leaves to you.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="input-text-email">Email</Label>
      <Input type="email" id="input-text-email" placeholder="Email" aria-describedby="input-text-email-help" />
      <p id="input-text-email-help" className="text-sm text-muted-foreground">
        Enter your email address.
      </p>
    </div>
  )
}
