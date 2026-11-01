import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Disabled",
  description:
    "Official `textarea-disabled`: the same field with `disabled`. The box is redrawn dashed in pencil grey, so the state does not rest on colour alone.",
  layout: "center" as const,
}

export default function Example() {
  return <Textarea placeholder="Type your message here." aria-label="Message" disabled className="max-w-sm" />
}
