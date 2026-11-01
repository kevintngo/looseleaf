import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Invalid",
  description: "shadcn's `native-select-invalid`: `aria-invalid=\"true\"` redraws the frame in red pencil with a bang before the chevron. It is the same attribute a form library sets.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <NativeSelect aria-invalid="true" aria-label="Role" className="max-w-xs">
      <NativeSelectOption value="">Select role</NativeSelectOption>
      <NativeSelectOption value="admin">Admin</NativeSelectOption>
      <NativeSelectOption value="editor">Editor</NativeSelectOption>
      <NativeSelectOption value="viewer">Viewer</NativeSelectOption>
      <NativeSelectOption value="guest">Guest</NativeSelectOption>
    </NativeSelect>
  )
}
