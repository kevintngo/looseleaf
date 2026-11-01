import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const meta = {
  title: "Select",
  description:
    "shadcn's `field-select`: a Radix Select under a label with a hint. The label points at the trigger (`htmlFor` and `id`, which the original leaves out), so a click on the word opens the list.",
  layout: "center" as const,
  height: 360,
}

export default function Example() {
  return (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel htmlFor="field-select-department">Department</FieldLabel>
        <Select>
          <SelectTrigger id="field-select-department">
            <SelectValue placeholder="Choose department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Select your department or area of work.</FieldDescription>
      </Field>
    </div>
  )
}
