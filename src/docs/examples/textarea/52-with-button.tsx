import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "With button",
  description:
    "Official `textarea-with-button`: the field stacked over a full-width Send button on a two-row grid. The gap is `gap-3` (the original's `gap-2` plus a pencil's width): a marker band bleeds a few pixels past its box, and a wide one would touch the field.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Textarea placeholder="Type your message here." aria-label="Message" />
      <Button>Send message</Button>
    </div>
  )
}
