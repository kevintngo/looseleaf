import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const meta = {
  title: "A feedback form",
  description: "Label, Input and a ruled Textarea in a real form: the note is required, and the button says what happened.",
  layout: "stack" as const,
}

export default function Example() {
  const [sent, setSent] = React.useState(false)
  return (
    <form
      className="grid w-full max-w-md gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="fb-subject">Subject</Label>
        <Input id="fb-subject" name="subject" placeholder="The short version" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fb-note" required>
          Your note
        </Label>
        <Textarea id="fb-note" name="note" ruled required showCount maxLength={400} placeholder="What should we know?" />
      </div>
      <Button type="submit" disabled={sent} className="justify-self-start">
        {sent ? "Sent, thank you" : "Send feedback"}
      </Button>
    </form>
  )
}
