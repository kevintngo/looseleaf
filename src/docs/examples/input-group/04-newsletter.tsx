import * as React from "react"

import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "Subscribe form",
  description: "A real-world use: a labeled group in a form. The label points at the control, the marker button is part of the same box, and a bad address turns the whole group red.",
  layout: "stack" as const,
}

export default function Example() {
  const [email, setEmail] = React.useState("")
  const [state, setState] = React.useState<"idle" | "bad" | "ok">("idle")
  return (
    <form
      className="grid w-full max-w-sm gap-2"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setState(/^\S+@\S+\.\S+$/.test(email) ? "ok" : "bad")
      }}
    >
      <Label htmlFor="news-email">Field notes, twice a month</Label>
      <InputGroup>
        <InputGroupAddon>
          <Icon name="mail" />
        </InputGroupAddon>
        <InputGroupInput
          id="news-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          aria-invalid={state === "bad"}
          aria-describedby="news-help"
          onChange={(e) => {
            setEmail(e.target.value)
            setState("idle")
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit" variant="default">
            Subscribe
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p id="news-help" role="status" className={state === "bad" ? "text-sm text-red" : "text-sm text-ink-muted"}>
        {state === "bad" ? "That does not look like an address." : state === "ok" ? "Thank you. Watch your inbox." : "No spam, and you can leave with one click."}
      </p>
    </form>
  )
}
