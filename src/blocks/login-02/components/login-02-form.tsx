"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BrandMark } from "@/blocks/login-02/components/login-02-brand-marks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Circled } from "@/components/ui/circled"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.email("Enter a full address, like ada@notes.dev."),
  password: z.string().min(1, "Enter your password."),
})

type LoginValues = z.infer<typeof schema>

type LoginFormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "", password: "" } })

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
    <form onSubmit={submit} noValidate className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="mb-3 font-script text-[2rem] leading-none font-bold">
            Good to see <Circled tone="blue" className="mx-2">you</Circled> again
          </h1>
          <p className="text-sm text-balance text-muted-foreground">Sign in with your email and the password you keep in your head.</p>
        </div>
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
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <BrandMark name="github" />
            Sign in with GitHub
          </Button>
          <FieldDescription className="text-center">
            New here? <a href="#signup">Make an account</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

export { LoginForm }
export type { LoginFormProps, LoginValues }
