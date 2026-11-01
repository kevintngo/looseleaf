"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Highlight } from "@/components/ui/highlight"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Tally } from "@/components/ui/tally"
import { cn } from "@/lib/utils"

const schema = z
  .object({
    name: z.string().trim().min(2, "Tell us what to call you (at least 2 letters)."),
    email: z.email("Enter a full address, like ada@notes.dev."),
    password: z.string().min(8, "Use at least 8 characters.").regex(/\d/, "Add at least one number."),
    confirm: z.string().min(1, "Type the password once more."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Those two do not match yet." })

type SignupFormValues = z.infer<typeof schema>
type SignupValues = Pick<SignupFormValues, "name" | "email" | "password">

type SignupFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (values: SignupValues) => void | Promise<void>
}

const pretend = () => new Promise<void>((resolve) => setTimeout(resolve, 700))

const describedBy = (...ids: Array<string | false | undefined>) => ids.filter(Boolean).join(" ") || undefined

function PasswordInput({ toggleLabel = "Show password", ...props }: Omit<React.ComponentProps<typeof InputGroupInput>, "type"> & { toggleLabel?: string }) {
  const [shown, setShown] = React.useState(false)
  return (
    <InputGroup>
      <InputGroupInput type={shown ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end" className="has-[>button]:-me-1">
        <InputGroupButton size="icon-sm" className="size-7 compact:size-6 calm:size-6" aria-label={toggleLabel} aria-pressed={shown} onClick={() => setShown((v) => !v)}>
          <Icon name={shown ? "eye-off" : "eye"} size={16} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

const STRENGTH = ["", "weak", "okay", "good", "strong"] as const

function scoreOf(password: string) {
  const points = [password.length >= 8, /\d/.test(password), /[a-z]/.test(password) && /[A-Z]/.test(password), password.length >= 12].filter(Boolean).length
  return Math.max(1, points)
}

function SignupForm({ className, onSubmit, ...props }: SignupFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const [formError, setFormError] = React.useState<string | null>(null)
  const [created, setCreated] = React.useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { name: "", email: "", password: "", confirm: "" } })

  const submit = handleSubmit(async ({ name, email, password }) => {
    setFormError(null)
    try {
      await (onSubmit ?? pretend)({ name, email, password })
      if (!onSubmit) setCreated(true)
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "Something went wrong on our side. Try again in a moment.")
    }
  })
  const password = watch("password")
  const score = scoreOf(password)

  return (
    <div className={cn("@container/signup flex flex-col gap-6", className)} {...props}>
      <Card seed="signup-03">
        <CardHeader className="text-center">
          <CardTitle role="heading" aria-level={1} className="text-[2rem]">
            Create your <Highlight className="ms-1">account</Highlight>
          </CardTitle>
          <CardDescription>Four lines and you are in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate className="@container/pw">
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <Icon name="circle-alert" />
                  <AlertTitle>We could not create your account</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              {created ? (
                <Alert variant="success" role="status">
                  <Icon name="circle-check" />
                  <AlertTitle>Account created (this is a demo)</AlertTitle>
                  <AlertDescription>Nothing was sent anywhere. Pass an onSubmit to SignupForm to create accounts for real.</AlertDescription>
                </Alert>
              ) : null}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor={id("name")}>Full name</FieldLabel>
                <Input
                  id={id("name")}
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? id("name-error") : undefined}
                  {...register("name")}
                />
                <FieldError id={id("name-error")} errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor={id("email")}>Email</FieldLabel>
                <Input
                  id={id("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="ada@notes.dev"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={describedBy(id("email-hint"), !!errors.email && id("email-error"))}
                  {...register("email")}
                />
                <FieldDescription id={id("email-hint")}>We use this to reach you and never share it.</FieldDescription>
                <FieldError id={id("email-error")} errors={[errors.email]} />
              </Field>
              <Field>
                <div className="grid gap-4 @[20rem]/pw:grid-cols-2">
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor={id("password")}>Password</FieldLabel>
                    <PasswordInput
                      id={id("password")}
                      autoComplete="new-password"
                      required
                      aria-invalid={!!errors.password}
                      aria-describedby={describedBy(id("password-hint"), !!errors.password && id("password-error"))}
                      {...register("password", {
                        onChange: () => {
                          if (getValues("confirm")) void trigger("confirm")
                        },
                      })}
                    />
                    <FieldError id={id("password-error")} errors={[errors.password]} />
                  </Field>
                  <Field data-invalid={!!errors.confirm}>
                    <FieldLabel htmlFor={id("confirm")}>Confirm password</FieldLabel>
                    <PasswordInput
                      id={id("confirm")}
                      toggleLabel="Show password confirmation"
                      autoComplete="new-password"
                      required
                      aria-invalid={!!errors.confirm}
                      aria-describedby={describedBy(id("password-hint"), !!errors.confirm && id("confirm-error"))}
                      {...register("confirm")}
                    />
                    <FieldError id={id("confirm-error")} errors={[errors.confirm]} />
                  </Field>
                </div>
                <FieldDescription id={id("password-hint")}>At least 8 characters and one number.</FieldDescription>
                <div aria-live="polite" className="text-sm empty:-mt-3">
                  {password ? (
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">Strength</span>
                      <Tally count={score} size="sm" tone={score > 2 ? "green" : "ink"} label={`Password strength: ${STRENGTH[score]}`} />
                      <span className="font-bold">{STRENGTH[score]}</span>
                    </span>
                  ) : null}
                </div>
              </Field>
              <Field>
                <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" /> Creating account
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="#login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-balance [&>a]:whitespace-nowrap [&>a]:text-foreground [&>a:hover]:text-foreground">
        By creating an account you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

export { SignupForm }
export type { SignupFormProps, SignupValues }
