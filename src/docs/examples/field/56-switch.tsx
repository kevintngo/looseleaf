import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export const meta = {
  title: "Switch",
  description: "shadcn's `field-switch`: label and description in a FieldContent column, the switch at the far end of a horizontal Field. Click the words or the switch.",
  layout: "center" as const,
}

export default function Example() {
  return (
    <div className="w-full max-w-md">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="field-switch-2fa">Multi-factor authentication</FieldLabel>
          <FieldDescription>
            Enable multi-factor authentication. If you do not have a two-factor device, you can use a one-time code sent to your email.
          </FieldDescription>
        </FieldContent>
        <Switch id="field-switch-2fa" />
      </Field>
    </div>
  )
}
