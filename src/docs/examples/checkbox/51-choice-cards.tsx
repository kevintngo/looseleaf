import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field"

export const meta = {
  title: "The whole card is the checkbox",
  description:
    "The shadcn demo's bordered label. Wrap a Field in a FieldLabel and the pair becomes a hand-drawn card; when the box inside is ticked the card gets a highlighter wash and a felt outline. Click anywhere on it, or Tab to the box and press Space.",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <FieldGroup className="w-full max-w-sm gap-4">
      <FieldLabel htmlFor="cb-card-notify">
        <Field orientation="horizontal">
          <Checkbox id="cb-card-notify" defaultChecked />
          <FieldContent>
            <FieldTitle>Enable notifications</FieldTitle>
            <FieldDescription>You can enable or disable notifications at any time.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="cb-card-digest">
        <Field orientation="horizontal">
          <Checkbox id="cb-card-digest" />
          <FieldContent>
            <FieldTitle>Weekly digest</FieldTitle>
            <FieldDescription>One email on Friday with everything you missed.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}
