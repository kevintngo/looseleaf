import type { ComponentDoc } from "@/docs/types"

export default {
  slug: "form",
  title: "Form",
  category: "Forms",
  description:
    "react-hook-form wired to the drawn controls, exactly like shadcn's Form. FormControl gives the control its id, aria-describedby and aria-invalid, so an Input, Select, Checkbox or Switch turns red pencil when the field has an error, its label follows, and FormMessage writes the message under it with a wavy red underline.",
  status: "stable",
  upstream: "form",
  parts: [
    { name: "Form", description: "react-hook-form's FormProvider: spread the result of `useForm()` on it." },
    { name: "FormField", description: "A react-hook-form Controller that also tells its children which field they belong to. Same props as Controller (`control`, `name`, `render`)." },
    { name: "FormItem", description: "A grid with a gap and a fresh id for the label, control, description and message of one field." },
    { name: "FormLabel", description: "A Label whose `for` is the control's id; it is red pencil while the field has an error." },
    { name: "FormControl", description: "Wrap the control (a Slot): it receives `id`, `aria-describedby` (the description, plus the message while there is an error) and `aria-invalid`." },
    { name: "FormDescription", description: "Muted help text, wired into aria-describedby." },
    {
      name: "FormMessage",
      description: "The field's error (or your own children), drawn with a wavy red pencil underline. Renders nothing when there is nothing to say.",
      props: [{ name: "seed", type: "string | number", description: "Pins the hand of the underline. Default: from useId()." }],
    },
    { name: "useFormField", description: "Hook for your own parts inside a FormItem: `{ id, name, formItemId, formDescriptionId, formMessageId, error, invalid, isDirty, isTouched }`." },
  ],
  a11y: [
    "FormLabel is a real <label for>, FormControl puts the same id on the control, and aria-describedby points at the description and (while invalid) the message; aria-invalid is set for you.",
    "FormMessage is a <p> that appears next to the control with its id in aria-describedby, so a screen reader reads it with the control when focus arrives. Wrap it in an element with role=\"alert\" (or use Field's FieldError) if you want it announced the moment it appears.",
    "Not every control can be named by FormLabel's `for`: a Slider (role=slider on a span) or a Rating (a radiogroup) needs `aria-labelledby` pointing at an `id` you give the FormLabel, or an `aria-label`. FormControl's id, aria-describedby and aria-invalid do reach a Slider's thumb, a Rating's group and a RadioGroup's group (whose radios turn red).",
    "Errors do not rely on color alone: the message text, the wavy underline and the control's own drawn state (red box, a bang on text fields) all say it.",
    "Validation timing is react-hook-form's (`mode`: onSubmit by default, onChange, onBlur ...); the drawn components do not re-render their ink when it changes, only their state layers.",
    "Windows high contrast: the ink is replaced by real borders, and the message gets a wavy text underline.",
  ],
  usage: `import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({ email: z.string().email("Enter an address like ada@notes.dev.") })

export function Example() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.warn)} className="grid max-w-sm gap-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}`,
  related: ["field", "input", "select", "checkbox", "label"],
} satisfies ComponentDoc
