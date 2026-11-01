import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const meta = {
  title: "In a form",
  description: "Boxes with a name and value submit like native checkboxes; required blocks the submit until the box is ticked.",
  layout: "stack" as const,
}

export default function Example() {
  const [sent, setSent] = React.useState<string>("")
  return (
    <form
      className="grid max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        setSent(`Saved: ${data.getAll("notify").join(", ") || "nothing"}`)
      }}
    >
      <fieldset className="grid gap-3">
        <legend className="mb-2 font-bold">Tell me about</legend>
        {["comments", "replies", "mentions"].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <Checkbox id={n} name="notify" value={n} defaultChecked={n !== "mentions"} />
            <Label htmlFor={n} className="capitalize">
              {n}
            </Label>
          </div>
        ))}
      </fieldset>
      <div className="flex items-center gap-2">
        <Checkbox id="agree" name="agree" required />
        <Label htmlFor="agree" required>
          I have read the small print
        </Label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Save</Button>
        <span role="status" className="text-sm text-ink-muted">
          {sent}
        </span>
      </div>
    </form>
  )
}
