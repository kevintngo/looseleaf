import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Accept terms",
  description: "shadcn's `label-demo`: a Label next to a Checkbox, joined by `htmlFor` and `id`. Click the words and the box ticks itself; the row is the hit area.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox id="label-terms" />
        <Label htmlFor="label-terms">Accept terms and conditions</Label>
      </div>
    </div>
  )
}
