"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BrandMark } from "@/blocks/login-05/components/login-05-brand-marks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Highlight } from "@/components/ui/highlight"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Mascot } from "@/components/ui/mascot"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.email("Enter a full address, like ada@notes.dev."),
})

type LoginValues = z.infer<typeof schema>

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (values: LoginValues) => void | Promise<void>
}

const pretend = () => new Promise<void>((resolve) => setTimeout(resolve, 700))

function LoginForm({ className, onSubmit, ...props }: LoginFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const [formError, setFormError] = React.useState<string | null>(null)
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "" } })

  const sentRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (sentTo) sentRef.current?.focus()
  }, [sentTo])

  const refocus = React.useRef(false)
  React.useEffect(() => {
    if (sentTo === null && refocus.current) {
      refocus.current = false
      setFocus("email")
    }
  }, [sentTo, setFocus])

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await (onSubmit ?? pretend)(values)
      setSentTo(values.email)
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We could not send that link. Try again in a moment.")
    }
  })

  return (
    <div className={cn("@container/login flex flex-col gap-6", className)} {...props}>
      <form onSubmit={submit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Mascot pose={sentTo ? "celebrate" : "wave"} size={88} />
            <h1 className="font-script text-[2.25rem] leading-none font-bold">
              Welcome to <Highlight className="ms-1">Looseleaf</Highlight>
            </h1>
            <FieldDescription>
              New here? <a href="#signup">Make an account</a>
            </FieldDescription>
          </div>
          {formError ? (
            <Alert variant="destructive">
              <Icon name="circle-alert" />
              <AlertTitle>That did not go through</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          {sentTo ? (
            <>
              <Alert ref={sentRef} tabIndex={-1} variant="success" role="status" className="outline-none">
                <Icon name="mail-check" />
                <AlertTitle>Your link is on its way</AlertTitle>
                <AlertDescription>
                  {sentTo} will have it in a minute. Open it on this device to sign in.
                  {onSubmit ? null : " (This is a demo: nothing was sent.)"}
                </AlertDescription>
              </Alert>
              <Field>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    refocus.current = true
                    setSentTo(null)
                    reset({ email: sentTo })
                  }}
                >
                  Use a different email
                </Button>
              </Field>
            </>
          ) : (
            <>
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
              <Field>
                <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" /> Sending
                    </>
                  ) : (
                    "Email me a sign-in link"
                  )}
                </Button>
              </Field>
            </>
          )}
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field className="grid gap-4 @sm/login:grid-cols-2">
            <Button variant="outline" type="button" aria-label="Continue with Apple">
              <BrandMark name="apple" />
              Apple
            </Button>
            <Button variant="outline" type="button" aria-label="Continue with Google">
              <BrandMark name="google" />
              Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-balance [&>a]:whitespace-nowrap">
        By continuing you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

export { LoginForm }
export type { LoginFormProps, LoginValues }
