import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Textarea",
  description: "shadcn's `field-textarea`: a labeled ruled box with a hint underneath. `rows` sets the height, as on a plain textarea.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-textarea-feedback">Feedback</FieldLabel>
            <Textarea id="field-textarea-feedback" placeholder="Your feedback helps us improve..." rows={4} />
            <FieldDescription>Share your thoughts about our service.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
