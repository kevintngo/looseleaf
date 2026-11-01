import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Required",
  description: "The star is drawn, not typed, and it is decorative: required on the control is what a screen reader hears.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="req-name" required>
          Full name
        </Label>
        <Input id="req-name" required placeholder="Ada Lovelace" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="req-note">
          Note <span className="font-normal text-ink-muted">(optional)</span>
        </Label>
        <Textarea id="req-note" />
      </div>
    </div>
  )
}
