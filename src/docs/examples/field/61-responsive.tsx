import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "Responsive layout",
  description:
    "shadcn's `field-responsive`: `orientation=\"responsive\"` stacks label above control on a narrow container and puts them side by side once the FieldGroup is wide enough. It answers to the container, not the viewport, so resize the preview.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="w-full max-w-4xl">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="field-responsive-name">Name</FieldLabel>
                <FieldDescription>Provide your full name for identification</FieldDescription>
              </FieldContent>
              <Input id="field-responsive-name" placeholder="Evil Rabbit" required />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="field-responsive-message">Message</FieldLabel>
                <FieldDescription>You can write your message here. Keep it short, preferably under 100 characters.</FieldDescription>
              </FieldContent>
              <Textarea id="field-responsive-message" placeholder="Hello, world!" required className="min-h-[100px] resize-none sm:min-w-[300px]" />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
