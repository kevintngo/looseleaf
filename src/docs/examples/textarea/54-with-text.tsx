import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "With text",
  description:
    "Official `textarea-with-text`: a label, the field and a line of help text below. The help is linked to the field with `aria-describedby` (the original leaves it unlinked), so a screen reader reads it with the field.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Label htmlFor="textarea-with-text-message">Your Message</Label>
      <Textarea placeholder="Type your message here." id="textarea-with-text-message" aria-describedby="textarea-with-text-help" />
      <p id="textarea-with-text-help" className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  )
}
