import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

export const meta = {
  title: "Option groups",
  description: "shadcn's `native-select-groups`: `NativeSelectOptGroup` is an `<optgroup>`, so the platform draws the group headings and indents the options under them.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <NativeSelect aria-label="Department" className="max-w-xs">
      <NativeSelectOption value="">Select department</NativeSelectOption>
      <NativeSelectOptGroup label="Engineering">
        <NativeSelectOption value="frontend">Frontend</NativeSelectOption>
        <NativeSelectOption value="backend">Backend</NativeSelectOption>
        <NativeSelectOption value="devops">DevOps</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Sales">
        <NativeSelectOption value="sales-rep">Sales Rep</NativeSelectOption>
        <NativeSelectOption value="account-manager">Account Manager</NativeSelectOption>
        <NativeSelectOption value="sales-director">Sales Director</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Operations">
        <NativeSelectOption value="support">Customer Support</NativeSelectOption>
        <NativeSelectOption value="product-manager">Product Manager</NativeSelectOption>
        <NativeSelectOption value="ops-manager">Operations Manager</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}
