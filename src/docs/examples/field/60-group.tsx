import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field"

export const meta = {
  title: "Field group",
  description:
    "shadcn's `field-group`: FieldGroups stack fields and FieldSets, and `data-slot=\"checkbox-group\"` tightens the gap between boxes. The first box is checked and disabled, the second set has a link in its help line.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Responses</FieldLegend>
          <FieldDescription>Get notified when ChatGPT responds to requests that take time, like research or image generation.</FieldDescription>
          <FieldGroup data-slot="checkbox-group">
            <Field orientation="horizontal">
              <Checkbox id="field-group-push" defaultChecked disabled />
              <FieldLabel htmlFor="field-group-push" className="font-normal">
                Push notifications
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend variant="label">Tasks</FieldLegend>
          <FieldDescription>
            Get notified when tasks you&apos;ve created have updates. <a href="#manage-tasks">Manage tasks</a>
          </FieldDescription>
          <FieldGroup data-slot="checkbox-group">
            <Field orientation="horizontal">
              <Checkbox id="field-group-push-tasks" />
              <FieldLabel htmlFor="field-group-push-tasks" className="font-normal">
                Push notifications
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="field-group-email-tasks" />
              <FieldLabel htmlFor="field-group-email-tasks" className="font-normal">
                Email notifications
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  )
}
