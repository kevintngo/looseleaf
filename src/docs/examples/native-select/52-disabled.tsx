import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Disabled",
  description: "shadcn's `native-select-disabled`: `disabled` on the select. The frame is drawn dashed and pale and the chevron fades with it.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <NativeSelect disabled aria-label="Priority" className="max-w-xs">
      <NativeSelectOption value="">Select priority</NativeSelectOption>
      <NativeSelectOption value="low">Low</NativeSelectOption>
      <NativeSelectOption value="medium">Medium</NativeSelectOption>
      <NativeSelectOption value="high">High</NativeSelectOption>
      <NativeSelectOption value="critical">Critical</NativeSelectOption>
    </NativeSelect>
  )
}
