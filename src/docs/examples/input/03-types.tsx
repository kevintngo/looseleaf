import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Types",
  description: "Password, number, search, date and file. The number spinners and the search clear button are removed; the file button is a highlighter swatch.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" defaultValue="hunter2hunter2" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="qty">Quantity</Label>
        <Input id="qty" type="number" min={0} defaultValue={3} className="w-24" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="when">Due</Label>
        <Input id="when" type="date" className="w-44" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pic">Picture</Label>
        <Input id="pic" type="file" />
      </div>
    </div>
  )
}
