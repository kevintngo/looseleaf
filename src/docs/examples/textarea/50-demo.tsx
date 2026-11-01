import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Demo",
  description:
    "Official `textarea-demo`: a bare textarea with a placeholder. It sits in a hand-drawn box that grows with its text (`field-sizing: content`, as upstream) and redraws the resize grip in its corner. Only addition: an `aria-label`, since there is no visible label.",
  layout: "center" as const,
}

export default function Example() {
  return <Textarea placeholder="Type your message here." aria-label="Message" className="max-w-sm" />
}
