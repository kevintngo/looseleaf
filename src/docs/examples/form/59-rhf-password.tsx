import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/sonner"

export const meta = {
  title: "React Hook Form: password",
  description:
    "shadcn's `form-rhf-password`: `useWatch` feeds a strength meter and a live checklist while the schema guards the submit. The bar is a marker pass that changes ink as the password improves; a met rule is a pencilled tick, an open one a cross, and each says so in words for a screen reader.",
  layout: "center" as const,
}

const passwordRequirements = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (val: string) => val.length >= 8,
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (val: string) => /[a-z]/.test(val),
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (val: string) => /[A-Z]/.test(val),
  },
  { id: "number", label: "One number", test: (val: string) => /\d/.test(val) },
  {
    id: "special",
    label: "One special character",
    test: (val: string) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
  },
]

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
    .refine((val) => /\d/.test(val), "Password must contain at least one number")
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), "Password must contain at least one special character"),
})

export default function Example() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  })

  const password = useWatch({
    control: form.control,
    name: "password",
  })

  const metRequirements = passwordRequirements.filter((req) => req.test(password || ""))
  const strengthPercentage = (metRequirements.length / passwordRequirements.length) * 100

  const strengthTone = strengthPercentage <= 40 ? "marker" : strengthPercentage <= 80 ? "hi" : "green"

  const allRequirementsMet = metRequirements.length === passwordRequirements.length

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("You submitted the following values:", {
      toasterId: "form-rhf-password",
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
      <CardHeader className="border-b">
        <CardTitle>Create Password</CardTitle>
        <CardDescription>Choose a strong password to secure your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-password" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-password-input">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-rhf-password-input"
                      type="password"
                      placeholder="Enter your password"
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    <InputGroupAddon align="inline-end">
                      <Icon name="check" className={allRequirementsMet ? "text-green" : "text-muted-foreground"} />
                    </InputGroupAddon>
                  </InputGroup>
                  <div className="space-y-2">
                    <Progress value={strengthPercentage} tone={strengthTone} aria-label="Password strength" />
                    <div className="space-y-1.5">
                      {passwordRequirements.map((requirement) => {
                        const isMet = requirement.test(password || "")
                        return (
                          <div key={requirement.id} className="flex items-center gap-2 text-sm">
                            <Icon name={isMet ? "check" : "x"} className={isMet ? "size-4 text-green" : "size-4 text-muted-foreground"} />
                            <span className={isMet ? "text-foreground" : "text-muted-foreground"}>{requirement.label}</span>
                            <span className="sr-only">{isMet ? "(met)" : "(not met)"}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Field>
          <Button type="submit" form="form-rhf-password">
            Create Password
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </Field>
      </CardFooter>
      <Toaster id="form-rhf-password" />
    </Card>
  )
}
