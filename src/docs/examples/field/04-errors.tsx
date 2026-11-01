import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export const meta = {
  title: "Errors and validation",
  description: "`FieldError` takes children or an `errors` array: one message is text, several are a list, duplicates collapse. It is announced as an alert and wears a wavy red pencil underline; `data-invalid` on the Field turns the label red, `aria-invalid` on the control draws its box red.",
  layout: "stack" as const,
}

type Errs = { email?: string[]; pass?: string[] }

function check(email: string, pass: string): Errs {
  const e: Errs = {}
  if (!/^\S+@\S+\.\S+$/.test(email)) e.email = ["Enter an address like ada@notes.dev."]
  const p: string[] = []
  if (pass.length < 8) p.push("Use at least 8 characters.")
  if (!/\d/.test(pass)) p.push("Add a number.")
  if (p.length) e.pass = p
  return e
}

export default function Example() {
  const [email, setEmail] = React.useState("ada")
  const [pass, setPass] = React.useState("pencil")
  const [shown, setShown] = React.useState(true)
  const errs = shown ? check(email, pass) : {}
  return (
    <form
      className="w-full max-w-sm"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setShown(true)
      }}
    >
      <FieldGroup>
        <Field data-invalid={!!errs.email}>
          <FieldLabel htmlFor="er-email">Email</FieldLabel>
          <Input id="er-email" type="email" value={email} aria-invalid={!!errs.email} aria-describedby="er-email-err" onChange={(e) => setEmail(e.target.value)} />
          <FieldError id="er-email-err" errors={errs.email?.map((message) => ({ message }))} />
        </Field>
        <Field data-invalid={!!errs.pass}>
          <FieldLabel htmlFor="er-pass">Password</FieldLabel>
          <Input id="er-pass" type="password" value={pass} aria-invalid={!!errs.pass} aria-describedby="er-pass-err" onChange={(e) => setPass(e.target.value)} />
          <FieldDescription>Eight characters and a number.</FieldDescription>
          <FieldError id="er-pass-err" errors={errs.pass?.map((message) => ({ message }))} />
        </Field>
        <FieldSeparator>then</FieldSeparator>
        <Field orientation="horizontal">
          <Button type="submit">Create account</Button>
          <Button type="button" variant="outline" onClick={() => setShown(false)}>
            Hide errors
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
