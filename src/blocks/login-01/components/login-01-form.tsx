"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { BrandMark } from "@/blocks/login-01/components/login-01-brand-marks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Mascot } from "@/components/ui/mascot"
import { Spinner } from "@/components/ui/spinner"
import { Underline } from "@/components/ui/underline"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.email("Enter a full address, like ada@notes.dev."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof schema>

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (values: LoginValues) => void | Promise<void>
}

const pretend = () => new Promise<void>((resolve) => setTimeout(resolve, 700))

function PasswordInput({ ...props }: Omit<React.ComponentProps<typeof InputGroupInput>, "type">) {
  const [shown, setShown] = React.useState(false)
  return (
    <InputGroup>
      <InputGroupInput type={shown ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end" className="has-[>button]:-me-1">
        <InputGroupButton size="icon-sm" className="size-7 compact:size-6 calm:size-6" aria-label="Show password" aria-pressed={shown} onClick={() => setShown((v) => !v)}>
          <Icon name={shown ? "eye-off" : "eye"} size={16} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function LoginForm({ className, onSubmit, ...props }: LoginFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const [formError, setFormError] = React.useState<string | null>(null)
  const [signedIn, setSignedIn] = React.useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "", password: "", remember: true } })

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await (onSubmit ?? pretend)(values)
      if (!onSubmit) setSignedIn(true)
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "Something went wrong on our side. Try again in a moment.")
    }
  })

  return (
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      <Mascot pose="peek" size={88} className="pointer-events-none absolute end-9 bottom-[calc(100%-1rem)] [--ll-blend:normal]" />
      <Card tilt={false} tape="corner" tapeKind="washi-dots" seed="login-01">
        <CardHeader>
          <CardTitle role="heading" aria-level={1} className="text-[2rem]">
            Welcome <Underline kind="wavy" tone="marker">back</Underline>
          </CardTitle>
          <CardDescription>Sign in to pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <Icon name="circle-alert" />
                  <AlertTitle>We could not sign you in</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              {signedIn ? (
                <Alert variant="success" role="status">
                  <Icon name="circle-check" />
                  <AlertTitle>You are in (this is a demo)</AlertTitle>
                  <AlertDescription>Nothing was sent anywhere. Pass an onSubmit to LoginForm to sign in for real.</AlertDescription>
                </Alert>
              ) : null}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor={id("email")}>Email</FieldLabel>
                <Input
                  id={id("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="ada@notes.dev"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? id("email-error") : undefined}
                  {...register("email")}
                />
                <FieldError id={id("email-error")} errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <div className="flex items-center gap-3">
                  <FieldLabel htmlFor={id("password")}>Password</FieldLabel>
                  <a href="#forgot-password" className="-my-1 ms-auto py-1 text-sm text-link underline underline-offset-4 hover:text-link-hover">
                    Forgot your password?
                  </a>
                </div>
                <PasswordInput
                  id={id("password")}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? id("password-error") : undefined}
                  {...register("password")}
                />
                <FieldError id={id("password-error")} errors={[errors.password]} />
              </Field>
              <Field orientation="horizontal">
                <Controller
                  control={control}
                  name="remember"
                  render={({ field }) => (
                    <Checkbox id={id("remember")} name={field.name} ref={field.ref} checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} onBlur={field.onBlur} />
                  )}
                />
                <FieldLabel htmlFor={id("remember")} className="font-normal">
                  Remember me on this desk
                </FieldLabel>
              </Field>
              <Field>
                <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" /> Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <Button variant="outline" type="button">
                  <BrandMark name="google" />
                  Sign in with Google
                </Button>
                <FieldDescription className="text-center">
                  New here? <a href="#signup">Make an account</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { LoginForm }
export type { LoginFormProps, LoginValues }
