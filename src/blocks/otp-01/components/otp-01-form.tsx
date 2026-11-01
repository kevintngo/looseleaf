"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, REGEXP_ONLY_DIGITS } from "@/components/ui/input-otp"
import { Mascot } from "@/components/ui/mascot"
import { Seal } from "@/components/ui/seal"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const DEMO_CODE = "246810"

type Status = "idle" | "verifying" | "wrong" | "verified"

type OtpFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  email?: string
  onVerify?: (code: string) => boolean | Promise<boolean>
  onResend?: () => void | Promise<void>
  onContinue?: () => void
  resendAfter?: number
}

const demoVerify = (code: string) => new Promise<boolean>((resolve) => setTimeout(() => resolve(code === DEMO_CODE), 600))

function OtpForm({ className, email = "ada@notes.dev", onVerify, onResend, onContinue, resendAfter = 30, ...props }: OtpFormProps) {
  const uid = React.useId()
  const id = (name: string) => `${uid}-${name}`
  const inputRef = React.useRef<HTMLInputElement>(null)
  const titleRef = React.useRef<HTMLDivElement>(null)
  const busy = React.useRef(false)
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  const [message, setMessage] = React.useState("That code is not right. Check the latest email and try again.")
  const [left, setLeft] = React.useState(resendAfter)
  const [resent, setResent] = React.useState(false)

  React.useEffect(() => {
    if (left <= 0) return
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])

  React.useEffect(() => {
    if (status === "wrong") inputRef.current?.focus()
    if (status === "verified") titleRef.current?.focus()
  }, [status])

  async function verify(value: string) {
    if (busy.current || value.length < 6) return
    busy.current = true
    setStatus("verifying")
    try {
      const ok = await (onVerify ?? demoVerify)(value)
      if (ok) setStatus("verified")
      else {
        setMessage("That code is not right. Check the latest email and try again.")
        setCode("")
        setStatus("wrong")
      }
    } catch {
      setMessage("We could not check that code. Try again in a moment.")
      setCode("")
      setStatus("wrong")
    } finally {
      busy.current = false
    }
  }

  async function resend() {
    setResent(true)
    setCode("")
    setStatus("idle")
    setLeft(resendAfter)
    inputRef.current?.focus()
    try {
      await onResend?.()
    } catch {
      setResent(false)
    }
  }

  if (status === "verified") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card tape="corner" seed="otp-01-done">
          <CardHeader className="justify-items-center text-center">
            <Seal variant="rosette" mark="check" tone="grass" size={104} label="Verified" tilt={-4} />
            <CardTitle ref={titleRef} tabIndex={-1} role="heading" aria-level={1} className="text-[2rem] outline-none">
              You are verified
            </CardTitle>
            <CardDescription>{email} is confirmed. Welcome to the desk.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full" onClick={onContinue}>
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const verifying = status === "verifying"
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card tape="corner" seed="otp-01">
        <CardHeader className="justify-items-center text-center">
          <Mascot pose={status === "wrong" ? "oops" : verifying ? "search" : "think"} size={80} />
          <CardTitle role="heading" aria-level={1} className="text-[2rem]">
            Check your email
          </CardTitle>
          <CardDescription>
            We sent a six-digit code to <strong className="font-bold text-foreground">{email}</strong>. It works for ten minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void verify(code)
            }}
          >
            <FieldGroup>
              <Field data-invalid={status === "wrong"} className="items-center">
                <FieldLabel htmlFor={id("code")} className="sr-only">
                  Verification code
                </FieldLabel>
                <InputOTP
                  id={id("code")}
                  ref={inputRef}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  value={code}
                  disabled={verifying}
                  invalid={status === "wrong"}
                  aria-describedby={status === "wrong" ? id("code-error") : id("code-hint")}
                  containerClassName="w-full justify-center"
                  onChange={(value) => {
                    setCode(value)
                    if (status === "wrong") setStatus("idle")
                  }}
                  onComplete={(value) => void verify(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {status === "wrong" ? (
                  <FieldError id={id("code-error")} className="text-center">
                    {message}
                  </FieldError>
                ) : (
                  <FieldDescription id={id("code-hint")} className="text-center">
                    Type it, or paste it whole.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" aria-busy={verifying} disabled={verifying || code.length < 6}>
                  {verifying ? (
                    <>
                      <Spinner aria-hidden="true" /> Checking
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  {left > 0 ? (
                    <span role="timer">Need another? You can ask again in {left}s.</span>
                  ) : (
                    <>
                      Did not get it?{" "}
                      <button type="button" onClick={() => void resend()} className="text-link underline underline-offset-4 hover:text-link-hover">
                        Resend code
                      </button>
                    </>
                  )}
                </FieldDescription>
                <p role="status" className="sr-only">
                  {resent && left > 0 ? "A new code is on its way." : ""}
                </p>
                <FieldDescription className="text-center">
                  Wrong address? <a href="#change-email">Change your email</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { OtpForm, DEMO_CODE }
export type { OtpFormProps }
