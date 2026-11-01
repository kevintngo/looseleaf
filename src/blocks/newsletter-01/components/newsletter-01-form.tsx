"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Newsletter01Status = "idle" | "invalid" | "sending" | "failed" | "done"

type Newsletter01FormProps = {
  status: Newsletter01Status
  email: string
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onReset: () => void
}

function Newsletter01Form({ status, email, onEmailChange, onSubmit, onReset }: Newsletter01FormProps) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const doneRef = React.useRef<HTMLDivElement>(null)
  const bad = status === "invalid" || status === "failed"

  React.useEffect(() => {
    if (status === "done") doneRef.current?.focus()
    if (status === "invalid" || status === "failed") inputRef.current?.focus()
  }, [status])

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded-none outline-none">
        <p className="font-script text-3xl leading-none font-bold text-ink">You&rsquo;re on the list.</p>
        <p className="mt-2 text-lg/7 text-ink-soft">
          We sent a note to <strong className="font-bold text-ink">{email}</strong>. Click the link inside to confirm, and the first letter lands on Sunday.
        </p>
        <Button type="button" variant="link" size="sm" onClick={onReset} className="-ms-3 mt-1">
          Use a different address
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Field data-invalid={bad || undefined}>
        <FieldLabel htmlFor={`${id}-email`}>Your email address</FieldLabel>
        <div className="flex flex-col gap-3 @lg:flex-row @lg:gap-4">
          <Input
            ref={inputRef}
            id={`${id}-email`}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            aria-invalid={bad || undefined}
            aria-describedby={`${id}-help${bad ? ` ${id}-error` : ""}`}
            className="min-w-0 @lg:flex-1"
          />
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Subscribing…" : "Subscribe"}
          </Button>
        </div>
        <FieldDescription id={`${id}-help`}>No spam. Leave with one click. 12,400 people read it.</FieldDescription>
        {status === "invalid" ? <FieldError id={`${id}-error`}>That does not look like an email address. Check it for typos?</FieldError> : null}
        {status === "failed" ? <FieldError id={`${id}-error`}>Something went wrong on our side. Please try again in a moment.</FieldError> : null}
      </Field>
    </form>
  )
}

export { Newsletter01Form }
export type { Newsletter01Status }
