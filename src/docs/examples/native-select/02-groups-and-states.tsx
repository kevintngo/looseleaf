import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Groups, sizes and states",
  description: "Option groups, a small size, an invalid select (red pencil box and a bang before the chevron) and a disabled one (dashed, pale).",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-x-6 gap-y-5 max-sm:grid-cols-1">
      <div className="grid gap-2">
        <Label htmlFor="ns-pen">With groups</Label>
        <NativeSelect id="ns-pen" defaultValue="felt">
          <NativeSelectOptGroup label="Pens">
            <NativeSelectOption value="felt">Felt tip</NativeSelectOption>
            <NativeSelectOption value="gel">Gel</NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Pencils">
            <NativeSelectOption value="hb">HB</NativeSelectOption>
            <NativeSelectOption value="2b">2B</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ns-small">Small</Label>
        <NativeSelect id="ns-small" size="sm" defaultValue="a">
          <NativeSelectOption value="a">A5, ruled</NativeSelectOption>
          <NativeSelectOption value="b">A4, ruled</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ns-bad">Invalid</Label>
        <NativeSelect id="ns-bad" aria-invalid defaultValue="" aria-describedby="ns-bad-msg">
          <NativeSelectOption value="">Pick one</NativeSelectOption>
          <NativeSelectOption value="x">Something</NativeSelectOption>
        </NativeSelect>
        <p id="ns-bad-msg" className="text-sm text-red">
          This one is required.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ns-off">Disabled</Label>
        <NativeSelect id="ns-off" disabled defaultValue="a">
          <NativeSelectOption value="a">Locked</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  )
}
