import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "With label",
  description:
    "Official `textarea-with-label`: a Label tied to the field by `htmlFor` and `id`, so a click on the words puts the cursor in the box. The id is prefixed to stay unique on a page with other examples.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Label htmlFor="textarea-with-label-message">Your message</Label>
      <Textarea placeholder="Type your message here." id="textarea-with-label-message" />
    </div>
  )
}
