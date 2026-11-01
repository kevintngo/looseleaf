import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export const meta = {
  title: "Demo",
  description:
    "Official `radio-group-demo`: three options, the middle one chosen. Click, or focus the group and use the arrow keys; the chosen ring gets its dot written in. Only change: the ids are prefixed to stay unique on a page with other examples.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="radio-group-demo-1" />
        <Label htmlFor="radio-group-demo-1">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="radio-group-demo-2" />
        <Label htmlFor="radio-group-demo-2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="radio-group-demo-3" />
        <Label htmlFor="radio-group-demo-3">Compact</Label>
      </div>
    </RadioGroup>
  )
}
