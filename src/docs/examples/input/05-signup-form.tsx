import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "A sign-up form",
  description: "Real validation: the email field turns red with its message the moment it is wrong, and the form only submits when it is right.",
  layout: "stack" as const,
}

export default function Example() {
  const [email, setEmail] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const invalid = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

  return (
    <form
      className="grid w-full max-w-sm gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!invalid && email) setDone(true)
      }}
      noValidate
    >
      <div className="grid gap-2">
        <Label htmlFor="su-name" required>
          Your name
        </Label>
        <Input id="su-name" name="name" autoComplete="name" required placeholder="Ada Lovelace" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="su-email" required>
          Email
        </Label>
        <Input
          id="su-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={invalid}
          aria-describedby="su-email-error"
          placeholder="you@example.com"
        />
        <p id="su-email-error" className="min-h-5 text-sm text-red">
          {invalid ? "That does not look like an email address." : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="su-terms" name="terms" required />
        <Label htmlFor="su-terms">I have read the small print</Label>
      </div>
      <Button type="submit" className="w-full">{done ? "Signed up, thanks" : "Sign up"}</Button>
    </form>
  )
}
