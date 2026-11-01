import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Demo",
  description:
    "Official `switch-demo`: a switch and its label. Flip it and the marker fills the track while the paper coin slides across; the label toggles it too. Only the id is prefixed, so it stays unique on a page with other examples.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="switch-demo-airplane-mode" />
      <Label htmlFor="switch-demo-airplane-mode">Airplane Mode</Label>
    </div>
  )
}
