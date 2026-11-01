import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "File",
  description: "shadcn's `input-file`: `type=\"file\"` under a label. The native picker button becomes a highlighter swatch; the file name is the field's own text.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="input-file-picture">Picture</Label>
      <Input id="input-file-picture" type="file" />
    </div>
  )
}
