import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Orientations",
  description: "`vertical` (label above), `horizontal` (label beside a switch or checkbox, with FieldContent holding the words) and `responsive` (vertical until its FieldGroup is md wide, using a container query, so it follows the box, not the screen).",
  layout: "stack" as const,
}

export default function Example() {
  return (
    <FieldGroup className="w-full max-w-lg">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="o-sync">Sync to the cloud</FieldLabel>
          <FieldDescription>Keeps every page on all your devices.</FieldDescription>
        </FieldContent>
        <Switch id="o-sync" defaultChecked />
      </Field>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox id="o-terms" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="o-terms">Accept the terms</FieldLabel>
          <FieldDescription>You agree to the small print and the big print.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldSeparator>responsive</FieldSeparator>
      <Field orientation="responsive">
        <FieldContent>
          <FieldTitle>Display name</FieldTitle>
          <FieldDescription>Stacks on narrow boxes, sits in a row on wide ones.</FieldDescription>
        </FieldContent>
        <Input placeholder="Ada" aria-label="Display name" className="max-w-56" />
      </Field>
    </FieldGroup>
  )
}
