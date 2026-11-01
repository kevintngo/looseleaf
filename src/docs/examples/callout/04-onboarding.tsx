import * as React from "react"

import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "A hint on a form",
  description: "Positioned with className over a form: a hint that points at the field it is about, that writes itself on when the form scrolls into view and goes away when you dismiss it.",
  layout: "center" as const,
  height: 320,
}

export default function Example() {
  const [hint, setHint] = React.useState(true)
  return (
    <form className="grid w-full max-w-xs gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="relative grid gap-2 pb-12">
        <Label htmlFor="callout-email">Email</Label>
        <Input id="callout-email" type="email" placeholder="you@example.com" onFocus={() => setHint(false)} />
        <Callout show={hint} animate direction="up-right" curve="curved" className="pointer-events-none absolute start-8 bottom-0">
          start with this one
        </Callout>
      </div>
      <Button type="submit">Send the link</Button>
    </form>
  )
}
