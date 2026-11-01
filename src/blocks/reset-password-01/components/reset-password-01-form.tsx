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
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Mascot } from "@/components/ui/mascot"
import { Seal } from "@/components/ui/seal"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const RULES = [
  { key: "length", label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { key: "digit", label: "A number", test: (p: string) => /\d/.test(p) },
  { key: "case", label: "A capital and a small letter", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
] as const

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/\d/, "Add at least one number.")
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, "Mix a capital and a small letter."),
    confirm: z.string().min(1, "Type the password once more."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Those two do not match yet." })

type ResetFormValues = z.infer<typeof schema>
type ResetPasswordValues = Pick<ResetFormValues, "password">

type ResetPasswordFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  onSubmit?: (values: ResetPasswordValues) => void | Promise<void>
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

function ResetPasswordForm({ className, onSubmit, ...props }: ResetPasswordFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const titleRef = React.useRef<HTMLDivElement>(null)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { password: "", confirm: "" } })
  const password = watch("password")

  React.useEffect(() => {
    if (saved) titleRef.current?.focus()
  }, [saved])

  const submit = handleSubmit(async ({ password: next }) => {
    setFormError(null)
    try {
      await (onSubmit ?? pretend)({ password: next })
      setSaved(true)
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We could not save the new password. Ask for a fresh link and try again.")
    }
  })

  if (saved) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card tape="corner" seed="reset-password-01-done">
          <CardHeader className="justify-items-center text-center">
            <Seal variant="rosette" mark="check" tone="grass" size={104} label="Done" tilt={-4} />
            <CardTitle ref={titleRef} tabIndex={-1} role="heading" aria-level={1} className="text-[2rem] outline-none">
              Password changed
            </CardTitle>
            <CardDescription>
              You can sign in with it now.{onSubmit ? null : " (This is a demo: nothing was saved.)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="#login">Back to sign in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card tape="corner" seed="reset-password-01">
        <CardHeader className="justify-items-center text-center">
          <Mascot pose="write" size={80} />
          <CardTitle role="heading" aria-level={1} className="text-[2rem]">
            Choose a new password
          </CardTitle>
          <CardDescription>Make it one you will remember. Nobody is watching the pen.</CardDescription>
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
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor={id("password")}>New password</FieldLabel>
                <PasswordInput
                  id={id("password")}
                  autoComplete="new-password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={describedBy(id("rules"), !!errors.password && id("password-error"))}
                  {...register("password", {
                    onChange: () => {
                      if (getValues("confirm")) void trigger("confirm")
                    },
                  })}
                />
                <ul id={id("rules")} aria-label="A good password has" className="grid gap-1 text-sm">
                  {RULES.map((rule) => {
                    const met = rule.test(password)
                    return (
                      <li key={rule.key} data-met={met} className={cn("flex items-center gap-2", met ? "text-green" : "text-muted-foreground")}>
                        <Icon name={met ? "circle-check" : "circle"} size={16} />
                        <span className="sr-only">{met ? "Done: " : "Not yet: "}</span>
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
                <FieldError id={id("password-error")} errors={[errors.password]} />
              </Field>
              <Field data-invalid={!!errors.confirm}>
                <FieldLabel htmlFor={id("confirm")}>Confirm new password</FieldLabel>
                <PasswordInput
                  id={id("confirm")}
                  toggleLabel="Show password confirmation"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!errors.confirm}
                  aria-describedby={errors.confirm ? id("confirm-error") : undefined}
                  {...register("confirm")}
                />
                <FieldError id={id("confirm-error")} errors={[errors.confirm]} />
              </Field>
              <Field>
                <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner aria-hidden="true" /> Saving
                    </>
                  ) : (
                    "Save new password"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Changed your mind? <a href="#login">Back to sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { ResetPasswordForm }
export type { ResetPasswordFormProps, ResetPasswordValues }
