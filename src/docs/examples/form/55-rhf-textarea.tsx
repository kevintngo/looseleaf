import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Toaster } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "React Hook Form: textarea",
  description: "shadcn's `form-rhf-textarea`: a ruled textarea with a length rule on both ends. Too short and too long each get their own sentence.",
  layout: "center" as const,
}

const formSchema = z.object({
  about: z.string().min(10, "Please provide at least 10 characters.").max(200, "Please keep it under 200 characters."),
})

export default function Example() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      about: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:", {
      toasterId: "form-rhf-textarea",
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto bg-paper-shade p-4 font-mono text-sm text-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    })
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Personalization</CardTitle>
        <CardDescription>Customize your experience by telling us more about yourself.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-textarea" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="about"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-textarea-about">More about you</FieldLabel>
                  <Textarea
                    {...field}
                    id="form-rhf-textarea-about"
                    aria-invalid={fieldState.invalid}
                    placeholder="I'm a software engineer..."
                    className="min-h-[120px]"
                  />
                  <FieldDescription>Tell us more about yourself. This will be used to help us personalize your experience.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-textarea">
            Save
          </Button>
        </Field>
      </CardFooter>
      <Toaster id="form-rhf-textarea" />
    </Card>
  )
}
