import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"

export const meta = {
  title: "With a description",
  description:
    "A label and a line of help beside the box. Field keeps the box level with the first line of text however long the help runs, and `data-disabled` on the Field dims the label and the help together with the disabled box.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <FieldGroup className="w-full max-w-sm gap-5">
      <Field orientation="horizontal">
        <Checkbox id="cb-terms" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="cb-terms">Accept terms and conditions</FieldLabel>
          <FieldDescription>By clicking this checkbox, you agree to the terms and conditions.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="cb-policy" />
        <FieldContent>
          <FieldLabel htmlFor="cb-policy">Accept terms and conditions</FieldLabel>
          <FieldDescription>You agree to our Terms of Service and Privacy Policy.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-disabled="true">
        <Checkbox id="cb-locked" disabled />
        <FieldContent>
          <FieldLabel htmlFor="cb-locked">Enable notifications</FieldLabel>
          <FieldDescription>Switched off by your administrator.</FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}
