import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Status",
  description: "shadcn's `native-select-demo`: the browser's own `<select>` with a first option whose value is empty, which reads as the placeholder. Its list, keyboard and phone picker are the platform's.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <NativeSelect aria-label="Status" className="max-w-xs">
      <NativeSelectOption value="">Select status</NativeSelectOption>
      <NativeSelectOption value="todo">Todo</NativeSelectOption>
      <NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
      <NativeSelectOption value="done">Done</NativeSelectOption>
      <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
    </NativeSelect>
  )
}
