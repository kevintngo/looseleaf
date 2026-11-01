"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Mascot } from "@/components/ui/mascot"
import { Spinner } from "@/components/ui/spinner"
import { Sticker } from "@/components/ui/sticker"
import { cn } from "@/lib/utils"

const schema = z.object({
  email: z.email("Enter a full address, like ada@notes.dev."),
})

type ForgotPasswordValues = z.infer<typeof schema>

type ForgotPasswordFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (values: ForgotPasswordValues) => void | Promise<void>
}

const pretend = () => new Promise<void>((resolve) => setTimeout(resolve, 700))

function ForgotPasswordForm({ className, onSubmit, ...props }: ForgotPasswordFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const titleRef = React.useRef<HTMLDivElement>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const [again, setAgain] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "" } })

  React.useEffect(() => {
    if (sentTo) titleRef.current?.focus()
  }, [sentTo])

  async function send(email: string) {
    setFormError(null)
    try {
      await (onSubmit ?? pretend)({ email })
      setSentTo(email)
      return true
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We could not send that link. Try again in a moment.")
      return false
    }
  }

  const submit = handleSubmit((values) => send(values.email))

  if (sentTo) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card tape="corner" seed="forgot-password-01-sent">
          <CardHeader className="justify-items-center text-center">
            <Sticker name="envelope-heart" size={96} rotate={-6} />
            <CardTitle ref={titleRef} tabIndex={-1} role="heading" aria-level={1} className="text-[2rem] outline-none">
              Check your email
            </CardTitle>
            <CardDescription>
              If <strong className="font-bold text-foreground">{sentTo}</strong> has an account, a link to choose a new password is on its way. It works for one hour.
              {onSubmit ? null : " (This is a demo: nothing was sent.)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <Icon name="circle-alert" />
                  <AlertTitle>That did not go through</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}
              <Field>
                <Button asChild>
                  <a href="#login">Back to sign in</a>
                </Button>
                <FieldDescription className="text-center">
                  Nothing yet? Look in your spam folder, or{" "}
                  <button
                    type="button"
                    aria-disabled={resending}
                    onClick={async () => {
                      if (resending) return
                      setResending(true)
                      setAgain(false)
                      setAgain(await send(sentTo))
                      setResending(false)
                    }}
                    className="text-link underline underline-offset-4 hover:text-link-hover aria-disabled:text-pencil-text"
                  >
                    send it again
                  </button>
                  .
                </FieldDescription>
                <p role="status" className="sr-only">
                  {again ? "We sent the link again." : ""}
                </p>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card tape="corner" seed="forgot-password-01">
        <CardHeader className="justify-items-center text-center">
          <Mascot pose="search" size={80} />
          <CardTitle role="heading" aria-level={1} className="text-[2rem]">
            Forgot your password?
          </CardTitle>
          <CardDescription>No harm done. Tell us your email and we will send a link to choose a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <Icon name="circle-alert" />
                  <AlertTitle>That did not go through</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
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
              <Field>
                <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" /> Sending
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Remembered it? <a href="#login">Back to sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { ForgotPasswordForm }
export type { ForgotPasswordFormProps, ForgotPasswordValues }
